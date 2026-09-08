// lucide-react-native 패키지에서 **실제 아이콘 도형**을 뽑아 icons.js 로 만든다.
// 기억으로 path 를 적지 않는다 — 설치된 패키지가 정본이다.
//
// node_modules 는 이 워크트리에 없을 수 있으므로(저장소 CLAUDE.md 참조) 후보 경로를 순회한다.
//   node docs/design-system/figma-plugin/extract-icons.mjs
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

const CANDIDATES = execSync("git worktree list --porcelain", { encoding: "utf8" })
  .split("\n").filter((l) => l.startsWith("worktree ")).map((l) => l.slice(9))
  .map((w) => path.join(w, "apps/ch-life/node_modules/lucide-react-native"));

const pkg = CANDIDATES.find((p) => existsSync(p));
if (!pkg) {
  console.error("lucide-react-native 를 찾지 못했다. 어느 워크트리에서든 `pnpm install` 후 다시 실행할 것.");
  console.error("찾아본 곳:\n  " + CANDIDATES.join("\n  "));
  process.exit(1);
}
const version = JSON.parse(readFileSync(path.join(pkg, "package.json"), "utf8")).version;

// 앱이 실제로 import 하는 것을 **소스에서 직접** 뽑는다 — 목록을 손으로 적지 않는다.
// (작은따옴표/큰따옴표 import 를 모두 잡는다. 하드코딩했다가 Share 를 놓친 적이 있다.)
const APP = path.join(process.cwd().includes("figma-plugin")
  ? path.resolve("../../..") : ".", "apps/ch-life");
const grep = execSync(
  `grep -rhoE "import \\{[^}]*\\} from ['\\"]lucide-react-native['\\"]" ${APP}/app ${APP}/src || true`,
  { encoding: "utf8" });
const names = [...new Set(grep.split("\n").flatMap((line) => {
  const m = line.match(/import\s*\{([^}]*)\}/);
  return m ? m[1].split(",").map((x) => x.trim()).filter(Boolean) : [];
}))].sort();
if (!names.length) { console.error("lucide import 를 찾지 못했다."); process.exit(1); }

// PascalCase → kebab-case 파일명 (Trash2 → trash-2)
const slugOf = (n) => n.replace(/([a-z])([A-Z])/g, "$1-$2")
  .replace(/([A-Za-z])(\d)/g, "$1-$2").toLowerCase();
const USED = Object.fromEntries(names.map((n) => [n, slugOf(n)]));

function parseIcon(file) {
  const src = readFileSync(file, "utf8");
  const open = src.indexOf("createLucideIcon(");
  const arrStart = src.indexOf("[", open);
  // 대괄호 균형을 맞춰 데이터 배열만 잘라낸다
  let depth = 0, end = -1;
  for (let i = arrStart; i < src.length; i++) {
    if (src[i] === "[") depth++;
    else if (src[i] === "]") { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  const literal = src.slice(arrStart, end);
  // 순수 데이터(배열·객체·문자열)뿐이라 안전하게 평가할 수 있다
  return Function('"use strict"; return (' + literal + ")")();
}

const out = {};
for (const [name, slug] of Object.entries(USED)) {
  const file = path.join(pkg, "dist/esm/icons", slug + ".mjs");
  if (!existsSync(file)) { console.error("없음:", file); process.exit(1); }
  const nodes = parseIcon(file);
  const body = nodes.map(([tag, attrs]) => {
    const a = Object.entries(attrs).filter(([k]) => k !== "key")
      .map(([k, v]) => `${k}="${v}"`).join(" ");
    return `<${tag} ${a}/>`;
  }).join("");
  // lucide 기본값 + 앱이 실제로 쓰는 strokeWidth 1.8 (HeaderControls.tsx:43 등)
  out[name] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ` +
    `stroke="#000000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

writeFileSync("icons.js",
  `// 자동 생성 — lucide-react-native@${version} 패키지에서 추출. 직접 수정하지 말 것.\n` +
  `// 재생성: node docs/design-system/figma-plugin/extract-icons.mjs\n` +
  `// stroke-width 1.8 은 앱이 실제로 쓰는 값이다(HeaderControls.tsx:43, NoteListSidebar.tsx:87 등).\n` +
  `// ChevronLeft 만 2를 쓴다(HeaderControls.tsx:65) — 시트에는 1.8 기준으로 그린다.\n` +
  `const LUCIDE_SVG = ${JSON.stringify(out, null, 1)};\n`);
console.log(`lucide-react-native@${version} 에서 아이콘 ${Object.keys(out).length}종 추출 → icons.js`);
console.log("출처:", pkg);
