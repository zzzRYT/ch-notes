import type { BlockNode, CitationVerse, QuoteBlockNode } from "./types";

/**
 * `editionId` 없이 저장된 인용이 가리키는 판본. 그 필드가 생기기 전의 인용은
 * 전부 이 번들에서 왔으므로 읽을 때 이 값으로 채운다(ADR-0024 전환 규칙).
 * 번들 판본이 바뀌어도 이 상수는 바뀌지 않는다 — 과거 사실이다.
 */
export const LEGACY_CITATION_EDITION_ID = "openbible-ko";

/** 인용 블록을 만드는 유일한 자리. `status`는 항상 `loaded`다(RULE-EDIT-007). */
export function makeQuoteBlock(
  ref: string,
  verses: CitationVerse[],
  editionId: string,
): QuoteBlockNode {
  return { type: "quote", ref, verses, status: "loaded", editionId };
}

/** 저장소에서 읽은 본문의 인용에 빠진 `editionId`를 채운다. 새 배열을 돌려준다. */
export function withCitationEdition(body: BlockNode[]): BlockNode[] {
  return body.map((block) =>
    block.type === "quote" && block.editionId === undefined
      ? { ...block, editionId: LEGACY_CITATION_EDITION_ID }
      : block,
  );
}
