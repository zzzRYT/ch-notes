import { resolveBookCode, type BookCode } from "./book-map";

export type ParsedRef = {
  book: BookCode;
  chapter: number;
  verse: number;
  end: number | null;
};

const PATTERN =
  /^([가-힣]{1,8}|[A-Za-z][A-Za-z\s]{0,20})\s*(\d{1,3}):(\d{1,3})(?:-(\d{1,3}))?$/;

export function parseRef(input: string): ParsedRef | null {
  const trimmed = input.trim();
  const m = PATTERN.exec(trimmed);
  if (!m) return null;
  const [, bookRaw, chapterStr, verseStr, endStr] = m;
  if (!bookRaw || !chapterStr || !verseStr) return null;
  const code = resolveBookCode(bookRaw);
  if (!code) return null;
  const chapter = Number(chapterStr);
  const verse = Number(verseStr);
  const end = endStr ? Number(endStr) : null;
  if (!Number.isInteger(chapter) || !Number.isInteger(verse)) return null;
  return { book: code, chapter, verse, end };
}
