import type { BookCode } from "@/parser/book-map";
import bible from "../../assets/bible-krv.json";

type BibleData = Record<string, Record<string, Record<string, string>>>;
const DATA: BibleData = bible as BibleData;

export type Testament = "OT" | "NT";

export type BookMeta = {
  code: BookCode;
  nameKo: string;
  testament: Testament;
};

export const BOOKS_META: ReadonlyArray<BookMeta> = [
  { code: "Gen", nameKo: "창세기", testament: "OT" },
  { code: "Exo", nameKo: "출애굽기", testament: "OT" },
  { code: "Lev", nameKo: "레위기", testament: "OT" },
  { code: "Num", nameKo: "민수기", testament: "OT" },
  { code: "Deu", nameKo: "신명기", testament: "OT" },
  { code: "Jos", nameKo: "여호수아", testament: "OT" },
  { code: "Jdg", nameKo: "사사기", testament: "OT" },
  { code: "Rut", nameKo: "룻기", testament: "OT" },
  { code: "1Sa", nameKo: "사무엘상", testament: "OT" },
  { code: "2Sa", nameKo: "사무엘하", testament: "OT" },
  { code: "1Ki", nameKo: "열왕기상", testament: "OT" },
  { code: "2Ki", nameKo: "열왕기하", testament: "OT" },
  { code: "1Ch", nameKo: "역대상", testament: "OT" },
  { code: "2Ch", nameKo: "역대하", testament: "OT" },
  { code: "Ezr", nameKo: "에스라", testament: "OT" },
  { code: "Neh", nameKo: "느헤미야", testament: "OT" },
  { code: "Est", nameKo: "에스더", testament: "OT" },
  { code: "Job", nameKo: "욥기", testament: "OT" },
  { code: "Psa", nameKo: "시편", testament: "OT" },
  { code: "Pro", nameKo: "잠언", testament: "OT" },
  { code: "Ecc", nameKo: "전도서", testament: "OT" },
  { code: "Sng", nameKo: "아가", testament: "OT" },
  { code: "Isa", nameKo: "이사야", testament: "OT" },
  { code: "Jer", nameKo: "예레미야", testament: "OT" },
  { code: "Lam", nameKo: "예레미야애가", testament: "OT" },
  { code: "Ezk", nameKo: "에스겔", testament: "OT" },
  { code: "Dan", nameKo: "다니엘", testament: "OT" },
  { code: "Hos", nameKo: "호세아", testament: "OT" },
  { code: "Joe", nameKo: "요엘", testament: "OT" },
  { code: "Amo", nameKo: "아모스", testament: "OT" },
  { code: "Oba", nameKo: "오바댜", testament: "OT" },
  { code: "Jon", nameKo: "요나", testament: "OT" },
  { code: "Mic", nameKo: "미가", testament: "OT" },
  { code: "Nam", nameKo: "나훔", testament: "OT" },
  { code: "Hab", nameKo: "하박국", testament: "OT" },
  { code: "Zep", nameKo: "스바냐", testament: "OT" },
  { code: "Hag", nameKo: "학개", testament: "OT" },
  { code: "Zec", nameKo: "스가랴", testament: "OT" },
  { code: "Mal", nameKo: "말라기", testament: "OT" },
  { code: "Mat", nameKo: "마태복음", testament: "NT" },
  { code: "Mrk", nameKo: "마가복음", testament: "NT" },
  { code: "Luk", nameKo: "누가복음", testament: "NT" },
  { code: "Jhn", nameKo: "요한복음", testament: "NT" },
  { code: "Act", nameKo: "사도행전", testament: "NT" },
  { code: "Rom", nameKo: "로마서", testament: "NT" },
  { code: "1Co", nameKo: "고린도전서", testament: "NT" },
  { code: "2Co", nameKo: "고린도후서", testament: "NT" },
  { code: "Gal", nameKo: "갈라디아서", testament: "NT" },
  { code: "Eph", nameKo: "에베소서", testament: "NT" },
  { code: "Php", nameKo: "빌립보서", testament: "NT" },
  { code: "Col", nameKo: "골로새서", testament: "NT" },
  { code: "1Th", nameKo: "데살로니가전서", testament: "NT" },
  { code: "2Th", nameKo: "데살로니가후서", testament: "NT" },
  { code: "1Ti", nameKo: "디모데전서", testament: "NT" },
  { code: "2Ti", nameKo: "디모데후서", testament: "NT" },
  { code: "Tit", nameKo: "디도서", testament: "NT" },
  { code: "Phm", nameKo: "빌레몬서", testament: "NT" },
  { code: "Heb", nameKo: "히브리서", testament: "NT" },
  { code: "Jas", nameKo: "야고보서", testament: "NT" },
  { code: "1Pe", nameKo: "베드로전서", testament: "NT" },
  { code: "2Pe", nameKo: "베드로후서", testament: "NT" },
  { code: "1Jn", nameKo: "요한일서", testament: "NT" },
  { code: "2Jn", nameKo: "요한이서", testament: "NT" },
  { code: "3Jn", nameKo: "요한삼서", testament: "NT" },
  { code: "Jud", nameKo: "유다서", testament: "NT" },
  { code: "Rev", nameKo: "요한계시록", testament: "NT" },
];

export function findBookMeta(code: BookCode): BookMeta | null {
  return BOOKS_META.find((m) => m.code === code) ?? null;
}

export function chapterCount(book: BookCode): number {
  const b = DATA[book];
  return b ? Object.keys(b).length : 0;
}

export function verseCount(book: BookCode, chapter: number): number {
  const c = DATA[book]?.[String(chapter)];
  return c ? Object.keys(c).length : 0;
}
