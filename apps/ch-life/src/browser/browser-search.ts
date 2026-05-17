import { resolveBookCode, type BookCode } from "@/parser/book-map";

export type BrowserQueryResult =
  | { kind: "book"; book: BookCode }
  | { kind: "chapter"; book: BookCode; chapter: number }
  | { kind: "verse"; book: BookCode; chapter: number; verse: number };

const PATTERN =
  /^([가-힣]{1,8}|[A-Za-z][A-Za-z\s]{0,20})(?:\s*(\d{1,3})(?::(\d{1,3}))?)?$/;

export function resolveBrowserQuery(input: string): BrowserQueryResult | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const m = PATTERN.exec(trimmed);
  if (!m) return null;
  const [, bookRaw, chapterStr, verseStr] = m;
  if (!bookRaw) return null;
  const book = resolveBookCode(bookRaw);
  if (!book) return null;
  if (!chapterStr) return { kind: "book", book };
  const chapter = Number(chapterStr);
  if (!Number.isInteger(chapter) || chapter < 1) return null;
  if (!verseStr) return { kind: "chapter", book, chapter };
  const verse = Number(verseStr);
  if (!Number.isInteger(verse) || verse < 1) return null;
  return { kind: "verse", book, chapter, verse };
}
