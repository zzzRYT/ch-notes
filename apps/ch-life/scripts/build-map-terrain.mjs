#!/usr/bin/env node
// 말씀 지도 지형 번들 생성: Natural Earth(공개 영역) 1:10m를 지도 범위로 잘라 단순화한다.
//
//   node scripts/build-map-terrain.mjs <ne_geojson_dir>
//
// <ne_geojson_dir>에는 github.com/nvkelso/natural-earth-vector 의 geojson/ 아래
// ne_10m_land, ne_10m_lakes, ne_10m_rivers_lake_centerlines (.geojson)가 있어야 한다.
// 결과: assets/maps/scripture-region.json. 범위를 바꾸면 이 스크립트로 다시 만든다.
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const BBOX = { minLon: 34.2, maxLon: 36.4, minLat: 31.0, maxLat: 33.4 };
/** 단순화 허용 오차(도). 약 40m — 확대 10배에서도 해안선이 각지지 않는 정도. */
const TOLERANCE = 0.0004;
const LAKES = new Set(["Sea of Galilee", "Dead Sea"]);
const RIVERS = new Set(["Jordan"]);

const dir = process.argv[2];
if (!dir) throw new Error("usage: build-map-terrain.mjs <ne_geojson_dir>");
const load = (n) => JSON.parse(readFileSync(join(dir, `${n}.geojson`), "utf8")).features;

// Sutherland–Hodgman: 고리를 직사각형 범위로 자른다.
function clipRing(ring) {
  const edges = [
    [([x]) => x >= BBOX.minLon, (a, b) => at(a, b, "x", BBOX.minLon)],
    [([x]) => x <= BBOX.maxLon, (a, b) => at(a, b, "x", BBOX.maxLon)],
    [([, y]) => y >= BBOX.minLat, (a, b) => at(a, b, "y", BBOX.minLat)],
    [([, y]) => y <= BBOX.maxLat, (a, b) => at(a, b, "y", BBOX.maxLat)],
  ];
  let out = ring;
  for (const [inside, cut] of edges) {
    const input = out;
    out = [];
    input.forEach((cur, i) => {
      const prev = input[(i + input.length - 1) % input.length];
      if (inside(cur)) {
        if (!inside(prev)) out.push(cut(prev, cur));
        out.push(cur);
      } else if (inside(prev)) out.push(cut(prev, cur));
    });
    if (out.length === 0) return [];
  }
  return out;
}
function at([x1, y1], [x2, y2], axis, v) {
  const t = axis === "x" ? (v - x1) / (x2 - x1) : (v - y1) / (y2 - y1);
  return axis === "x" ? [v, y1 + t * (y2 - y1)] : [x1 + t * (x2 - x1), v];
}

// Douglas–Peucker.
function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  let max = 0,
    idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = dist(pts[i], a, b);
    if (d > max) [max, idx] = [d, i];
  }
  if (max <= tol) return [a, b];
  return [...simplify(pts.slice(0, idx + 1), tol).slice(0, -1), ...simplify(pts.slice(idx), tol)];
}
function dist([px, py], [ax, ay], [bx, by]) {
  const dx = bx - ax,
    dy = by - ay,
    len = Math.hypot(dx, dy);
  return len === 0
    ? Math.hypot(px - ax, py - ay)
    : Math.abs(dy * px - dx * py + bx * ay - by * ax) / len;
}

const flat = (pts) => pts.flatMap(([x, y]) => [+x.toFixed(4), +y.toFixed(4)]);
const polygons = (g) => (g.type === "Polygon" ? [g.coordinates] : g.coordinates);
// 바깥 고리만 쓴다. 구멍(내륙 호수)은 lakes 레이어가 덮는다.
const ringsOf = (features) =>
  features.flatMap((f) =>
    polygons(f.geometry)
      .map((p) => simplify(clipRing(p[0]), TOLERANCE))
      .filter((r) => r.length >= 3),
  );

const land = ringsOf(load("ne_10m_land")).map(flat);
const lakes = load("ne_10m_lakes")
  .filter((f) => LAKES.has(f.properties.name))
  .map((f) => ({ name: f.properties.name, rings: ringsOf([f]).map(flat) }));

// 하천은 범위 안에 든 점의 연속 구간만 남긴다.
const inBox = ([x, y]) =>
  x >= BBOX.minLon && x <= BBOX.maxLon && y >= BBOX.minLat && y <= BBOX.maxLat;
const rivers = load("ne_10m_rivers_lake_centerlines")
  .filter((f) => RIVERS.has(f.properties.name))
  .flatMap((f) => f.geometry.coordinates)
  .flatMap((line) => {
    const runs = [];
    let run = [];
    for (const p of line) {
      if (inBox(p)) run.push(p);
      else if (run.length) (runs.push(run), (run = []));
    }
    if (run.length) runs.push(run);
    return runs.map((r) => flat(simplify(r, TOLERANCE))).filter((r) => r.length >= 4);
  });

const out = join(dirname(fileURLToPath(import.meta.url)), "../assets/maps/scripture-region.json");
writeFileSync(
  out,
  JSON.stringify({
    _source:
      "Natural Earth ne_10m_land, ne_10m_lakes, ne_10m_rivers_lake_centerlines (public domain), 1:10m. 지도 범위로 잘라 약 40m 허용 오차로 단순화했다. 고대 해안선·경계가 아니다.",
    bbox: BBOX,
    land,
    lakes,
    rivers,
  }),
);
console.log(`land ${land.length} rings, lakes ${lakes.length}, rivers ${rivers.length} → ${out}`);
