import type { BookCode } from "@/entities/scripture";

/** 사건 시대. 본문 속 사건의 넓은 맥락이며 작성일·책의 저작 시기가 아니다(R5). */
export type Period = {
  id: string;
  name: string;
  order: number;
  basis: string;
};

export type PlacePrecision = "site" | "city" | "area";

/** 시대별 장소. 같은 지역이라도 시대가 다르면 다른 항목이다(R4). */
export type Place = {
  id: string;
  regionKey: string;
  regionName: string;
  /** null이면 시대 미상. */
  periodId: string | null;
  name: string;
  lat: number;
  lon: number;
  precision: PlacePrecision;
  /** 위치 설명과 불확실성(R12). */
  locationNote: string;
  source: string;
};

/** 검토된 본문 사건. 같은 책·장의 절 범위 하나. */
export type Scene = {
  id: string;
  book: BookCode;
  chapter: number;
  start: number;
  end: number;
  /** 사건 시대. null이면 시대 미상. */
  periodId: string | null;
  placeIds: string[];
  basis: string;
};

export type MapData = {
  periods: Period[];
  places: Place[];
  scenes: Scene[];
};

/** 매칭에 필요한 노트 필드만. 노트 엔티티를 import하지 않으려고 구조만 받는다. */
export type MapNote = {
  id: string;
  scripture: string | null;
  citedRefs: string[];
};

export type SceneMatch = {
  sceneId: string;
  /** 노트에 적힌 원래 인용. */
  ref: string;
  /** 사건 범위와 실제로 겹친 절. */
  chapter: number;
  from: number;
  to: number;
};

/** (노트, 장소) 한 쌍. 같은 쌍은 하나로 합친다. */
export type PlaceLink = {
  noteId: string;
  placeId: string;
  matches: SceneMatch[];
};
