// ─────────────────────────────────────────────────────────────────────────────
// 씀씀(ch-life) 디자인 토큰 플러그인 — 메인 로직
//
// 왜 플러그인인가: Figma MCP는 Starter 플랜에서 월 20회로 제한된다.
// 이 플러그인은 MCP를 전혀 쓰지 않으므로 몇 번이든 돌릴 수 있다.
//
// 전부 멱등하다 — 같은 이름의 변수/스타일/페이지가 있으면 새로 만들지 않고 값만 갱신한다.
// ─────────────────────────────────────────────────────────────────────────────

// ── 공식 Plugin API 헬퍼 ──────────────────────────────────────────────────────
// 주의: figma.createAutoLayout() / node.query() / node.set() 은 MCP(use_figma) 런타임의
// 편의 함수이지 실제 Plugin API가 아니다. 진짜 플러그인에서는 존재하지 않으므로 쓰지 않는다.
function autoLayout(direction, name, gap) {
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = direction;
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "AUTO";
  f.itemSpacing = gap || 0;
  f.fills = [];
  return f;
}
function pad(f, n) {
  f.paddingLeft = f.paddingRight = f.paddingTop = f.paddingBottom = n;
}
function text(fontName, size, chars, rgb) {
  const t = figma.createText();
  t.fontName = fontName;      // 반드시 characters 보다 먼저
  t.fontSize = size;
  t.characters = chars;
  if (rgb) t.fills = [{ type: "SOLID", color: rgb }];
  return t;
}

const PRIMITIVES = "Primitives";
const COLORS = "Color";
const FONT = { family: "Inter", style: "Regular" };
const FONT_SB = { family: "Inter", style: "Semi Bold" };

function log(msg) {
  figma.ui.postMessage({ type: "log", msg: msg });
}

// ── 한 페이지 규약 ────────────────────────────────────────────────────────────
// free 플랜은 파일당 페이지가 3개까지다. 예전 버전은 페이지를 3개(Tokens·Components·Icons)
// 만들었는데, 기본 "Page 1"까지 세면 한도를 넘는다. 그래서 전부 한 페이지에 몰아 넣고
// 페이지 안에서 가로 루트 하나에 보드 3개를 나란히 둔다.
const DS_PAGE = "🎨 씀씀 Design System";
const LEGACY_PAGES = ["🎨 Tokens", "🧩 Components", "🔣 Icons"];
const ROOT_NAME = "씀씀 Design System";
const BOARD_TOKENS = "토큰";
const BOARD_COMPONENTS = "공통 컴포넌트";
const BOARD_ICONS = "아이콘";
const BOARD_ORDER = [BOARD_TOKENS, BOARD_COMPONENTS, BOARD_ICONS];

// 예전 버전이 이 페이지들에 만들어 놓은 것들. 이 이름만 있으면 우리 것으로 보고 지운다.
const OURS = ["Design Tokens", "공통 컴포넌트", "아이콘", "토큰", ROOT_NAME];

// manifest 의 documentAccess: "dynamic-page" 때문에 페이지의 children 은 그냥 못 읽는다.
// 열려 있는 페이지 말고는 loadAsync() 를 먼저 불러야 한다.
async function isOurLeftover(page) {
  await page.loadAsync();
  for (const ch of page.children) {
    if (OURS.indexOf(ch.name) < 0) return false;   // 사용자가 뭔가 더 그려 놨다 — 손대지 않는다
  }
  return true;
}

async function ensurePage() {
  let page = figma.root.children.find((p) => p.name === DS_PAGE);
  if (!page) {
    // 예전 버전이 만든 페이지가 있으면 새로 만들지 않고 이름만 바꿔 재사용한다.
    // 페이지가 이미 한도에 닿아 있을 수 있어서, createPage 를 부르기 전에 먼저 본다.
    const legacy = figma.root.children.find((p) => LEGACY_PAGES.indexOf(p.name) >= 0);
    if (legacy) {
      await legacy.loadAsync();
      legacy.name = DS_PAGE;
      for (const ch of legacy.children.slice()) ch.remove();  // 예전 구조는 버린다
      page = legacy;
    } else if (figma.root.children.length < 3) {
      page = figma.createPage();
      page.name = DS_PAGE;
    } else {
      throw new Error(
        "페이지가 이미 " + figma.root.children.length + "개다. free 플랜은 3개까지라 " +
        "새 페이지를 만들 수 없다. 빈 페이지를 하나 지우고 다시 실행할 것.");
    }
  }
  await figma.setCurrentPageAsync(page);   // 지우기 전에 현재 페이지를 옮겨 둔다
  await page.loadAsync();                  // ensureRoot 가 page.children 을 읽는다

  // 남은 예전 페이지 정리. 내용이 우리가 만든 것뿐일 때만 지운다 —
  // 사용자가 그 페이지에 뭔가 더 그려 놨으면 알리기만 하고 놔둔다.
  const keep = [];
  for (const p of figma.root.children.slice()) {
    if (p === page || LEGACY_PAGES.indexOf(p.name) < 0) continue;
    if (await isOurLeftover(p)) p.remove();
    else keep.push(p.name);
  }
  if (keep.length) {
    log("⚠️ 예전 페이지에 직접 그린 내용이 있어 지우지 않았다 — " + keep.join(", ") +
        ". free 플랜 페이지 한도(3개)에 걸리면 직접 지울 것.");
  }
  return page;
}

// 보드 3개를 나란히 놓는 가로 루트. x 좌표를 손으로 계산하면 보드 폭이 바뀔 때마다
// 겹치므로 오토레이아웃에 맡긴다.
function ensureRoot(page) {
  let root = null;
  for (const n of page.children) {
    if (n.type === "FRAME" && n.name === ROOT_NAME) { root = n; break; }
  }
  if (!root) {
    root = autoLayout("HORIZONTAL", ROOT_NAME, 200);
    root.counterAxisAlignItems = "MIN";
    root.x = 0; root.y = 0;
    page.appendChild(root);
  }
  return root;
}

// 자기 보드만 갈아 끼운다. 페이지를 통째로 비우면 다른 단계가 만든 보드까지 날아간다.
function replaceBoard(root, name, board) {
  const idx = BOARD_ORDER.indexOf(name);
  for (const ch of root.children.slice()) {
    if (ch.name === name) ch.remove();
  }
  let at = 0;
  for (const ch of root.children) {
    if (BOARD_ORDER.indexOf(ch.name) < idx) at++;
  }
  root.insertChild(at, board);
  return board;
}

async function ensureCollection(name) {
  const all = await figma.variables.getLocalVariableCollectionsAsync();
  const found = all.find((c) => c.name === name);
  if (found) return { coll: found, created: false };
  const coll = figma.variables.createVariableCollection(name);
  coll.renameMode(coll.modes[0].modeId, "base");
  return { coll: coll, created: true };
}

// 이름으로 기존 변수를 찾는다 — 멱등성의 핵심
async function existingByName(coll) {
  const map = {};
  for (const id of coll.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    if (v) map[v.name] = v;
  }
  return map;
}

function applyMeta(v, scopes, desc, code) {
  if (scopes) v.scopes = scopes;
  if (desc) v.description = desc;
  if (code) {
    // ANDROID 슬롯을 쓴다 — WEB 슬롯은 Figma가 var() 래퍼를 씌워 RN 표현과 맞지 않는다
    try { v.setVariableCodeSyntax("ANDROID", code); } catch (e) {}
  }
}

// ── ① 수치 토큰 ──────────────────────────────────────────────────────────────
async function buildNumbers() {
  const r = await ensureCollection(PRIMITIVES);
  const coll = r.coll;
  const mode = coll.modes[0].modeId;
  const have = await existingByName(coll);
  let created = 0, updated = 0;

  for (const t of NUMBER_TOKENS) {
    const name = t[0], value = t[1], scopes = t[2], desc = t[3], code = t[4];
    let v = have[name];
    if (v) { updated++; } else { v = figma.variables.createVariable(name, coll, "FLOAT"); created++; }
    v.setValueForMode(mode, value);
    applyMeta(v, scopes, desc, code);
  }
  log("① 수치 토큰 — 신규 " + created + " · 갱신 " + updated + " (컬렉션 " + PRIMITIVES + ")");
  return { created: created, updated: updated };
}

// ── ② 색 토큰 ────────────────────────────────────────────────────────────────
// 모드가 1개로 제한되므로(free 플랜) variation 4종을 모드가 아니라 이름으로 가른다.
async function buildColors() {
  const r = await ensureCollection(COLORS);
  const coll = r.coll;
  const mode = coll.modes[0].modeId;
  const have = await existingByName(coll);
  let created = 0, updated = 0;

  for (const t of COLOR_TOKENS) {
    let v = have[t.name];
    if (v) { updated++; } else { v = figma.variables.createVariable(t.name, coll, "COLOR"); created++; }
    // Figma COLOR 변수는 alpha를 색 자체에 담는다
    v.setValueForMode(mode, { r: t.r, g: t.g, b: t.b, a: t.a });
    applyMeta(v, ["FRAME_FILL", "SHAPE_FILL", "TEXT_FILL", "STROKE_COLOR"],
      t.desc + "\n원본: " + t.raw + " (ThemeProvider.tsx)", t.code);
  }
  log("② 색 토큰 — 신규 " + created + " · 갱신 " + updated + " (4테마 × 16, 컬렉션 " + COLORS + ")");
  return { created: created, updated: updated };
}

// ── ③ 텍스트 스타일 ──────────────────────────────────────────────────────────
const TYPE_RAMP = [
  ["display", 30, 1.2, "Semi Bold"],
  ["title", 20, 1.3, "Semi Bold"],
  ["body-large", 17, 1.625, "Regular"],
  ["body", 15, 1.6, "Regular"],
  ["label", 13, 1.4, "Semi Bold"],
  ["caption", 11, 1.4, "Semi Bold"],
];

async function buildTextStyles() {
  await figma.loadFontAsync(FONT);
  await figma.loadFontAsync(FONT_SB);
  const existing = await figma.getLocalTextStylesAsync();
  let created = 0, updated = 0;

  for (const t of TYPE_RAMP) {
    const name = "text/" + t[0];
    let s = existing.find((x) => x.name === name);
    if (s) { updated++; } else { s = figma.createTextStyle(); s.name = name; created++; }
    s.fontName = t[3] === "Semi Bold" ? FONT_SB : FONT;
    s.fontSize = t[1];
    s.lineHeight = { unit: "PERCENT", value: Math.round(t[2] * 100) };
    s.description =
      "base " + t[1] + "px · 행간 " + t[2] +
      "\n실제 표시 크기는 앱에서 scaled(" + t[1] + ", fontScale) — ×1.0/1.2/1.4/1.6" +
      "\n⚠️ 서체는 Figma 표현용 Inter다. 앱에는 폰트 파일도 expo-font 로딩도 없고, " +
      "fontStackFor()가 RN이 받지 않는 CSS 콤마 스택을 반환한다(wiki drift.md B24).";
  }
  log("③ 텍스트 스타일 — 신규 " + created + " · 갱신 " + updated);
  return { created: created, updated: updated };
}

// ── ④ 토큰 문서 페이지 ───────────────────────────────────────────────────────
const THEME_ORDER = ["minimal", "paper", "focus", "dark"];

// 변수 이름 → 변수 객체 맵을 한 번만 만든다 (스와치마다 전수 탐색하면 64x64회가 된다)
async function colorVarMap() {
  const all = await figma.variables.getLocalVariableCollectionsAsync();
  const coll = all.find((c) => c.name === COLORS);
  if (!coll) return {};
  return await existingByName(coll);
}
function bindFill(node, v) {
  if (!v) return false;
  const paint = figma.variables.setBoundVariableForPaint(
    { type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", v);
  node.fills = [paint];
  return true;
}

async function buildDocPage() {
  await figma.loadFontAsync(FONT);
  await figma.loadFontAsync(FONT_SB);

  const page = await ensurePage();
  const pageRoot = ensureRoot(page);

  const varMap = await colorVarMap();

  const root = autoLayout("VERTICAL", BOARD_TOKENS, 40);
  pad(root, 48);
  root.fills = [{ type: "SOLID", color: { r: 0.98, g: 0.98, b: 0.97 } }];
  replaceBoard(pageRoot, BOARD_TOKENS, root);   // 멱등: 이 보드만 다시 그린다

  const h = figma.createText();
  h.fontName = FONT_SB; h.fontSize = 32;
  h.characters = "씀씀 (ch-life) — 디자인 토큰";
  root.appendChild(h);

  const sub = figma.createText();
  sub.fontName = FONT; sub.fontSize = 13;
  sub.characters =
    "apps/ch-life/src/theme/ThemeProvider.tsx 에서 자동 추출 · 손으로 옮겨 적지 않았다\n" +
    "free 플랜은 컬렉션당 모드가 1개뿐이라 variation 4종을 모드가 아니라 이름으로 가른다";
  sub.fills = [{ type: "SOLID", color: { r: 0.45, g: 0.44, b: 0.42 } }];
  root.appendChild(sub);

  // 4테마 색 스와치
  const themesRow = autoLayout("HORIZONTAL", "Themes", 24);
  root.appendChild(themesRow);

  for (const theme of THEME_ORDER) {
    const col = autoLayout("VERTICAL", theme, 8);
    pad(col, 16);
    col.cornerRadius = 12;
    col.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
    themesRow.appendChild(col);

    const title = figma.createText();
    title.fontName = FONT_SB; title.fontSize = 16;
    title.characters = theme;
    col.appendChild(title);

    const items = COLOR_TOKENS.filter((t) => t.name.indexOf(theme + "/") === 0);
    for (const t of items) {
      const row = autoLayout("HORIZONTAL", t.name, 10);
      row.counterAxisAlignItems = "CENTER";
      col.appendChild(row);

      const chip = figma.createRectangle();
      chip.resize(28, 28);
      chip.cornerRadius = 6;
      chip.strokes = [{ type: "SOLID", color: { r: 0.85, g: 0.85, b: 0.84 } }];
      chip.strokeWeight = 1;
      row.appendChild(chip);
      if (!bindFill(chip, varMap[t.name])) {
        chip.fills = [{ type: "SOLID", color: { r: t.r, g: t.g, b: t.b }, opacity: t.a }];
      }

      const label = figma.createText();
      label.fontName = FONT; label.fontSize = 11;
      label.characters = t.name.split("/")[1] + "   " + t.code;
      label.fills = [{ type: "SOLID", color: { r: 0.3, g: 0.29, b: 0.27 } }];
      row.appendChild(label);
    }
  }

  // 타입 스케일 — ×1.0 과 ×1.6 을 나란히 (이슈 완료 기준: 큰 글씨 검토)
  const typeSec = autoLayout("VERTICAL", "Type scale", 16);
  pad(typeSec, 24);
  typeSec.cornerRadius = 12;
  typeSec.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  root.appendChild(typeSec);

  const th = figma.createText();
  th.fontName = FONT_SB; th.fontSize = 20;
  th.characters = "타입 스케일 — 글자 크기 설정 ×1.0 / ×1.6";
  typeSec.appendChild(th);

  for (const t of TYPE_RAMP) {
    const row = autoLayout("HORIZONTAL", t[0], 32);
    row.counterAxisAlignItems = "BASELINE";
    typeSec.appendChild(row);

    const tag = figma.createText();
    tag.fontName = FONT; tag.fontSize = 11;
    tag.characters = t[0] + " · base " + t[1];
    tag.fills = [{ type: "SOLID", color: { r: 0.55, g: 0.54, b: 0.52 } }];
    tag.textAutoResize = "HEIGHT";
    tag.resize(150, tag.height);
    row.appendChild(tag);

    for (const scale of [1.0, 1.6]) {
      const sample = figma.createText();
      sample.fontName = t[3] === "Semi Bold" ? FONT_SB : FONT;
      sample.fontSize = Math.round(t[1] * scale);
      sample.lineHeight = { unit: "PERCENT", value: Math.round(t[2] * 100) };
      sample.characters = "주일 설교 노트 " + Math.round(t[1] * scale);
      row.appendChild(sample);
    }
  }

  // 터치 영역 — 기준선과 위반 사례를 실제 크기로
  const touchSec = autoLayout("VERTICAL", "Touch targets", 12);
  pad(touchSec, 24);
  touchSec.cornerRadius = 12;
  touchSec.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  root.appendChild(touchSec);

  const tt = figma.createText();
  tt.fontName = FONT_SB; tt.fontSize = 20;
  tt.characters = "터치 영역 — RULE-UI-004 기준선 44px";
  touchSec.appendChild(tt);

  const touchRow = autoLayout("HORIZONTAL", "sizes", 20);
  touchRow.counterAxisAlignItems = "CENTER";
  touchSec.appendChild(touchRow);

  for (const spec of [[44, "min ✓"], [40, "regular ⚠"], [38, "rail ⚠"], [36, "collapse ⚠"], [28, "compact ⚠"], [22, "clear ⚠"]]) {
    const cell = autoLayout("VERTICAL", String(spec[0]), 6);
    cell.counterAxisAlignItems = "CENTER";
    touchRow.appendChild(cell);

    const box = figma.createRectangle();
    box.resize(spec[0], spec[0]);
    box.cornerRadius = 8;
    const ok = spec[0] >= 44;
    box.fills = [{ type: "SOLID", color: ok ? { r: 0.85, g: 0.93, b: 0.87 } : { r: 0.99, g: 0.89, b: 0.88 } }];
    box.strokes = [{ type: "SOLID", color: ok ? { r: 0.2, g: 0.6, b: 0.35 } : { r: 0.78, g: 0.2, b: 0.16 } }];
    box.strokeWeight = 1;
    cell.appendChild(box);

    const cap = figma.createText();
    cap.fontName = FONT; cap.fontSize = 10;
    cap.characters = spec[0] + "px\n" + spec[1];
    cap.textAlignHorizontal = "CENTER";
    cell.appendChild(cap);
  }

  figma.viewport.scrollAndZoomIntoView([root]);
  log("④ 토큰 보드 — '" + DS_PAGE + " › " + BOARD_TOKENS + "' 갱신 (4테마 스와치 · 타입 스케일 ×1/×1.6 · 터치 영역)");
  return { pageId: page.id, rootId: root.id };
}

// ── 실행 ─────────────────────────────────────────────────────────────────────
figma.showUI(__html__, { width: 380, height: 460 });

figma.ui.onmessage = async (msg) => {
  try {
    if (msg.type === "numbers") await buildNumbers();
    else if (msg.type === "colors") await buildColors();
    else if (msg.type === "styles") await buildTextStyles();
    else if (msg.type === "doc") await buildDocPage();
    else if (msg.type === "components") await buildComponents();
    else if (msg.type === "iconsheet") await buildIconSheet();
    else if (msg.type === "all") {
      await buildNumbers();
      await buildColors();
      await buildTextStyles();
      await buildDocPage();
      await buildComponents();
      await buildIconSheet();
      log("✅ 전체 완료");
    } else if (msg.type === "close") {
      figma.closePlugin();
      return;
    }
    figma.ui.postMessage({ type: "done" });
  } catch (e) {
    log("❌ " + (e && e.message ? e.message : String(e)));
    figma.ui.postMessage({ type: "done" });
  }
};
