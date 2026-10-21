import terrain from "../../../../assets/maps/scripture-region.json";
import contextLabels from "../../../../assets/maps/context-labels.json";

/**
 * Natural Earth(공개 영역)를 지도 범위로 자른 현대 해안선·호수·강. 고대 지형이 아니다(R12).
 * 좌표는 [lon, lat, lon, lat, …] 평탄 배열이다. 재생성: scripts/build-map-terrain.mjs
 */
export const TERRAIN = terrain as {
  land: number[][];
  lakes: { name: string; rings: number[][] }[];
  rivers: number[][];
};

export type ContextKind = "water" | "area" | "mount" | "town";
export type ContextLabel = {
  kind: ContextKind;
  name: string;
  lon: number;
  lat: number;
  anchor?: "start" | "middle" | "end";
  minS?: number;
  maxS?: number;
};
export const CONTEXT_LABELS = contextLabels.labels as ContextLabel[];
