import type { InlineMark } from "@/domain/types";

// Inline emphasis is stored inside a block's text as lightweight markdown.
// Delimiters are intentionally distinct so combinations stay unambiguous:
//   bold      → **text**
//   italic    → _text_
//   underline → ++text++
// e.g. bold + italic → **_text_**
const BOLD = "**";
const UNDERLINE = "++";
const ITALIC = "_";

// Wrapping order is fixed outer→inner so output is deterministic and the
// toggle-based parser below can round-trip it: underline ⊃ bold ⊃ italic.
const WRAP_ORDER: readonly InlineMark[] = ["underline", "bold", "italic"];

const DELIM: Record<InlineMark, string> = {
  bold: BOLD,
  italic: ITALIC,
  underline: UNDERLINE,
};

// Minimal ProseMirror inline node shapes (a subset of what TipTap emits).
type PMMark = { type: string; attrs?: Record<string, unknown> };
type PMInlineNode = { type: string; text?: string; marks?: PMMark[] };

function marksToSet(marks: PMMark[] | undefined): Set<InlineMark> {
  const set = new Set<InlineMark>();
  if (!marks) return set;
  for (const m of marks) {
    if (m.type === "bold") set.add("bold");
    else if (m.type === "italic") set.add("italic");
    else if (m.type === "underline") set.add("underline");
    // strike / link / color etc. are intentionally dropped — this app only
    // surfaces bold/italic/underline.
  }
  return set;
}

function wrap(text: string, marks: Set<InlineMark>): string {
  let out = text;
  // Inner→outer so the fixed nesting order is produced.
  for (let i = WRAP_ORDER.length - 1; i >= 0; i -= 1) {
    const mark = WRAP_ORDER[i]!;
    if (marks.has(mark)) {
      const d = DELIM[mark];
      out = `${d}${out}${d}`;
    }
  }
  return out;
}

// ProseMirror inline content → markdown string.
export function inlineToMarkdown(content: PMInlineNode[] | undefined): string {
  if (!content || content.length === 0) return "";
  let out = "";
  for (const node of content) {
    if (node.type === "hardBreak") {
      out += "\n";
      continue;
    }
    if (node.type === "text" && typeof node.text === "string") {
      const text = node.text;
      if (text.length === 0) continue;
      out += wrap(text, marksToSet(node.marks));
    }
  }
  return out;
}

function activeMarks(flags: {
  bold: boolean;
  italic: boolean;
  underline: boolean;
}): PMMark[] {
  const marks: PMMark[] = [];
  if (flags.bold) marks.push({ type: "bold" });
  if (flags.italic) marks.push({ type: "italic" });
  if (flags.underline) marks.push({ type: "underline" });
  return marks;
}

// Markdown string → ProseMirror inline content. Newlines become hardBreak
// nodes so soft line breaks inside a block survive the round trip.
export function markdownToInline(text: string): PMInlineNode[] {
  const nodes: PMInlineNode[] = [];
  const flags = { bold: false, italic: false, underline: false };
  let buf = "";

  const flush = (): void => {
    if (buf.length === 0) return;
    const marks = activeMarks(flags);
    nodes.push(marks.length ? { type: "text", text: buf, marks } : { type: "text", text: buf });
    buf = "";
  };

  let i = 0;
  while (i < text.length) {
    const two = text.slice(i, i + 2);
    const ch = text[i]!;
    if (two === BOLD) {
      flush();
      flags.bold = !flags.bold;
      i += 2;
    } else if (two === UNDERLINE) {
      flush();
      flags.underline = !flags.underline;
      i += 2;
    } else if (ch === ITALIC) {
      flush();
      flags.italic = !flags.italic;
      i += 1;
    } else if (ch === "\n") {
      flush();
      nodes.push({ type: "hardBreak" });
      i += 1;
    } else {
      buf += ch;
      i += 1;
    }
  }
  flush();
  return nodes;
}

// Strip emphasis delimiters, leaving plain readable text. Used by FTS body_text,
// list previews, and cited-ref scans where marks add no signal.
export function stripInlineMarks(text: string): string {
  return text
    .split(BOLD)
    .join("")
    .split(UNDERLINE)
    .join("")
    .split(ITALIC)
    .join("");
}
