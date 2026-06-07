import { resolveBrowserQuery } from "./browser-search";
import type { BrowserLevel } from "./BibleReader";

export function levelFromRef(ref: string | null | undefined): BrowserLevel {
  if (!ref) return { kind: "books" };
  const r = resolveBrowserQuery(ref);
  if (!r) return { kind: "books" };
  if (r.kind === "book") return { kind: "chapters", book: r.book };
  return { kind: "verses", book: r.book, chapter: r.chapter };
}
