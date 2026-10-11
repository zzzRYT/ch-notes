import terrain from "../../../../assets/maps/scripture-region.json";
import type { Bounds } from "./marker-layout";

/** Natural Earth(공개 영역)을 지도 범위로 자른 현대 해안선·호수. 고대 지형이 아니다(R12). */
export const TERRAIN = terrain as {
  bbox: Bounds;
  /** [lon, lat, lon, lat, …] 평탄 배열의 고리들. */
  land: number[][];
  lakes: { name: string; rings: number[][] }[];
};

export const FULL_BOUNDS: Bounds = TERRAIN.bbox;
