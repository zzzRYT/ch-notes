import type { BlockNode } from "@/domain/types";
import { formatRef } from "@/parser/format-ref";
import { lookupVerses } from "@/parser/verse-lookup";

export type InsertVerseResult =
  | { ok: true; body: BlockNode[]; message: string }
  | { ok: false; body: BlockNode[]; message: string };

export function insertVerse(
  body: BlockNode[],
  ref: string,
): InsertVerseResult {
  const verses = lookupVerses(ref);
  if (!verses) {
    return {
      ok: false,
      body,
      message: "성경 구절을 추가하지 못했습니다",
    };
  }

  return {
    ok: true,
    body: [
      ...body,
      { type: "quote", ref, verses, status: "loaded" },
      { type: "paragraph", text: "" },
    ],
    message: `${formatRef(ref)}을 노트에 추가했습니다`,
  };
}
