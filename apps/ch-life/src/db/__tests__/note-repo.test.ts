import Database from "better-sqlite3";
import * as fs from "node:fs";
import * as path from "node:path";
import { makeNoteRepo, type DbAdapter } from "../note-repo";
import { markdownToNote } from "@/markdown/parse";

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

  it("import 경로: 파싱한 노트의 메타가 create 후 보존된다", async () => {
    const repo = setup();
    const md =
      `---\nid: SHARED1\ntitle: 주일설교\n` +
      `sermonDate: '2026-05-30'\npreacher: 홍길동 목사\n` +
      `location: 본당\nscripture: 요한복음 3:16\nschemaVersion: 1\n---\n\n본문\n`;
    const parsed = markdownToNote(md);
    expect(parsed).not.toBeNull();
    // import-note.ts의 insert 경로와 동일하게 저장 (파일 id 보존)
    const id = await repo.create({
      id: parsed!.id,
      title: parsed!.title,
      body: parsed!.body,
      citedRefs: parsed!.citedRefs,
      sermonDate: parsed!.sermonDate,
      preacher: parsed!.preacher,
      location: parsed!.location,
      scripture: parsed!.scripture,
    });
    // 파일의 id가 보존돼야 재import 시 충돌로 감지된다.
    expect(id).toBe("SHARED1");
    expect(await repo.findById("SHARED1")).not.toBeNull();
    const saved = await repo.findById(id);
    expect(saved?.title).toBe("주일설교");
    expect(saved?.sermonDate).toBe("2026-05-30");
    expect(saved?.preacher).toBe("홍길동 목사");
    expect(saved?.location).toBe("본당");
    expect(saved?.scripture).toBe("요한복음 3:16");
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

  it("delete가 완전한 스냅샷을 반환하고 restore가 그대로 복원한다", async () => {
    const repo = setup();
    const id = await repo.create({
      title: "복원할 노트",
      body: [{ type: "paragraph", text: "본문" }],
      citedRefs: ["John 3:16"],
      sermonDate: "2026-08-09",
      preacher: "홍길동",
      location: "본당",
      scripture: "요한복음 3:16",
    });
    const before = await repo.findById(id);
    expect(before).not.toBeNull();

    const deleted = await repo.delete(id);
    expect(deleted).toEqual(before);
    expect(await repo.findById(id)).toBeNull();

    await repo.restore(deleted!);
    expect(await repo.findById(id)).toEqual(before);
  });

  it("없는 노트 delete는 null을 반환한다", async () => {
    expect(await setup().delete("MISSING")).toBeNull();
  });

  it("restore는 같은 ID의 기존 노트를 덮어쓰지 않는다", async () => {
    const repo = setup();
    const id = await repo.create({ title: "원본", body: [], citedRefs: [] });
    const note = await repo.findById(id);
    await expect(repo.restore(note!)).rejects.toThrow();
    expect((await repo.findById(id))?.title).toBe("원본");
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

  it("설교 메타데이터를 저장하고 읽는다", async () => {
    const repo = setup();
    const id = await repo.create({
      title: "주일설교",
      body: [],
      citedRefs: [],
      sermonDate: "2026-05-24",
      preacher: "홍길동 목사",
      location: "본당",
      scripture: "요 3:16",
    });
    const note = await repo.findById(id);
    expect(note?.sermonDate).toBe("2026-05-24");
    expect(note?.preacher).toBe("홍길동 목사");
    expect(note?.location).toBe("본당");
    expect(note?.scripture).toBe("요 3:16");
  });

  it("메타 필드 미지정 시 null로 저장된다", async () => {
    const repo = setup();
    const id = await repo.create({ title: null, body: [], citedRefs: [] });
    const note = await repo.findById(id);
    expect(note?.sermonDate).toBeNull();
    expect(note?.preacher).toBeNull();
    expect(note?.location).toBeNull();
    expect(note?.scripture).toBeNull();
  });

  it("update가 메타 필드를 부분 갱신한다", async () => {
    const repo = setup();
    const id = await repo.create({
      title: "x",
      body: [],
      citedRefs: [],
      preacher: "전임 목사",
    });
    await repo.update(id, { preacher: "후임 목사", location: "교육관" });
    const note = await repo.findById(id);
    expect(note?.preacher).toBe("후임 목사");
    expect(note?.location).toBe("교육관");
    expect(note?.title).toBe("x");
  });
});
