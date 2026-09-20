#!/usr/bin/env node
// className 오라클. uniwind는 모르는 클래스를 조용히 버린다(store.ts: `if (!(className in stylesheet)) continue`).
// 그래서 소스의 모든 className 토큰이 실제 번들 스타일시트에 들어갔는지 대조한다.
//
//   node scripts/check-classnames.mjs            # export부터 실행(느림, ~1분)
//   node scripts/check-classnames.mjs <bundle.js> # 이미 뽑은 --no-bytecode 번들로 대조
import { execSync } from "node:child_process";
import { readFileSync, readdirSync, statSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const ROOT = new URL("..", import.meta.url).pathname;

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) {
      if (e !== "__tests__") walk(p, out);
    } else if (p.endsWith(".tsx")) out.push(p);
  }
  return out;
}

// `xxxClassName=` 뒤의 속성값(문자열 또는 {식})을 통째로 잘라 그 안의 문자열 리터럴을 토큰으로 쪼갠다.
// 식이 `className={ROW}`·`className={cls(x)}`처럼 식별자를 참조하면 같은 파일의
// `const ROW = …` / `function cls(…) { … }` 본문까지 따라가 거기 리터럴도 센다.
function literalsIn(text) {
  const out = [];
  for (const lit of text.matchAll(/(["'`])((?:\\.|(?!\1)[^\\])*)\1/g)) {
    for (const tok of lit[2].replace(/\$\{[^}]*\}/g, " ").split(/\s+/)) if (tok) out.push(tok);
  }
  return out;
}

function definitionOf(src, name) {
  const c = new RegExp(`\\bconst ${name}\\s*=\\s*([^;]*);`).exec(src);
  if (c) return c[1];
  const f = new RegExp(`\\bfunction ${name}\\b[^{]*\\{`).exec(src);
  if (!f) return null;
  let depth = 0, i = f.index + f[0].length - 1;
  for (; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}" && --depth === 0) break;
  }
  return src.slice(f.index, i + 1);
}

function tokensOf(src) {
  const out = new Map();
  const re = /[A-Za-z]*[cC]lassName=/g;
  let m;
  while ((m = re.exec(src))) {
    let i = m.index + m[0].length;
    let value;
    if (src[i] === '"' || src[i] === "'") {
      const q = src[i];
      const end = src.indexOf(q, i + 1);
      value = src.slice(i, end + 1);
      i = end + 1;
    } else if (src[i] === "{") {
      let depth = 0, j = i;
      for (; j < src.length; j++) {
        if (src[j] === "{") depth++;
        else if (src[j] === "}" && --depth === 0) break;
      }
      value = src.slice(i, j + 1);
      i = j + 1;
    } else continue;
    // 식별자 참조를 정의로 치환해 리터럴을 모은다. 따라가는 것은 SCREAMING_CASE 상수와
    // 함수 호출 `name(` 뿐이다 — `compact ? … : …` 같은 조건 변수는 클래스 정의가 아니다.
    const seen = new Set();
    const queue = [value];
    while (queue.length) {
      const text = queue.pop();
      for (const tok of literalsIn(text)) out.set(tok, (out.get(tok) ?? 0) + 1);
      for (const id of text.matchAll(/\b([A-Z][A-Z0-9_]+)\b|\b([a-zA-Z_][A-Za-z0-9_]*)\(/g)) {
        const name = id[1] ?? id[2];
        if (seen.has(name)) continue;
        seen.add(name);
        const def = definitionOf(src, name);
        if (def) queue.push(def);
      }
    }
    re.lastIndex = i;
  }
  return out;
}

const used = new Map();
for (const f of walk(join(ROOT, "src"))) {
  for (const [t, n] of tokensOf(readFileSync(f, "utf8"))) {
    if (!used.has(t)) used.set(t, []);
    used.get(t).push(f.replace(ROOT, ""));
  }
}

let bundle = process.argv[2];
if (!bundle) {
  const out = mkdtempSync(join(tmpdir(), "ch-life-classnames-"));
  execSync(`npx expo export --platform ios --no-bytecode --output-dir ${out}`, {
    cwd: ROOT, stdio: "ignore", env: { ...process.env, CI: "1" },
  });
  const dir = join(out, "_expo/static/js/ios");
  bundle = join(dir, readdirSync(dir).find((f) => f.endsWith(".js")));
}
const js = readFileSync(bundle, "utf8");
const compiled = new Set([...js.matchAll(/className:"((?:\\.|[^"\\])*)"/g)].map((m) => m[1]));

const missing = [...used.keys()].filter((t) => !compiled.has(t)).sort();
console.log(`className 토큰 ${used.size}종 / 번들 스타일시트 ${compiled.size}종`);
if (missing.length) {
  console.error(`\n번들에 없는 클래스 ${missing.length}종 — 조용히 무시된다:`);
  for (const t of missing) console.error(`  ${t}  ← ${[...new Set(used.get(t))].join(", ")}`);
  process.exit(1);
}
console.log("통과 — 모든 className이 컴파일됐다");
