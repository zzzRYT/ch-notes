import { createBibleLookup } from "@/entities/scripture";
import type { MapData, MapNote } from "../types";
import { matchNotes, summarize } from "../match-notes";
import { validateMapData } from "../validate-data";

// 테스트 전용 가짜 연결표 — 출시 데이터가 아니다.
const chapter = (n: number) =>
  Object.fromEntries(Array.from({ length: n }, (_, i) => [String(i + 1), `v${i + 1}`]));
const lookup = createBibleLookup({
  Jos: { "6": chapter(27) },
  Luk: { "19": chapter(48) },
  Heb: { "11": chapter(40) },
}).lookupVerses;

const place = (id: string, periodId: string | null, regionKey = "jericho") => ({
  id,
  regionKey,
  regionName: regionKey,
  periodId,
  name: id,
  lat: 31.87,
  lon: 35.44,
  precision: "city" as const,
  locationNote: "테스트",
  source: "fixture",
});

const data: MapData = {
  periods: [
    { id: "joshua", name: "여호수아 시대", order: 1, basis: "fixture" },
    { id: "ministry", name: "예수님 사역 시대", order: 2, basis: "fixture" },
  ],
  places: [
    place("jericho-conquest", "joshua"),
    place("jericho-ministry", "ministry"),
    place("jericho-unknown", null),
  ],
  scenes: [
    { id: "jos6", book: "Jos", chapter: 6, start: 1, end: 20, periodId: "joshua", placeIds: ["jericho-conquest"], basis: "f" },
    { id: "luk19", book: "Luk", chapter: 19, start: 1, end: 10, periodId: "ministry", placeIds: ["jericho-ministry"], basis: "f" },
    { id: "heb11", book: "Heb", chapter: 11, start: 30, end: 30, periodId: "joshua", placeIds: ["jericho-conquest"], basis: "f" },
  ],
};

const note = (id: string, scripture: string | null, citedRefs: string[] = []): MapNote => ({
  id,
  scripture,
  citedRefs,
});
const run = (notes: MapNote[]) => matchNotes(notes, data, lookup);

describe("matchNotes", () => {
  it("AE1: 표기가 다른 동일 구절·중복 인용이 한 (노트, 장소) 연결로 모인다", () => {
    const links = run([note("n1", "여호수아 6:1-20", ["수 6:3", "Joshua 6:3", "수 6:3"])]);
    expect(links).toHaveLength(1);
    expect(links[0]).toMatchObject({ noteId: "n1", placeId: "jericho-conquest" });
    expect(links[0]!.matches.map((m) => m.ref)).toEqual(["여호수아 6:1-20", "수 6:3", "Joshua 6:3"]);
  });

  it("AE2: 두 시대 본문은 각 장소에 남고 노트 수는 한 편", () => {
    const links = run([note("n1", "수 6:1-5", ["눅 19:1-10"])]);
    expect(links.map((l) => l.placeId).sort()).toEqual(["jericho-conquest", "jericho-ministry"]);
    expect(summarize(links, data)).toEqual({ noteCount: 1, regionCount: 1 });
    expect(summarize(links, data, "joshua")).toEqual({ noteCount: 1, regionCount: 1 });
  });

  it("인용이 사건 범위의 경계에 걸치면 겹친 절만 기록한다", () => {
    const [l] = run([note("n1", null, ["수 6:18-25"])]);
    expect(l!.matches[0]).toMatchObject({ sceneId: "jos6", from: 18, to: 20 });
    const [m] = run([note("n1", null, ["눅 19:10-12"])]);
    expect(m!.matches[0]).toMatchObject({ from: 10, to: 10 });
  });

  it("같은 장의 사건 범위 밖 절에는 연결하지 않는다 (장 전체 전파 금지)", () => {
    expect(run([note("n1", "수 6:21-27")])).toEqual([]);
  });

  it("AE5: 역방향·없는 절·자유 문장·미지원 본문·미등록 책은 연결이 없다", () => {
    expect(
      run([note("n1", "수 6:10-5", ["수 6:99", "여리고를 돌았다", "누가복음 19장", "창 1:1"])]),
    ).toEqual([]);
  });

  it("히브리서처럼 이전 시대를 말하는 본문은 책이 아니라 사건 시대를 따른다", () => {
    const [l] = run([note("n1", "히 11:30")]);
    expect(l!.placeId).toBe("jericho-conquest");
  });

  it("scripture가 null이고 인용도 없으면 빈 결과", () => {
    expect(run([note("n1", null)])).toEqual([]);
  });
});

describe("summarize", () => {
  const links = run([note("a", "수 6:1"), note("b", "눅 19:1"), note("c", "수 6:2", ["눅 19:2"])]);

  it("전체는 고유 노트 수, 필터 후에도 해당 집합에서 중복 제거", () => {
    expect(summarize(links, data)).toEqual({ noteCount: 3, regionCount: 1 });
    expect(summarize(links, data, "joshua")).toEqual({ noteCount: 2, regionCount: 1 });
    expect(summarize(links, data, "ministry")).toEqual({ noteCount: 2, regionCount: 1 });
  });

  it("시대 미상 필터는 null", () => {
    expect(summarize(links, data, null)).toEqual({ noteCount: 0, regionCount: 0 });
  });
});

describe("validateMapData", () => {
  const check = (d: MapData) => validateMapData(d, lookup);

  it("정상 데이터는 오류 없음", () => {
    expect(check(data)).toEqual([]);
  });

  it("없는 시대·장소 ID, 비정상 좌표, 중복, 역방향·본문에 없는 범위를 찾는다", () => {
    const bad: MapData = {
      periods: data.periods,
      places: [{ ...place("p1", "nope"), lat: 91 }, place("p1", "joshua")],
      scenes: [
        { ...data.scenes[0]!, id: "s1", placeIds: ["missing"], periodId: "nope" },
        { ...data.scenes[0]!, id: "s2", start: 9, end: 3 },
        { ...data.scenes[0]!, id: "s3", end: 99 },
        { ...data.scenes[0]!, id: "s4", placeIds: [] },
      ],
    };
    const errors = check(bad).join("\n");
    for (const expected of [
      "장소 ID 중복: p1",
      "장소 p1: 없는 시대 nope",
      "비정상 좌표",
      "사건 s1: 없는 시대 nope",
      "사건 s1: 없는 장소 missing",
      "사건 s2: 끝 절이 시작 절보다 앞",
      "사건 s3: 본문에 없는 범위",
      "사건 s4: 장소 없음",
    ])
      expect(errors).toContain(expected);
  });
});
