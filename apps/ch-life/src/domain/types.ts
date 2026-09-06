export type Verse = {
  book: string;
  chapter: number;
  verse: number;
  text: string;
};

// Inline emphasis stored inside a block's `text` as lightweight markdown:
//   bold      → **text**
//   italic    → _text_
//   underline → ++text++
// Storing marks in the text keeps `text: string` on every block, so the
// share/markdown export, FTS body_text, list preview, and cited-ref extraction
// only need to strip the delimiters rather than understand a span model.
export type InlineMark = "bold" | "italic" | "underline";

export type BlockNode =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "bullet"; text: string }
  | { type: "todo"; checked: boolean; text: string }
  | { type: "blockquote"; text: string }
  | {
      type: "quote";
      ref: string;
      verses: Verse[];
      status: "loading" | "loaded" | "error";
    };

// Block types whose content is a single rich-text string (everything except the
// scripture `quote`, which carries structured verse data instead).
export type TextBlock = Extract<BlockNode, { text: string }>;

export type Note = {
  id: string;
  title: string | null;
  body: BlockNode[];
  createdAt: number;
  updatedAt: number;
  citedRefs: string[];
  sermonDate: string | null;
  preacher: string | null;
  location: string | null;
  scripture: string | null;
};

export type Variation = "minimal" | "paper" | "focus" | "dark";

export type BlockStyle = "default" | "card" | "quote" | "collapse";
export type FontFamily = "sans" | "serif" | "mono";
export type AccentChoice =
  | "default"
  | "#1e6fd9"
  | "#b15c2e"
  | "#1f8a5b"
  | "#f5b35e"
  | "#7a5af0"
  | "#6b7280";

export type Settings = {
  fontScale: 1.0 | 1.2 | 1.4 | 1.6;
  themePreference: "system" | "light" | "dark";
  variation: Variation;
  blockStyle: BlockStyle;
  fontFamily: FontFamily;
  accentChoice: AccentChoice;
  lastOpenedNoteId: string | null;
  lastBibleRef: string | null;
  /** 스토어 업데이트 안내를 닫은 버전. 같은 버전은 다시 띄우지 않는다. */
  dismissedUpdateVersion: string | null;
};
