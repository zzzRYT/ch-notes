import { readFileSync } from "node:fs";
import vm from "node:vm";

const CODE = readFileSync("docs/design-system/figma-plugin/code.js", "utf8");

const VALID_FLOAT_SCOPES = new Set(["ALL_SCOPES","TEXT_CONTENT","WIDTH_HEIGHT","GAP","STROKE_FLOAT","EFFECT_FLOAT","OPACITY","FONT_WEIGHT","FONT_SIZE","LINE_HEIGHT","LETTER_SPACING","PARAGRAPH_SPACING","PARAGRAPH_INDENT","CORNER_RADIUS"]);
const VALID_COLOR_SCOPES = new Set(["ALL_SCOPES","FRAME_FILL","SHAPE_FILL","TEXT_FILL","STROKE_COLOR","EFFECT_COLOR"]);
const BINDABLE = new Set(["paddingTop","paddingRight","paddingBottom","paddingLeft","itemSpacing",
  "topLeftRadius","topRightRadius","bottomLeftRadius","bottomRightRadius","minHeight","minWidth",
  "maxHeight","maxWidth","strokeWeight","width","height","fontSize","opacity","characters"]);

// free 플랜은 파일당 페이지 3개까지다. 스텁이 이걸 안 막아서 "페이지 4개"를 성공으로 통과시켰다.
const PAGE_CAP = 3;

function makeWorld(legacyPages) {
  const LOADED = new Set();
  const problems = [];
  const bindings = [];
  const collections = [], variables = [], textStyles = [];
  const sized = [];   // resize() 를 부른 노드 — 축 검사용
  let ids = 0;

  const kids = (x) => x._children || x.children;   // 페이지는 내부 배열로 직접 만진다
  const detach = (c) => {
    if (c.parent) {
      const arr = kids(c.parent);
      if (arr) { const i = arr.indexOf(c); if (i >= 0) arr.splice(i, 1); }
    }
  };

  function node(type) {
    const n = {
      id: "n" + ++ids, type, name: "", children: [], fills: [], strokes: [], width: 100,
      appendChild(c) { detach(c); c.parent = n; n.children.push(c); },
      insertChild(i, c) {
        if (!Number.isInteger(i) || i < 0 || i > n.children.length) problems.push(`insertChild 인덱스 ${i} (children ${n.children.length})`);
        detach(c); c.parent = n; n.children.splice(i, 0, c);
      },
      remove() { detach(n); n.removed = true; },
      resize(w, h) { n.width = w; n.height = h; n.resized = true; sized.push(n); },
      findOne(fn) {
        const walk = (x) => {
          for (const c of x.children || []) { if (fn(c)) return c; const r = walk(c); if (r) return r; }
          return null;
        };
        return walk(n);
      },
      setBoundVariable(field, v) {
        if (!BINDABLE.has(field)) { problems.push(`바인딩 불가 필드: ${field}`); throw new Error("unbindable " + field); }
        if (!v) { problems.push(`setBoundVariable(${field})에 undefined 변수`); throw new Error("no var"); }
        bindings.push({ type, field, name: v.name });
      },
    };
    Object.defineProperty(n, "height", { value: 20, writable: true });
    let wrap; Object.defineProperty(n, "layoutWrap", { get: () => wrap, set: (x) => {
      if (!["WRAP","NO_WRAP"].includes(x)) problems.push(`layoutWrap = "${x}"`); wrap = x; } });
    const LAYOUT = { layoutMode:["HORIZONTAL","VERTICAL","NONE"], primaryAxisSizingMode:["FIXED","AUTO"],
      counterAxisSizingMode:["FIXED","AUTO"], primaryAxisAlignItems:["MIN","CENTER","MAX","SPACE_BETWEEN"],
      counterAxisAlignItems:["MIN","CENTER","MAX","BASELINE"],
      layoutSizingHorizontal:["FIXED","HUG","FILL"], layoutSizingVertical:["FIXED","HUG","FILL"] };
    for (const k of Object.keys(LAYOUT)) {
      let val;
      Object.defineProperty(n, k, { get: () => val, set: (x) => {
        if (!LAYOUT[k].includes(x)) problems.push(`${type}.${k} = "${String(x).slice(0,60)}" — 허용값 ${LAYOUT[k].join("|")}`);
        val = x; } });
    }
    return n;
  }

  function textNode() {
    const t = node("TEXT");
    let _font = { family: "Inter", style: "Regular" }, _chars = "";
    Object.defineProperty(t, "fontName", { get: () => _font, set: (v) => { _font = v; } });
    Object.defineProperty(t, "characters", {
      get: () => _chars,
      set: (v) => {
        const key = _font.family + "|" + _font.style;
        if (!LOADED.has(key)) problems.push(`폰트 미로드 상태에서 characters 설정: ${key}`);
        _chars = v;
      },
    });
    return t;
  }

  // manifest 의 documentAccess: "dynamic-page" 를 그대로 흉내 낸다.
  // 열려 있지 않은 페이지의 children 을 읽으면 Figma 는 예외를 던진다.
  const mkPage = (name) => {
    const p = { id: "p" + ++ids, name, _children: [], loaded: false,
      async loadAsync() { p.loaded = true; },
      appendChild(c) { detach(c); c.parent = p; p._children.push(c); },
      insertChild(i, c) { detach(c); c.parent = p; p._children.splice(i, 0, c); },
      remove() {
        if (figma.currentPage === p) problems.push("현재 페이지를 remove() 했다 — Figma는 이걸 거부한다");
        const i = pages.indexOf(p); if (i >= 0) pages.splice(i, 1);
      } };
    Object.defineProperty(p, "children", { get() {
      if (!p.loaded) {
        problems.push(`페이지 "${p.name}" 를 loadAsync() 없이 children 접근 — dynamic-page 에서 예외다`);
        throw new Error("in get_children: Cannot access property `children` on a page that has not been explicitly loaded.");
      }
      return p._children;
    } });
    return p;
  };
  const pages = [mkPage("Page 1"), ...legacyPages.map(mkPage)];
  pages[0].loaded = true;   // 열려 있는 페이지는 Figma 가 이미 불러 놨다

  const cloneTree = (src) => {
    const c = src.type === "TEXT" ? textNode() : node(src.type === "COMPONENT" ? "INSTANCE" : src.type);
    c.name = src.name;
    if (src.type === "TEXT") { c.fontName = src.fontName; }
    for (const ch of src.children) c.appendChild(cloneTree(ch));
    return c;
  };

  const figma = {
    editorType: "figma",
    root: { name: "Doc", children: pages },
    currentPage: pages[0],
    viewport: { scrollAndZoomIntoView() {} },
    createFrame: () => node("FRAME"),
    createComponent: () => node("COMPONENT"),
    createNodeFromSvg(svg) {
      if (typeof svg !== "string" || svg.indexOf("<svg") !== 0) { problems.push("createNodeFromSvg: SVG 문자열이 아님"); throw new Error("bad svg"); }
      const n = node("FRAME"); const v = node("VECTOR");
      v.strokes = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
      n.appendChild(v); return n;
    },
    createEllipse: () => node("ELLIPSE"),
    combineAsVariants(nodes, parent) {
      const props = nodes.map((n) => n.name.split(", ").map((p) => p.split("=")[0]).join("|"));
      if (new Set(props).size > 1) problems.push("변형 prop 이름이 서로 다르다: " + [...new Set(props)].join(" vs "));
      const set = node("COMPONENT_SET");
      set.name = "set";
      nodes.forEach((n) => { detach(n); n.parent = set; set.children.push(n); });
      Object.defineProperty(set, "defaultVariant", { get: () => set.children[0] });
      const names = new Set(nodes.flatMap((n) => n.name.split(", ").map((p) => p.split("=")[0])));
      set.children.forEach((v) => {
        v.createInstance = () => {
          const inst = cloneTree(v);
          inst.setProperties = (props) => {
            for (const k of Object.keys(props)) {
              if (!names.has(k)) { problems.push(`setProperties: 없는 prop "${k}" (있는 것: ${[...names].join(",")})`); throw new Error("bad prop"); }
            }
          };
          return inst;
        };
      });
      if (parent && parent.appendChild) parent.appendChild(set);
      return set;
    },
    createRectangle: () => node("RECTANGLE"),
    createText: textNode,
    createPage() {
      if (pages.length >= PAGE_CAP) throw new Error(`페이지 한도 ${PAGE_CAP} 초과 — free 플랜에서 createPage 는 여기서 실패한다`);
      const p = mkPage(""); pages.push(p); return p;
    },
    async setCurrentPageAsync(p) { p.loaded = true; figma.currentPage = p; },
    async loadFontAsync(f) { LOADED.add(f.family + "|" + f.style); },
    createTextStyle() { const s = { id: "ts" + ++ids, name: "" }; textStyles.push(s); return s; },
    async getLocalTextStylesAsync() { return textStyles; },
    variables: {
      createVariableCollection(name) {
        const c = { id: "c" + ++ids, name, variableIds: [], modes: [{ modeId: "m" + ids, name: "Mode 1" }],
          renameMode(id, n) { c.modes.find((m) => m.modeId === id).name = n; },
          addMode() { throw new Error("in addMode: Limited to 1 modes only"); } };
        collections.push(c); return c;
      },
      async getLocalVariableCollectionsAsync() { return collections; },
      async getVariableByIdAsync(id) { return variables.find((v) => v.id === id) || null; },
      createVariable(name, coll, type) {
        if (variables.some((v) => v.name === name && v.collId === coll.id)) problems.push(`중복 생성: ${name}`);
        const v = { id: "v" + ++ids, name, collId: coll.id, resolvedType: type, values: {},
          setValueForMode(m, val) {
            if (type === "FLOAT" && typeof val !== "number") problems.push(`${name}: FLOAT인데 값이 ${typeof val}`);
            if (type === "COLOR") {
              for (const k of ["r","g","b","a"]) {
                if (typeof val[k] !== "number") problems.push(`${name}: COLOR ${k} 누락`);
                else if (val[k] < 0 || val[k] > 1) problems.push(`${name}: COLOR ${k}=${val[k]} 범위 밖(0-1)`);
              }
            }
            v.values[m] = val;
          },
          setVariableCodeSyntax(p, val) {
            if (!["WEB","ANDROID","iOS"].includes(p)) problems.push(`${name}: 잘못된 code syntax 플랫폼 ${p}`);
            v.code = val;
          } };
        Object.defineProperty(v, "scopes", { set(s) {
          const valid = type === "COLOR" ? VALID_COLOR_SCOPES : VALID_FLOAT_SCOPES;
          for (const x of s) if (!valid.has(x)) problems.push(`${name}: 잘못된 scope "${x}" (${type})`);
          v._scopes = s;
        }, get() { return v._scopes; } });
        Object.defineProperty(v, "description", { set(d) { if (typeof d !== "string") problems.push(`${name}: description 타입`); v._d = d; }, get() { return v._d; } });
        coll.variableIds.push(v.id); variables.push(v); return v;
      },
      setBoundVariableForPaint(paint, field, v) {
        if (!v) problems.push("setBoundVariableForPaint에 undefined 변수");
        return { ...paint, boundVariables: { [field]: { id: v.id } } };
      },
    },
    showUI() {}, ui: { postMessage(m) { if (m.type === "log") console.log("   " + m.msg); }, onmessage: null },
    closePlugin() {},
  };
  return { figma, pages, problems, bindings, collections, variables, textStyles, sized };
}

async function fixture(label, legacyPages) {
  console.log(`\n${"═".repeat(70)}\n▶ 픽스처: ${label}\n${"═".repeat(70)}`);
  const w = makeWorld(legacyPages);
  const ctx = vm.createContext({ figma: w.figma, __html__: "<html></html>", console });
  // code.js 의 top-level const 는 렉시컬 스코프라 ctx 프로퍼티가 되지 않는다.
  // 같은 스크립트 끝에 한 줄 붙여 밖으로 꺼낸다.
  vm.runInContext(CODE + "\n;globalThis.__SPECS = typeof COMPONENT_SPECS !== 'undefined' ? COMPONENT_SPECS : [];", ctx);

  await ctx.figma.ui.onmessage({ type: "all" });

  const byField = {};
  for (const b of w.bindings) byField[b.field] = (byField[b.field] || 0) + 1;
  console.log("\n── 결과 ──");
  console.log("컬렉션:", w.collections.map((c) => `${c.name}(${c.variableIds.length}, modes=${c.modes.length})`).join(" · "));
  console.log("변수", w.variables.length, "· 텍스트 스타일", w.textStyles.length, "· 바인딩", w.bindings.length, "건");

  // ── 페이지·보드 검사 ──
  console.log("페이지", w.pages.length + ":", w.pages.map((p) => `"${p.name}"`).join(" · "));
  if (w.pages.length > PAGE_CAP) w.problems.push(`페이지 ${w.pages.length}개 — free 한도 ${PAGE_CAP} 초과`);
  const ds = w.pages.find((p) => p.name === "🎨 씀씀 Design System");
  if (!ds) w.problems.push("디자인 시스템 페이지가 없다");
  else {
    const roots = ds._children.filter((n) => n.name === "씀씀 Design System");
    if (roots.length !== 1) w.problems.push(`루트 프레임이 ${roots.length}개 (1이어야 한다)`);
    if (roots[0]) {
      const names = roots[0].children.map((n) => n.name);
      console.log("보드:", names.join(" · "));
      const want = ["토큰", "공통 컴포넌트", "아이콘"];
      if (JSON.stringify(names) !== JSON.stringify(want)) w.problems.push(`보드 구성이 [${names}] — [${want}] 이어야 한다`);
    }
  }

  // ── 컴포넌트 id 안정성 ──
  // 실행할 때마다 컴포넌트를 지우고 다시 만들면 id 가 바뀐다. 그러면 그 컴포넌트를
  // 화면 시안에 끌어다 놓은 인스턴스가 전부 끊긴다 — Figma 를 정본으로 쓰는 한 이건 치명적이다.
  const compIds = () => {
    const out = {};
    const walk = (n) => {
      if (n.type === "COMPONENT_SET" || (n.type === "COMPONENT" && n.parent && n.parent.type !== "COMPONENT_SET")) out[n.name] = n.id;
      for (const c of n.children || []) walk(c);
    };
    const p = w.pages.find((x) => x.name === "🎨 씀씀 Design System");
    for (const c of (p ? p._children : [])) walk(c);
    return out;
  };
  const idsBefore = compIds();

  // ── 멱등성 ──
  const before = w.variables.length;
  console.log("\n▶ 한 번 더 실행 (멱등성)");
  await ctx.figma.ui.onmessage({ type: "all" });
  console.log("변수", before, "→", w.variables.length, w.variables.length === before ? "✅" : "❌ 중복");
  console.log("페이지", w.pages.length, "· 보드", (w.pages.find((p) => p.name === "🎨 씀씀 Design System")?._children?.[0]?.children || []).map((n) => n.name).join(" · "));
  if (w.pages.length > PAGE_CAP) w.problems.push(`재실행 후 페이지 ${w.pages.length}개 — 한도 초과`);

  // ── 축 검사 ──
  // primaryAxisSizingMode 는 layoutMode 에 따라 뜻이 뒤집힌다. VERTICAL 프레임에서 primary 는 높이다.
  // 폭을 resize 해 놓고 가로 축을 고정하지 않으면 폭은 hug 로 돌아가고 높이가 기본값에 굳는다.
  for (const n of w.sized) {
    if (!n.layoutMode || n.layoutMode === "NONE") continue;
    const hFixed = n.layoutSizingHorizontal === "FIXED" ||
      (n.layoutMode === "HORIZONTAL" ? n.primaryAxisSizingMode === "FIXED" : n.counterAxisSizingMode === "FIXED");
    if (!hFixed) w.problems.push(`${n.type}("${n.name}") ${n.layoutMode}: 폭을 resize 했는데 가로 축이 고정이 아니다 — hug 로 돌아간다`);
    if (n.layoutMode === "VERTICAL" && n.primaryAxisSizingMode === "FIXED" && n.layoutSizingVertical !== "HUG"
        && n.name !== "grid" && !/^week-/.test(n.name)) {
      w.problems.push(`${n.type}("${n.name}") VERTICAL: primaryAxisSizingMode=FIXED 라 높이가 기본값에 굳는다`);
    }
  }

  const idsAfter = compIds();
  const moved = Object.keys(idsBefore).filter((k) => idsBefore[k] !== idsAfter[k]);
  const gone = Object.keys(idsBefore).filter((k) => !(k in idsAfter));
  console.log("컴포넌트 id 유지:", Object.keys(idsBefore).length - moved.length, "/", Object.keys(idsBefore).length);
  for (const k of moved) w.problems.push(`컴포넌트 "${k}" 의 id 가 재실행에서 바뀌었다 — 배치된 인스턴스가 끊긴다`);
  for (const k of gone) w.problems.push(`컴포넌트 "${k}" 가 재실행에서 사라졌다`);

  // ── 사양 위생 ──
  let proposedVariants = 0;
  for (const spec of ctx.__SPECS || []) {
    if (spec.status && ["code", "proposed", "planned"].indexOf(spec.status) < 0)
      w.problems.push(`${spec.name}: 알 수 없는 status "${spec.status}"`);
    // planned 는 코드에 아무것도 없으므로 어디서 왔는지(reference)가 유일한 근거다.
    // proposed 는 화면에 패턴이 있다는 뜻이라 reference 없이 자체 코드만으로도 정당하다 — 대신 sources 가 있어야 한다.
    if (spec.status === "planned" && !spec.reference)
      w.problems.push(`${spec.name}: status=planned 인데 reference 가 비어 있다 — 근거가 아무 데도 없다`);
    if (spec.status === "proposed" && !(spec.sources && spec.sources.length))
      w.problems.push(`${spec.name}: status=proposed 인데 sources 가 비어 있다 — 화면에 패턴이 있다는 주장의 근거가 없다`);
    if (!spec.level) w.problems.push(`${spec.name}: level 이 없다 (atom|molecule|organism)`);
    else if (["atom", "molecule", "organism"].indexOf(spec.level) < 0)
      w.problems.push(`${spec.name}: 알 수 없는 level "${spec.level}"`);
    for (const v of spec.variants) {
      if (v.proposed) { proposedVariants++; if (!v.why) w.problems.push(`${spec.name} ${JSON.stringify(v.props)}: proposed 인데 why 가 없다`); }
    }
    // 사양이 스스로와 모순되지 않는지 — a11y 프로즈가 "미달"이라 말하는데 도형이 44 이상이면 거짓말이다.
    // "충족"이 같이 있으면 반사실 절이다("minHeight 가 없으면 미달했다") — 그건 모순이 아니다.
    const prose = spec.a11y || "";
    if (/RULE-UI-004/.test(prose) && /미달/.test(prose) && !/충족/.test(prose) && spec.base.minHeight >= 44)
      w.problems.push(`${spec.name}: a11y 는 44px 미달이라는데 base.minHeight=${spec.base.minHeight} 다 — 사양이 스스로와 모순`);
  }
  console.log("근거 없는 변형(⚠️ 표시됨):", proposedVariants, "개");

  // ── 보드 단독 실행 ── ⑤만 눌러도 ④·⑥ 보드가 남아 있어야 한다
  console.log("\n▶ ⑤만 단독 실행 (보드 범위 검사)");
  await ctx.figma.ui.onmessage({ type: "components" });
  const dsPage = w.pages.find((p) => p.name === "🎨 씀씀 Design System");
  const after = (dsPage && dsPage._children[0] ? dsPage._children[0].children : []).map((n) => n.name);
  console.log("보드:", after.join(" · "));
  if (JSON.stringify(after) !== JSON.stringify(["토큰", "공통 컴포넌트", "아이콘"]))
    w.problems.push(`⑤ 단독 실행 뒤 보드가 [${after}] — 다른 보드를 지웠다`);

  // ── 등급 승격 검사 ── Proposed/ 접두사가 떨어져도 id 는 그대로여야 한다.
  // ADR-0017 이 "승격해도 인스턴스가 끊기지 않는다"고 단언하는데, 이걸 재는 검사가 없었다.
  const compEntry = (nm) => {
    let found = null;
    const walk = (n) => {
      if ((n.type === "COMPONENT_SET" || (n.type === "COMPONENT" && n.parent && n.parent.type !== "COMPONENT_SET"))
          && n.name === nm) found = n;
      for (const c of n.children || []) walk(c);
    };
    const p = w.pages.find((x) => x.name === "🎨 씀씀 Design System");
    for (const c of (p ? p._children : [])) walk(c);
    return found;
  };
  console.log("\n▶ 등급 승격 검사 (Proposed/ ↔ 코드)");
  const promoSpec = (ctx.__SPECS || []).find((sp) => sp.name === "ActionBanner");
  if (!promoSpec) w.problems.push("등급 승격을 검증할 사양(ActionBanner)이 없다");
  else {
    const start = compEntry("Proposed/ActionBanner");
    if (!start) w.problems.push('승격 전에 "Proposed/ActionBanner" 가 없다 — 등급 접두사가 붙지 않았다');
    else {
      const id0 = start.id;
      promoSpec.status = "code";
      await ctx.figma.ui.onmessage({ type: "components" });
      const up = compEntry("ActionBanner");
      if (!up) w.problems.push("승격 뒤 접두사 없는 ActionBanner 가 없다");
      else if (up.id !== id0) w.problems.push("등급 승격이 컴포넌트를 새로 만들었다 — 배치된 인스턴스가 끊긴다");
      else console.log("   Proposed/ActionBanner → ActionBanner · id 유지");

      promoSpec.status = "proposed";
      await ctx.figma.ui.onmessage({ type: "components" });
      const down = compEntry("Proposed/ActionBanner");
      if (!down) w.problems.push("강등 뒤 Proposed/ 접두사가 돌아오지 않았다");
      else if (down.id !== id0) w.problems.push("등급 강등이 컴포넌트를 새로 만들었다");
      else console.log("   ActionBanner → Proposed/ActionBanner · id 유지");
    }
  }

  const uniq = [...new Set(w.problems)];
  console.log("\n── 문제 ──");
  if (!uniq.length) console.log("✅ 없음");
  else uniq.forEach((p) => console.log("❌", p));
  return uniq.length;
}

let bad = 0;
bad += await fixture("새 파일 (Page 1 만)", []);
bad += await fixture("예전 파일 (Page 1 + 예전 3페이지)", ["🎨 Tokens", "🧩 Components", "🔣 Icons"]);
console.log(`\n${"═".repeat(70)}\n${bad === 0 ? "✅ 두 픽스처 모두 통과" : `❌ 문제 ${bad}종`}`);
process.exit(bad ? 1 : 0);
