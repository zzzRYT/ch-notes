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

export type Settings = {
  fontScale: 1.0 | 1.2 | 1.4 | 1.6;
  themePreference: "system" | "light" | "dark";
  lastOpenedNoteId: string | null;
};
