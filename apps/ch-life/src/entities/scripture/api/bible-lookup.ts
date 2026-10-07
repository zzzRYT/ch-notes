import { parseRef } from "../model/ref-parser";
import type { Verse } from "../model/types";

export type BibleData = Record<string, Record<string, Record<string, string>>>;

export function createBibleLookup(data: BibleData) {
  function lookupVerses(refInput: string): Verse[] | null {
    const parsed = parseRef(refInput);
    if (!parsed) return null;
    const { book, chapter, verse, end } = parsed;
    const endVerse = end ?? verse;
    if (endVerse < verse) return null;

    const chapterData = data[book]?.[String(chapter)];
    if (!chapterData) return null;

    const verses: Verse[] = [];
    for (let v = verse; v <= endVerse; v++) {
      const text = chapterData[String(v)];
      if (!text) return null;
      verses.push({ book, chapter, verse: v, text });
    }
    return verses.length > 0 ? verses : null;
  }

  return { lookupVerses };
}
