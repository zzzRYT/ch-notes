import { layoutMarkers, makeProjection, zoomBounds, type Anchor } from "../marker-layout";

const FULL = { minLon: 34.6, maxLon: 36.0, minLat: 31.6, maxLat: 33.05 };
const anchor = (id: string, groupKey: string, lat: number, lon: number): Anchor => ({ id, groupKey, lat, lon });
// 시드 데이터의 실제 좌표(검토본과 같은 값).
const JERICHO_OT = anchor("jericho-joshua", "jericho", 31.871719, 35.444564);
const JERICHO_NT = anchor("jericho-ministry", "jericho", 31.851872, 35.436238);
const TEMPLE_1 = anchor("temple-kingdom", "jerusalem", 31.777778, 35.235556);
const TEMPLE_2 = anchor("temple-ministry", "jerusalem", 31.777778, 35.235556);
const CAPERNAUM = anchor("capernaum", "capernaum", 32.881111, 35.575);

describe("makeProjection", () => {
  it("범위의 북서 모서리는 (0,0), 남동 모서리는 (width,height)", () => {
    const p = makeProjection(FULL, 390);
    expect(p.project(FULL.maxLat, FULL.minLon)).toEqual({ x: 0, y: 0 });
    const se = p.project(FULL.minLat, FULL.maxLon);
    expect(se.x).toBeCloseTo(390);
    expect(se.y).toBeCloseTo(p.height);
  });
});

describe("layoutMarkers", () => {
  const overview = makeProjection(FULL, 390);

  it("AE3: 같은 지역의 다른 좌표는 전체 지도에서 겹쳐 지역 묶음 하나가 된다", () => {
    const m = layoutMarkers([JERICHO_OT, JERICHO_NT], overview, 44);
    expect(m).toHaveLength(1);
    expect(m[0]).toMatchObject({ kind: "bundle", groupKey: "jericho" });
    expect(m[0]!.ids.sort()).toEqual(["jericho-joshua", "jericho-ministry"]);
  });

  it("AE3: 확대하면 각 위치가 별도 표식으로 유지된다", () => {
    const zoom = makeProjection(zoomBounds([JERICHO_OT, JERICHO_NT], FULL), 390);
    const m = layoutMarkers([JERICHO_OT, JERICHO_NT], zoom, 44);
    expect(m.map((x) => x.kind)).toEqual(["single", "single"]);
    const proj = (a: Anchor) => zoom.project(a.lat, a.lon);
    // 위치를 옮기지 않는다.
    expect(m.find((x) => x.ids[0] === "jericho-joshua")).toMatchObject(proj(JERICHO_OT));
  });

  it("AE4: 같은 좌표의 다른 시대 장소는 이동 없이 same-point 하나로 묶인다", () => {
    const [m] = layoutMarkers([TEMPLE_1, TEMPLE_2], overview, 44);
    expect(m).toMatchObject({ kind: "same-point", ids: ["temple-kingdom", "temple-ministry"] });
    expect(m).toMatchObject(overview.project(31.777778, 35.235556));
  });

  it("확대해도 같은 좌표는 계속 하나 — 좌표를 흩뜨려 구분하지 않는다", () => {
    const zoom = makeProjection(zoomBounds([TEMPLE_1, TEMPLE_2], FULL), 390);
    expect(layoutMarkers([TEMPLE_1, TEMPLE_2], zoom, 44)).toHaveLength(1);
  });

  it("화면이 좁을수록 일찍 겹치고, 다른 지역은 묶지 않는다", () => {
    const pair = [JERICHO_OT, JERICHO_NT];
    expect(layoutMarkers(pair, makeProjection(FULL, 4000), 44)).toHaveLength(2);
    expect(layoutMarkers(pair, makeProjection(FULL, 390), 44)).toHaveLength(1);
    expect(layoutMarkers([JERICHO_OT, TEMPLE_1, CAPERNAUM], makeProjection(FULL, 40), 44)).toHaveLength(3);
  });

  it("연쇄로 겹치면 한 묶음이 된다", () => {
    const a = anchor("a", "g", 32, 35), b = anchor("b", "g", 32, 35.01), c = anchor("c", "g", 32, 35.02);
    const p = makeProjection(FULL, 390); // 0.01° ≈ 3px
    expect(layoutMarkers([a, b, c], p, 44)).toHaveLength(1);
    expect(layoutMarkers([a, b, c], p, 0)).toHaveLength(3);
  });
});

describe("zoomBounds", () => {
  it("전체 지도와 같은 종횡비를 유지하고 점을 가운데에 둔다", () => {
    const b = zoomBounds([JERICHO_OT, JERICHO_NT], FULL);
    const fullRatio = (FULL.maxLat - FULL.minLat) / (FULL.maxLon - FULL.minLon);
    expect((b.maxLat - b.minLat) / (b.maxLon - b.minLon)).toBeCloseTo(fullRatio);
    expect((b.minLon + b.maxLon) / 2).toBeCloseTo((35.444564 + 35.436238) / 2);
  });
  it("전체 범위보다 크게 확대 범위가 늘어나지 않는다", () => {
    const b = zoomBounds([JERICHO_OT, CAPERNAUM], FULL);
    expect(b.maxLon - b.minLon).toBeLessThanOrEqual(FULL.maxLon - FULL.minLon);
  });
});
