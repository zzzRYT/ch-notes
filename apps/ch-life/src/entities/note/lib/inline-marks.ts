import type { InlineMark } from "../model/types";

// Inline emphasis is stored inside a block's text as lightweight markdown:
//   bold      → **text**
//   italic    → _text_
//   underline → ++text++
const BOLD = "**";
const UNDERLINE = "++";
const ITALIC = "_";

export const INLINE_MARK_DELIMITER: Record<InlineMark, string> = {
  bold: BOLD,
  italic: ITALIC,
  underline: UNDERLINE,
};

// Longer delimiters first so `**` is never read as two italics.
const DELIMITERS: readonly [string, InlineMark][] = [
  [BOLD, "bold"],
  [UNDERLINE, "underline"],
  [ITALIC, "italic"],
];

// Strip emphasis delimiters, leaving plain readable text. Used by list previews
// (and any plain-text scan) where the markdown markers add no signal.
export function stripInlineMarks(text: string): string {
  return text
    .split(BOLD)
    .join("")
    .split(UNDERLINE)
    .join("")
    .split(ITALIC)
    .join("");
}

export type InlineRun = {
  text: string;
  // For a delimiter: the marks in effect right after it — an opener carries its
  // mark, a closer does not. iOS styles a typed character like the one before
  // the caret, so this is what makes text typed after `**` come out bold and
  // text typed after the closing `**` come out plain.
  marks: InlineMark[];
  // The delimiter itself. The editor shows it instead of hiding it, so the
  // stored string and the on-screen string stay index-for-index identical.
  delimiter: boolean;
};

// Split text into styled runs. A delimiter opens a mark only when the same
// delimiter appears again later (its closer); an unpaired one is plain text.
// Concatenating every run's `text` gives back the input unchanged.
export function tokenizeInlineMarks(text: string): InlineRun[] {
  const runs: InlineRun[] = [];
  const active = new Set<InlineMark>();
  let plain = "";
  const flush = () => {
    if (plain) runs.push({ text: plain, marks: [...active], delimiter: false });
    plain = "";
  };
  let i = 0;
  while (i < text.length) {
    const hit = DELIMITERS.find(
      ([d, mark]) =>
        text.startsWith(d, i) &&
        (active.has(mark) || text.indexOf(d, i + d.length) !== -1),
    );
    if (!hit) {
      plain += text[i];
      i += 1;
      continue;
    }
    const [d, mark] = hit;
    flush();
    if (active.has(mark)) active.delete(mark);
    else active.add(mark);
    runs.push({ text: d, marks: [...active], delimiter: true });
    i += d.length;
  }
  flush();
  return runs;
}

// Marks a character typed at `pos` would get — what the toolbar shows as "on".
// Tokenizes with a probe character at the caret, which also covers an empty
// pair (`**|**`) where no text run exists yet.
export function marksAt(text: string, pos: number): InlineMark[] {
  const probe = "\u0000";
  const runs = tokenizeInlineMarks(text.slice(0, pos) + probe + text.slice(pos));
  return runs.find((r) => r.text.includes(probe))?.marks ?? [];
}

export type MarkEdit = { text: string; start: number; end: number };

// Toolbar B / I / U on the current selection.
// - selection already wrapped (`**|sel|**`, or selecting `**sel**` itself) → unwrap
// - collapsed caret right before the closer of an active mark → step past it,
//   so the next keystrokes come out plain ("turn bold off")
// - otherwise → wrap; a collapsed caret gets an empty pair `**|**` to type into
export function toggleInlineMark(
  text: string,
  start: number,
  end: number,
  mark: InlineMark,
): MarkEdit {
  const d = INLINE_MARK_DELIMITER[mark];
  const n = d.length;
  const before = text.slice(0, start);
  const sel = text.slice(start, end);
  const after = text.slice(end);

  if (before.endsWith(d) && after.startsWith(d)) {
    return {
      text: before.slice(0, -n) + sel + after.slice(n),
      start: start - n,
      end: end - n,
    };
  }
  if (sel.length >= 2 * n && sel.startsWith(d) && sel.endsWith(d)) {
    return {
      text: before + sel.slice(n, -n) + after,
      start,
      end: end - 2 * n,
    };
  }
  if (start === end && after.startsWith(d) && marksAt(text, start).includes(mark)) {
    return { text, start: start + n, end: end + n };
  }
  return {
    text: before + d + sel + d + after,
    start: start + n,
    end: end + n,
  };
}
