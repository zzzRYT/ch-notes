import type { BlockNode } from "@/domain/types";

// 설교 메타 헤더의 입력 필드 — 키보드 Return으로 이동하는 순서.
export type MetaFieldKey =
  | "title"
  | "date"
  | "preacher"
  | "location"
  | "scripture";

export const META_FIELD_ORDER: readonly MetaFieldKey[] = [
  "title",
  "date",
  "preacher",
  "location",
  "scripture",
];

// 메타 필드 다음 포커스 대상. 마지막 필드 다음은 본문("body")으로 넘어간다.
export type MetaNavTarget = MetaFieldKey | "body";

export function nextMetaField(current: MetaFieldKey): MetaNavTarget {
  const i = META_FIELD_ORDER.indexOf(current);
  const next = i < 0 ? undefined : META_FIELD_ORDER[i + 1];
  return next ?? "body";
}

// 본문에서 캐럿을 처음 놓을 단락 블록의 인덱스. 단락이 없으면 -1.
export function firstParagraphIndex(body: BlockNode[]): number {
  return body.findIndex((block) => block.type === "paragraph");
}
