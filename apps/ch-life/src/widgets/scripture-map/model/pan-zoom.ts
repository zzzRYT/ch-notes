/** 지형을 옮기고 키우는 변환. 화면 좌표 = 투영 좌표 × k + (x, y). 표식·라벨은 이 값으로 위치만 옮긴다. */
export type Transform = { k: number; x: number; y: number };
export const IDENTITY: Transform = { k: 1, x: 0, y: 0 };

export type Size = { w: number; h: number };
export type Limits = {
  minK: number;
  maxK: number;
  /** 지도 가장자리 밖으로 끌 수 있는 비율. */ slack: number;
};

export function clampTransform(t: Transform, { w, h }: Size, l: Limits): Transform {
  const k = Math.max(l.minK, Math.min(l.maxK, t.k));
  const sx = w * l.slack;
  const sy = h * l.slack;
  return {
    k,
    x: Math.min(sx, Math.max(w - w * k - sx, t.x)),
    y: Math.min(sy, Math.max(h - h * k - sy, t.y)),
  };
}

/** (px, py) 아래의 지점이 움직이지 않게 factor배 확대·축소한다. */
export function zoomAt(
  t: Transform,
  factor: number,
  px: number,
  py: number,
  size: Size,
  l: Limits,
): Transform {
  const k = Math.max(l.minK, Math.min(l.maxK, t.k * factor));
  const r = k / t.k;
  return clampTransform({ k, x: px - (px - t.x) * r, y: py - (py - t.y) * r }, size, l);
}

/** 투영 좌표 pt가 화면 가운데 오도록 k배로 맞춘다. */
export function centerOn(pt: [number, number], k: number, size: Size, l: Limits): Transform {
  return clampTransform({ k, x: size.w / 2 - pt[0] * k, y: size.h / 2 - pt[1] * k }, size, l);
}

/** 투영 좌표 → 화면 좌표. */
export const toScreen = (t: Transform, pt: [number, number]): [number, number] => [
  pt[0] * t.k + t.x,
  pt[1] * t.k + t.y,
];
