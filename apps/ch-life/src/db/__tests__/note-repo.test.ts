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

describe("note-repo", () => {
  it("노트를 만들고 읽는다", async () => {
    const repo = setup();
    const id = await repo.create({
      title: "주일설교",
      body: [{ type: "paragraph", text: "안녕" }],
      citedRefs: [],
    });
    const note = await repo.findById(id);
    expect(note?.title).toBe("주일설교");
    expect(note?.body[0]).toEqual({ type: "paragraph", text: "안녕" });
    expect(note?.citedRefs).toEqual([]);
  });

  it("createdAt 내림차순 정렬 (업데이트해도 순서 변하지 않음)", async () => {
    const repo = setup();
    const a = await repo.create({ title: "A", body: [], citedRefs: [] });
    await new Promise((r) => setTimeout(r, 5));
    const b = await repo.create({ title: "B", body: [], citedRefs: [] });
    // 더 일찍 만든 a를 나중에 업데이트해도 b가 먼저 와야 한다.
    await new Promise((r) => setTimeout(r, 5));
    await repo.update(a, { title: "A2" });
    const list = await repo.listRecent({ limit: 10 });
    expect(list[0]?.id).toBe(b);
    expect(list[1]?.id).toBe(a);
  });

  it("update가 updatedAt을 갱신하고 title을 바꾼다", async () => {
    const repo = setup();
    const id = await repo.create({ title: "x", body: [], citedRefs: [] });
    const before = await repo.findById(id);
    expect(before).not.toBeNull();
    await new Promise((r) => setTimeout(r, 5));
    await repo.update(id, { title: "y" });
    const after = await repo.findById(id);
    expect(after?.title).toBe("y");
    expect((after?.updatedAt ?? 0)).toBeGreaterThan(before?.updatedAt ?? 0);
  });

  it("delete로 노트가 사라진다", async () => {
    const repo = setup();
    const id = await repo.create({ title: "x", body: [], citedRefs: [] });
    await repo.delete(id);
    expect(await repo.findById(id)).toBeNull();
  });

  it("citedRefs JSON 직렬화 왕복", async () => {
    const repo = setup();
    const id = await repo.create({
      title: null,
      body: [],
      citedRefs: ["Col 3:20", "Eph 5:21"],
    });
    const note = await repo.findById(id);
    expect(note?.citedRefs).toEqual(["Col 3:20", "Eph 5:21"]);
  });
});
