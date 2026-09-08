// code.js 를 다시 만든다. Figma 플러그인은 번들러 없이 단일 파일이어야 하므로 이어 붙인다.
import { readFileSync, writeFileSync } from "node:fs";
const head = [
  "// ⚠️ 자동 생성 파일 — 직접 수정하지 말 것.",
  "// 소스: tokens.colors.js (ThemeProvider.tsx에서 추출) + primitives.js + main.js",
  "// 재생성: node build.mjs",
  "",
].join("\n");
const parts = ["tokens.colors.js", "primitives.js", "components.js", "icons.js", "icons.inventory.js", "main.js", "component-builder.js"].map((f) => readFileSync(f, "utf8"));
writeFileSync("code.js", head + parts.join("\n\n"));
console.log("code.js 재생성 완료 —", head.length + parts.join("").length, "bytes");
