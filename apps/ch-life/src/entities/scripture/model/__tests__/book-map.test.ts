import { resolveBookCode } from "../book-map";

const FULL_KO: ReadonlyArray<readonly [string, string]> = [
  ["창세기", "Gen"], ["출애굽기", "Exo"], ["레위기", "Lev"], ["민수기", "Num"],
  ["신명기", "Deu"], ["여호수아", "Jos"], ["사사기", "Jdg"], ["룻기", "Rut"],
  ["사무엘상", "1Sa"], ["사무엘하", "2Sa"], ["열왕기상", "1Ki"], ["열왕기하", "2Ki"],
  ["역대상", "1Ch"], ["역대하", "2Ch"], ["에스라", "Ezr"], ["느헤미야", "Neh"],
  ["에스더", "Est"], ["욥기", "Job"], ["시편", "Psa"], ["잠언", "Pro"],
  ["전도서", "Ecc"], ["아가", "Sng"], ["이사야", "Isa"], ["예레미야", "Jer"],
  ["예레미야애가", "Lam"], ["에스겔", "Ezk"], ["다니엘", "Dan"], ["호세아", "Hos"],
  ["요엘", "Joe"], ["아모스", "Amo"], ["오바댜", "Oba"], ["요나", "Jon"],
  ["미가", "Mic"], ["나훔", "Nam"], ["하박국", "Hab"], ["스바냐", "Zep"],
  ["학개", "Hag"], ["스가랴", "Zec"], ["말라기", "Mal"],
  ["마태복음", "Mat"], ["마가복음", "Mrk"], ["누가복음", "Luk"], ["요한복음", "Jhn"],
  ["사도행전", "Act"], ["로마서", "Rom"], ["고린도전서", "1Co"], ["고린도후서", "2Co"],
  ["갈라디아서", "Gal"], ["에베소서", "Eph"], ["빌립보서", "Php"], ["골로새서", "Col"],
  ["데살로니가전서", "1Th"], ["데살로니가후서", "2Th"], ["디모데전서", "1Ti"],
  ["디모데후서", "2Ti"], ["디도서", "Tit"], ["빌레몬서", "Phm"], ["히브리서", "Heb"],
  ["야고보서", "Jas"], ["베드로전서", "1Pe"], ["베드로후서", "2Pe"],
  ["요한일서", "1Jn"], ["요한이서", "2Jn"], ["요한삼서", "3Jn"], ["유다서", "Jud"],
  ["요한계시록", "Rev"],
];

const ABBR_KO: ReadonlyArray<readonly [string, string]> = [
  ["창", "Gen"], ["출", "Exo"], ["레", "Lev"], ["민", "Num"], ["신", "Deu"],
  ["수", "Jos"], ["삿", "Jdg"], ["룻", "Rut"], ["삼상", "1Sa"], ["삼하", "2Sa"],
  ["왕상", "1Ki"], ["왕하", "2Ki"], ["대상", "1Ch"], ["대하", "2Ch"], ["스", "Ezr"],
  ["느", "Neh"], ["에", "Est"], ["욥", "Job"], ["시", "Psa"], ["잠", "Pro"],
  ["전", "Ecc"], ["아", "Sng"], ["사", "Isa"], ["렘", "Jer"], ["애", "Lam"],
  ["겔", "Ezk"], ["단", "Dan"], ["호", "Hos"], ["욜", "Joe"], ["암", "Amo"],
  ["옵", "Oba"], ["욘", "Jon"], ["미", "Mic"], ["나", "Nam"], ["합", "Hab"],
  ["습", "Zep"], ["학", "Hag"], ["슥", "Zec"], ["말", "Mal"],
  ["마", "Mat"], ["막", "Mrk"], ["눅", "Luk"], ["요", "Jhn"], ["행", "Act"],
  ["롬", "Rom"], ["고전", "1Co"], ["고후", "2Co"], ["갈", "Gal"], ["엡", "Eph"],
  ["빌", "Php"], ["골", "Col"], ["살전", "1Th"], ["살후", "2Th"],
  ["딤전", "1Ti"], ["딤후", "2Ti"], ["딛", "Tit"], ["몬", "Phm"], ["히", "Heb"],
  ["약", "Jas"], ["벧전", "1Pe"], ["벧후", "2Pe"], ["요일", "1Jn"], ["요이", "2Jn"],
  ["요삼", "3Jn"], ["유", "Jud"], ["계", "Rev"],
];

const EN_FULL: ReadonlyArray<readonly [string, string]> = [
  ["Genesis", "Gen"], ["Exodus", "Exo"], ["Leviticus", "Lev"], ["Numbers", "Num"],
  ["Deuteronomy", "Deu"], ["Joshua", "Jos"], ["Judges", "Jdg"], ["Ruth", "Rut"],
  ["1 Samuel", "1Sa"], ["2 Samuel", "2Sa"], ["1 Kings", "1Ki"], ["2 Kings", "2Ki"],
  ["1 Chronicles", "1Ch"], ["2 Chronicles", "2Ch"], ["Ezra", "Ezr"], ["Nehemiah", "Neh"],
  ["Esther", "Est"], ["Job", "Job"], ["Psalms", "Psa"], ["Proverbs", "Pro"],
  ["Ecclesiastes", "Ecc"], ["Isaiah", "Isa"], ["Jeremiah", "Jer"],
  ["Lamentations", "Lam"], ["Ezekiel", "Ezk"], ["Daniel", "Dan"], ["Hosea", "Hos"],
  ["Joel", "Joe"], ["Amos", "Amo"], ["Obadiah", "Oba"], ["Jonah", "Jon"],
  ["Micah", "Mic"], ["Nahum", "Nam"], ["Habakkuk", "Hab"], ["Zephaniah", "Zep"],
  ["Haggai", "Hag"], ["Zechariah", "Zec"], ["Malachi", "Mal"],
  ["Matthew", "Mat"], ["Mark", "Mrk"], ["Luke", "Luk"], ["John", "Jhn"],
  ["Acts", "Act"], ["Romans", "Rom"], ["1 Corinthians", "1Co"], ["2 Corinthians", "2Co"],
  ["Galatians", "Gal"], ["Ephesians", "Eph"], ["Philippians", "Php"], ["Colossians", "Col"],
  ["1 Thessalonians", "1Th"], ["2 Thessalonians", "2Th"],
  ["1 Timothy", "1Ti"], ["2 Timothy", "2Ti"], ["Titus", "Tit"], ["Philemon", "Phm"],
  ["Hebrews", "Heb"], ["James", "Jas"], ["1 Peter", "1Pe"], ["2 Peter", "2Pe"],
  ["1 John", "1Jn"], ["2 John", "2Jn"], ["3 John", "3Jn"], ["Jude", "Jud"],
  ["Revelation", "Rev"],
];

const EN_ABBR: ReadonlyArray<readonly [string, string]> = [
  ["Gen", "Gen"], ["Exo", "Exo"], ["Col", "Col"], ["Rev", "Rev"],
  ["1Co", "1Co"], ["Phil", "Php"], ["Mk", "Mrk"], ["Jn", "Jhn"],
  ["Ps", "Psa"], ["1Sam", "1Sa"], ["2Kgs", "2Ki"],
];

describe("resolveBookCode — 한국어 정식 66권", () => {
  for (const [input, code] of FULL_KO) {
    it(`${input} → ${code}`, () => {
      expect(resolveBookCode(input)).toBe(code);
    });
  }
});

describe("resolveBookCode — 한국어 축약 66권", () => {
  for (const [input, code] of ABBR_KO) {
    it(`${input} → ${code}`, () => {
      expect(resolveBookCode(input)).toBe(code);
    });
  }
});

describe("resolveBookCode — 영어 정식", () => {
  for (const [input, code] of EN_FULL) {
    it(`${input} → ${code}`, () => {
      expect(resolveBookCode(input)).toBe(code);
    });
  }
});

describe("resolveBookCode — 영어 축약", () => {
  for (const [input, code] of EN_ABBR) {
    it(`${input} → ${code}`, () => {
      expect(resolveBookCode(input)).toBe(code);
    });
  }
});

describe("resolveBookCode — 데드 케이스", () => {
  it("존재하지 않는 책은 null", () => {
    expect(resolveBookCode("롤리")).toBeNull();
  });
  it("빈 문자열은 null", () => {
    expect(resolveBookCode("")).toBeNull();
  });
});
