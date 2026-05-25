import { parseRef } from "./ref-parser";
import { bookDisplayName } from "./book-map";

/**
 * Renders a scripture reference with its full canonical book name.
 * "요 1:2" → "요한복음 1:2", "요 3:16-17" → "요한복음 3:16-17".
 * Input that cannot be parsed is returned trimmed and unchanged so legacy
 * or free-form refs still display gracefully.
 */
export function formatRef(raw: string): string {
  const parsed = parseRef(raw);
  if (!parsed) return raw.trim();
  const { book, chapter, verse, end } = parsed;
  const base = `${bookDisplayName(book)} ${chapter}:${verse}`;
  return end != null && end !== verse ? `${base}-${end}` : base;
}
