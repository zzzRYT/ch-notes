#!/usr/bin/env node
// wiki/index.md 생성기 — 블록의 yaml 헤더를 모아 ID 표와 커버리지를 다시 쓴다.
// 규칙·계약을 더하거나 requirement/confidence를 고쳤으면 이걸 돌린다.
//   node wiki/gen-index.mjs      (검사는 node wiki/check.mjs)
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
const WIKI = process.argv[2] ?? dirname(fileURLToPath(import.meta.url));
function walk(d){let o=[];for(const e of readdirSync(d)){const p=d+"/"+e;if(statSync(p).isDirectory())o=o.concat(walk(p));else if(e.endsWith(".md")&&!(d===WIKI&&e==="README.md")&&!(d===WIKI&&e==="index.md"))o.push(p);}return o;}
const blocks=[];
for(const f of walk(WIKI).sort()){
  const src=readFileSync(f,"utf8"); const re=/```yaml\n([\s\S]*?)```/g; let m;
  while((m=re.exec(src))!==null){
    const b=m[1]; const g=(k)=>((new RegExp("^"+k+":\\s*(.*)$","m")).exec(b)||[])[1]||"";
    if(!g("id")) continue;
    blocks.push({id:g("id"),req:g("requirement"),conf:g("confidence"),st:g("statement"),
      auto:/^\s+-\s+(test|ci):/m.test(b), man:/^\s+-\s+manual:/m.test(b),
      waiver:!!g("waiver"), file:f.replace(WIKI+"/","")});
  }
}
const esc=(s)=>s.replace(/\|/g,"\\|");
const link=(b)=>`[\`${b.id}\`](${b.file})`;
const ev=(b)=> b.auto?"자동":(b.man?(b.waiver?"수동 (waiver)":"수동"):(b.waiver?"waiver":"—"));
const rules=blocks.filter(b=>b.id.startsWith("RULE-"));
const auto=rules.filter(b=>b.auto).length;
const AREAS=[["RULE-REF","성경 참조 해석","rules/scripture-ref.md"],["RULE-EDIT","에디터·인용 삽입","rules/editor-insert.md"],
 ["RULE-NOTE","노트 저장","rules/note-persistence.md"],["RULE-SEARCH","검색","rules/search.md"],
 ["RULE-MD","공유 파일","rules/share-markdown.md"],["RULE-BIBLE","성경 리더","rules/bible-reader.md"],
 ["RULE-SET","설정·테마","rules/settings-theme.md"],["RULE-UI","레이아웃·접근성","rules/layout-a11y.md"],
 ["RULE-OTA","OTA 배포","rules/release.md"]];
let out=`# 전체 ID 표

[\`README.md\`](README.md)의 규약에 따라 발급된 모든 ID다. 숫자는 \`node wiki/check.mjs\` 실행 시점 기준이며, 이 표와 실제 파일이 어긋나면 **파일이 정본**이다.

## 커버리지

| | 개수 |
|---|---|
| 사용자 정책 \`POL\` | ${blocks.filter(b=>b.id.startsWith("POL-")).length} |
| 도메인 규칙 \`RULE\` | ${rules.length} |
| 계약 \`CONTRACT\` | ${blocks.filter(b=>b.id.startsWith("CONTRACT-")).length} |
| 결정 \`ADR\` | ${blocks.filter(b=>b.id.startsWith("ADR-")).length} |
| **합계** | **${blocks.length}** |

| 지표 | 값 |
|---|---|
| 자동 증거(test/ci)가 붙은 RULE | **${auto}/${rules.length} (${Math.round(auto/rules.length*100)}%)** |
| 나머지 ${rules.length-auto}건 | 수동 QA 또는 현상 서술 — 대부분 UI 계층 |
| 근거가 기록으로 남아 있는 항목 | ${blocks.filter(b=>b.conf==="기록됨").length} |
| 코드에서 추론한 항목 | ${blocks.filter(b=>b.conf==="코드추론").length} |
| **확인 필요 (사용자 답 대기)** | **${blocks.filter(b=>b.conf==="확인필요").length}** → [\`drift.md\`](drift.md) E절 |

자동 증거 비율이 60%에 못 미치는 이유는 감추지 않는다. RN 컴포넌트 테스트 도구가 없어 **UI 규칙 전체에 자동 증거가 없고**([\`drift.md\`](drift.md) C3), **OTA 규칙은 실기기와 실제 발행 없이는 재현되지 않는다**. 그 규칙들은 대문자 요구를 쓸 때 반드시 \`waiver\`를 붙인다.

## POL — 사용자 정책

| ID | 요구 | 증거 | 근거 | 내용 |
|---|---|---|---|---|
`;
for(const b of blocks.filter(b=>b.id.startsWith("POL-"))) out+=`| ${link(b)} | ${b.req||"—"} | ${ev(b)} | ${b.conf} | ${esc(b.st)} |\n`;
out+=`\n## RULE — 도메인 규칙\n`;
for(const [pfx,label,file] of AREAS){
  const rs=rules.filter(b=>b.id.startsWith(pfx+"-"));
  out+=`\n### ${label} — [\`${file}\`](${file})\n\n| ID | 요구 | 증거 | 근거 | 내용 |\n|---|---|---|---|---|\n`;
  for(const b of rs) out+=`| ${link(b)} | ${b.req||"현상 서술"} | ${ev(b)} | ${b.conf} | ${esc(b.st)} |\n`;
}
out+=`\n## CONTRACT — 계약\n\n| ID | 근거 | 내용 |\n|---|---|---|\n`;
for(const b of blocks.filter(b=>b.id.startsWith("CONTRACT-"))) out+=`| ${link(b)} | ${b.conf} | ${esc(b.st)} |\n`;
out+=`\n## ADR — 결정 기록\n\n| ID | 근거 | 결정 |\n|---|---|---|\n`;
for(const b of blocks.filter(b=>b.id.startsWith("ADR-")).sort((a,c)=>a.id.localeCompare(c.id))) out+=`| ${link(b)} | ${b.conf} | ${esc(b.st)} |\n`;
out+=`
## 정본이 아닌 것

- [\`drift.md\`](drift.md) — 계획 문서와의 차이, 구현 내부 모순, 오라클 문제, 공개 문서와의 충돌, 확인 필요 질문
- \`DESIGN.md\`, \`docs/plans/**\` — 역사 기록. 근거 출처로 인용하되 합격 기준으로 쓰지 않는다.
`;
writeFileSync(WIKI+"/index.md",out);
console.log("index.md written");
