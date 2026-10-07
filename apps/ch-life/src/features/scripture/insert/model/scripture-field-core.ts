import type { Verse } from "@/entities/scripture";

export type ScriptureValidation = { valid: boolean; verses: Verse[] | null };

export function validateScriptureWithLookup(
  ref: string,
  lookup: (ref: string) => Verse[] | null,
): ScriptureValidation {
  const trimmed = ref.trim();
  if (!trimmed) return { valid: false, verses: null };
  const verses = lookup(trimmed);
  return { valid: verses !== null, verses };
}
