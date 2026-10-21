export type Bounds = {
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
};

const RAD = Math.PI / 180;
const merc = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * RAD) / 2));

/** 웹 메르카토르. scale은 라디안당 px — 확대(k)를 곱하면 "효과 축척"이 되어 라벨 노출 기준이 된다. */
export type Projection = {
  scale: number;
  project: (lon: number, lat: number) => [number, number];
  /** project의 역. */
  unproject: (x: number, y: number) => [lon: number, lat: number];
};

/** bounds가 (w, h) 안에 pad만 남기고 꼭 들어가도록 맞추고 가운데에 둔다. 경도 폭이 0이면 높이만 본다. */
export function fitMercator(w: number, h: number, b: Bounds, pad = 12): Projection {
  const dx = (b.maxLon - b.minLon) * RAD;
  const dy = merc(b.maxLat) - merc(b.minLat);
  const scale = Math.min((w - 2 * pad) / dx, (h - 2 * pad) / dy);
  const cx = ((b.minLon + b.maxLon) / 2) * RAD;
  const cy = (merc(b.minLat) + merc(b.maxLat)) / 2;
  return {
    scale,
    project: (lon, lat) => [w / 2 + (lon * RAD - cx) * scale, h / 2 - (merc(lat) - cy) * scale],
    unproject: (x, y) => [
      ((x - w / 2) / scale + cx) / RAD,
      (2 * Math.atan(Math.exp(cy - (y - h / 2) / scale)) - Math.PI / 2) / RAD,
    ],
  };
}

/** 전체 지도: 세로로 맞추고 경도 중심을 고정한다 — 서쪽 지중해, 북쪽 갈릴리, 남쪽 사해. */
export const OVERVIEW_BOUNDS: Bounds = {
  minLon: 35.25,
  maxLon: 35.25,
  minLat: 31.38,
  maxLat: 33.02,
};

type Point = { lat: number; lon: number };

/**
 * 장소들을 감싸는 지역 확대 범위. 한 곳이거나 가까워도 최소 폭(약 30km)은 보이게 한다.
 * 화면 비율에 맞추는 일은 fitMercator가 한다.
 */
export function regionBounds(points: Point[], minLonSpan = 0.32, minLatSpan = 0.12): Bounds {
  const lons = points.map((p) => p.lon);
  const lats = points.map((p) => p.lat);
  const cLon = (Math.min(...lons) + Math.max(...lons)) / 2;
  const cLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const lon = Math.max(minLonSpan, (Math.max(...lons) - Math.min(...lons)) * 1.6);
  const lat = Math.max(minLatSpan, (Math.max(...lats) - Math.min(...lats)) * 1.6);
  return {
    minLon: cLon - lon / 2,
    maxLon: cLon + lon / 2,
    minLat: cLat - lat / 2,
    maxLat: cLat + lat / 2,
  };
}

/** 정확히 같은 좌표의 장소끼리 묶는다. 위치를 옮기지 않고 표식 하나로 둔다(R8). */
export function groupByCoord<T extends Point>(items: T[]): T[][] {
  const groups = new Map<string, T[]>();
  for (const it of items) {
    const key = `${it.lon},${it.lat}`;
    groups.set(key, [...(groups.get(key) ?? []), it]);
  }
  return [...groups.values()];
}
