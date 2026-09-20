import type { DbAdapter } from "@/shared/lib";
import type { BlockNode, Note } from "../model/types";
import type { NoteInput, NotePatch, NoteRepo } from "../model/note-repo";
import { withCitationEdition } from "../model/citation";
import { makeId } from "../lib/make-id";
import { addMissingNoteColumns } from "./migrate";

// ⚠️ 같은 DDL이 `schema.sql`(테스트가 읽음)에도 있다. 함께 고친다(ADR-0006).
export const NOTE_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS notes (
  id          TEXT PRIMARY KEY,
  title       TEXT,
  body_json   TEXT NOT NULL,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL,
  cited_refs  TEXT NOT NULL DEFAULT '[]',
  sermon_date TEXT,
  preacher    TEXT,
  location    TEXT,
  scripture   TEXT
);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
DROP INDEX IF EXISTS idx_notes_updated_at;
CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title);
CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
  id UNINDEXED, title, body_text, cited_refs, tokenize='unicode61'
);
CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes BEGIN
  INSERT INTO notes_fts(id, title, body_text, cited_refs)
  VALUES (new.id, COALESCE(new.title,''), '', new.cited_refs);
END;
CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON notes BEGIN
  DELETE FROM notes_fts WHERE id = old.id;
END;
CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes BEGIN
  UPDATE notes_fts SET title = COALESCE(new.title,''), cited_refs = new.cited_refs
  WHERE id = new.id;
END;
`;

/** notes 스키마 생성 + 누락 컬럼 보강. 매 실행 멱등(ADR-0005). */
export async function runNoteMigrations(db: DbAdapter): Promise<void> {
  await db.execAsync(NOTE_SCHEMA_SQL);
  await addMissingNoteColumns(db);
}

type Row = {
  id: string;
  title: string | null;
  body_json: string;
  created_at: number;
  updated_at: number;
  cited_refs: string;
  sermon_date: string | null;
  preacher: string | null;
  location: string | null;
  scripture: string | null;
};

function rowToNote(r: Row): Note {
  return {
    id: r.id,
    title: r.title,
    // editionId가 없던 시절의 인용을 현재 규칙으로 읽는다(ADR-0024 전환 규칙).
    body: withCitationEdition(JSON.parse(r.body_json) as BlockNode[]),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    citedRefs: JSON.parse(r.cited_refs) as string[],
    sermonDate: r.sermon_date,
    preacher: r.preacher,
    location: r.location,
    scripture: r.scripture,
  };
}

export function makeSqliteNoteRepo(db: DbAdapter): NoteRepo {
  const findById = async (id: string): Promise<Note | null> => {
    const row = await db.getFirstAsync<Row>(
      `SELECT * FROM notes WHERE id = ?`,
      [id],
    );
    return row ? rowToNote(row) : null;
  };

  return {
    async create(input: NoteInput): Promise<string> {
      const id = input.id ?? makeId();
      const now = Date.now();
      await db.runAsync(
        `INSERT INTO notes(id, title, body_json, created_at, updated_at, cited_refs, sermon_date, preacher, location, scripture)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          input.title ?? null,
          JSON.stringify(input.body),
          now,
          now,
          JSON.stringify(input.citedRefs),
          input.sermonDate ?? null,
          input.preacher ?? null,
          input.location ?? null,
          input.scripture ?? null,
        ],
      );
      return id;
    },

    async update(id: string, patch: NotePatch): Promise<void> {
      const current = await db.getFirstAsync<Row>(
        `SELECT * FROM notes WHERE id = ?`,
        [id],
      );
      if (!current) throw new Error(`note not found: ${id}`);
      const next: Row = {
        ...current,
        title: patch.title !== undefined ? patch.title : current.title,
        body_json: patch.body
          ? JSON.stringify(patch.body)
          : current.body_json,
        cited_refs: patch.citedRefs
          ? JSON.stringify(patch.citedRefs)
          : current.cited_refs,
        sermon_date: patch.sermonDate !== undefined ? patch.sermonDate : current.sermon_date,
        preacher: patch.preacher !== undefined ? patch.preacher : current.preacher,
        location: patch.location !== undefined ? patch.location : current.location,
        scripture: patch.scripture !== undefined ? patch.scripture : current.scripture,
        updated_at: Date.now(),
      };
      await db.runAsync(
        `UPDATE notes SET title=?, body_json=?, cited_refs=?, sermon_date=?, preacher=?, location=?, scripture=?, updated_at=?
         WHERE id=?`,
        [next.title, next.body_json, next.cited_refs, next.sermon_date, next.preacher, next.location, next.scripture, next.updated_at, id],
      );
    },

    findById,

    async listRecent(opts: { limit: number }): Promise<Note[]> {
      const rows = await db.getAllAsync<Row>(
        `SELECT * FROM notes ORDER BY created_at DESC LIMIT ?`,
        [opts.limit],
      );
      return rows.map(rowToNote);
    },

    async delete(id: string): Promise<Note | null> {
      const note = await findById(id);
      if (!note) return null;
      await db.runAsync(`DELETE FROM notes WHERE id = ?`, [id]);
      return note;
    },

    async restore(note: Note): Promise<void> {
      await db.runAsync(
        `INSERT INTO notes(id, title, body_json, created_at, updated_at, cited_refs, sermon_date, preacher, location, scripture)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          note.id,
          note.title,
          JSON.stringify(note.body),
          note.createdAt,
          note.updatedAt,
          JSON.stringify(note.citedRefs),
          note.sermonDate,
          note.preacher,
          note.location,
          note.scripture,
        ],
      );
    },

    async searchNotes(query: string): Promise<Note[]> {
      const q = query.trim();
      if (!q) return [];
      // FTS5 input sanitize: 따옴표 제거 (구문 오류 방지)
      const sanitized = q.replace(/["']/g, "");
      if (!sanitized) return [];
      const rows = await db.getAllAsync<Row>(
        `SELECT n.* FROM notes n
         JOIN notes_fts f ON f.id = n.id
         WHERE notes_fts MATCH ?
         ORDER BY n.created_at DESC LIMIT 200`,
        [`${sanitized}*`],
      );
      return rows.map(rowToNote);
    },
  };
}
