// Inline emphasis is stored inside a block's text as lightweight markdown:
//   bold      → **text**
//   italic    → _text_
//   underline → ++text++
const BOLD = "**";
const UNDERLINE = "++";
const ITALIC = "_";

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
