/**
 * Task 0.2에서 결정된 소스 URL에서 KRV JSON을 받아
 * { [book: string]: { [chapter: string]: { [verse: string]: string } } }
 * 형태로 정규화 후 assets/bible-krv.json에 저장.
 *
 * 현재 상태: Task 0.2 미완료 → assets/bible-krv.json은 placeholder.
 * 소스 확정 후 normalize() 구현 채워서 실데이터로 교체.
 */
import * as fs from "node:fs";
import * as path from "node:path";

const SOURCE_URL = process.env.KRV_SOURCE_URL ?? "";
const OUT_PATH = path.resolve(__dirname, "../assets/bible-krv.json");

export const BOOK_CODES = [
  "Gen", "Exo", "Lev", "Num", "Deu", "Jos", "Jdg", "Rut", "1Sa", "2Sa",
  "1Ki", "2Ki", "1Ch", "2Ch", "Ezr", "Neh", "Est", "Job", "Psa", "Pro",
  "Ecc", "Sng", "Isa", "Jer", "Lam", "Ezk", "Dan", "Hos", "Joe", "Amo",
  "Oba", "Jon", "Mic", "Nam", "Hab", "Zep", "Hag", "Zec", "Mal",
  "Mat", "Mrk", "Luk", "Jhn", "Act", "Rom", "1Co", "2Co", "Gal", "Eph",
  "Php", "Col", "1Th", "2Th", "1Ti", "2Ti", "Tit", "Phm", "Heb", "Jas",
  "1Pe", "2Pe", "1Jn", "2Jn", "3Jn", "Jud", "Rev",
] as const;

type BibleData = Record<string, Record<string, Record<string, string>>>;

async function main(): Promise<void> {
  if (!SOURCE_URL) {
    throw new Error(
      "KRV_SOURCE_URL 환경변수가 비어있다. Task 0.2 완료 후 URL 설정 필요.",
    );
  }
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`fetch 실패: ${res.status}`);
  const raw = (await res.json()) as unknown;
  const normalized = normalize(raw);
  validate(normalized);
  fs.writeFileSync(OUT_PATH, JSON.stringify(normalized));
  console.log(`완료: ${OUT_PATH} (${BOOK_CODES.length}권)`);
}

function normalize(_raw: unknown): BibleData {
  // Task 0.2 결정된 소스 포맷에 맞춰 채움.
  throw new Error("Task 0.2 결과에 따라 매핑 로직 구현 필요");
}

function validate(data: BibleData): void {
  for (const code of BOOK_CODES) {
    if (!data[code]) throw new Error(`누락된 책: ${code}`);
  }
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
