import type { BlockNode, Note } from "@/domain/types";

export type DbAdapter = {
  execAsync: (sql: string) => Promise<void>;
  runAsync: (sql: string, params?: unknown[]) => Promise<unknown>;
  getAllAsync: <T>(sql: string, params?: unknown[]) => Promise<T[]>;
  getFirstAsync: <T>(sql: string, params?: unknown[]) => Promise<T | null>;
};

type Row = {
  id: string;
  title: string | null;
  body_json: string;
  created_at: number;
  updated_at: number;
  cited_refs: string;
};

function rowToNote(r: Row): Note {
  return {
    id: r.id,
    title: r.title,
    body: JSON.parse(r.body_json) as BlockNode[],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    citedRefs: JSON.parse(r.cited_refs) as string[],
  };
}

function makeId(): string {
  const t = Date.now().toString(36).padStart(10, "0");
  const r = Math.random().toString(36).slice(2, 12).padStart(10, "0");
  return (t + r).toUpperCase();
}

export function makeNoteRepo(db: DbAdapter) {
  return {
    async create(input: {
      title?: string | null;
      body: BlockNode[];
      citedRefs: string[];
    }): Promise<string> {
      const id = makeId();
      const now = Date.now();
      await db.runAsync(
        `INSERT INTO notes(id, title, body_json, created_at, updated_at, cited_refs)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          input.title ?? null,
          JSON.stringify(input.body),
          now,
          now,
          JSON.stringify(input.citedRefs),
        ],
      );
      return id;
    },

    async update(
      id: string,
      patch: {
        title?: string | null;
        body?: BlockNode[];
        citedRefs?: string[];
      },
    ): Promise<void> {
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
        updated_at: Date.now(),
      };
      await db.runAsync(
        `UPDATE notes SET title=?, body_json=?, cited_refs=?, updated_at=?
         WHERE id=?`,
        [next.title, next.body_json, next.cited_refs, next.updated_at, id],
      );
    },

    async findById(id: string): Promise<Note | null> {
      const row = await db.getFirstAsync<Row>(
        `SELECT * FROM notes WHERE id = ?`,
        [id],
      );
      return row ? rowToNote(row) : null;
    },

    async listRecent(opts: { limit: number }): Promise<Note[]> {
      const rows = await db.getAllAsync<Row>(
        `SELECT * FROM notes ORDER BY created_at DESC LIMIT ?`,
        [opts.limit],
      );
      return rows.map(rowToNote);
    },

    async delete(id: string): Promise<void> {
      await db.runAsync(`DELETE FROM notes WHERE id = ?`, [id]);
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

export type NoteRepo = ReturnType<typeof makeNoteRepo>;
