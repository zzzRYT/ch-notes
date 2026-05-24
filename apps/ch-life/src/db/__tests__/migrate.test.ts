import Database from "better-sqlite3";
import { addMissingNoteColumns } from "../migrate";
import type { DbAdapter } from "../note-repo";

// 새 컬럼이 없던 "구버전" notes 테이블을 흉내낸다.
const OLD_SCHEMA = `
CREATE TABLE notes (
  id          TEXT PRIMARY KEY,
  title       TEXT,
  body_json   TEXT NOT NULL,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL,
  cited_refs  TEXT NOT NULL DEFAULT '[]'
);`;

function adapterFor(db: Database.Database): DbAdapter {
  return {
    execAsync: async (sql) => {
      db.exec(sql);
    },
    runAsync: async (sql, params = []) => {
      db.prepare(sql).run(...params);
    },
    getAllAsync: async <T,>(sql: string, params: unknown[] = []) =>
      db.prepare(sql).all(...params) as T[],
    getFirstAsync: async <T,>(sql: string, params: unknown[] = []) =>
      (db.prepare(sql).get(...params) as T | undefined) ?? null,
  };
}

function columnNames(db: Database.Database): string[] {
  return (db.prepare("PRAGMA table_info(notes)").all() as Array<{ name: string }>).map(
    (c) => c.name,
  );
}

describe("addMissingNoteColumns", () => {
  it("구버전 테이블에 누락된 메타 컬럼을 추가한다", async () => {
    const db = new Database(":memory:");
    db.exec(OLD_SCHEMA);
    await addMissingNoteColumns(adapterFor(db));
    const cols = columnNames(db);
    expect(cols).toEqual(
      expect.arrayContaining(["sermon_date", "preacher", "location", "scripture"]),
    );
    db.close();
  });

  it("멱등하다 — 두 번 실행해도 오류 없음", async () => {
    const db = new Database(":memory:");
    db.exec(OLD_SCHEMA);
    await addMissingNoteColumns(adapterFor(db));
    await expect(addMissingNoteColumns(adapterFor(db))).resolves.toBeUndefined();
    db.close();
  });
});
