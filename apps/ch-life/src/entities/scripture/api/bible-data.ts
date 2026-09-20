import bible from "../../../../assets/bible.json";

// 번들 데이터의 모양: 책 코드 → 장 번호(문자열) → 절 번호(문자열) → 본문.
export type BibleData = Record<string, Record<string, Record<string, string>>>;

export const BIBLE_DATA: BibleData = bible as BibleData;

export type ChapterVerse = { num: number; text: string };

/** 한 장의 절 목록. 없는 책·장이면 빈 배열. */
export function chapterVerses(book: string, chapter: number): ChapterVerse[] {
  const c = BIBLE_DATA[book]?.[String(chapter)];
  if (!c) return [];
  return Object.keys(c)
    .map((k) => ({ num: Number(k), text: c[k] ?? "" }))
    .sort((a, b) => a.num - b.num);
}
