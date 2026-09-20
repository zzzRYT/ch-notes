import { parseRef } from "../model/ref-parser";
import type { Verse } from "../model/types";
import { BIBLE_DATA as DATA } from "./bible-data";

export function lookupVerses(refInput: string): Verse[] | null {
  const parsed = parseRef(refInput);
  if (!parsed) return null;
  const { book, chapter, verse, end } = parsed;
  const endVerse = end ?? verse;
  if (endVerse < verse) return null;

  const chapterData = DATA[book]?.[String(chapter)];
  if (!chapterData) return null;

  const verses: Verse[] = [];
  for (let v = verse; v <= endVerse; v++) {
    const text = chapterData[String(v)];
    if (!text) return null;
    verses.push({ book, chapter, verse: v, text });
  }
  return verses.length > 0 ? verses : null;
}
