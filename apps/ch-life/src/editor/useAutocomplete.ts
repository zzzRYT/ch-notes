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

// Whitespace that arms the autocomplete when typed right after a reference.
const TRIGGER_CHAR = /[\s\n]/;

function commonPrefixLength(a: string, b: string): number {
  const max = Math.min(a.length, b.length);
  let i = 0;
  while (i < max && a.charCodeAt(i) === b.charCodeAt(i)) i++;
  return i;
}

function commonSuffixLength(
  a: string,
  b: string,
  prefixLength: number,
): number {
  const max = Math.min(a.length, b.length) - prefixLength;
  let i = 0;
  while (
    i < max &&
    a.charCodeAt(a.length - 1 - i) === b.charCodeAt(b.length - 1 - i)
  ) {
    i++;
  }
  return i;
}

export type TriggeredRef = {
  detected: DetectedRef;
  /**
   * The input with the trigger whitespace removed but all other text — both
   * before and after the reference — preserved, so the caller can split it
   * into head / quote / tail.
   */
  textWithoutTrigger: string;
};

/**
 * Decide whether an edit (from `prev` to `next`) just created a citation shape:
 * a valid reference followed by trigger whitespace somewhere in the changed
 * range.
 *
 * Unlike inspecting the end of the field, this scans the changed range, so
 * typing or pasting `안녕하세요 창 1:3 누구세요` can promote the middle reference
 * exactly like typing it at the end of the field.
 *
 * Newlines need extra care: pressing Enter often inserts a `\n` right next to
 * the line break that already precedes the following line, and the two orders
 * (`…3\n[\n]누구` vs `…3[\n]\n누구`) are the same string — a plain prefix diff
 * picks the later position, leaving the reference ending in `\n` so it fails to
 * match. The citation's trigger is the FIRST such whitespace after the
 * reference, so we walk back to the start of the run of identical chars.
 */
export function detectTriggeredRef(
  prev: string,
  next: string,
): TriggeredRef | null {
  if (next.length <= prev.length) return null;
  const insertStart = commonPrefixLength(prev, next);
  const insertEnd = next.length - commonSuffixLength(prev, next, insertStart);

  for (let i = insertStart; i < insertEnd; i++) {
    const triggerChar = next.charAt(i);
    if (!TRIGGER_CHAR.test(triggerChar)) continue;

    let refEnd = i;
    while (refEnd > 0 && next.charAt(refEnd - 1) === triggerChar) refEnd--;

    const detected = detectRefAtCursor(next, refEnd);
    if (!detected) continue;

    const textWithoutTrigger = next.slice(0, refEnd) + next.slice(refEnd + 1);
    return { detected, textWithoutTrigger };
  }

  return null;
}
