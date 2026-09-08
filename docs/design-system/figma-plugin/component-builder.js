// ─────────────────────────────────────────────────────────────────────────────
// ⑤ 공통 컴포넌트 빌더 — COMPONENT_SPECS(components.js)를 읽어 Figma 컴포넌트 세트를 만든다.
//
// 사양은 손으로 쓰지 않는다. apps/ch-life 코드에서 추출·검증한 값이 components.js 로 들어온다.
// 색은 앱 기본 변형인 focus/* 에 바인딩한다(app-store.ts DEFAULT_SETTINGS.variation === "focus").
// ─────────────────────────────────────────────────────────────────────────────


// 토큰 이름 → 변수 객체. 컴포넌트마다 다시 조회하지 않도록 한 번만 만든다.
async function allVarMaps() {
  const colls = await figma.variables.getLocalVariableCollectionsAsync();
  const out = { num: {}, color: {} };
  for (const c of colls) {
    const target = c.name === COLORS ? out.color : out.num;
    for (const id of c.variableIds) {
      const v = await figma.variables.getVariableByIdAsync(id);
      if (v) target[v.name] = v;
    }
  }
  return out;
}

// 숫자 변수 바인딩. 필드에 따라 Figma가 거부할 수 있으므로 실패해도 값은 남긴다.
function bindNum(node, field, token, maps) {
  const v = token && maps.num[token];
  if (!v) return false;
  try { node.setBoundVariable(field, v); return true; } catch (e) { return false; }
}

function solidFrom(token, maps, fallback) {
  const v = token && maps.color[token];
  if (v) {
    return figma.variables.setBoundVariableForPaint(
      { type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", v);
  }
  return { type: "SOLID", color: fallback || { r: 0.5, g: 0.5, b: 0.5 } };
}

function applyContainer(node, base, ov, maps) {
  const g = (k) => (ov && ov[k] !== undefined ? ov[k] : base[k]);

  node.layoutMode = base.layoutMode === "NONE" ? "HORIZONTAL" : base.layoutMode;
  // 축을 이름으로 지정한다. primaryAxisSizingMode 는 layoutMode 에 따라 뜻이 뒤집혀서
  // VERTICAL 프레임에 fixedWidth 를 주면 폭이 아니라 **높이**가 굳는다 —
  // 실제로 ModalSheet·InlineErrorBanner·QuoteBlock·CalendarDayCell 이 그렇게 깨져 있었다.
  if (base.fixedWidth) {
    node.layoutSizingHorizontal = "FIXED";
    node.layoutSizingVertical = "HUG";
  } else {
    node.layoutSizingHorizontal = "HUG";
    node.layoutSizingVertical = "HUG";
  }
  node.primaryAxisAlignItems = base.primaryAxisAlign || "MIN";
  node.counterAxisAlignItems = base.counterAxisAlign || "CENTER";

  // padding·itemSpacing 은 변형이 덮어쓸 수 있다 (예: accentChip 은 14/10)
  const p = (ov && ov.padding) || base.padding;
  const pt = (ov && ov.paddingTokens) || base.paddingTokens;
  node.paddingTop = p.t; node.paddingRight = p.r;
  node.paddingBottom = p.b; node.paddingLeft = p.l;
  if (pt) {
    bindNum(node, "paddingTop", pt.t, maps);
    bindNum(node, "paddingRight", pt.r, maps);
    bindNum(node, "paddingBottom", pt.b, maps);
    bindNum(node, "paddingLeft", pt.l, maps);
  }

  node.itemSpacing = (ov && ov.itemSpacing !== undefined) ? ov.itemSpacing : (base.itemSpacing || 0);
  bindNum(node, "itemSpacing", (ov && ov.itemSpacingToken) || base.itemSpacingToken, maps);

  node.cornerRadius = base.cornerRadius || 0;
  bindNum(node, "topLeftRadius", base.cornerRadiusToken, maps);
  bindNum(node, "topRightRadius", base.cornerRadiusToken, maps);
  bindNum(node, "bottomLeftRadius", base.cornerRadiusToken, maps);
  bindNum(node, "bottomRightRadius", base.cornerRadiusToken, maps);

  if (base.minHeight) {
    try { node.minHeight = base.minHeight; bindNum(node, "minHeight", base.minHeightToken, maps); }
    catch (e) { node.resize(node.width, Math.max(node.height, base.minHeight)); }
  }
  if (base.fixedWidth) node.resize(base.fixedWidth, node.height);

  const fill = g("fillToken");
  node.fills = fill ? [solidFrom(fill, maps)] : [];

  const stroke = g("strokeToken");
  const sw = g("strokeWeight");
  const side = g("strokeSide");
  if (stroke && sw) {
    node.strokes = [solidFrom(stroke, maps)];
    node.strokeWeight = sw;
    if (side && side !== "ALL") {
      node.strokeTopWeight = side === "TOP" ? sw : 0;
      node.strokeBottomWeight = side === "BOTTOM" ? sw : 0;
      node.strokeLeftWeight = side === "LEFT" ? sw : 0;
      node.strokeRightWeight = side === "RIGHT" ? sw : 0;
    }
  } else {
    node.strokes = [];
  }

  if (ov && ov.opacity !== undefined) node.opacity = ov.opacity;
}

async function makeText(t, ov, maps) {
  const weight = ov && ov.fontWeight !== undefined ? ov.fontWeight : t.fontWeight;
  const style = weight >= 700 ? "Bold" : weight >= 600 ? "Semi Bold" : "Regular";
  const font = { family: "Inter", style: style };
  await figma.loadFontAsync(font);

  const n = figma.createText();
  n.name = t.role;
  n.fontName = font;                  // characters 보다 먼저
  n.fontSize = t.fontSize;
  n.characters = t.textTransform === "uppercase" ? String(t.content).toUpperCase() : String(t.content);
  bindNum(n, "fontSize", t.fontSizeToken, maps);
  if (t.letterSpacing) n.letterSpacing = { unit: "PIXELS", value: t.letterSpacing };
  if (t.lineHeight) n.lineHeight = { unit: "PERCENT", value: Math.round(t.lineHeight * 100) };

  const colorToken = ov && ov.textColorToken ? ov.textColorToken : t.colorToken;
  n.fills = [solidFrom(colorToken, maps)];
  return n;
}

function variantName(variant) {
  return Object.keys(variant.props).map((k) => k + "=" + variant.props[k]).join(", ");
}

// 이미 있는 컴포넌트의 **내용만** 갈아 끼운다. 노드를 새로 만들지 않는 것이 요점이다 —
// 새로 만들면 id 가 바뀌어 디자이너가 파일 어딘가에 놔둔 인스턴스가 전부 떨어져 나간다.
async function fillVariant(c, spec, variant, maps) {
  for (const ch of c.children.slice()) ch.remove();

  // base.inner 가 있으면 두 겹이다 — 바깥이 터치 영역, 안쪽이 시각 요소.
  // 달력 날짜 셀이 코드에서 정확히 그 구조다(Pressable padding 2 + cellInner 원).
  // 이때 변형 오버라이드(채움·테두리·글자색·불투명도)는 전부 안쪽이 받는다.
  // noInner 는 "안쪽 도형이 아예 없다"는 뜻이다. 달력의 빈 칸이 그렇다 —
  // 코드에서 <View style={cell}/> 하나뿐이고 cellInner 노드가 존재하지 않는다.
  let host = c;
  if (spec.base.inner && !(variant.overrides && variant.overrides.noInner)) {
    applyContainer(c, spec.base, null, maps);
    const innerFrame = figma.createFrame();
    innerFrame.name = "inner";
    applyContainer(innerFrame, spec.base.inner, variant.overrides, maps);
    c.appendChild(innerFrame);
    host = innerFrame;
  } else {
    applyContainer(c, spec.base, variant.overrides, maps);
  }


  // 강조색 칩의 12x12 스와치 — ACCENT_SWATCHES의 리터럴 hex를 그대로 보여주는 데이터라
  // 토큰이 아니라 리터럴이 맞다(조사 문서 §7-4의 유일한 예외).
  if (variant.overrides && variant.overrides.leadingSwatch) {
    const dot = figma.createEllipse();
    dot.name = "swatch";
    dot.resize(12, 12);
    dot.fills = [{ type: "SOLID", color: variant.overrides.leadingSwatch }];
    host.appendChild(dot);
  }

  // texts: [] 는 "글자 없음"이다(빈 배열은 truthy라 spec.texts 로 넘어가지 않는다).
  // 달력의 빈 칸이 이 경우다 — 코드에서도 <View>만 있고 <Text>가 없다.
  const texts = (variant.overrides && variant.overrides.texts) || spec.texts;
  for (const t of texts) {
    const n = await makeText(t, variant.overrides, maps);
    host.appendChild(n);
  }
  return c;
}

async function buildOneVariant(spec, variant, maps) {
  const c = figma.createComponent();
  c.name = variantName(variant);
  await fillVariant(c, spec, variant, maps);
  return c;
}

// ── 멱등성의 두 번째 층: 노드를 지우지 않고 맞춘다 ─────────────────────────────
// 변수·텍스트 스타일은 처음부터 이름으로 찾아 갱신했는데 컴포넌트만 매번 보드째 지우고
// 다시 만들고 있었다. 그러면 실행할 때마다 COMPONENT_SET 의 id 가 바뀌고,
// 그 컴포넌트를 화면 시안에 끌어다 놓은 인스턴스가 전부 끊긴다.
function childByName(parent, name) {
  for (const ch of parent.children) if (ch.name === name) return ch;
  return null;
}

function ensureBoard(root, name, make) {
  const found = childByName(root, name);
  if (found) return found;
  const board = make();
  replaceBoard(root, name, board);
  return board;
}

function styleVariantSet(node, spec) {
  node.name = spec.name;
  node.layoutMode = "HORIZONTAL";
  node.layoutSizingHorizontal = "HUG";
  node.layoutSizingVertical = "HUG";
  node.counterAxisAlignItems = "CENTER";
  node.itemSpacing = 16;
  pad(node, 16);
  node.fills = [{ type: "SOLID", color: { r: 0.97, g: 0.97, b: 0.96 } }];
}

// 컴포넌트 세트를 이름으로 찾아 변형 단위로 맞춘다. 있는 변형은 내용만 갈고,
// 새 변형은 붙이고, 사양에서 사라진 변형만 뗀다.
async function reconcileComponent(section, spec, maps) {
  const want = spec.variants.map(variantName);
  let node = childByName(section, spec.name);

  if (spec.variants.length > 1) {
    if (node && node.type === "COMPONENT_SET") {
      for (const v of spec.variants) {
        const nm = variantName(v);
        let c = childByName(node, nm);
        if (!c) { c = figma.createComponent(); c.name = nm; node.appendChild(c); }
        await fillVariant(c, spec, v, maps);
      }
      for (const ch of node.children.slice()) if (want.indexOf(ch.name) < 0) ch.remove();
      styleVariantSet(node, spec);
      return { node: node, reused: true };
    }
    if (node) node.remove();     // 타입이 바뀌었다 — 다시 만드는 수밖에 없다
    const variants = [];
    for (const v of spec.variants) variants.push(await buildOneVariant(spec, v, maps));
    for (const v of variants) section.appendChild(v);
    const set = figma.combineAsVariants(variants, section);
    styleVariantSet(set, spec);
    return { node: set, reused: false };
  }

  // 변형이 하나면 COMPONENT 그대로다
  if (node && node.type === "COMPONENT") {
    await fillVariant(node, spec, spec.variants[0], maps);
    node.name = spec.name;
    return { node: node, reused: true };
  }
  if (node) node.remove();
  const c = await buildOneVariant(spec, spec.variants[0], maps);
  c.name = spec.name;
  section.appendChild(c);
  return { node: c, reused: false };
}

// ── 두 축: 층위(level)와 등급(status) ────────────────────────────────────────
//
// 층위 — 보드를 나누는 축. Atoms / Molecules / Organisms.
//   "NavRow 는 Molecule 인가 Organism 인가"를 매번 다시 논쟁하지 않도록 판정을 기계화한다.
//   위에서부터 순서대로 물어 처음 걸리는 곳이 그 컴포넌트의 층위다:
//     ① 화면의 한 구역을 차지하는가 — 다른 컴포넌트 인스턴스를 품거나 내용이 슬롯인가? → Organism
//     ② 서로 역할이 다른 요소가 둘 이상 묶여 한 기능을 이루는가?                    → Molecule
//     ③ 나머지 — 더 쪼개면 의미가 없다. 글자·아이콘·도형 하나에 상태만 붙는다.        → Atom
//
// 등급 — 근거의 세기. 보드를 나누지 않고 **이름 접두사**로 붙는다.
//   층위와 등급은 서로 다른 것을 말하므로 축을 섞지 않는다.
const REPO_URL = "https://github.com/zzzRYT/ch-notes/blob/main/apps/ch-life/";

const LEVELS = ["atom", "molecule", "organism"];
const LEVEL = {
  atom: {
    title: "Atoms — 더 쪼개면 의미가 없는 것",
    note: "글자·아이콘·도형 하나에 상태만 붙는다. 다른 컴포넌트를 품지 않는다.",
  },
  molecule: {
    title: "Molecules — 요소 둘 이상이 한 기능으로 묶인 것",
    note: "혼자 화면에 놓이지 않는다. Atom 을 조합하지만 화면 구역을 차지하지는 않는다.",
  },
  organism: {
    title: "Organisms — 화면의 한 구역을 차지하는 것",
    note: "다른 컴포넌트의 인스턴스를 품거나, 내용이 슬롯이다.",
  },
};
function levelOf(spec) { return LEVEL[spec.level] ? spec.level : "molecule"; }

const TIER = {
  code: { prefix: "", label: "코드에 있음" },
  proposed: { prefix: "Proposed/", label: "제안 — 화면에 패턴은 있으나 컴포넌트가 아니다" },
  planned: { prefix: "Planned/", label: "예정 — 코드에 아직 없다" },
};
function tierOf(spec) { return TIER[spec.status] ? spec.status : "code"; }
// 등급을 슬래시 접두사로 붙이면 Figma 에셋 패널에서 폴더처럼 묶인다.
// 'code' 만 접두사가 없다 — 기존 이름을 그대로 두려는 것이다.
function figmaName(spec) { return TIER[tierOf(spec)].prefix + spec.name; }

// 변형 단위 근거. variant.proposed 가 true 면 코드에 그 상태가 없다는 뜻이다.
// 이 플래그가 배선돼 있지 않아 근거 없는 변형이 조용히 쌓였다 — 이제 표시된다.
function proposedNames(spec) {
  const out = [];
  for (const v of spec.variants) if (v.proposed) out.push(variantName(v));
  return out;
}

function ensureText(parent, name, font, size, chars, rgb) {
  let t = childByName(parent, name);
  if (!t || t.type !== "TEXT") { if (t) t.remove(); t = figma.createText(); t.name = name; parent.appendChild(t); }
  t.fontName = font;                    // characters 보다 먼저
  t.fontSize = size;
  t.characters = chars;
  t.fills = [{ type: "SOLID", color: rgb || { r: 0.082, g: 0.078, b: 0.055 } }];
  return t;
}

async function buildComponents() {
  if (typeof COMPONENT_SPECS === "undefined" || !COMPONENT_SPECS.length) {
    log("⑤ 컴포넌트 — components.js 가 아직 비어 있다. 사양 추출이 끝나면 채워진다.");
    return { built: 0 };
  }
  const maps = await allVarMaps();
  if (!Object.keys(maps.color).length) {
    log("⑤ ⚠️ 색 토큰이 없다 — ② 색 토큰을 먼저 실행할 것");
    return { built: 0 };
  }

  const page = await ensurePage();
  const pageRoot = ensureRoot(page);

  await figma.loadFontAsync(FONT);
  await figma.loadFontAsync(FONT_SB);

  const MUTED = { r: 0.45, g: 0.44, b: 0.42 };

  // 보드를 통째로 지우지 않는다. 지우면 COMPONENT_SET 의 id 가 매번 바뀌어
  // 이 컴포넌트를 화면 시안에 끌어다 놓은 인스턴스가 전부 끊긴다.
  const board = ensureBoard(pageRoot, BOARD_COMPONENTS, function () {
    const b = autoLayout("VERTICAL", BOARD_COMPONENTS, 56);
    pad(b, 48);
    b.fills = [{ type: "SOLID", color: { r: 0.98, g: 0.98, b: 0.97 } }];
    return b;
  });

  ensureText(board, "head", FONT_SB, 32, "씀씀 (ch-life) — 공통 컴포넌트");
  ensureText(board, "head-sub", FONT, 13,
    "색은 앱 기본 변형 focus/* 에 바인딩된다. ⚠️ 표시는 코드에 없어 제안한 상태다.\n" +
    "이름 앞의 Proposed/ · Planned/ 는 등급이다 — 접두사가 없으면 앱에 이미 있는 것이다.\n" +
    "이 보드는 지웠다 다시 그리지 않는다. 컴포넌트를 이름으로 찾아 내용만 갈아 끼우므로 " +
    "인스턴스 연결이 유지된다.", MUTED);

  const built = [];
  let dayCellSet = null;
  const order = [];      // 보드 안에서의 최종 순서

  for (const level of LEVELS) {
    const specs = COMPONENT_SPECS.filter(function (sp) { return levelOf(sp) === level; });
    if (!specs.length && level !== "organism") continue;   // organism 에는 CalendarMonth 가 붙는다

    const headName = "level:" + level;
    let th = childByName(board, headName);
    if (!th || th.type !== "FRAME") { if (th) th.remove(); th = autoLayout("VERTICAL", headName, 4); board.appendChild(th); }
    ensureText(th, "t", FONT_SB, 22, LEVEL[level].title);
    ensureText(th, "n", FONT, 12, LEVEL[level].note, MUTED);
    order.push(th);

    for (const spec of specs) {
      const secName = "sec:" + spec.name;
      let section = childByName(board, secName);
      if (!section || section.type !== "FRAME") {
        if (section) section.remove();
        section = autoLayout("VERTICAL", secName, 12);
        pad(section, 24);
        section.cornerRadius = 12;
        board.appendChild(section);
      }
      section.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
      order.push(section);

      ensureText(section, "title", FONT_SB, 18, figmaName(spec) + "  " + spec.ko);
      ensureText(section, "meta", FONT, 11, spec.sources.join("  ·  ") + "\n" + spec.a11y, MUTED);

      // 근거 없는 변형을 눈에 보이게 적는다. 컴포넌트 안에 배지를 넣으면 인스턴스마다 따라붙으므로
      // 섹션에 캡션으로 둔다. 표시가 없으면 근거가 없다는 사실 자체가 보이지 않는다.
      const props = proposedNames(spec);
      const warn = { r: 0.78, g: 0.2, b: 0.16 };
      if (props.length) {
        ensureText(section, "proposed", FONT_SB, 11,
          "⚠️ 코드 근거 없는 변형 " + props.length + "개 — " + props.join(" · ") +
          "\n   그대로 구현하기 전에 확인이 필요하다.", warn);
      } else {
        const old2 = childByName(section, "proposed");
        if (old2) old2.remove();
      }

      // 등급이 바뀌었으면 예전 이름으로 남아 있다 — 찾아서 이름만 고친다(id 는 그대로).
      const stale = childByName(section, spec.name) || childByName(section, "Proposed/" + spec.name) ||
                    childByName(section, "Planned/" + spec.name);
      if (stale && stale.name !== figmaName(spec) &&
          (stale.type === "COMPONENT" || stale.type === "COMPONENT_SET")) {
        stale.name = figmaName(spec);
      }

      const r = await reconcileComponent(section, { name: figmaName(spec), variants: spec.variants,
                                                    base: spec.base, texts: spec.texts }, maps);
      const node = r.node;
      if (node.type === "COMPONENT_SET") {
        for (const v of spec.variants) {
          const c = childByName(node, variantName(v));
          if (c) c.description = v.proposed
            ? "⚠️ 제안 — 코드에 이 상태가 없다. " + (v.why || "저장소 선례에서 도출한 값이다.")
            : "코드에 있는 상태다.";
        }
      }
      node.description =
        "[" + LEVEL[levelOf(spec)].title.split(" —")[0] + " · " + TIER[tierOf(spec)].label + "]\n" +
        spec.description +
        (props.length ? "\n\n⚠️ 코드 근거 없는 변형: " + props.join(", ") : "") +
        "\n\n출처: " + spec.sources.join(", ") + "\n접근성: " + spec.a11y +
        (spec.reference ? "\n참조 패턴: " + spec.reference : "") +
        (spec.divergences && spec.divergences.length
          ? "\n\n호출처 간 차이:\n- " + spec.divergences.join("\n- ") : "");
      // 소스 파일로 바로 가는 링크. 유지보수할 때 이게 없으면 코드를 다시 찾아야 한다.
      try {
        const first = (spec.sources[0] || "").split(" ")[0];
        if (first && (first.indexOf("src/") === 0 || first.indexOf("app/") === 0)) {
          const parts = first.split(":");
          node.documentationLinks = [{ uri: REPO_URL + parts[0] + (parts[1] ? "#L" + parts[1].split("-")[0] : "") }];
        }
      } catch (e) { /* documentationLinks 를 못 쓰는 환경이면 그냥 넘어간다 */ }

      built.push({ name: figmaName(spec), id: node.id, variants: spec.variants.length, reused: r.reused });
      if (spec.name === "CalendarDayCell") dayCellSet = node;
    }
  }

  // 사양에서 사라진 섹션·등급 머리글을 뗀다
  const keep = {};
  for (const n of order) keep[n.name] = true;
  keep["head"] = keep["head-sub"] = true;
  keep["sec:CalendarMonth"] = true;
  keep["level:organism"] = true;
  for (const ch of board.children.slice()) if (!keep[ch.name]) ch.remove();

  // 달력 전체. 날짜 칸을 CalendarDayCell 인스턴스로 채우므로 세트가 만들어진 뒤에 돌린다.
  if (dayCellSet) {
    const cal = await buildCalendarMonth(maps, dayCellSet, board);
    built.push({ name: "CalendarMonth", id: cal.id, variants: 1 });
    order.push(cal.parent);
  }

  // 순서 고정 — 등급 머리글 다음에 그 등급의 섹션들이 온다
  let at = 2;   // head, head-sub 다음
  for (const n of order) { board.insertChild(Math.min(at++, board.children.length), n); }

  figma.viewport.scrollAndZoomIntoView([board]);
  const reusedN = built.filter(function (b) { return b.reused; }).length;
  log("⑤ 컴포넌트 — " + built.length + "개 · 변형 총 " +
      built.reduce(function (n, b) { return n + b.variants; }, 0) + "개" +
      (reusedN ? " (기존 " + reusedN + "개는 id 유지)" : "") + " ('" + BOARD_COMPONENTS + "' 보드)");
  return { built: built.length, detail: built };
}

// ── CalendarMonth — 달력 한 달 전체 ──────────────────────────────────────────
// 평평한 base/texts/variants 사양으로는 헤더 + 요일 행 + 6주 격자 + '오늘' 버튼을
// 표현할 수 없다. 그래서 여기서 직접 조립한다.
// 날짜 칸은 CalendarDayCell 인스턴스다 — 그림이 아니라 진짜 중첩이다.
//
// 시트 값은 ModalSheet 와 같은 자리에서 왔다(radius 16 · padding 16 · paper).
//
// 폭이 함정이다. 시트는 width:"100%" 에 maxWidth:360 이지 고정 360 이 아니다(:163-164).
// backdrop 이 padding 24 라서 실제 폭 = min(화면폭 − 48, 360) 이다. 기준 화면 360dp 에서는
// 312 이고, 화면이 408dp 이상이어야 360 에 닿는다.
// 여기서는 360dp 기준으로 그린다 — 칸이 정확히 40px 이 되는 쪽이고, RULE-UI-004(44px)에
// 걸리는 쪽도 그쪽이라 눈에 보여야 한다. CalendarDayCell 이 그리는 크기와도 이때 맞는다.
const CAL_SCREEN = 360;                                        // 기준 화면 폭
const CAL_SHEET_W = Math.min(CAL_SCREEN - 24 * 2, 360);        // 312
const CAL_PAD = 16;                                            // :166 padding
const CAL_CONTENT = CAL_SHEET_W - CAL_PAD * 2;                 // 280 → 칸 40
const CAL_WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];   // :18 WEEKDAYS

// 보기용 달은 2026년 9월로 고정한다. new Date() 를 쓰면 돌릴 때마다 그림이 달라져
// 디자인 파일의 참조값으로 못 쓴다. 1일이 화요일이라 앞 패딩 2칸, 30일이라 뒤 패딩 10칸.
const CAL_YEAR = 2026, CAL_MONTH = 9, CAL_LEAD = 2, CAL_DAYS = 30;
const CAL_TODAY = 6;      // 2026-09-06 (일)
const CAL_SELECTED = 13;  // 다른 상태도 같이 보이도록 둘을 갈라 놓는다

function calFrame(dir, name) {
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = dir;
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "AUTO";
  f.itemSpacing = 0;
  f.fills = [];
  return f;
}

async function calText(styleName, size, chars, colorToken, maps, sizeToken) {
  const font = { family: "Inter", style: styleName };
  await figma.loadFontAsync(font);
  const t = figma.createText();
  t.fontName = font;            // characters 보다 먼저
  t.fontSize = size;
  t.characters = chars;
  if (sizeToken) bindNum(t, "fontSize", sizeToken, maps);
  t.fills = [solidFrom(colorToken, maps)];
  return t;
}

async function buildCalendarMonth(maps, dayCellSet, parentBoard) {
  const MUTED2 = { r: 0.45, g: 0.44, b: 0.42 };
  let section = childByName(parentBoard, "sec:CalendarMonth");
  if (!section || section.type !== "FRAME") {
    if (section) section.remove();
    section = autoLayout("VERTICAL", "sec:CalendarMonth", 12);
    pad(section, 24);
    section.cornerRadius = 12;
    parentBoard.appendChild(section);
  }
  section.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  ensureText(section, "title", FONT_SB, 18, "CalendarMonth  달력 한 달");
  ensureText(section, "meta", FONT, 11,
    "src/editor/DatePickerModal.tsx:38-148  ·  src/editor/calendar.ts:40-51\n" +
    "날짜 칸은 CalendarDayCell 인스턴스다. ⚠️ 요일 12 · 이전다음 24 · '오늘' 14 는 scaled() 를 " +
    "거치지 않아 글자 크기 설정을 따르지 않는다 — 달 제목(17)과 날짜 숫자(15)만 커진다.", MUTED2);

  // 세트와 같은 이유로 지웠다 다시 만들지 않는다 — 내용만 비우고 다시 채운다.
  let sheet = childByName(section, "CalendarMonth");
  if (!sheet || sheet.type !== "COMPONENT") {
    if (sheet) sheet.remove();
    sheet = figma.createComponent();
    sheet.name = "CalendarMonth";
    section.appendChild(sheet);
  }
  for (const ch of sheet.children.slice()) ch.remove();
  sheet.layoutMode = "VERTICAL";
  sheet.primaryAxisSizingMode = "AUTO";       // 세로는 내용만큼
  sheet.counterAxisSizingMode = "FIXED";      // 가로는 360 고정
  sheet.itemSpacing = 0;                      // 간격은 각 행이 자기 padding 으로 만든다
  sheet.resize(CAL_SHEET_W, 100);
  sheet.paddingTop = sheet.paddingRight = sheet.paddingBottom = sheet.paddingLeft = CAL_PAD;
  bindNum(sheet, "paddingTop", "space/16", maps);
  bindNum(sheet, "paddingRight", "space/16", maps);
  bindNum(sheet, "paddingBottom", "space/16", maps);
  bindNum(sheet, "paddingLeft", "space/16", maps);
  sheet.cornerRadius = 16;
  bindNum(sheet, "topLeftRadius", "radius/16", maps);
  bindNum(sheet, "topRightRadius", "radius/16", maps);
  bindNum(sheet, "bottomLeftRadius", "radius/16", maps);
  bindNum(sheet, "bottomRightRadius", "radius/16", maps);
  sheet.fills = [solidFrom("focus/paper", maps)];

  // FILL 이 거부되면 노드가 HUG 로 남아 행이 조용히 어긋난다 — 삼키지 말고 알린다.
  const fill = (n) => {
    try { n.layoutSizingHorizontal = "FILL"; }
    catch (e) { log("⚠️ FILL 실패 — " + n.name + ": " + e.message); }
  };

  // ① 달 헤더 — ‹ 2026년 9월 › . marginBottom 8 은 paddingBottom 으로 옮겼다.
  const head = calFrame("HORIZONTAL", "head");
  head.counterAxisAlignItems = "CENTER";
  head.primaryAxisAlignItems = "SPACE_BETWEEN";
  sheet.appendChild(head);
  fill(head);
  head.paddingBottom = 8;
  bindNum(head, "paddingBottom", "space/8", maps);

  for (const [name, glyph] of [["prev", "‹"], ["title", ""], ["next", "›"]]) {
    if (name === "title") {
      head.appendChild(await calText("Bold", 17, CAL_YEAR + "년 " + CAL_MONTH + "월",
        "focus/ink", maps, "text/size/body-large"));
      continue;
    }
    const btn = calFrame("HORIZONTAL", name);
    btn.primaryAxisSizingMode = "FIXED";
    btn.counterAxisSizingMode = "FIXED";
    btn.primaryAxisAlignItems = "CENTER";
    btn.counterAxisAlignItems = "CENTER";
    btn.resize(44, 44);                       // styles.navBtn — RULE-UI-004 를 지키는 몇 안 되는 자리
    bindNum(btn, "minWidth", "touch/min", maps);
    bindNum(btn, "minHeight", "touch/min", maps);
    head.appendChild(btn);
    // 24 는 타입 스케일에 없는 값이라 토큰을 걸지 않는다.
    btn.appendChild(await calText("Regular", 24, glyph, "focus/ink-2", maps, ""));
  }

  // ② 요일 행 — 일~토, 각 칸 100/7%
  const week = calFrame("HORIZONTAL", "weekdays");
  sheet.appendChild(week);
  fill(week);
  week.primaryAxisSizingMode = "FIXED";
  week.resize(CAL_CONTENT, week.height);
  for (const w of CAL_WEEKDAYS) {
    const cell = calFrame("VERTICAL", w);
    cell.counterAxisAlignItems = "CENTER";
    cell.paddingTop = cell.paddingBottom = 4;
    bindNum(cell, "paddingTop", "space/4", maps);
    bindNum(cell, "paddingBottom", "space/4", maps);
    week.appendChild(cell);
    fill(cell);
    cell.appendChild(await calText("Regular", 12, w, "focus/ink-3", maps, ""));
  }

  // ③ 6주 격자 — layoutWrap 대신 세로 6행 × 가로 7칸.
  // 280/7 = 40 이지만 wrap 은 반올림 한 번에 한 행이 6칸으로 무너진다. FILL 로 나눈다.
  const grid = calFrame("VERTICAL", "grid");
  sheet.appendChild(grid);
  fill(grid);
  grid.primaryAxisSizingMode = "AUTO";
  const base = dayCellSet.type === "COMPONENT_SET" ? dayCellSet.defaultVariant : dayCellSet;
  let used = 0;
  for (let r = 0; r < 6; r++) {
    const row = calFrame("HORIZONTAL", "week-" + (r + 1));
    row.counterAxisAlignItems = "CENTER";
    grid.appendChild(row);
    fill(row);
    row.primaryAxisSizingMode = "FIXED";
    row.resize(CAL_CONTENT, row.height);
    for (let c = 0; c < 7; c++) {
      const i = r * 7 + c;
      const day = i - CAL_LEAD + 1;
      const inGrid = day >= 1 && day <= CAL_DAYS;
      const inst = base.createInstance();
      row.appendChild(inst);
      fill(inst);
      const state = !inGrid ? "Empty"
        : day === CAL_SELECTED ? "Selected"
        : day === CAL_TODAY ? "Today" : "Default";
      try { inst.setProperties({ State: state }); } catch (e) {}
      inst.name = inGrid ? String(day) : "empty";
      if (inGrid) {
        // 인스턴스의 숫자 텍스트를 실제 날짜로 바꾼다.
        const tx = inst.findOne((n) => n.type === "TEXT");
        if (tx) {
          try {
            await figma.loadFontAsync(tx.fontName);
            tx.characters = String(day);
            used++;
          } catch (e) {}
        }
      }
    }
  }

  // ④ '오늘' 버튼 — alignSelf center · marginTop 8 · padding 12
  const todayWrap = calFrame("VERTICAL", "today-row");
  todayWrap.counterAxisAlignItems = "CENTER";
  sheet.appendChild(todayWrap);
  fill(todayWrap);
  todayWrap.paddingTop = 8;
  bindNum(todayWrap, "paddingTop", "space/8", maps);
  const todayBtn = calFrame("HORIZONTAL", "today-button");
  todayBtn.primaryAxisAlignItems = "CENTER";
  todayBtn.counterAxisAlignItems = "CENTER";
  pad(todayBtn, 12);
  bindNum(todayBtn, "paddingTop", "space/12", maps);
  bindNum(todayBtn, "paddingRight", "space/12", maps);
  bindNum(todayBtn, "paddingBottom", "space/12", maps);
  bindNum(todayBtn, "paddingLeft", "space/12", maps);
  todayWrap.appendChild(todayBtn);
  todayBtn.appendChild(await calText("Semi Bold", 14, "오늘", "focus/accent", maps, ""));

  sheet.description =
    "날짜 선택 모달의 달력 전체.\n" +
    "⚠️ 이것만 절차적 조립이다 — components.js 의 base/texts/variants 사양이 아니라 이 파일의 buildCalendarMonth() 가 직접 그린다. 그래서 변형이 없다. 고칠 곳은 사양이 아니라 코드다.\n\n" +
    "⚠️ 시트 폭은 고정값이 아니다. width:\"100%\" 에 maxWidth 360 이고 backdrop padding 이 24라 " +
    "실제 폭 = min(화면폭 − 48, 360) 이다. 여기 그린 " + CAL_SHEET_W + "은 화면 " + CAL_SCREEN +
    "dp 기준이고(내용 폭 " + CAL_CONTENT + ", 칸 " + (CAL_CONTENT / 7) + "), " +
    "화면이 408dp 이상이면 시트가 360까지 커져 칸이 46.86이 된다. " +
    "radius 16 · padding 16 · paper 는 ModalSheet 와 같은 자리에서 왔다.\n\n" +
    "출처: src/editor/DatePickerModal.tsx:38-148, src/editor/calendar.ts:40-51\n" +
    "격자는 일요일 시작 6주 42칸이고 빈 칸은 null 이다(buildMonthGrid).\n" +
    "날짜 칸은 CalendarDayCell 인스턴스다 — 그림이 아니라 진짜 중첩이다.\n\n" +
    "접근성: 이전/다음 달 버튼은 44×44 · hitSlop 12 로 RULE-UI-004를 지키지만, " +
    "날짜 칸은 화면 360dp에서 40px 로 미달이다(drift B21).\n" +
    "⚠️ 요일 12 · 이전다음 24 · '오늘' 14 는 scaled() 를 거치지 않는다 — " +
    "글자 크기를 키워도 그대로다. 달 제목(17)과 날짜 숫자(15)만 커진다.\n" +
    "보기용 달은 " + CAL_YEAR + "년 " + CAL_MONTH + "월로 고정되어 있다.";

  log("⑤ CalendarMonth — 날짜 칸 42칸(숫자 " + used + ") · CalendarDayCell 인스턴스로 채웠다");
  return sheet;
}

// ── ⑥ 아이콘 시트 ────────────────────────────────────────────────────────────
// lucide 벡터는 설치된 패키지에서 뽑은 실제 SVG로 그린다(icons.js).
// 글리프 아이콘은 앱과 동일하게 텍스트로 그린다 — 코드에서도 <Text>이기 때문이다.

function svgNode(svg, size, rgb) {
  const n = figma.createNodeFromSvg(svg);
  n.resize(size, size);
  // createNodeFromSvg 는 FRAME 을 돌려준다. 안쪽 vector 의 stroke 색을 바꾼다.
  const paint = [{ type: "SOLID", color: rgb }];
  const walk = (node) => {
    if (node.strokes && node.strokes.length) node.strokes = paint;
    if (node.children) node.children.forEach(walk);
  };
  walk(n);
  n.fills = [];
  return n;
}

async function buildIconSheet() {
  if (typeof ICON_INVENTORY === "undefined" || !ICON_INVENTORY.length) {
    log("⑥ 아이콘 — icons.inventory.js 가 아직 비어 있다.");
    return { built: 0 };
  }
  await figma.loadFontAsync(FONT);
  await figma.loadFontAsync(FONT_SB);

  const page = await ensurePage();
  const pageRoot = ensureRoot(page);

  const INK = { r: 0.082, g: 0.078, b: 0.055 };      // focus/ink #15140e
  const MUTED = { r: 0.45, g: 0.44, b: 0.42 };

  const board = autoLayout("VERTICAL", BOARD_ICONS, 32);
  pad(board, 48);
  board.fills = [{ type: "SOLID", color: { r: 0.98, g: 0.98, b: 0.97 } }];
  replaceBoard(pageRoot, BOARD_ICONS, board);

  board.appendChild(text(FONT_SB, 32, "씀씀 (ch-life) — 아이콘"));
  board.appendChild(text(FONT, 13,
    "lucide 벡터는 설치된 lucide-react-native 패키지에서 추출한 실제 도형이다(stroke-width 1.8).\n" +
    "글리프는 앱과 동일하게 텍스트로 그린다 — 코드에서도 <Text>다.\n" +
    "⚠️ 표시는 같은 의미인데 크기·표현이 갈리는 자리다.", MUTED));

  let vectorCount = 0, glyphCount = 0;
  for (const kind of ["lucide", "glyph"]) {
    const items = ICON_INVENTORY.filter((i) => i.kind === kind);
    if (!items.length) continue;

    const sec = autoLayout("VERTICAL", kind === "lucide" ? "벡터 (lucide)" : "글리프 (텍스트)", 12);
    pad(sec, 24);
    sec.cornerRadius = 12;
    sec.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
    board.appendChild(sec);
    sec.appendChild(text(FONT_SB, 18,
      kind === "lucide" ? "벡터 아이콘 — lucide-react-native" : "글리프 아이콘 — 유니코드 텍스트"));

    const grid = autoLayout("HORIZONTAL", "grid", 20);
    grid.layoutWrap = "WRAP";
    grid.counterAxisAlignItems = "MIN";
    grid.resize(880, grid.height);
    grid.primaryAxisSizingMode = "FIXED";
    sec.appendChild(grid);

    for (const ic of items) {
      const cell = autoLayout("VERTICAL", ic.symbol, 6);
      pad(cell, 12);
      cell.counterAxisAlignItems = "CENTER";
      cell.cornerRadius = 8;
      cell.fills = [{ type: "SOLID", color: { r: 0.98, g: 0.98, b: 0.97 } }];
      // VERTICAL 프레임에서 primary 는 높이다. 폭 160을 굳히려면 가로 축을 이름으로 지정해야 한다.
      cell.layoutSizingHorizontal = "FIXED";
      cell.layoutSizingVertical = "HUG";
      cell.resize(160, cell.height);
      grid.appendChild(cell);

      const size = ic.sizes && ic.sizes.length ? Math.max.apply(null, ic.sizes) : 24;
      if (kind === "lucide" && typeof LUCIDE_SVG !== "undefined" && LUCIDE_SVG[ic.symbol]) {
        try { cell.appendChild(svgNode(LUCIDE_SVG[ic.symbol], size, INK)); vectorCount++; }
        catch (e) { cell.appendChild(text(FONT, 20, "?", MUTED)); }
      } else {
        cell.appendChild(text(FONT, size, ic.symbol, INK));
        glyphCount++;
      }

      cell.appendChild(text(FONT_SB, 11, ic.symbol));
      cell.appendChild(text(FONT, 10, ic.meaning, MUTED));
      cell.appendChild(text(FONT, 9,
        (ic.sizes || []).join(" / ") + "px" + (ic.inconsistency ? "\n⚠️ " + ic.inconsistency : ""),
        ic.inconsistency ? { r: 0.78, g: 0.2, b: 0.16 } : MUTED));
    }
  }

  figma.viewport.scrollAndZoomIntoView([board]);
  log("⑥ 아이콘 — 벡터 " + vectorCount + " · 글리프 " + glyphCount + " ('" + BOARD_ICONS + "' 보드)");
  return { vectorCount: vectorCount, glyphCount: glyphCount };
}
