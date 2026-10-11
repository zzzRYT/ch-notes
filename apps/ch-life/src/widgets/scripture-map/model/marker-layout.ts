export type Bounds = { minLon: number; maxLon: number; minLat: number; maxLat: number };

export type Anchor = { id: string; groupKey: string; lat: number; lon: number };

/**
 * single: 장소 하나. same-point: 같은 좌표의 여러 장소(위치를 옮기지 않고 목록으로 구분, R8).
 * bundle: 좌표는 다르지만 화면에서 겹쳐 하나로 묶은 것(지역 묶음).
 */
export type Marker = {
  key: string;
  groupKey: string;
  ids: string[];
  x: number;
  y: number;
  kind: "single" | "same-point" | "bundle";
};

export type Projection = {
  width: number;
  height: number;
  project: (lat: number, lon: number) => { x: number; y: number };
};

/**
 * 등장방형 투영. 가로 폭에 경도 범위를 맞추고, 위도 방향은 같은 지상 축척으로 늘린다.
 * 위도 폭은 bounds에서 정해지며 height는 그 결과다.
 */
export function makeProjection(b: Bounds, width: number): Projection {
  const midLat = ((b.minLat + b.maxLat) / 2) * (Math.PI / 180);
  const kx = Math.cos(midLat);
  const lonSpan = b.maxLon - b.minLon;
  const scale = width / (lonSpan * kx);
  return {
    width,
    height: (b.maxLat - b.minLat) * scale,
    project: (lat, lon) => ({
      x: (lon - b.minLon) * kx * scale,
      y: (b.maxLat - lat) * scale,
    }),
  };
}

/** 장소들을 감싸는 확대 범위. 화면 비율(종횡비)은 전체 지도와 같게 유지한다. */
export function zoomBounds(
  points: { lat: number; lon: number }[],
  full: Bounds,
  minLonSpan = 0.12,
): Bounds {
  const lats = points.map((p) => p.lat);
  const lons = points.map((p) => p.lon);
  const cLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const cLon = (Math.min(...lons) + Math.max(...lons)) / 2;
  const fullLon = full.maxLon - full.minLon;
  const fullLat = full.maxLat - full.minLat;
  const lonSpan = Math.min(fullLon, Math.max(minLonSpan, (Math.max(...lons) - Math.min(...lons)) * 2.4));
  const latSpan = (lonSpan * fullLat) / fullLon;
  return {
    minLon: cLon - lonSpan / 2,
    maxLon: cLon + lonSpan / 2,
    minLat: cLat - latSpan / 2,
    maxLat: cLat + latSpan / 2,
  };
}

/**
 * 화면 좌표에서 minDistance(px) 안에 있는 같은 그룹의 점을 하나로 묶는다(연쇄 포함).
 * 같은 좌표는 이동 없이 same-point, 다른 좌표가 겹치면 중심에 놓는 bundle.
 * 다른 그룹끼리는 묶지 않는다.
 * ponytail: 다른 지역 표식끼리의 겹침은 처리하지 않는다 — 현재 범위(갈릴리·예루살렘·여리고)는 수십 km 떨어져 있다. 지역이 늘어 겹치면 그룹 경계를 풀어 묶는다.
 */
export function layoutMarkers(
  anchors: Anchor[],
  proj: Projection,
  minDistance: number,
): Marker[] {
  const pts = anchors.map((a) => ({ a, ...proj.project(a.lat, a.lon) }));
  const parent = pts.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i]!)));

  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const p = pts[i]!, q = pts[j]!;
      if (p.a.groupKey !== q.a.groupKey) continue;
      if (Math.hypot(p.x - q.x, p.y - q.y) < minDistance) parent[find(i)] = find(j);
    }
  }

  const clusters = new Map<number, typeof pts>();
  pts.forEach((p, i) => {
    const root = find(i);
    clusters.set(root, [...(clusters.get(root) ?? []), p]);
  });

  return [...clusters.values()].map((members) => {
    const first = members[0]!;
    const sameSpot = members.every((m) => m.a.lat === first.a.lat && m.a.lon === first.a.lon);
    return {
      key: members.map((m) => m.a.id).sort().join("+"),
      groupKey: first.a.groupKey,
      ids: members.map((m) => m.a.id),
      x: members.reduce((s, m) => s + m.x, 0) / members.length,
      y: members.reduce((s, m) => s + m.y, 0) / members.length,
      kind: members.length === 1 ? "single" : sameSpot ? "same-point" : "bundle",
    };
  });
}
