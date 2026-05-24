import Database from "better-sqlite3";
import * as fs from "node:fs";
import * as path from "node:path";
import { makeNoteRepo, type DbAdapter } from "../note-repo";

const SCHEMA = fs.readFileSync(
  path.resolve(__dirname, "../schema.sql"),
  "utf8",
);

function setup() {
  const db = new Database(":memory:");
  db.exec(SCHEMA);
  const adapter: DbAdapter = {
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
  return makeNoteRepo(adapter);
}

describe("searchNotes", () => {
  it("제목 prefix 검색", async () => {
    const repo = setup();
    await repo.create({ title: "주일설교", body: [], citedRefs: [] });
    await repo.create({ title: "수요예배", body: [], citedRefs: [] });
    const r = await repo.searchNotes("주일");
    expect(r.map((n) => n.title)).toContain("주일설교");
    expect(r.map((n) => n.title)).not.toContain("수요예배");
  });

  it("citedRefs 검색", async () => {
    const repo = setup();
    await repo.create({ title: null, body: [], citedRefs: ["Col 3:20"] });
    await repo.create({ title: null, body: [], citedRefs: ["Eph 5:21"] });
    const r = await repo.searchNotes("Col");
    expect(r).toHaveLength(1);
  });

  it("빈 쿼리는 빈 배열", async () => {
    const repo = setup();
    await repo.create({ title: "test", body: [], citedRefs: [] });
    expect(await repo.searchNotes("")).toEqual([]);
    expect(await repo.searchNotes("   ")).toEqual([]);
  });

  it("따옴표는 sanitize되어 SQL 오류 없이 빈 결과", async () => {
    const repo = setup();
    await repo.create({ title: "ok", body: [], citedRefs: [] });
    const r = await repo.searchNotes('"\'evil');
    expect(Array.isArray(r)).toBe(true);
  });

  it("최신 updated_at 우선", async () => {
    const repo = setup();
    const a = await repo.create({
      title: "alpha",
      body: [],
      citedRefs: [],
    });
    await new Promise((r) => setTimeout(r, 5));
    const b = await repo.create({
      title: "alphabet",
      body: [],
      citedRefs: [],
    });
    const r = await repo.searchNotes("alpha");
    expect(r[0]?.id).toBe(b);
    expect(r[1]?.id).toBe(a);
  });
});
