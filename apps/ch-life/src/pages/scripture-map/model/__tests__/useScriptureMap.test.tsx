import React from "react";
import { act, create } from "react-test-renderer";
import type { NoteRefSummary, NoteRepo } from "@/entities/note";
import { useNoteDeleteStore } from "@/features/note/delete";
import type { MapData } from "@/features/scripture/map";
import { useScriptureMap, type ScriptureMapState } from "../useScriptureMap";

let mockRepo: Pick<NoteRepo, "listRefSummaries">;
jest.mock("expo-router", () => ({
  // 포커스 상태를 흉내 낸다: 마운트 때 실행, 언마운트 때 정리.
  useFocusEffect: (cb: () => void | (() => void)) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("react").useEffect(cb, [cb]);
  },
}));
jest.mock("@/entities/note", () => ({
  ...jest.requireActual("@/entities/note"),
  useNoteRepo: () => mockRepo,
}));

const data: MapData = {
  periods: [{ id: "p", name: "p", order: 1, basis: "f" }],
  places: [
    { id: "pl", regionKey: "r", regionName: "r", periodId: "p", name: "pl", lat: 1, lon: 1, precision: "city", locationNote: "f", source: "fixture" },
  ],
  scenes: [{ id: "s", book: "Jos", chapter: 6, start: 1, end: 20, periodId: "p", placeIds: ["pl"], basis: "f" }],
};
jest.mock("@/entities/scripture", () => ({
  ...jest.requireActual("@/entities/scripture"),
  lookupVerses: () => [{}],
}));

const note = (id: string, scripture: string): NoteRefSummary => ({ id, title: null, scripture, citedRefs: [], createdAt: 1 });

let latest: ScriptureMapState;
function Probe() {
  latest = useScriptureMap(data).state;
  return null;
}
const ids = () => (latest.status === "ready" ? latest.links.map((l) => l.noteId) : latest.status);
const mounted: ReturnType<typeof create>[] = [];
const mount = () => act(() => { mounted.push(create(<Probe />)); });
const flush = () => act(async () => { await Promise.resolve(); });

describe("useScriptureMap", () => {
  afterEach(() => {
    // 앞 테스트의 화면이 revision 변화에 반응하지 않도록 내린다.
    act(() => mounted.splice(0).forEach((r) => r.unmount()));
  });

  it("조회 중에는 loading, 실패는 빈 결과와 구분되는 error", async () => {
    mockRepo = { listRefSummaries: () => Promise.reject(new Error("db")) };
    jest.spyOn(console, "warn").mockImplementation(() => {});
    mount();
    expect(latest.status).toBe("loading");
    await flush();
    expect(latest.status).toBe("error");
  });

  it("성공하면 전체 기록을 연결하고, 삭제·복원(revision) 뒤 다시 읽는다", async () => {
    let notes = [note("a", "수 6:1"), note("b", "수 6:3")];
    mockRepo = { listRefSummaries: async () => notes };
    mount();
    await flush();
    expect(ids()).toEqual(["a", "b"]);

    notes = [note("a", "수 6:1")];
    act(() => { useNoteDeleteStore.setState((s) => ({ noteRevision: s.noteRevision + 1 })); });
    await flush();
    expect(ids()).toEqual(["a"]);
  });

  it("늦게 끝난 이전 조회가 최신 결과를 덮지 않는다", async () => {
    const resolvers: ((n: NoteRefSummary[]) => void)[] = [];
    mockRepo = { listRefSummaries: () => new Promise((res) => resolvers.push(res)) };
    mount();
    act(() => { useNoteDeleteStore.setState((s) => ({ noteRevision: s.noteRevision + 1 })); });
    expect(resolvers).toHaveLength(2);
    await act(async () => { resolvers[1]?.([note("new", "수 6:1")]); });
    await act(async () => { resolvers[0]?.([note("old", "수 6:1")]); });
    expect(ids()).toEqual(["new"]);
  });
});
