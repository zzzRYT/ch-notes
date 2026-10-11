import type { MapData, PlaceLink } from "../types";
import { buildRegions, type ViewNote } from "../build-view";
import { summarize } from "../match-notes";

// 테스트 전용 가짜 연결표 — 출시 데이터가 아니다.
const place = (id: string, regionKey: string, periodId: string | null) => ({
  id, regionKey, regionName: regionKey, periodId, name: id,
  lat: 1, lon: 1, precision: "city" as const, locationNote: "f", source: "fixture",
});
const data: MapData = {
  periods: [
    { id: "joshua", name: "여호수아 시대", order: 1, basis: "f" },
    { id: "ministry", name: "예수님 사역 시대", order: 2, basis: "f" },
  ],
  places: [
    place("jericho-ministry", "jericho", "ministry"),
    place("jericho-joshua", "jericho", "joshua"),
    place("cana", "cana", null),
  ],
  scenes: [],
};
const note = (id: string): ViewNote => ({ id, title: id, scripture: null, citedRefs: [], createdAt: 1 });
const link = (noteId: string, placeId: string, ...refs: string[]): PlaceLink => ({
  noteId, placeId,
  matches: refs.map((ref) => ({ sceneId: "s", ref, chapter: 1, from: 1, to: 2 })),
});
const notes = [note("a"), note("b"), note("c")];
const links = [
  link("a", "jericho-joshua", "수 6:1"),
  link("a", "jericho-ministry", "눅 19:1", "눅 19:2", "눅 19:1"), // 한 노트가 두 시대에 연결 (AE2)
  link("b", "jericho-ministry", "눅 19:5"),
  link("c", "cana", "요 2:1"),
];

describe("buildRegions", () => {
  it("지역 기록 수는 장소별 합이 아니라 고유 노트 수, 장소는 시대 순 (AE2·R9)", () => {
    const jericho = buildRegions(links, notes, data)[0]!;
    expect(jericho.key).toBe("jericho");
    expect(jericho.places.map((p) => p.place.id)).toEqual(["jericho-joshua", "jericho-ministry"]);
    expect(jericho.places.map((p) => p.notes.length)).toEqual([1, 2]);
    expect(jericho.noteCount).toBe(2);
  });

  it("같은 노트의 중복 인용은 한 줄에 한 번만 (AE1)", () => {
    const ministry = buildRegions(links, notes, data)[0]!.places[1]!;
    expect(ministry.notes.find((n) => n.note.id === "a")!.refs).toEqual(["눅 19:1", "눅 19:2"]);
  });

  it("시대 필터는 장소의 시대로 거르고, 시대 미상은 null로 고른다 (F2)", () => {
    expect(buildRegions(links, notes, data, "joshua").map((r) => r.key)).toEqual(["jericho"]);
    expect(buildRegions(links, notes, data, "joshua")[0]!.noteCount).toBe(1);
    expect(buildRegions(links, notes, data, null).map((r) => r.key)).toEqual(["cana"]);
    expect(buildRegions(links, notes, data, "kingdom")).toEqual([]);
  });

  it("연결이 없으면 지역을 만들지 않고, 시대 미상 장소는 맨 뒤 (AE5)", () => {
    expect(buildRegions([], notes, data)).toEqual([]);
    const mixed: MapData = { ...data, places: [place("x-unknown", "x", null), place("x-joshua", "x", "joshua")] };
    const view = buildRegions([link("a", "x-unknown"), link("a", "x-joshua")], notes, mixed);
    expect(view[0]!.places.map((p) => p.place.id)).toEqual(["x-joshua", "x-unknown"]);
  });

  it("요약 집계(summarize)와 같은 수를 낸다", () => {
    for (const period of [undefined, "joshua", "ministry", null] as const) {
      const regions = buildRegions(links, notes, data, period);
      const all = new Set(regions.flatMap((r) => r.places.flatMap((p) => p.notes.map((n) => n.note.id))));
      expect({ noteCount: all.size, regionCount: regions.length }).toEqual(summarize(links, data, period));
    }
  });
});
