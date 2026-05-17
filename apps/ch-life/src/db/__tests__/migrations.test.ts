import Database from "better-sqlite3";
import * as fs from "node:fs";
import * as path from "node:path";

const SCHEMA = fs.readFileSync(
  path.resolve(__dirname, "../schema.sql"),
  "utf8",
);

describe("schema", () => {
  it("notes 테이블·인덱스·FTS·트리거가 생성된다", () => {
    const db = new Database(":memory:");
    db.exec(SCHEMA);

    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map((r) => (r as { name: string }).name);
    expect(tables).toContain("notes");
    expect(tables).toContain("notes_fts");

    const indexes = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='index' AND sql IS NOT NULL",
      )
      .all()
      .map((r) => (r as { name: string }).name);
    expect(indexes).toEqual(
      expect.arrayContaining(["idx_notes_updated_at", "idx_notes_title"]),
    );

    const triggers = db
      .prepare("SELECT name FROM sqlite_master WHERE type='trigger'")
      .all()
      .map((r) => (r as { name: string }).name);
    expect(triggers).toEqual(
      expect.arrayContaining(["notes_ai", "notes_ad", "notes_au"]),
    );

    db.close();
  });

  it("notes 인서트 시 FTS 트리거가 행을 동기화한다", () => {
    const db = new Database(":memory:");
    db.exec(SCHEMA);
    db.prepare(
      `INSERT INTO notes(id,title,body_json,created_at,updated_at,cited_refs)
       VALUES (?,?,?,?,?,?)`,
    ).run("01HABC", "주일설교", "[]", 1, 1, '["Col 3:20"]');

    const fts = db
      .prepare("SELECT id, title, cited_refs FROM notes_fts")
      .all() as Array<{ id: string; title: string; cited_refs: string }>;
    expect(fts).toHaveLength(1);
    expect(fts[0]?.id).toBe("01HABC");
    expect(fts[0]?.title).toBe("주일설교");
    db.close();
  });
});
