import { CONTEXT_LABELS, type ContextKind, type ContextLabel } from "./terrain";
import { toScreen, type Size, type Transform } from "./pan-zoom";
import type { Projection } from "./projection";

/** 기록 표식과 그 라벨 칩이 차지하는 화면 영역: [x, y, 라벨이 놓인 쪽, 칩 폭]. */
export type Avoid = [x: number, y: number, side: "left" | "right", chipWidth: number];

export type PlacedLabel = ContextLabel & {
  x: number;
  y: number;
  anchor: "start" | "middle" | "end";
};

const ORDER: Record<ContextKind, number> = {
  water: 0,
  area: 1,
  mount: 2,
  town: 3,
};

/**
 * 지금 화면에 보일 맥락 라벨. 확대 정도로 노출을 정하고, 기록 표식 주변과 먼저 놓인 라벨과 겹치는 것은 건너뛴다.
 * 물 이름은 지형 설명이라 겹침 검사를 받지 않는다.
 * ponytail: 글자 폭은 글자 수로 어림한다(한글 위주). 다국어 라벨이 들어오면 실제 폭을 잰다.
 */
export function placeContextLabels(
  proj: Projection,
  t: Transform,
  size: Size,
  avoid: Avoid[],
  labels: ContextLabel[] = CONTEXT_LABELS,
): PlacedLabel[] {
  const effS = proj.scale * t.k;
  const taken = avoid.map(([x, y, side, cw]) => ({
    x0: x - 26 - (side === "left" ? cw + 16 : 0),
    x1: x + 26 + (side === "right" ? cw + 16 : 0),
    y0: y - 20,
    y1: y + 20,
  }));
  // 왼쪽 아래 축척 막대 자리는 비운다.
  taken.push({ x0: 0, x1: 130, y0: size.h - 36, y1: size.h });
  const out: PlacedLabel[] = [];
  [...labels]
    .sort((a, b) => ORDER[a.kind] - ORDER[b.kind])
    .forEach((c) => {
      if (c.minS && effS < c.minS) return;
      if (c.maxS && effS >= c.maxS) return;
      const [x, y] = toScreen(t, proj.project(c.lon, c.lat));
      if (x < -20 || x > size.w + 20 || y < -10 || y > size.h + 10) return;
      const fs = c.kind === "area" ? 12 : 11;
      const marked = c.kind === "town" || c.kind === "mount";
      const tw =
        c.name.length * fs * 0.95 + (marked ? 10 : 0) + (c.kind === "area" ? c.name.length * 3 : 0);
      const anchor = c.anchor ?? (marked ? "start" : "middle");
      const bx0 = anchor === "start" ? x - 4 : anchor === "end" ? x - tw : x - tw / 2;
      const box = { x0: bx0, x1: bx0 + tw, y0: y - 9, y1: y + 7 };
      if (box.x0 < 2 || box.x1 > size.w - 2) return;
      if (
        c.kind !== "water" &&
        taken.some((q) => box.x0 < q.x1 && box.x1 > q.x0 && box.y0 < q.y1 && box.y1 > q.y0)
      )
        return;
      taken.push(box);
      out.push({ ...c, x, y, anchor });
    });
  return out;
}

/** 축척 막대: 화면 가운데 위도 기준으로 44px 이상이 되는 가장 작은 1·2·5 단위. */
export function scaleBar(proj: Projection, t: Transform, size: Size): { km: number; px: number } {
  const [lon, lat] = proj.unproject((size.w / 2 - t.x) / t.k, (size.h / 2 - t.y) / t.k);
  const dLon = 1 / (111.32 * Math.cos((lat * Math.PI) / 180)); // 동서로 1km에 해당하는 경도
  const pxPerKm = (proj.project(lon + dLon, lat)[0] - proj.project(lon, lat)[0]) * t.k;
  const km = [0.5, 1, 2, 5, 10, 20, 50].find((v) => v * pxPerKm >= 44) ?? 50;
  return { km, px: km * pxPerKm };
}
