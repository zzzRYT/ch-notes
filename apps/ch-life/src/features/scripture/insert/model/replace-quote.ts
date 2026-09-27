import { makeQuoteBlock, type BlockNode } from "@/entities/note";
import {
  BUNDLED_EDITION_ID,
  formatRef,
  lookupVerses,
} from "@/entities/scripture";

/**
 * 인용 `idx`의 참조를 `ref`로 바꾼 새 본문. 바꿀 수 없으면 `null` —
 * `idx`가 인용이 아니거나, 본문 조회에 실패하거나, 같은 구절(표시 이름 기준)일 때.
 * 인용은 `makeQuoteBlock`으로만 다시 만든다(RULE-EDIT-007).
 */
export function replaceQuoteRef(
  body: BlockNode[],
  idx: number,
  ref: string,
): BlockNode[] | null {
  const current = body[idx];
  if (current?.type !== "quote") return null;
  const trimmed = ref.trim();
  if (formatRef(trimmed) === formatRef(current.ref)) return null;
  const verses = lookupVerses(trimmed);
  if (!verses) return null;
  const next = body.slice();
  next[idx] = makeQuoteBlock(trimmed, verses, BUNDLED_EDITION_ID);
  return next;
}
