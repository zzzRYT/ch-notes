export type BookCode =
  | "Gen" | "Exo" | "Lev" | "Num" | "Deu" | "Jos" | "Jdg" | "Rut"
  | "1Sa" | "2Sa" | "1Ki" | "2Ki" | "1Ch" | "2Ch" | "Ezr" | "Neh"
  | "Est" | "Job" | "Psa" | "Pro" | "Ecc" | "Sng" | "Isa" | "Jer"
  | "Lam" | "Ezk" | "Dan" | "Hos" | "Joe" | "Amo" | "Oba" | "Jon"
  | "Mic" | "Nam" | "Hab" | "Zep" | "Hag" | "Zec" | "Mal"
  | "Mat" | "Mrk" | "Luk" | "Jhn" | "Act" | "Rom" | "1Co" | "2Co"
  | "Gal" | "Eph" | "Php" | "Col" | "1Th" | "2Th" | "1Ti" | "2Ti"
  | "Tit" | "Phm" | "Heb" | "Jas" | "1Pe" | "2Pe" | "1Jn" | "2Jn"
  | "3Jn" | "Jud" | "Rev";

const ALIAS_TABLE: ReadonlyArray<{ code: BookCode; aliases: readonly string[] }> = [
  { code: "Gen", aliases: ["창세기", "창", "Genesis", "Gen"] },
  { code: "Exo", aliases: ["출애굽기", "출", "Exodus", "Exo", "Ex"] },
  { code: "Lev", aliases: ["레위기", "레", "Leviticus", "Lev"] },
  { code: "Num", aliases: ["민수기", "민", "Numbers", "Num"] },
  { code: "Deu", aliases: ["신명기", "신", "Deuteronomy", "Deu", "Dt"] },
  { code: "Jos", aliases: ["여호수아", "수", "Joshua", "Jos", "Josh"] },
  { code: "Jdg", aliases: ["사사기", "삿", "Judges", "Jdg", "Judg"] },
  { code: "Rut", aliases: ["룻기", "룻", "Ruth", "Rut"] },
  { code: "1Sa", aliases: ["사무엘상", "삼상", "1 Samuel", "1Sa", "1Sam"] },
  { code: "2Sa", aliases: ["사무엘하", "삼하", "2 Samuel", "2Sa", "2Sam"] },
  { code: "1Ki", aliases: ["열왕기상", "왕상", "1 Kings", "1Ki", "1Kgs"] },
  { code: "2Ki", aliases: ["열왕기하", "왕하", "2 Kings", "2Ki", "2Kgs"] },
  { code: "1Ch", aliases: ["역대상", "대상", "1 Chronicles", "1Ch"] },
  { code: "2Ch", aliases: ["역대하", "대하", "2 Chronicles", "2Ch"] },
  { code: "Ezr", aliases: ["에스라", "스", "Ezra", "Ezr"] },
  { code: "Neh", aliases: ["느헤미야", "느", "Nehemiah", "Neh"] },
  { code: "Est", aliases: ["에스더", "에", "Esther", "Est"] },
  { code: "Job", aliases: ["욥기", "욥", "Job"] },
  { code: "Psa", aliases: ["시편", "시", "Psalms", "Psalm", "Psa", "Ps"] },
  { code: "Pro", aliases: ["잠언", "잠", "Proverbs", "Pro", "Prov"] },
  { code: "Ecc", aliases: ["전도서", "전", "Ecclesiastes", "Ecc", "Eccl"] },
  { code: "Sng", aliases: ["아가", "아", "Song of Solomon", "Song", "Sng", "SoS"] },
  { code: "Isa", aliases: ["이사야", "사", "Isaiah", "Isa"] },
  { code: "Jer", aliases: ["예레미야", "렘", "Jeremiah", "Jer"] },
  { code: "Lam", aliases: ["예레미야애가", "애", "Lamentations", "Lam"] },
  { code: "Ezk", aliases: ["에스겔", "겔", "Ezekiel", "Ezk", "Ezek"] },
  { code: "Dan", aliases: ["다니엘", "단", "Daniel", "Dan"] },
  { code: "Hos", aliases: ["호세아", "호", "Hosea", "Hos"] },
  { code: "Joe", aliases: ["요엘", "욜", "Joel", "Joe"] },
  { code: "Amo", aliases: ["아모스", "암", "Amos", "Amo"] },
  { code: "Oba", aliases: ["오바댜", "옵", "Obadiah", "Oba"] },
  { code: "Jon", aliases: ["요나", "욘", "Jonah", "Jon"] },
  { code: "Mic", aliases: ["미가", "미", "Micah", "Mic"] },
  { code: "Nam", aliases: ["나훔", "나", "Nahum", "Nam"] },
  { code: "Hab", aliases: ["하박국", "합", "Habakkuk", "Hab"] },
  { code: "Zep", aliases: ["스바냐", "습", "Zephaniah", "Zep"] },
  { code: "Hag", aliases: ["학개", "학", "Haggai", "Hag"] },
  { code: "Zec", aliases: ["스가랴", "슥", "Zechariah", "Zec", "Zech"] },
  { code: "Mal", aliases: ["말라기", "말", "Malachi", "Mal"] },
  { code: "Mat", aliases: ["마태복음", "마", "Matthew", "Mat", "Matt"] },
  { code: "Mrk", aliases: ["마가복음", "막", "Mark", "Mrk", "Mk"] },
  { code: "Luk", aliases: ["누가복음", "눅", "Luke", "Luk", "Lk"] },
  { code: "Jhn", aliases: ["요한복음", "요", "John", "Jhn", "Jn"] },
  { code: "Act", aliases: ["사도행전", "행", "Acts", "Act"] },
  { code: "Rom", aliases: ["로마서", "롬", "Romans", "Rom"] },
  { code: "1Co", aliases: ["고린도전서", "고전", "1 Corinthians", "1Co", "1Cor"] },
  { code: "2Co", aliases: ["고린도후서", "고후", "2 Corinthians", "2Co", "2Cor"] },
  { code: "Gal", aliases: ["갈라디아서", "갈", "Galatians", "Gal"] },
  { code: "Eph", aliases: ["에베소서", "엡", "Ephesians", "Eph"] },
  { code: "Php", aliases: ["빌립보서", "빌", "Philippians", "Php", "Phil"] },
  { code: "Col", aliases: ["골로새서", "골", "Colossians", "Col"] },
  { code: "1Th", aliases: ["데살로니가전서", "살전", "1 Thessalonians", "1Th"] },
  { code: "2Th", aliases: ["데살로니가후서", "살후", "2 Thessalonians", "2Th"] },
  { code: "1Ti", aliases: ["디모데전서", "딤전", "1 Timothy", "1Ti", "1Tim"] },
  { code: "2Ti", aliases: ["디모데후서", "딤후", "2 Timothy", "2Ti", "2Tim"] },
  { code: "Tit", aliases: ["디도서", "딛", "Titus", "Tit"] },
  { code: "Phm", aliases: ["빌레몬서", "몬", "Philemon", "Phm"] },
  { code: "Heb", aliases: ["히브리서", "히", "Hebrews", "Heb"] },
  { code: "Jas", aliases: ["야고보서", "약", "James", "Jas"] },
  { code: "1Pe", aliases: ["베드로전서", "벧전", "1 Peter", "1Pe", "1Pet"] },
  { code: "2Pe", aliases: ["베드로후서", "벧후", "2 Peter", "2Pe", "2Pet"] },
  { code: "1Jn", aliases: ["요한일서", "요일", "1 John", "1Jn"] },
  { code: "2Jn", aliases: ["요한이서", "요이", "2 John", "2Jn"] },
  { code: "3Jn", aliases: ["요한삼서", "요삼", "3 John", "3Jn"] },
  { code: "Jud", aliases: ["유다서", "유", "Jude", "Jud"] },
  { code: "Rev", aliases: ["요한계시록", "계", "Revelation", "Rev", "Rv"] },
];

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "");
}

const ALIAS_MAP: ReadonlyMap<string, BookCode> = (() => {
  const m = new Map<string, BookCode>();
  for (const { aliases, code } of ALIAS_TABLE) {
    for (const a of aliases) m.set(normalize(a), code);
  }
  return m;
})();

export function resolveBookCode(input: string): BookCode | null {
  if (!input) return null;
  return ALIAS_MAP.get(normalize(input)) ?? null;
}

// The first alias of each entry is the canonical Korean book name.
const DISPLAY_NAME_MAP: ReadonlyMap<BookCode, string> = (() => {
  const m = new Map<BookCode, string>();
  for (const { aliases, code } of ALIAS_TABLE) {
    const canonical = aliases[0];
    if (canonical) m.set(code, canonical);
  }
  return m;
})();

export function bookDisplayName(code: BookCode): string {
  return DISPLAY_NAME_MAP.get(code) ?? code;
}
