/**
 * Task 0.2 미완료 상태에서 다운스트림 작업(SQLite, verse-lookup, editor 등)이
 * 막히지 않도록 minimal placeholder `bible-krv.json` 생성.
 *
 * 포함 데이터:
 *   - 66권 코드 모두 (top-level keys)
 *   - 테스트가 요구하는 절만 실제 KRV 본문:
 *       Gen 1:1   (Task 1.3 bible-data.test)
 *       Col 3:20..22 (Task 2.3 verse-lookup.test 범위 케이스)
 *   - 그 외 모든 책/장은 빈 객체 (lookup 시 null 반환)
 *
 * 실데이터가 들어오면 build-bible.ts로 교체.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { BOOK_CODES } from "./build-bible";

type BibleData = Record<string, Record<string, Record<string, string>>>;

const OUT_PATH = path.resolve(__dirname, "../assets/bible-krv.json");

const SEEDS: Array<[string, number, number, string]> = [
  ["Gen", 1, 1, "태초에 하나님이 천지를 창조하시니라"],
  [
    "Col", 3, 20,
    "자녀들아 모든 일에 부모에게 순종하라 이는 주 안에서 기쁘게 하는 것이니라",
  ],
  ["Col", 3, 21, "아비들아 너희 자녀를 격노케 말지니 낙심할까 함이라"],
  [
    "Col", 3, 22,
    "종들아 모든 일에 육신의 상전들에게 순종하되 사람을 기쁘게 하는 자와 같이 눈가림만 하지 말고 오직 주를 두려워하여 성실한 마음으로 하라",
  ],
];

function build(): BibleData {
  const out: BibleData = {};
  for (const code of BOOK_CODES) out[code] = {};
  for (const [book, chapter, verse, text] of SEEDS) {
    const b = out[book];
    if (!b) throw new Error(`unknown book code in seed: ${book}`);
    const cKey = String(chapter);
    const vKey = String(verse);
    if (!b[cKey]) b[cKey] = {};
    b[cKey][vKey] = text;
  }
  return out;
}

function main(): void {
  const data = build();
  fs.writeFileSync(OUT_PATH, JSON.stringify(data, null, 0) + "\n");
  console.log(`placeholder 생성: ${OUT_PATH} (66권, 시드 ${SEEDS.length}절)`);
}

if (require.main === module) main();
