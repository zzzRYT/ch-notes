import type { BookCode } from "./book-map";

export type Verse = {
  book: BookCode;
  chapter: number;
  verse: number;
  text: string;
};
