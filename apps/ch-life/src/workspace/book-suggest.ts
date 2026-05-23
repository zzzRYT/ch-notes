import { BOOKS_META } from "@/browser/books-meta";
import type { BookCode } from "@/parser/book-map";

export type BookSuggestion = {
  code: BookCode;
  shortKo: string;
  fullKo: string;
};

// Korean short aliases for each book (개역개정 standard abbreviations).
const SHORT_KO: Record<BookCode, string> = {
  Gen: "창", Exo: "출", Lev: "레", Num: "민", Deu: "신",
  Jos: "수", Jdg: "삿", Rut: "룻",
  "1Sa": "삼상", "2Sa": "삼하", "1Ki": "왕상", "2Ki": "왕하",
  "1Ch": "대상", "2Ch": "대하", Ezr: "스", Neh: "느",
  Est: "에", Job: "욥", Psa: "시", Pro: "잠",
  Ecc: "전", Sng: "아", Isa: "사", Jer: "렘",
  Lam: "애", Ezk: "겔", Dan: "단", Hos: "호",
  Joe: "욜", Amo: "암", Oba: "옵", Jon: "욘",
  Mic: "미", Nam: "나", Hab: "합", Zep: "습",
  Hag: "학", Zec: "슥", Mal: "말",
  Mat: "마", Mrk: "막", Luk: "눅", Jhn: "요",
  Act: "행", Rom: "롬", "1Co": "고전", "2Co": "고후",
  Gal: "갈", Eph: "엡", Php: "빌", Col: "골",
  "1Th": "살전", "2Th": "살후", "1Ti": "딤전", "2Ti": "딤후",
  Tit: "딛", Phm: "몬", Heb: "히", Jas: "약",
  "1Pe": "벧전", "2Pe": "벧후", "1Jn": "요일", "2Jn": "요이",
  "3Jn": "요삼", Jud: "유", Rev: "계",
};

const TABLE: ReadonlyArray<BookSuggestion> = BOOKS_META.map((m) => ({
  code: m.code,
  shortKo: SHORT_KO[m.code],
  fullKo: m.nameKo,
}));

export function suggestBooks(query: string, limit = 6): BookSuggestion[] {
  const q = query.trim();
  if (!q) return [];
  return TABLE.filter(
    (b) => b.shortKo.startsWith(q) || b.fullKo.startsWith(q),
  ).slice(0, limit);
}
