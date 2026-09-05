#!/usr/bin/env node
// wiki/check.mjs — 정본 위키 무결성 검사
//
//   node wiki/check.mjs
//
// 검사 항목
//   1. ID 유일성
//   2. RULE-*가 가리키는 POL-* 실재 여부
//   3. implemented_by / verified_by / source 의 저장소 경로 실재 여부
//   4. 자동 증거(test: 또는 ci:) 없는 MUST — waiver가 있으면 통과
//   5. 폴더 인덱스 — 폴더마다 index.md가 있고, 그 안의 모든 파일과 ID를 담고 있는지
//   6. 산문에 등장하는 모든 ID 토큰이 실재하는 블록인지
//   7. 마크다운 링크 대상 실재 여부
//   8. gen-index.mjs의 AREAS가 모든 RULE 계열을 덮는지
//   9. 커버리지 집계
//
// 종료 코드: 오류가 하나라도 있으면 1.

import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const WIKI = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(WIKI);

const errors = [];
const warnings = [];

// ── 마크다운 수집 ────────────────────────────────────────────────
// README.md는 형식 설명용 예시 블록을 담고 있어 수집 대상에서 뺀다.
const SKIP = new Set(["README.md"]);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (entry.endsWith(".md") && !(dir === WIKI && SKIP.has(entry))) out.push(p);
  }
  return out;
}

// ── 최소 YAML 파서 ───────────────────────────────────────────────
// 이 위키의 블록은 "key: value" 와 "  - item" / "  - key: value" 두 형태만 쓴다.
function parseBlock(text) {
  const obj = {};
  let currentKey = null;
  for (const raw of text.split("\n")) {
    if (!raw.trim() || raw.trim().startsWith("#")) continue;
    const listItem = /^\s+-\s+(.*)$/.exec(raw);
    if (listItem && currentKey) {
      const item = listItem[1].trim();
      const kv = /^([A-Za-z_][A-Za-z0-9_]*):\s+(.*)$/.exec(item);
      (obj[currentKey] ||= []).push(kv ? { key: kv[1], value: kv[2] } : { key: null, value: item });
      continue;
    }
    const kv = /^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/.exec(raw);
    if (kv) {
      currentKey = kv[1];
      const value = kv[2].trim();
      if (value) obj[currentKey] = value;
      else obj[currentKey] = [];
    }
  }
  return obj;
}

function extractBlocks(file) {
  const src = readFileSync(file, "utf8");
  const blocks = [];
  const re = /```yaml\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const parsed = parseBlock(m[1]);
    if (parsed.id) blocks.push({ ...parsed, file: relative(ROOT, file) });
  }
  return blocks;
}

// ── 경로 검사 ────────────────────────────────────────────────────
const PATHY = /^[\w./\-[\]@]+\.(md|ts|tsx|sql|json|yml|yaml|mjs|js)$/;

function checkPath(block, field, value) {
  // "path#테스트이름" 또는 "path 설명…" 형태를 모두 받는다.
  const hashAt = value.indexOf("#");
  const head = hashAt === -1 ? value : value.slice(0, hashAt);
  const token = head.trim().split(/\s+/)[0];
  if (!PATHY.test(token)) return; // 커밋 해시·산문 근거 등은 건너뛴다
  const abs = join(ROOT, token);
  if (!existsSync(abs)) {
    errors.push(`${block.id} (${block.file}) — ${field}의 경로가 없다: ${token}`);
    return;
  }
  // `#조각`은 그 파일 안에 실제로 있는 문자열이어야 한다.
  // 증거가 가리키는 테스트 이름이 사라지면 여기서 걸린다.
  if (hashAt === -1) return;
  const fragment = value.slice(hashAt + 1).trim();
  if (!fragment || token.endsWith(".md")) return; // 문서 절 제목은 검사 대상 아님
  if (!readFileSync(abs, "utf8").includes(fragment)) {
    errors.push(
      `${block.id} (${block.file}) — ${field}의 조각이 파일에 없다: ${token}#${fragment}`,
    );
  }
}

// ── 수집 ────────────────────────────────────────────────────────
const blocks = walk(WIKI).flatMap(extractBlocks);
const byId = new Map();

for (const b of blocks) {
  if (byId.has(b.id)) {
    errors.push(`ID 중복: ${b.id} (${byId.get(b.id).file}, ${b.file})`);
  } else {
    byId.set(b.id, b);
  }
}

// ── 검사 ────────────────────────────────────────────────────────
const AUTOMATED = new Set(["test", "ci"]);

for (const b of blocks) {
  const kind = b.id.split("-")[0];

  if (kind === "RULE" && !b.policy) {
    errors.push(`${b.id} (${b.file}) — 상위 policy가 없다`);
  }
  if (b.policy && !byId.has(b.policy)) {
    errors.push(`${b.id} (${b.file}) — 상위 policy를 찾을 수 없다: ${b.policy}`);
  }

  for (const field of ["implemented_by", "verified_by", "source"]) {
    const items = b[field];
    if (!Array.isArray(items)) continue;
    for (const item of items) checkPath(b, field, item.value);
  }

  const req = typeof b.requirement === "string" ? b.requirement : null;
  if (req && /^MUST/.test(req)) {
    const evidence = Array.isArray(b.verified_by) ? b.verified_by : [];
    const automated = evidence.some((e) => AUTOMATED.has(e.key));
    if (!automated && !b.waiver) {
      errors.push(
        `${b.id} (${b.file}) — 자동 증거 없이 ${req}를 쓴다. test/ci 증거를 붙이거나 requirement를 낮추거나 waiver를 적어라`,
      );
    }
  }

  if (!b.confidence) warnings.push(`${b.id} (${b.file}) — confidence 표기 없음`);
}

// 상위 정책에 규칙이 하나도 없으면 알린다
const policiesUsed = new Set(blocks.map((b) => b.policy).filter(Boolean));
for (const b of blocks) {
  if (b.id.startsWith("POL-") && !policiesUsed.has(b.id)) {
    warnings.push(`${b.id} (${b.file}) — 이 정책을 가리키는 RULE이 없다`);
  }
}

// ── 폴더 인덱스 검사 ─────────────────────────────────────────────
// 폴더마다 손으로 쓴 index.md가 있고, 그 폴더의 모든 파일과 모든 ID를 담아야 한다.
// 파일이나 규칙을 새로 만들고 인덱스를 안 고치면 여기서 걸린다.
const FOLDER_INDEX = "index.md";

// wiki/ 아래에서 .md를 가진 모든 디렉터리 (루트 자신은 README.md 목차가 대신한다)
function indexedDirs(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (!statSync(p).isDirectory()) continue;
    if (readdirSync(p).some((f) => f.endsWith(".md"))) out.push(p);
    out.push(...indexedDirs(p));
  }
  return out;
}

for (const dir of indexedDirs(WIKI)) {
  const entry = relative(WIKI, dir);
  const indexPath = join(dir, FOLDER_INDEX);
  if (!existsSync(indexPath)) {
    errors.push(`${entry}/ — ${FOLDER_INDEX}가 없다. 폴더마다 역할 인덱스를 둔다`);
    continue;
  }
  const indexText = readFileSync(indexPath, "utf8");

  // 파일은 마크다운 링크로 걸려 있어야 한다. 단순 부분 문자열이면
  // `note-search.md`가 `search.md` 검사를 통과시켜 버린다.
  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".md") || name === FOLDER_INDEX) continue;
    if (!indexText.includes(`](${name})`)) {
      errors.push(`${entry}/${FOLDER_INDEX} — ${name} 링크가 인덱스에 없다`);
    }
  }

  // ID는 하나씩 적거나 `RULE-SET-001 ~ RULE-SET-006` 범위로 적는다.
  // 범위는 끝 번호까지만 덮으므로, 007을 새로 만들면 여기서 걸린다.
  const covered = new Set();
  const RANGE = /\b([A-Z]+(?:-[A-Z0-9]+)*)-(\d+)\s*~\s*\1-(\d+)\b/g;
  for (const m of indexText.matchAll(RANGE)) {
    const width = m[2].length;
    for (let n = Number(m[2]); n <= Number(m[3]); n++) {
      covered.add(`${m[1]}-${String(n).padStart(width, "0")}`);
    }
  }

  const prefix = relative(ROOT, dir) + "/";
  for (const b of blocks) {
    if (!b.file.startsWith(prefix)) continue;
    const literal = new RegExp(`\\b${b.id}\\b`).test(indexText);
    if (!literal && !covered.has(b.id)) {
      errors.push(`${entry}/${FOLDER_INDEX} — ${b.id}이 인덱스에 없다 (${b.file})`);
    }
  }
}

// ── 산문 ID 검사 ─────────────────────────────────────────────────
// 위키 어디서든 ID 모양으로 적힌 것은 실재하는 블록이어야 한다.
// 인덱스·drift·산문의 오타를 잡는다. README.md는 형식 예시라 제외.
const ID_TOKEN = /\b(?:POL|RULE|CONTRACT|ADR)-[A-Z0-9]+(?:-[A-Z0-9]+)*\b/g;
const LINK_TARGET = /\]\([^)]*\)/g; // 링크 주소는 파일명이라 ID가 아니다
const MD_FILENAME = /[\w.-]+\.md/g;   // 링크 텍스트에 쓰인 파일명도 ID가 아니다

// `RULE-EDIT`처럼 계열 이름으로 쓰는 것은 허용한다 — 그 계열에 실제 ID가 있으면 된다.
const isFamily = (token) => {
  for (const id of byId.keys()) if (id.startsWith(token + "-")) return true;
  return false;
};

for (const file of walk(WIKI)) {
  const rel = relative(WIKI, file);
  const text = readFileSync(file, "utf8")
    .replace(LINK_TARGET, "]()")
    .replace(MD_FILENAME, "");
  const unknown = new Set();
  for (const m of text.matchAll(ID_TOKEN)) {
    if (!byId.has(m[0]) && !isFamily(m[0])) unknown.add(m[0]);
  }
  for (const id of unknown) {
    errors.push(`${rel} — 존재하지 않는 ID를 가리킨다: ${id}`);
  }
}

// ── 링크 실재 검사 ───────────────────────────────────────────────
// `](대상)` 형태의 상대 링크가 실제 파일을 가리키는지 본다.
// 존재하지 않는 문서를 여러 곳에서 안내하는 사고를 막는다.
const MD_LINK = /\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

for (const file of walk(WIKI)) {
  const rel = relative(WIKI, file);
  const seen = new Set();
  for (const m of readFileSync(file, "utf8").matchAll(MD_LINK)) {
    const target = m[1].split("#")[0];
    if (!target || /^(https?:|mailto:)/.test(target)) continue;
    if (seen.has(target)) continue;
    seen.add(target);
    if (!existsSync(join(dirname(file), target))) {
      errors.push(`${rel} — 링크 대상이 없다: ${target}`);
    }
  }
}

// ── 안내 문서의 코드 경로 검사 ───────────────────────────────────
// by-task.md·workflow.md는 산문으로 코드 경로를 안내한다. YAML 블록이 아니라
// 위의 경로 검사가 닿지 않으므로, 백틱 안의 경로 토큰을 따로 확인한다.
const GUIDES = ["by-task.md", "workflow.md"];
const APP = "apps/ch-life";

function expandBraces(s) {
  const m = /^(.*?)\{([^{}]*)\}(.*)$/.exec(s);
  if (!m) return [s];
  return m[2].split(",").flatMap((x) => expandBraces(m[1] + x.trim() + m[3]));
}

function pathExists(rel) {
  // 글로브는 `*` 앞의 디렉터리까지만 확인한다 (`src/x/__tests__/*.test.ts` → `src/x/__tests__`).
  const star = rel.indexOf("*");
  const bare =
    star === -1 ? rel : rel.slice(0, rel.lastIndexOf("/", star)).replace(/\/$/, "");
  // 저장소 루트 · 앱 루트 · 위키 자신 기준 셋 다 받는다.
  return (
    existsSync(join(ROOT, bare)) ||
    existsSync(join(ROOT, APP, bare)) ||
    existsSync(join(WIKI, bare))
  );
}

for (const guide of GUIDES) {
  const file = join(WIKI, guide);
  if (!existsSync(file)) continue;
  const src = readFileSync(file, "utf8");
  const bad = new Set();
  for (const m of src.matchAll(/`([^`\n]+)`/g)) {
    // 백틱 안에 여러 경로가 나열될 수 있다. 중괄호 안의 쉼표는 보존한다.
    let depth = 0, cur = "";
    const parts = [];
    for (const ch of m[1]) {
      if (ch === "{") depth++;
      if (ch === "}") depth--;
      if ((ch === " " || ch === "·") && depth === 0) { if (cur) parts.push(cur); cur = ""; }
      else cur += ch;
    }
    if (cur) parts.push(cur);

    for (const raw of parts) {
      const tok = raw.replace(/[.,]+$/, "");
      if (!tok.includes("/") || /^(https?:|\/)/.test(tok)) continue;
      if (!/^[\w./\-[\]{}*,]+$/.test(tok)) continue;
      for (const cand of expandBraces(tok)) {
        if (!pathExists(cand)) bad.add(cand);
      }
    }
  }
  for (const b of bad) errors.push(`${guide} — 안내하는 경로가 없다: ${b}`);
}

// ── 생성기 커버리지 검사 ─────────────────────────────────────────
// gen-index.mjs의 AREAS에 없는 접두사의 RULE은 index.md에서 조용히 빠진다.
const GEN = join(WIKI, "gen-index.mjs");
if (existsSync(GEN)) {
  const genSrc = readFileSync(GEN, "utf8");
  const known = new Set([...genSrc.matchAll(/\["(RULE-[A-Z0-9]+)"/g)].map((m) => m[1]));
  const missing = new Set();
  for (const b of blocks) {
    if (!b.id.startsWith("RULE-")) continue;
    const family = b.id.split("-").slice(0, 2).join("-");
    if (!known.has(family)) missing.add(family);
  }
  for (const f of missing) {
    errors.push(`gen-index.mjs — AREAS에 ${f} 계열이 없다. index.md에서 조용히 빠진다`);
  }
}

// ── 집계 ────────────────────────────────────────────────────────
const count = (pred) => blocks.filter(pred).length;
const rules = blocks.filter((b) => b.id.startsWith("RULE-"));
const withTest = rules.filter((b) =>
  (Array.isArray(b.verified_by) ? b.verified_by : []).some((e) => AUTOMATED.has(e.key)),
);
const confidence = {};
for (const b of blocks) confidence[b.confidence ?? "(없음)"] = (confidence[b.confidence ?? "(없음)"] ?? 0) + 1;
const requirement = {};
for (const b of rules) requirement[b.requirement ?? "(없음)"] = (requirement[b.requirement ?? "(없음)"] ?? 0) + 1;

const pct = (n, d) => (d === 0 ? "0" : ((n / d) * 100).toFixed(0));

console.log("ch-life 정본 위키 검사\n");
console.log(`  POL       ${count((b) => b.id.startsWith("POL-"))}`);
console.log(`  RULE      ${rules.length}`);
console.log(`  CONTRACT  ${count((b) => b.id.startsWith("CONTRACT-"))}`);
console.log(`  ADR       ${count((b) => b.id.startsWith("ADR-"))}`);
console.log(`  합계      ${blocks.length}\n`);
console.log(`  자동 증거가 붙은 RULE  ${withTest.length}/${rules.length} (${pct(withTest.length, rules.length)}%)`);
console.log(`  requirement 분포       ${JSON.stringify(requirement)}`);
console.log(`  confidence 분포        ${JSON.stringify(confidence)}\n`);

const needsAnswer = blocks.filter((b) => b.confidence === "확인필요");
if (needsAnswer.length) {
  console.log(`  확인필요 ${needsAnswer.length}건: ${needsAnswer.map((b) => b.id).join(", ")}\n`);
}

for (const w of warnings) console.log(`  경고  ${w}`);
if (warnings.length) console.log("");
for (const e of errors) console.log(`  오류  ${e}`);

if (errors.length) {
  console.log(`\n실패 — 오류 ${errors.length}건`);
  process.exit(1);
}
console.log("통과 — 오류 없음");
