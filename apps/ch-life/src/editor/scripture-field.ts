import type { Verse } from "@/domain/types";
import { lookupVerses } from "@/parser/verse-lookup";

export type ScriptureValidation = {
  valid: boolean;
  verses: Verse[] | null;
};

// 생명양식 입력값을 검증한다. 성경 본문이 실제로 조회되면 valid.
export function validateScripture(ref: string): ScriptureValidation {
  const trimmed = ref.trim();
  if (!trimmed) return { valid: false, verses: null };
  const verses = lookupVerses(trimmed);
  return { valid: verses !== null, verses };
}
