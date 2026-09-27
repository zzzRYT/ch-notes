import { makeQuoteBlock, type BlockNode } from "@/entities/note";
import { BUNDLED_EDITION_ID, lookupVerses } from "@/entities/scripture";
import { splitAtRef, type DetectedRef } from "./autocomplete";

/**
 * 문단 `idx`를 [참조 앞] / [인용] / [참조 뒤] 세 블록으로 나눈다(RULE-EDIT-002).
 * 글머리 블록이면 앞부분은 글머리로 남고, 뒷부분은 문단이 된다(목록은 인용에서 끝난다).
 * 본문 조회에 실패하면 `null` — 호출자는 아무것도 바꾸지 않는다.
 */
export function splitParagraphWithQuote(
  source: BlockNode[],
  idx: number,
  before: string,
  ref: DetectedRef,
): BlockNode[] | null {
  const verses = lookupVerses(ref.ref);
  if (!verses) return null;
  const next = source.slice();
  const current = next[idx];
  const isText = current?.type === "paragraph" || current?.type === "bullet";
  const { head, tail } = isText
    ? splitAtRef(before, ref)
    : { head: "", tail: "" };
  next[idx] = { type: current?.type === "bullet" ? "bullet" : "paragraph", text: head };
  next.splice(
    idx + 1,
    0,
    makeQuoteBlock(ref.ref, verses, BUNDLED_EDITION_ID),
    { type: "paragraph", text: tail },
  );
  return next;
}
