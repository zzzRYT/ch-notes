import { lookupVerses } from "@/parser/verse-lookup";

const TAIL_PATTERN =
  /([가-힣]{1,8}|[A-Za-z]{2,20})\s?\d{1,3}:\d{1,3}$/;

export type DetectedRef = {
  ref: string;
  start: number;
  end: number;
};

export function detectRefAtCursor(
  text: string,
  cursor: number,
): DetectedRef | null {
  const before = text.slice(0, cursor);
  const m = TAIL_PATTERN.exec(before);
  if (!m) return null;
  const ref = m[0];
  const start = before.length - ref.length;
  // 데드 ref면 칩 안 띄움
  const verses = lookupVerses(ref);
  if (!verses) return null;
  return { ref, start, end: before.length };
}
