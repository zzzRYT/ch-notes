import { CONTEXT_LABELS, TERRAIN } from "../terrain";
import { placeContextLabels, scaleBar } from "../labels";
import { IDENTITY, centerOn, clampTransform, zoomAt, toScreen } from "../pan-zoom";
import { labelSides } from "../label-side";
import { OVERVIEW_BOUNDS, fitMercator, groupByCoord, regionBounds } from "../projection";

const SIZE = { w: 350, h: 400 };
const LIM = { minK: 1, maxK: 10, slack: 0.35 };
const JERICHO_OT = { id: "jericho-joshua", lat: 31.871719, lon: 35.444564 };
const JERICHO_NT = { id: "jericho-ministry", lat: 31.851872, lon: 35.436238 };
const TEMPLE_A = { id: "temple-kingdom", lat: 31.777778, lon: 35.235556 };
const TEMPLE_B = { id: "temple-ministry", lat: 31.777778, lon: 35.235556 };

describe("fitMercator", () => {
  const p = fitMercator(SIZE.w, SIZE.h, OVERVIEW_BOUNDS);
  it("전체 지도는 세로 범위가 pad만 남기고 꼭 맞고 경도 중심이 가운데다", () => {
    expect(p.project(35.25, 33.02)[1]).toBeCloseTo(12);
    expect(p.project(35.25, 31.38)[1]).toBeCloseTo(SIZE.h - 12);
    expect(p.project(35.25, 32)[0]).toBeCloseTo(SIZE.w / 2);
  });
  it("unproject는 project의 역이다", () => {
    const [x, y] = p.project(35.44, 31.86);
    const [lon, lat] = p.unproject(x, y);
    expect(lon).toBeCloseTo(35.44, 6);
    expect(lat).toBeCloseTo(31.86, 6);
  });
  it("모든 번들 기록 후보 지역이 전체 지도 안에 든다", () => {
    for (const q of [JERICHO_OT, TEMPLE_A, { lon: 35.575, lat: 32.881 }]) {
      const [x, y] = p.project(q.lon, q.lat);
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(SIZE.w);
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(SIZE.h);
    }
  });
});

describe("pan-zoom", () => {
  it("확대는 손가락 아래 지점을 움직이지 않는다", () => {
    const t = zoomAt(IDENTITY, 2, 100, 150, SIZE, LIM);
    expect(toScreen(t, [100, 150])).toEqual([100, 150]);
  });
  it("배율은 한계 안으로, 이동은 slack 안으로 묶인다", () => {
    expect(zoomAt(IDENTITY, 100, 0, 0, SIZE, LIM).k).toBe(10);
    expect(zoomAt(IDENTITY, 0.01, 0, 0, SIZE, LIM).k).toBe(1);
    const far = clampTransform({ k: 2, x: 9999, y: -9999 }, SIZE, LIM);
    expect(far.x).toBeCloseTo(SIZE.w * 0.35);
    expect(far.y).toBeCloseTo(SIZE.h - SIZE.h * 2 - SIZE.h * 0.35);
  });
  it("centerOn은 점을 화면 가운데에 둔다", () => {
    const t = centerOn([100, 120], 2.6, SIZE, LIM);
    const [x, y] = toScreen(t, [100, 120]);
    expect(x).toBeCloseTo(SIZE.w / 2);
    expect(y).toBeCloseTo(SIZE.h / 2);
  });
});

describe("groupByCoord / regionBounds", () => {
  it("AE4: 같은 좌표의 다른 시대는 하나로 묶이고, 다른 좌표는 각자 유지된다", () => {
    expect(groupByCoord([TEMPLE_A, TEMPLE_B])).toEqual([[TEMPLE_A, TEMPLE_B]]);
    expect(groupByCoord([JERICHO_OT, JERICHO_NT])).toHaveLength(2);
  });
  it("지역 범위는 장소를 가운데에 두고 최소 폭을 보장한다", () => {
    const b = regionBounds([TEMPLE_A]);
    expect((b.minLon + b.maxLon) / 2).toBeCloseTo(TEMPLE_A.lon);
    expect(b.maxLon - b.minLon).toBeCloseTo(0.32);
    const wide = regionBounds([JERICHO_OT, { lon: 35.9, lat: 31.9 }]);
    expect(wide.maxLon - wide.minLon).toBeGreaterThan(0.32);
  });
});

describe("맥락 라벨 · 축척 막대", () => {
  const p = fitMercator(SIZE.w, SIZE.h, OVERVIEW_BOUNDS);
  it("모든 라벨은 번들 지형 범위 안에 있다", () => {
    const lons = TERRAIN.land.flatMap((r) => r.filter((_, i) => i % 2 === 0));
    const [minLon, maxLon] = [Math.min(...lons), Math.max(...lons)];
    for (const c of CONTEXT_LABELS) {
      expect(c.lon).toBeGreaterThanOrEqual(minLon);
      expect(c.lon).toBeLessThanOrEqual(maxLon);
    }
  });
  it("확대할수록 더 많은 라벨이 보이고, 기록 표식 주변은 비운다", () => {
    const base = placeContextLabels(p, IDENTITY, SIZE, []);
    const [x, y] = p.project(35.19, 32.28); // '사마리아' 성읍
    const zoomed = { k: 4, x: SIZE.w / 2 - x * 4, y: SIZE.h / 2 - y * 4 };
    const near = placeContextLabels(p, zoomed, SIZE, []);
    expect(near.some((l) => l.name === "사마리아" && l.kind === "town")).toBe(true);
    expect(base.some((l) => l.kind === "town")).toBe(false);
    const [mx, my] = [SIZE.w / 2, SIZE.h / 2];
    const avoided = placeContextLabels(p, zoomed, SIZE, [[mx, my, "right", 100]]);
    expect(avoided.some((l) => l.name === "사마리아" && l.kind === "town")).toBe(false);
  });
  it("축척 막대는 확대할수록 짧은 거리를 가리키고 44px 이상이다", () => {
    const a = scaleBar(p, IDENTITY, SIZE);
    const b = scaleBar(p, { k: 6, x: 0, y: 0 }, SIZE);
    expect(b.km).toBeLessThan(a.km);
    expect(a.px).toBeGreaterThanOrEqual(44);
    expect(b.px).toBeGreaterThanOrEqual(44);
  });
});

describe("labelSides", () => {
  it("나란한 표식은 서쪽 것이 왼쪽 라벨을 쓰고, 오른쪽 끝 표식도 왼쪽에 둔다", () => {
    const p = fitMercator(SIZE.w, SIZE.h, OVERVIEW_BOUNDS);
    const at = (key: string, lon: number, lat: number, chipWidth: number) => {
      const [x, y] = p.project(lon, lat);
      return { key, x, y, chipWidth };
    };
    const s = labelSides(
      [
        at("jerusalem", 35.2354, 31.7781, 92),
        at("jericho", 35.437, 31.864, 80),
        at("capernaum", 35.5753, 32.8806, 90),
      ],
      SIZE.w,
    );
    expect(s).toEqual({
      jerusalem: "left",
      jericho: "right",
      capernaum: "left",
    });
  });
});
