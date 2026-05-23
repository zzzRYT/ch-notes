export type Verse = {
  book: string;
  chapter: number;
  verse: number;
  text: string;
};

export type BlockNode =
  | { type: "paragraph"; text: string }
  | {
      type: "quote";
      ref: string;
      verses: Verse[];
      status: "loading" | "loaded" | "error";
    };

export type Note = {
  id: string;
  title: string | null;
  body: BlockNode[];
  createdAt: number;
  updatedAt: number;
  citedRefs: string[];
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
};
