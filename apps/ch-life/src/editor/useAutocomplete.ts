import { lookupVerses } from '@/parser/verse-lookup';

// Matches a reference at the cursor, including an optional verse range
// (`1:1-3`, `1:1~3`). The range separator is kept tight with no surrounding
// spaces: the autocomplete fires on space, so `1:1 - 3` would insert the
// single verse `1:1` before the `- 3` is ever typed.
const RANGE_SEP = '[-~–〜～]';
const TAIL_PATTERN = new RegExp(
  `([가-힣]{1,8}|[A-Za-z]{2,20})\\s?\\d{1,3}:\\d{1,3}(?:${RANGE_SEP}\\d{1,3})?$`,
);

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

export type RefSplit = {
  /** Text preceding the reference; trailing whitespace trimmed. */
  head: string;
  /** Text following the reference. */
  tail: string;
};

export function splitAtRef(before: string, ref: DetectedRef): RefSplit {
  return {
    head: before.slice(0, ref.start).replace(/\s+$/, ''),
    tail: before.slice(ref.end),
  };
}
