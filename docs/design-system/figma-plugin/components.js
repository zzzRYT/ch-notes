// ─────────────────────────────────────────────────────────────────────────────
// 공통 컴포넌트 사양 — apps/ch-life 코드에서 추출하고 소스와 대조 검증한 값이다.
//
// 출처: 조사 문서 §7(검증 통과 10개) + 컴포넌트별 정밀 사양 워크플로.
//       숫자 485개를 소스와 대조해 33건을 교정했다. 교정 내역은 아래 각 항목 주석 참조.
// 색은 앱 기본 변형 focus/* 에 바인딩한다 (app-store.ts DEFAULT_SETTINGS.variation === "focus").
//
// ⚠️ isProposal 상태(눌림·비활성·오류·포커스 대부분)는 **코드에 없는 제안**이다.
//    저장소의 기존 선례에서 도출했으며, 구현 전에 확인이 필요하다.
//    선례: 눌림 opacity 0.6 = SermonMetaHeader.tsx:172 (저장소 유일)
//          비활성 opacity 0.3 = SermonMetaHeader.tsx:249 · VerseList.tsx:127
//          오류 = QuoteBlock.tsx:124(테두리 err-bar) · TabletWorkspace.tsx:399(err-text)
//          포커스 = 선례 없음. 웹이 실사용 대상으로 확정되어(§11-1) 제외하지 않고 제안으로 남긴다.
// ─────────────────────────────────────────────────────────────────────────────

const PRESSED = 0.6;   // SermonMetaHeader.tsx:172
const DISABLED = 0.3;  // SermonMetaHeader.tsx:249, VerseList.tsx:127

const COMPONENT_SPECS = [
  {
    name: "SelectableChip",
    ko: "선택 칩",
    level: "atom",
    description:
      "설정 화면의 선택형 칩. renderChip(글꼴 크기·폰트·인용 블록 3개 섹션)과 accentChip(강조색)이 " +
      "선택 표현 로직을 문자 그대로 공유한다. 선택 시 배경·글자색이 동시에 반전되어 " +
      "RULE-UI-005('색만으로 의미를 전달하지 않는다')를 흑백에서도 통과한다.",
    sources: [
      "app/settings.tsx:89-119 (renderChip)",
      "app/settings.tsx:182,195,208 (호출 3곳)",
      "app/settings.tsx:220-254 (accentChip)",
      "app/settings.tsx:364-385 (styles.chip / chipText / accentChip / swatchDot)",
    ],
    a11y:
      "minHeight 44(touch/min)가 높이를 강제해 RULE-UI-004 하한을 정확히 충족 — 여유 0px. " +
      "패딩+글자만으로는 41~44px라 minHeight가 없으면 미달했다. hitSlop 없음(칩 간 gap 8, 잠식 대상 없음). " +
      "accessibilityRole=button · accessibilityLabel=라벨 · accessibilityState={{selected}} 모두 구현됨.",
    divergences: [
      "padding: chip 16/12(3개 호출처·11 인스턴스) vs accentChip 14/10(1개 호출처·7 인스턴스). " +
        "빈도와 역할 모두 chip이 우세해 chip을 정본으로 두고 accentChip은 Swatch=Yes 변형에서만 오버라이드한다.",
      "accentChip만 gap 8(space/8)과 12×12 스와치 원을 갖는다. 원의 색은 사용자가 고를 실제 hex라 " +
        "토큰이 아니라 리터럴이 맞다 — 조사 문서 §7-4가 지목한 유일한 예외.",
    ],
    base: {
      layoutMode: "HORIZONTAL",
      padding: { t: 12, r: 16, b: 12, l: 16 },
      paddingTokens: { t: "space/12", r: "space/16", b: "space/12", l: "space/16" },
      itemSpacing: 0, itemSpacingToken: "",
      cornerRadius: 999, cornerRadiusToken: "radius/full",
      minHeight: 44, minHeightToken: "touch/min",
      fixedWidth: 0,
      primaryAxisAlign: "CENTER", counterAxisAlign: "CENTER",
      fillToken: "focus/chip-bg", strokeToken: "", strokeWeight: 0, strokeSide: "",
    },
    texts: [{
      role: "label", content: "크게",
      fontSize: 14, fontSizeToken: "",   // 14는 타입 스케일에 없다(label 13 / body 15 사이) — 코드 실측값 유지
      fontWeight: 400, fontWeightToken: "text/weight/regular",
      colorToken: "focus/ink-2", letterSpacing: 0, lineHeight: 0, textTransform: "none",
    }],
    variants: [
      { props: { Swatch: "No", State: "Default" }, overrides: {} },
      { props: { Swatch: "No", State: "Selected" },
        overrides: { fillToken: "focus/ink", textColorToken: "focus/paper", fontWeight: 600 } },
      { props: { Swatch: "No", State: "Pressed" }, overrides: { opacity: PRESSED } },
      { props: { Swatch: "No", State: "Disabled" }, overrides: { opacity: DISABLED } },
      { props: { Swatch: "Yes", State: "Default" },
        overrides: {
          padding: { t: 10, r: 14, b: 10, l: 14 },
          paddingTokens: { t: "space/10", r: "space/14", b: "space/10", l: "space/14" },
          itemSpacing: 8, itemSpacingToken: "space/8",
          leadingSwatch: { r: 0.118, g: 0.435, b: 0.851 },   // #1e6fd9 — ACCENT_SWATCHES 리터럴
        } },
      { props: { Swatch: "Yes", State: "Selected" },
        overrides: {
          padding: { t: 10, r: 14, b: 10, l: 14 },
          paddingTokens: { t: "space/10", r: "space/14", b: "space/10", l: "space/14" },
          itemSpacing: 8, itemSpacingToken: "space/8",
          leadingSwatch: { r: 0.118, g: 0.435, b: 0.851 },
          fillToken: "focus/ink", textColorToken: "focus/paper", fontWeight: 600,
        } },
    ],
  },

  {
    name: "SectionLabel",
    ko: "섹션 라벨",
    level: "atom",
    description:
      "대문자 eyebrow 섹션 라벨. settings.tsx 7곳 · licenses.tsx 1곳 · BibleLookupPanel 3곳에서 " +
      "같은 값이 각각 손으로 반복된다. 여백은 부모의 gap에 맡기고 컴포넌트가 갖지 않는다.",
    sources: [
      "app/settings.tsx:343-348 (styles.sectionTitle)",
      "app/licenses.tsx:86-90",
      "src/workspace/BibleLookupPanel.tsx:291-296",
    ],
    a11y: "순수 Text — 조작 대상이 아니라 터치 크기 기준(RULE-UI-004)이 적용되지 않는다.",
    divergences: [
      "letterSpacing: 3곳은 0.6, NoteListSidebar의 groupLabel만 0.4 — 공유 토큰이 없어 이미 표류했다. " +
        "다수인 0.6(text/tracking/eyebrow)을 정본으로 삼는다.",
      "fontSize 11이 11곳 모두 하드코딩이라 글자 크기 설정(fontScale)에 반응하지 않는다.",
    ],
    base: {
      layoutMode: "HORIZONTAL",
      padding: { t: 0, r: 0, b: 0, l: 0 }, paddingTokens: null,
      itemSpacing: 0, itemSpacingToken: "",
      cornerRadius: 0, cornerRadiusToken: "",
      minHeight: 0, minHeightToken: "", fixedWidth: 0,
      primaryAxisAlign: "MIN", counterAxisAlign: "MIN",
      fillToken: "", strokeToken: "", strokeWeight: 0, strokeSide: "",
    },
    texts: [{
      role: "label", content: "테마 (variation)",
      fontSize: 11, fontSizeToken: "text/size/caption",
      fontWeight: 600, fontWeightToken: "text/weight/semibold",
      colorToken: "focus/ink-3", letterSpacing: 0.6, lineHeight: 0, textTransform: "uppercase",
    }],
    variants: [
      { props: { State: "Default" }, overrides: {} },
      { props: { State: "Error" }, overrides: { textColorToken: "focus/err-text" },
        proposed: true, why: "섹션 라벨이 오류 상태가 되는 경로가 코드에 없다. err-text 토큰을 빌려 온 추정이다." },
      { props: { State: "Disabled" }, overrides: { opacity: DISABLED } },
    ],
  },

  {
    name: "NavRow",
    ko: "내비게이션 행",
    level: "molecule",
    description:
      "설정 화면 하단의 이동/실행 행 3개(출처 및 라이선스 · 개인정보 처리방침 · 문의하기). " +
      "상단 hairline 구분선과 오른쪽 글리프를 공유한다.",
    sources: [
      "app/settings.tsx:272-284, 285-297, 298-310 (3개 Pressable)",
      "app/settings.tsx:387-397 (styles.navRow)",
    ],
    a11y:
      "minHeight 48로 RULE-UI-004(44~48px) 충족. accessibilityRole은 행마다 다르다 — " +
      "button 2곳(라이선스·문의) / link 1곳(개인정보). accessibilityLabel 서식이 통일되어 있지 않아 " +
      "kind로 자동 생성하지 말고 호출부가 명시해야 한다.",
    divergences: [
      "트레일링 글리프가 행마다 다르다 — '›'(이동) / '↗'(웹 열기) / '✉'(메일). 공유 아이콘 컴포넌트가 없다.",
      "눌림 피드백이 3곳 모두 없다. 같은 저장소에 이미 관례(SermonMetaHeader.tsx:172)가 있는데 이 행들만 밖에 있다.",
    ],
    base: {
      layoutMode: "HORIZONTAL",
      padding: { t: 12, r: 0, b: 12, l: 0 },
      paddingTokens: { t: "space/12", r: "", b: "space/12", l: "" },
      itemSpacing: 0, itemSpacingToken: "",
      cornerRadius: 0, cornerRadiusToken: "",
      minHeight: 48, minHeightToken: "", fixedWidth: 320,
      primaryAxisAlign: "SPACE_BETWEEN", counterAxisAlign: "CENTER",
      fillToken: "",
      // 교정: 사양은 strokeToken을 border/hairline(숫자 토큰)으로 적었으나 strokeToken은 색이어야 한다.
      strokeToken: "focus/rule", strokeWeight: 0.5, strokeSide: "TOP",
    },
    texts: [
      { role: "label", content: "출처 및 라이선스",
        fontSize: 15, fontSizeToken: "text/size/body",
        fontWeight: 400, fontWeightToken: "text/weight/regular",
        colorToken: "focus/ink", letterSpacing: 0, lineHeight: 0, textTransform: "none" },
      { role: "glyph", content: "›",
        fontSize: 22, fontSizeToken: "",
        fontWeight: 400, fontWeightToken: "text/weight/regular",
        colorToken: "focus/ink-3", letterSpacing: 0, lineHeight: 0, textTransform: "none" },
    ],
    variants: [
      { props: { State: "Default" }, overrides: {} },
      { props: { State: "Pressed" }, overrides: { opacity: PRESSED } },
      { props: { State: "Disabled" }, overrides: { opacity: DISABLED } },
      { props: { State: "Error" }, proposed: true,
        why: "settings.tsx:272-306 의 세 행은 전부 정적이다 — 오류로 전환되는 로직이 없다.",
        overrides: { strokeToken: "focus/err-bar", textColorToken: "focus/err-text" } },
    ],
  },

  {
    name: "IconButtonSquare",
    ko: "정사각 아이콘 버튼",
    level: "atom",
    description:
      "투명 배경의 정사각 아이콘 버튼. 7개 파일에 11개의 서로 다른 style 정의로 흩어져 있다. " +
      "40 계열(헤더) · 28 계열(패널) · 44(기준선) 세 크기로 정리한다.",
    sources: [
      "src/chrome/HeaderControls.tsx:40-43, 130-136 (40×40, 아이콘 21, hitSlop 8 — 렌더 7곳이 공유)",
      "src/workspace/NoteListSidebar.tsx:249-256 (28×28, radius 6, hitSlop 10)",
      "src/workspace/TabletWorkspace.tsx:502-508 (40×40, radius 8, hitSlop 없음)",
      "src/editor/SermonMetaHeader.tsx:297-304 (dateBtn — 저장소 유일의 pressed 구현)",
    ],
    a11y:
      "⚠️ 28 계열은 hitSlop 10을 더해도 인접 버튼 간격이 4px라 배타적 터치 폭이 32px로 떨어진다 " +
      "(RULE-UI-004 미달, wiki drift.md B22). 40 계열도 gap 2인 헤더에서는 실효 42px다. " +
      "44(touch/min) 변형이 새 구현의 기본값이어야 한다.",
    divergences: [
      "크기 3계열·radius 3종(0 / 6 / 8)이 공존한다. 아이콘도 lucide 벡터(16/21/24)와 텍스트 글리프(12~28)로 갈린다.",
      "가장 널리 쓰이는 아이콘 크기 21(icon/vector/header)은 4의 배수가 아니지만 정의 1개가 렌더 7곳에 전파되어 " +
        "바꿀 때 영향 범위가 가장 크다.",
    ],
    base: {
      layoutMode: "HORIZONTAL",
      padding: { t: 0, r: 0, b: 0, l: 0 }, paddingTokens: null,
      itemSpacing: 0, itemSpacingToken: "",
      cornerRadius: 0, cornerRadiusToken: "",
      minHeight: 40, minHeightToken: "touch/regular", fixedWidth: 40,
      primaryAxisAlign: "CENTER", counterAxisAlign: "CENTER",
      fillToken: "", strokeToken: "", strokeWeight: 0, strokeSide: "",
    },
    texts: [{
      role: "glyph", content: "≡",
      fontSize: 21, fontSizeToken: "icon/vector/header",
      fontWeight: 400, fontWeightToken: "text/weight/regular",
      colorToken: "focus/ink-2", letterSpacing: 0, lineHeight: 0, textTransform: "none",
    }],
    variants: [
      { props: { Size: "40 regular", State: "Default" }, overrides: {} },
      { props: { Size: "40 regular", State: "Pressed" }, overrides: { opacity: PRESSED } },
      { props: { Size: "40 regular", State: "Disabled" }, overrides: { opacity: DISABLED } },
      { props: { Size: "40 regular", State: "Selected" }, proposed: true,
        why: "SermonMetaHeader dateBtn 의 평상시 모습을 선택 상태로 잘못 이름 붙인 것이다. 실제 토글 버튼(BiblePanel TabBtn)은 색이 아니라 밑줄과 글자 굵기로 상태를 표시한다 — 색만 바뀌는 이 변형을 그대로 구현하면 RULE-UI-005 위반 소지가 있다.",
        overrides: { fillToken: "focus/accent-soft", textColorToken: "focus/accent" } },
      { props: { Size: "28 compact", State: "Default" },
        overrides: { fixedWidth: 28, minHeight: 28,
          texts: [{ role: "glyph", content: "›", fontSize: 18, fontSizeToken: "icon/glyph/lg",
            fontWeight: 400, colorToken: "focus/ink-2", letterSpacing: 0, lineHeight: 0, textTransform: "none" }] } },
      { props: { Size: "44 min", State: "Default" },
        overrides: { fixedWidth: 44, minHeight: 44 } },
      { props: { Size: "44 min", State: "Destructive" }, proposed: true,
        why: "실제로 있는 조합은 40×40 삭제 버튼(TabletWorkspace.tsx:359-366, 502-508)이다. 44 min 과 Destructive 가 만나는 자리는 코드에 없다.",
        overrides: { fixedWidth: 44, minHeight: 44, textColorToken: "focus/err-text" } },
    ],
  },

  {
    name: "CountBadge",
    ko: "개수 배지",
    level: "atom",
    description:
      "탭 라벨 옆·그룹 헤더 옆의 개수 배지. 세 곳이 같은 스펙을 손으로 반복한다.",
    sources: [
      "src/workspace/BiblePanel.tsx:131-136 (paddingH 7, fontSize 10)",
      "src/workspace/BibleLookupPanel.tsx:303-308 (paddingH 7)",
      "app/index.tsx:344-351 (paddingH 8, fontSize scaled(11))",
    ],
    a11y: "표시 전용(View+Text). 조작 대상이 아니라 터치 크기 기준이 적용되지 않는다.",
    divergences: [
      "paddingHorizontal 7(2곳) vs 8(1곳), fontSize 정적 10(2곳) vs scaled(11)(1곳). " +
        "토큰화가 곧 정규화이므로 8(space/8)과 caption(11)을 정본으로 삼는다 — 유일하게 fontScale에 반응하는 쪽을 따른다.",
      "0일 때 숨길지가 호출부마다 다르다 — BiblePanel은 숨기고 나머지 둘은 0도 표시한다. 컴포넌트가 아니라 호출부의 책임이다.",
    ],
    base: {
      layoutMode: "HORIZONTAL",
      padding: { t: 2, r: 8, b: 2, l: 8 },
      paddingTokens: { t: "space/2", r: "space/8", b: "space/2", l: "space/8" },
      itemSpacing: 0, itemSpacingToken: "",
      cornerRadius: 999, cornerRadiusToken: "radius/full",
      minHeight: 0, minHeightToken: "", fixedWidth: 0,
      primaryAxisAlign: "CENTER", counterAxisAlign: "CENTER",
      fillToken: "focus/chip-bg", strokeToken: "", strokeWeight: 0, strokeSide: "",
    },
    texts: [{
      role: "value", content: "3",
      fontSize: 11, fontSizeToken: "text/size/caption",
      fontWeight: 600, fontWeightToken: "text/weight/semibold",
      colorToken: "focus/ink-3", letterSpacing: 0, lineHeight: 0, textTransform: "none",
    }],
    variants: [
      { props: { State: "Default" }, overrides: {} },
      { props: { State: "Error" }, proposed: true,
        why: "개수 배지가 오류를 표시하는 자리가 코드에 없다.",
        overrides: { fillToken: "focus/err-bg", textColorToken: "focus/err-text" } },
      { props: { State: "Disabled" }, overrides: { opacity: DISABLED } },
    ],
  },

  {
    name: "ModalSheet",
    ko: "중앙 정렬 모달 시트",
    level: "organism",
    description:
      "화면 중앙에 뜨는 오버레이 시트. 날짜 선택과 본문 미리보기 두 모달이 공유한다. " +
      "폰 성경의 하단 시트(BibleBrowser)와는 다른 컴포넌트다 — 이름만 같다.",
    sources: [
      "src/editor/DatePickerModal.tsx:154-167 (maxWidth 360)",
      "src/editor/ScripturePreviewModal.tsx:73-75 (maxWidth 420, maxHeight 70%)",
    ],
    a11y:
      "백드롭 탭과 Android 하드웨어 뒤로가기(onRequestClose) 양쪽으로 닫힌다. " +
      "⚠️ 날짜 셀은 화면 폭 360dp에서 약 40px로 RULE-UI-004 미달(drift B21)이고 " +
      "선택 상태에 accessibilityState가 없다(drift B23).",
    divergences: [
      "maxWidth 360 vs 420, maxHeight 없음 vs 70%. 같은 '중앙 오버레이' 계약인데 값이 갈렸다 — " +
        "두 변형으로 남기되 새 모달은 420을 기본으로 쓴다.",
    ],
    base: {
      layoutMode: "VERTICAL",
      padding: { t: 16, r: 16, b: 16, l: 16 },
      paddingTokens: { t: "space/16", r: "space/16", b: "space/16", l: "space/16" },
      itemSpacing: 8, itemSpacingToken: "space/8",
      cornerRadius: 16, cornerRadiusToken: "radius/16",
      minHeight: 0, minHeightToken: "", fixedWidth: 360,
      primaryAxisAlign: "MIN", counterAxisAlign: "MIN",
      fillToken: "focus/paper", strokeToken: "", strokeWeight: 0, strokeSide: "",
    },
    texts: [
      { role: "title", content: "2026년 9월",
        fontSize: 20, fontSizeToken: "text/size/title",
        fontWeight: 700, fontWeightToken: "text/weight/bold",
        colorToken: "focus/ink", letterSpacing: 0, lineHeight: 0, textTransform: "none" },
      { role: "body", content: "본문 내용이 여기에 표시됩니다",
        fontSize: 15, fontSizeToken: "text/size/body",
        fontWeight: 400, fontWeightToken: "text/weight/regular",
        colorToken: "focus/ink-2", letterSpacing: 0, lineHeight: 1.6, textTransform: "none" },
    ],
    variants: [
      { props: { Width: "360 compact" }, overrides: {} },
      { props: { Width: "420 default" }, overrides: { fixedWidth: 420 } },
    ],
  },

  {
    name: "ModalFooterTextButton",
    ko: "모달 하단 텍스트 버튼",
    level: "atom",
    description:
      "모달 하단의 배경 없는 텍스트 액션('오늘' / '닫기'). 두 모달이 복사해 쓴다.",
    sources: [
      "src/editor/DatePickerModal.tsx:204 ('오늘')",
      "src/editor/ScripturePreviewModal.tsx:86-90 ('닫기')",
      "src/chrome/HeaderControls.tsx:81-105 (HeaderTextButton — 같은 물건의 더 완성된 사촌)",
    ],
    a11y:
      "⚠️ padding 12만으로 높이가 약 41~43px이라 RULE-UI-004(44px) 경계 미달이고, " +
      "두 곳 모두 hitSlop이 없다 — 저장소의 다른 탭 대상 대부분이 hitSlop을 갖는 것과 대비된다. " +
      "'차이'가 아니라 복붙에서 함께 넘어온 같은 결함이다. " +
      "여기 그린 높이도 44가 아니라 실측값 그대로다 — 사양이 44라고 말하면 미달인 버튼을 " +
      "고쳐야 한다는 사실 자체가 보이지 않는다(CalendarDayCell 과 같은 판단).",
    divergences: [
      "HeaderTextButton(src/chrome/HeaderControls.tsx:81-105)이 같은 물건인데 더 낫다 — " +
        "scaled(15, fontScale)로 글자 크기를 따르고 hitSlop 8도 있다. 셋을 합칠 때는 " +
        "이쪽을 정본으로 삼아야 한다.",
      "라벨과 accessibilityLabel이 한쪽만 다르다 — '오늘'/'오늘 선택' vs '닫기'/'닫기'. " +
        "라벨에서 파생시키지 말고 호출부가 명시해야 한다.",
    ],
    base: {
      layoutMode: "HORIZONTAL",
      padding: { t: 12, r: 12, b: 12, l: 12 },
      paddingTokens: { t: "space/12", r: "space/12", b: "space/12", l: "space/12" },
      itemSpacing: 0, itemSpacingToken: "",
      cornerRadius: 0, cornerRadiusToken: "",
      minHeight: 0, minHeightToken: "", fixedWidth: 0,
      primaryAxisAlign: "CENTER", counterAxisAlign: "CENTER",
      fillToken: "", strokeToken: "", strokeWeight: 0, strokeSide: "",
    },
    texts: [{
      role: "label", content: "닫기",
      fontSize: 14, fontSizeToken: "",
      fontWeight: 600, fontWeightToken: "text/weight/semibold",
      colorToken: "focus/accent", letterSpacing: 0, lineHeight: 0, textTransform: "none",
    }],
    variants: [
      { props: { State: "Default" }, overrides: {} },
      { props: { State: "Pressed" }, overrides: { opacity: PRESSED } },
      { props: { State: "Disabled" }, overrides: { opacity: DISABLED } },
      { props: { State: "Error" }, overrides: { textColorToken: "focus/err-text" },
        proposed: true, why: "'오늘'·'닫기' 두 버튼이 오류 상태가 되는 경로가 코드에 없다." },
    ],
  },

  {
    name: "InlineErrorBanner",
    ko: "인라인 오류 배너",
    level: "molecule",
    description:
      "저장 실패를 알리는 인라인 배너. 폰 에디터와 태블릿 작업공간에 바이트 단위로 같은 코드가 복제되어 있다. " +
      "이 앱에서 실제로 존재하는 유일한 '오류 상태' UI다.",
    sources: [
      "app/note/[id].tsx:224-226, :263 (padding 8 균등)",
      "src/workspace/TabletWorkspace.tsx:397-399, :510 (paddingH 20 / paddingV 8)",
    ],
    a11y:
      "⚠️ 두 곳 모두 accessibilityRole='alert'도 accessibilityLiveRegion도 없어 스크린리더가 알리지 않는다. " +
      "accessibilityLiveRegion은 Android 전용이라 iOS는 AccessibilityInfo.announceForAccessibility 병행이 필요하다 " +
      "(ActionBannerHost.tsx:30-34가 그 방식을 이미 쓴다).",
    divergences: [
      "padding: 폰 8 균등 vs 태블릿 20/8. 같은 트리거·같은 토큰인데 패딩만 다르다 — 의도된 변형이 아니라 " +
        "미조정 표류로 판단해 가로 20(space/20)을 정본으로 삼는다.",
    ],
    base: {
      layoutMode: "VERTICAL",
      padding: { t: 8, r: 20, b: 8, l: 20 },
      paddingTokens: { t: "space/8", r: "space/20", b: "space/8", l: "space/20" },
      itemSpacing: 0, itemSpacingToken: "",
      cornerRadius: 0, cornerRadiusToken: "",
      minHeight: 0, minHeightToken: "", fixedWidth: 360,
      primaryAxisAlign: "MIN", counterAxisAlign: "MIN",
      fillToken: "focus/err-bg", strokeToken: "", strokeWeight: 0, strokeSide: "",
    },
    texts: [{
      role: "message", content: "저장 실패. 다시 시도 중…",
      fontSize: 14, fontSizeToken: "",
      fontWeight: 400, fontWeightToken: "text/weight/regular",
      colorToken: "focus/err-text", letterSpacing: 0, lineHeight: 0, textTransform: "none",
    }],
    variants: [
      { props: { State: "Error" }, overrides: {} },
      { props: { State: "Retrying" }, overrides: { textColorToken: "focus/ink-3" },
        proposed: true, why: "재시도 중 상태를 그리는 코드가 없다." },
    ],
  },

  {
    name: "EmptyState",
    ko: "빈 상태",
    level: "molecule",
    description:
      "목록·패널이 비었을 때의 안내. 메시지만 있는 형태 5곳과 CTA 버튼을 포함한 형태 2곳이 있다.",
    sources: [
      "app/index.tsx:273-287 (CTA 포함), :353 (메시지)",
      "src/workspace/TabletWorkspace.tsx:425-438 (CTA 포함)",
      "src/browser/ChapterGrid.tsx:63 · src/browser/VerseList.tsx:150 (padding 24)",
    ],
    a11y: "메시지는 표시 전용. CTA는 PrimaryPillButton 사양을 따른다(minHeight 48).",
    divergences: [
      // 교정: 사양이 토큰명을 space/2/24 · space/2/16 으로 적었으나 실제 토큰명은 space/24 · space/16 이다.
      "메시지 크기가 14(사이드바·리더)와 18(홈 빈 상태)로 갈린다. 역할이 달라 두 변형으로 남긴다.",
      "전방향 padding 24는 ChapterGrid·VerseList 2곳뿐이다(ScripturePreviewModal은 세로만 24).",
    ],
    base: {
      layoutMode: "VERTICAL",
      padding: { t: 24, r: 24, b: 24, l: 24 },
      paddingTokens: { t: "space/24", r: "space/24", b: "space/24", l: "space/24" },
      itemSpacing: 16, itemSpacingToken: "space/16",
      cornerRadius: 0, cornerRadiusToken: "",
      minHeight: 0, minHeightToken: "", fixedWidth: 0,
      primaryAxisAlign: "CENTER", counterAxisAlign: "CENTER",
      fillToken: "", strokeToken: "", strokeWeight: 0, strokeSide: "",
    },
    texts: [{
      role: "message", content: "왼쪽에서 노트를 선택하거나 새 노트를 만드세요",
      fontSize: 14, fontSizeToken: "",
      fontWeight: 400, fontWeightToken: "text/weight/regular",
      colorToken: "focus/ink-3", letterSpacing: 0, lineHeight: 0, textTransform: "none",
    }],
    variants: [
      { props: { Emphasis: "Default" }, overrides: {} },
      { props: { Emphasis: "Prominent" },
        overrides: {
          texts: [{ role: "message", content: "첫 번째 설교 노트를 시작하세요",
            fontSize: 18, fontSizeToken: "", fontWeight: 400, colorToken: "focus/ink-3",
            letterSpacing: 0, lineHeight: 0, textTransform: "none" }],
        } },
    ],
  },

  {
    name: "PrimaryPillButton",
    ko: "주요 알약 버튼",
    level: "atom",
    description:
      "빈 상태의 주요 행동 버튼. 잉크로 채운 알약 형태로 폰과 태블릿에 각각 구현되어 있다.",
    sources: [
      "app/index.tsx:354-360 (paddingH 24, minHeight 48, fontSize 16)",
      "src/workspace/TabletWorkspace.tsx:518-522 (paddingH 20, minHeight 없음, fontSize 14)",
    ],
    a11y:
      "⚠️ 폰은 minHeight 48로 RULE-UI-004를 충족하지만 태블릿은 minHeight가 아예 없어 " +
      "코드가 44px를 보장하지 않는다. 폰 사양을 정본으로 삼는다.",
    divergences: [
      "paddingHorizontal 24(폰) vs 20(태블릿), fontSize 16 vs 14, minHeight 48 vs 없음, " +
        "justifyContent center는 폰에만 있다. 폰 쪽이 접근성 기준을 충족하므로 정본으로 삼는다.",
      "⚠️ 결함: 두 호출부 모두 createNote가 async인데 진행 중 disabled 처리가 없어 " +
        "연타 시 노트가 중복 생성될 수 있다. Disabled 변형은 이 결함을 고치기 위한 것이기도 하다.",
    ],
    base: {
      layoutMode: "HORIZONTAL",
      padding: { t: 12, r: 24, b: 12, l: 24 },
      paddingTokens: { t: "space/12", r: "space/24", b: "space/12", l: "space/24" },
      itemSpacing: 0, itemSpacingToken: "",
      cornerRadius: 999, cornerRadiusToken: "radius/full",
      minHeight: 48, minHeightToken: "", fixedWidth: 0,
      primaryAxisAlign: "CENTER", counterAxisAlign: "CENTER",
      fillToken: "focus/ink", strokeToken: "", strokeWeight: 0, strokeSide: "",
    },
    texts: [{
      role: "label", content: "시작하기",
      fontSize: 16, fontSizeToken: "",
      fontWeight: 600, fontWeightToken: "text/weight/semibold",
      colorToken: "focus/paper", letterSpacing: 0, lineHeight: 0, textTransform: "none",
    }],
    variants: [
      { props: { State: "Default" }, overrides: {} },
      { props: { State: "Pressed" }, overrides: { opacity: PRESSED } },
      { props: { State: "Disabled" }, overrides: { opacity: DISABLED } },
    ],
  },

  // ── 2차 조사분 (input · 달력 · 라벨 · FAB · 인용 블록) ────────────────────────
  // 값 320개를 소스와 대조해 14건 교정. FabButton이 UNBUILDABLE 판정을 받은 이유는
  // 값이 틀려서가 아니라 워크플로 스키마가 빌더 형태와 달랐기 때문이며, 여기서 옮기며 해소된다.
  // ⚠️ 원 사양의 opacity:0 은 '오버라이드 없음'을 뜻하는 자리값이었다 — 그대로 옮기면
  //    빌더가 노드를 투명하게 만든다. 아래에서는 해당 키를 아예 넣지 않는다.

  {
    name: "TextInputField",
    ko: "텍스트 입력",
    level: "molecule",
    description:
      "이 앱의 입력은 세 갈래다 — 검색형(홈·사이드바·성경 조회), 폼 필드형(설교 메타), 본문 에디터형. " +
      "검색형 셋만 배경·모서리를 갖고, 폼 필드와 에디터는 장식이 전혀 없는 순수 입력이다.",
    sources: [
      "app/index.tsx:200-214, :321-333 (홈 검색 — radius 10, 아이콘 없음)",
      "src/workspace/NoteListSidebar.tsx:109-125, :257-267 (⌕ 아이콘, minHeight 36)",
      "src/workspace/BibleLookupPanel.tsx:71-99, :251-269 (⌕ + ✕ 지우기)",
      "src/editor/SermonMetaHeader.tsx:110-257 (폼 필드 5종)",
      "src/editor/ParagraphInput.tsx:186-224 (본문 에디터)",
    ],
    a11y:
      "⚠️ 검색형 4곳 전부 RULE-UI-004 미달 — 홈·성경조회 40px, 사이드바 36px(가장 작음). " +
      "입력 박스 전체가 탭 영역이라 높이 축이 그대로 터치 높이다. " +
      "성경 조회의 ✕ 지우기는 22×22 + hitSlop 6 = 34px로 더 심하고, hitSlop 6은 토큰 집합(8/10/12)에도 없다.",
    divergences: [
      "radius: 8이 3곳, 홈 검색만 10. minHeight: 40이 3곳, 사이드바만 36. 다수인 8/40을 정본으로 삼는다.",
      "⌕ 글리프가 13px과 14px로 갈린다 — 1px 차이지만 둘 다 하드코딩이라 크기 토큰이 강제되지 않는다는 증거다.",
      "폼 필드·에디터만 theme.fontStack을 쓰고 검색형은 쓰지 않는다. 어차피 RN에서 무효지만(B24) 의도는 갈려 있다.",
    ],
    base: {
      layoutMode: "HORIZONTAL",
      padding: { t: 8, r: 12, b: 8, l: 12 },
      paddingTokens: { t: "space/8", r: "space/12", b: "space/8", l: "space/12" },
      itemSpacing: 8, itemSpacingToken: "space/8",
      cornerRadius: 8, cornerRadiusToken: "radius/8",
      minHeight: 40, minHeightToken: "touch/regular", fixedWidth: 280,
      primaryAxisAlign: "MIN", counterAxisAlign: "CENTER",
      fillToken: "focus/chip-bg", strokeToken: "", strokeWeight: 0, strokeSide: "",
    },
    texts: [{
      role: "placeholder", content: "검색 — 제목, 본문, 인용",
      fontSize: 14, fontSizeToken: "",
      fontWeight: 400, fontWeightToken: "text/weight/regular",
      colorToken: "focus/ink-3", letterSpacing: 0, lineHeight: 0, textTransform: "none",
    }],
    variants: [
      { props: { Type: "Search", State: "Empty" }, overrides: {} },
      { props: { Type: "Search", State: "Filled" },
        overrides: { textColorToken: "focus/ink",
          texts: [{ role: "value", content: "요한복음", fontSize: 14, fontSizeToken: "",
            fontWeight: 400, colorToken: "focus/ink", letterSpacing: 0, lineHeight: 0, textTransform: "none" }] } },
      { props: { Type: "Search", State: "Focus" },
        proposed: true, why: "코드에 포커스 시각 스타일이 0건이다. 웹이 실사용 대상이라 뺄 수 없어 제안으로 둔다.",
        overrides: { strokeToken: "focus/accent", strokeWeight: 1, strokeSide: "ALL" } },
      { props: { Type: "Field", State: "Empty" },
        overrides: { fillToken: "", cornerRadius: 0,
          texts: [{ role: "placeholder", content: "설교자 이름", fontSize: 16, fontSizeToken: "",
            fontWeight: 400, colorToken: "focus/ink-3", letterSpacing: 0, lineHeight: 0, textTransform: "none" }] } },
      { props: { Type: "Field", State: "Filled" },
        overrides: { fillToken: "", cornerRadius: 0,
          texts: [{ role: "value", content: "김목사", fontSize: 16, fontSizeToken: "",
            fontWeight: 400, colorToken: "focus/ink", letterSpacing: 0, lineHeight: 0, textTransform: "none" }] } },
      { props: { Type: "Field", State: "Focus" },
        proposed: true, why: "코드에 포커스 시각 스타일이 0건이다. 웹이 실사용 대상이라 뺄 수 없어 제안으로 둔다.",
        overrides: { fillToken: "", cornerRadius: 0, strokeToken: "focus/accent", strokeWeight: 1, strokeSide: "BOTTOM" } },
      { props: { Type: "Editor", State: "Empty" },
        overrides: { fillToken: "", cornerRadius: 0,
          texts: [{ role: "placeholder", content: "예: 창1:1 라고 입력 후 space", fontSize: 16, fontSizeToken: "",
            fontWeight: 400, colorToken: "focus/ink-3", letterSpacing: 0, lineHeight: 1.625, textTransform: "none" }] } },
      { props: { Type: "Editor", State: "Filled" },
        overrides: { fillToken: "", cornerRadius: 0,
          texts: [{ role: "value", content: "오늘 말씀은 은혜에 관한 것입니다", fontSize: 16, fontSizeToken: "",
            fontWeight: 400, colorToken: "focus/ink", letterSpacing: 0, lineHeight: 1.625, textTransform: "none" }] } },
      { props: { Type: "Editor", State: "Focus" }, overrides: { fillToken: "", cornerRadius: 0 },
        proposed: true, why: "코드에 포커스 시각 스타일이 0건이다. 웹이 실사용 대상이라 뺄 수 없어 제안으로 둔다." },
    ],
  },

  {
    name: "CalendarDayCell",
    ko: "달력 날짜 셀",
    level: "atom",
    description:
      "날짜 선택 달력(DatePickerModal)의 7열 격자 한 칸. 코드 그대로 두 겹이다 — " +
      "바깥 Pressable(styles.cell, padding 2)이 터치 영역이고 안쪽 원(cellInner)이 시각 요소다. " +
      "칸 폭은 화면 폭에 따라 변한다. 시트는 width:100% 에 maxWidth 360 이고 backdrop padding 이 24라 " +
      "칸 = (min(화면폭−48, 360)−32)÷7 이다: 화면 360dp에서 40×40(안쪽 원 36), " +
      "화면 408dp 이상이면 46.86×46.86(안쪽 42.86). 여기서는 작은 쪽 40을 그린다 — " +
      "RULE-UI-004(44px)에 걸리는 쪽이 그쪽이라 눈에 보여야 한다. " +
      "달력 전체는 CalendarMonth 컴포넌트를 볼 것.",
    sources: [
      "src/editor/DatePickerModal.tsx:88-131 (셀 렌더)",
      "src/editor/DatePickerModal.tsx:190-203 (cell / cellInner 스타일)",
      "src/editor/calendar.ts:40-51 (buildMonthGrid — 일요일 시작 42칸, 패딩은 null)",
    ],
    a11y:
      "⚠️ 칸 폭 = (min(화면폭−48, 360)−32)÷7. 화면폭 360dp에서 40×40px로 RULE-UI-004 미달이고 " +
      "393dp 이상에서만 44px에 닿는다(drift B21). hitSlop 없음. " +
      "⚠️ 선택된 칸에 accessibilityState가 없어 스크린리더에 선택 정보가 전달되지 않는다(drift B23). " +
      "accessibilityLabel 은 \"15일\" / 오늘이면 \"15일 오늘\".",
    divergences: [
      "'빈 칸'만 구조가 다르다 — 나머지는 Pressable(바깥) + cellInner(안쪽 원) 두 겹인데 " +
        "빈 칸은 <View style={cell}/> 하나뿐이라 안쪽 원도 터치 의미도 없다(DatePickerModal.tsx:89).",
      "'오늘'과 '선택됨'이 겹치면 선택됨이 이긴다 — 조건이 isToday && !selected 라서 오늘 테두리가 " +
        "지워지고 글자색은 accent-text 가 된다(DatePickerModal.tsx:107-121). 규칙이 없는 게 아니라 명시돼 있다.",
    ],
    base: {
      layoutMode: "VERTICAL",
      padding: { t: 2, r: 2, b: 2, l: 2 },
      paddingTokens: { t: "space/2", r: "space/2", b: "space/2", l: "space/2" },
      itemSpacing: 0, itemSpacingToken: "",
      cornerRadius: 0, cornerRadiusToken: "",
      minHeight: 40, minHeightToken: "", fixedWidth: 40,
      primaryAxisAlign: "CENTER", counterAxisAlign: "CENTER",
      fillToken: "", strokeToken: "", strokeWeight: 0, strokeSide: "",
      // 안쪽 원 — 채움·테두리·글자색은 전부 여기에 걸린다.
      inner: {
        layoutMode: "VERTICAL",
        padding: { t: 0, r: 0, b: 0, l: 0 }, paddingTokens: null,
        itemSpacing: 0, itemSpacingToken: "",
        cornerRadius: 999, cornerRadiusToken: "radius/full",
        minHeight: 36, minHeightToken: "", fixedWidth: 36,
        primaryAxisAlign: "CENTER", counterAxisAlign: "CENTER",
        fillToken: "", strokeToken: "", strokeWeight: 0, strokeSide: "",
      },
    },
    texts: [{
      role: "day-number", content: "15",
      fontSize: 15, fontSizeToken: "text/size/body",
      fontWeight: 400, fontWeightToken: "text/weight/regular",
      colorToken: "focus/ink", letterSpacing: 0, lineHeight: 0, textTransform: "none",
    }],
    variants: [
      { props: { State: "Default" }, overrides: {} },
      { props: { State: "Today" },
        overrides: { strokeToken: "focus/accent", strokeWeight: 1.5, strokeSide: "ALL",
                     textColorToken: "focus/accent", fontWeight: 700 } },
      { props: { State: "Selected" },
        overrides: { fillToken: "focus/accent", textColorToken: "focus/accent-text", fontWeight: 700 } },
      // 격자의 패딩 칸. 다른 상태와 구조 자체가 다르다 — Pressable 이 아니라 <View style={cell}/> 하나뿐이고
      // 안쪽 원(cellInner) 노드도, onPress·accessibilityRole·accessibilityLabel 도 없다(:89).
      { props: { State: "Empty" }, overrides: { texts: [], noInner: true } },
      // 제안 — styles.cell 은 정적 스타일이고 pressed 콜백이 없다(다른 화면의 0.6 관례를 빌려 왔다).
      { props: { State: "Pressed" }, overrides: { opacity: PRESSED },
        proposed: true, why: "styles.cell 은 정적이고 pressed 콜백이 없다." },
      // 제안 — 날짜를 막는 경로가 코드에 아예 없다.
      { props: { State: "Disabled" }, overrides: { opacity: DISABLED },
        proposed: true, why: "날짜를 막는 경로가 코드에 없다." },
    ],
  },

  {
    name: "FieldLabel",
    ko: "폼 필드 라벨",
    level: "atom",
    description:
      "설교 메타 헤더의 좌측 고정폭 라벨(제목·날짜·설교자·장소·생명양식). " +
      "SectionLabel(대문자 eyebrow)과는 다른 컴포넌트다 — 이쪽은 가로 배치의 폼 라벨이고 대문자화하지 않는다.",
    sources: [
      "src/editor/SermonMetaHeader.tsx:285-296 (styles.label — width 64)",
      "src/editor/SermonMetaHeader.tsx:113, 134, 186, 203, 220 (사용처 5곳)",
    ],
    a11y:
      "순수 Text로 조작 요소가 아니다 — RULE-UI-004는 애초에 적용 대상이 아니다(지어서 충족시키지 않는다). " +
      "⚠️ 폭이 64px로 고정이라 글자 크기 설정 ×1.6에서 라벨이 넘칠 수 있다.",
    divergences: [
      "이 앱의 '라벨처럼 보이는 것'은 셋이다 — FieldLabel(가로·고정폭 64·5곳) / " +
        "SectionLabel(대문자 eyebrow·11곳) / 날짜 그룹 라벨(1곳). 빈도가 아니라 역할·형태로 가른다.",
    ],
    base: {
      layoutMode: "HORIZONTAL",
      padding: { t: 0, r: 0, b: 0, l: 0 }, paddingTokens: null,
      itemSpacing: 0, itemSpacingToken: "",
      cornerRadius: 0, cornerRadiusToken: "",
      minHeight: 0, minHeightToken: "", fixedWidth: 64,
      primaryAxisAlign: "MIN", counterAxisAlign: "MIN",
      fillToken: "", strokeToken: "", strokeWeight: 0, strokeSide: "",
    },
    texts: [{
      role: "label", content: "설교자",
      fontSize: 13, fontSizeToken: "text/size/label",
      fontWeight: 600, fontWeightToken: "text/weight/semibold",
      colorToken: "focus/ink-3", letterSpacing: 0, lineHeight: 0, textTransform: "none",
    }],
    variants: [
      { props: { State: "Default" }, overrides: {} },
      { props: { State: "Active" }, overrides: { textColorToken: "focus/ink" },
        proposed: true, why: "라벨이 활성/비활성으로 갈리는 코드가 없다." },
      { props: { State: "Disabled" }, overrides: { opacity: DISABLED } },
    ],
  },

  {
    name: "FabButton",
    ko: "플로팅 버튼 (새 노트)",
    level: "atom",
    description:
      "홈 화면 우하단의 원형 플로팅 버튼. 앱에서 가장 큰 터치 타깃이고, 그림자를 가진 두 요소 중 하나다.",
    sources: [
      "app/index.tsx:291-301 (렌더)",
      "app/index.tsx:362-375 (styles.fab — 56×56, radius 28, shadowOpacity 0.22 / radius 14 / offset {0,6} / elevation 6)",
      "app/index.tsx:376 (글리프 ＋ — fontSize 28, lineHeight 32, fontWeight 300)",
    ],
    a11y:
      "56×56으로 RULE-UI-004(44~48px) 상한도 넘겨 충족한다. hitSlop 없이도 충분하다. " +
      "accessibilityRole='button' · accessibilityLabel='새 노트' 구현됨. " +
      "다만 wiki RULE-UI-004의 implemented_by 목록에 이 파일이 빠져 있다.",
    divergences: [
      "radius 28은 크기 56의 절반이라는 파생값이지 별도 스케일이 아니다 — 원형 버튼은 radius = size/2 규칙을 쓴다.",
      "앱에 그림자는 여기와 ActionBannerHost 단 둘뿐이고 값이 서로 다르다 " +
        "(opacity 0.22/0.18 · radius 14/8 · offset {0,6}/{0,3} · elevation 6/5). 통일 규칙이 없다.",
      "⚠️ 같은 '새 노트' 동작이 태블릿에서는 인라인 ＋(16px)로 그려진다. FAB는 폰 전용이다.",
    ],
    base: {
      layoutMode: "HORIZONTAL",
      padding: { t: 0, r: 0, b: 0, l: 0 }, paddingTokens: null,
      itemSpacing: 0, itemSpacingToken: "",
      cornerRadius: 28, cornerRadiusToken: "",
      minHeight: 56, minHeightToken: "touch/fab", fixedWidth: 56,
      primaryAxisAlign: "CENTER", counterAxisAlign: "CENTER",
      fillToken: "focus/ink", strokeToken: "", strokeWeight: 0, strokeSide: "",
    },
    texts: [{
      role: "glyph", content: "＋",
      fontSize: 28, fontSizeToken: "icon/glyph/fab",
      fontWeight: 400, fontWeightToken: "text/weight/regular",   // 코드는 300이나 Inter Light 로드를 피해 400으로 그린다
      colorToken: "focus/paper", letterSpacing: 0, lineHeight: 0, textTransform: "none",
    }],
    variants: [
      { props: { State: "Default" }, overrides: {} },
      { props: { State: "Pressed" }, overrides: { opacity: PRESSED } },
      { props: { State: "Disabled" }, overrides: { opacity: DISABLED } },
    ],
  },

  {
    name: "QuoteBlock",
    ko: "성경 인용 블록",
    level: "molecule",
    description:
      "이 앱의 핵심 컴포넌트. 설정의 blockStyle이 Card / Quote / Collapse 세 표현을 가르고, " +
      "기본값은 변형마다 다르다 — minimal=Card, paper=Quote, focus=Collapse, dark=Quote. " +
      "앱 기본 변형이 focus이므로 Collapse가 사실상의 기본 경험이다.",
    sources: [
      "src/editor/QuoteBlock.tsx:18 (blockStyle switch)",
      "src/editor/QuoteBlock.tsx:122-138 (Card) · :140-156 (Quote) · :157-203 (Collapse)",
      "src/editor/QuoteBlock.tsx:205-272 (styles)",
    ],
    a11y:
      "⚠️ Collapse 토글이 minHeight 36 · hitSlop 없음으로 RULE-UI-004 미달이고(drift B21), " +
      "focus가 기본 변형이라 **기본 경험에 들어 있다**. " +
      "다만 이 36px 계산은 fontScale 1.0 기준이다 — 기본값은 1.2라 실제 텍스트는 13/14px로 커지므로 " +
      "실측 높이는 36보다 크고 44에는 여전히 못 미칠 가능성이 높다(기기 확인 필요).",
    divergences: [
      "세 변형이 서로 다른 배경·테두리를 쓴다 — Card는 paper+rule 테두리, Quote는 accent-soft 배경에 테두리 없음, " +
        "Collapse는 bg+rule 테두리. 사용자가 blockStyle을 직접 고르면 변형 기본값을 이긴다.",
      "절 번호(11/20)와 본문(15/24)은 fontScale에 반응하는 몇 안 되는 자리다. " +
        "반면 '불러오는 중…'과 '본문을 찾을 수 없습니다'는 고정 14px다.",
      "⚠️ Loading/Error 분기는 코드에 있으나 도달하는 경로가 없다(drift B6) — 시트에는 그리되 현재는 죽은 상태다.",
    ],
    base: {
      layoutMode: "VERTICAL",
      padding: { t: 10, r: 12, b: 10, l: 12 },
      paddingTokens: { t: "space/10", r: "space/12", b: "space/10", l: "space/12" },
      itemSpacing: 6, itemSpacingToken: "space/6",
      cornerRadius: 10, cornerRadiusToken: "radius/10",
      minHeight: 36, minHeightToken: "", fixedWidth: 320,
      primaryAxisAlign: "MIN", counterAxisAlign: "MIN",
      fillToken: "focus/bg", strokeToken: "focus/rule", strokeWeight: 0.5, strokeSide: "ALL",
    },
    texts: [
      { role: "headerLabel", content: "요한복음 3:16",
        fontSize: 12, fontSizeToken: "",
        fontWeight: 600, fontWeightToken: "text/weight/semibold",
        colorToken: "focus/accent", letterSpacing: 0, lineHeight: 0, textTransform: "none" },
      { role: "verseText", content: "하나님이 세상을 이처럼 사랑하사",
        fontSize: 15, fontSizeToken: "text/size/body",
        fontWeight: 400, fontWeightToken: "text/weight/regular",
        colorToken: "focus/ink", letterSpacing: 0, lineHeight: 1.6, textTransform: "none" },
    ],
    variants: [
      { props: { Style: "Collapse", State: "Loaded" }, overrides: {} },
      { props: { Style: "Collapse", State: "Error" },
        overrides: { strokeToken: "focus/err-bar",
          texts: [{ role: "message", content: "본문을 찾을 수 없습니다", fontSize: 14, fontSizeToken: "",
            fontWeight: 400, colorToken: "focus/err-text", letterSpacing: 0, lineHeight: 0, textTransform: "none" }] } },
      { props: { Style: "Card", State: "Loaded" },
        overrides: { fillToken: "focus/paper", strokeToken: "focus/rule", strokeWeight: 0.5 } },
      { props: { Style: "Card", State: "Error" },
        overrides: { fillToken: "focus/paper", strokeToken: "focus/err-bar", strokeWeight: 0.5 } },
      { props: { Style: "Quote", State: "Loaded" },
        overrides: { fillToken: "focus/accent-soft", strokeToken: "", strokeWeight: 0, cornerRadius: 0 } },
      { props: { Style: "Quote", State: "Error" },
        overrides: { fillToken: "focus/accent-soft", strokeToken: "", strokeWeight: 0, cornerRadius: 0,
          texts: [{ role: "message", content: "본문을 찾을 수 없습니다", fontSize: 14, fontSizeToken: "",
            fontWeight: 400, colorToken: "focus/err-text", letterSpacing: 0, lineHeight: 0, textTransform: "none" }] } },
    ],
  },

  // ── 아래 둘은 코드에 컴포넌트로 존재하지 않는다. 등급이 이름 접두사로 붙는다. ────────
  //    Proposed/ = 화면에 패턴은 있으나 재사용 컴포넌트로 추출돼 있지 않다
  //    Planned/  = 데이터·계약에는 있으나 화면에 그리는 코드가 아직 없다

  {
    name: "ActionBanner",
    ko: "실행 취소 배너",
    level: "molecule",
    status: "proposed",
    reference:
      "shadcn/ui Toast — '메시지 + 단일 행동 + 자동 소멸' 이라는 구성만 참고했다. 수치·색은 전부 이 앱 코드에서 읽었다.",
    description:
      "화면 아래에 떠서 결과를 알리고 되돌릴 기회를 주는 배너. 값은 전부 실제 스타일에서 읽었지만 " +
      "코드에서는 ActionBannerHost 안의 인라인 JSX라 재사용 가능한 컴포넌트로 추출돼 있지 않다 — 그래서 Proposed 다.",
    sources: [
      "src/feedback/ActionBannerHost.tsx:51-72 (배너·메시지·실행 취소 버튼)",
      "src/feedback/ActionBannerHost.tsx:86-111 (styles — minHeight 48 / radius 12 / padding 16·8·10 / gap 12)",
      "src/state/app-store.ts:44, :97 (durationMs — 삭제 취소만 5000, 나머지 3000)",
    ],
    a11y:
      "메시지에 accessibilityLiveRegion(:56)이 있고 iOS 는 announceForAccessibility(:33)로 병행한다 — " +
      "두 경로를 모두 갖춘 저장소 유일한 곳이다. 실행 취소 버튼은 minHeight 40 + hitSlop 8 이라 " +
      "실효 56px 로 RULE-UI-004 를 충족한다. " +
      "⚠️ 메시지·버튼 글자 모두 scaled() 를 거치지 않아 글자 크기 설정이 배너에 적용되지 않는다(drift B27). " +
      "⚠️ 자동 소멸 시간도 글자 크기와 무관하게 고정이라 글자를 키운 사용자에게 읽을 시간이 더 주어지지 않는다.",
    divergences: [
      "tone 은 info(ink 배경 / paper 글자)와 error(err-bg / err-text) 둘뿐이다. success 는 없다.",
      "실행 취소 글자색은 tone 과 무관하게 accent 고정(:69)이다 — err-bg 위 accent 대비는 측정된 적이 없다.",
      "E14: 구절 삽입 '성공'에도 배너를 띄우는 것이 POL-A11Y-001 의 '조용함'과 충돌한다는 질문이 열려 있다. " +
        "그 질문이 닫히기 전에는 코드 정본으로 승격하지 않는다.",
    ],
    base: {
      layoutMode: "HORIZONTAL",
      // host 가 left/right 16 이라 360dp 화면에서 폭은 328 이다(maxWidth 560 은 태블릿에서만 걸린다).
      padding: { t: 10, r: 8, b: 10, l: 16 },
      paddingTokens: { t: "space/10", r: "space/8", b: "space/10", l: "space/16" },
      itemSpacing: 12, itemSpacingToken: "space/12",
      cornerRadius: 12, cornerRadiusToken: "radius/12",
      minHeight: 48, minHeightToken: "", fixedWidth: 328,
      primaryAxisAlign: "SPACE_BETWEEN", counterAxisAlign: "CENTER",
      fillToken: "focus/ink", strokeToken: "", strokeWeight: 0, strokeSide: "",
    },
    texts: [
      { role: "message", content: "노트를 삭제했습니다",
        fontSize: 14, fontSizeToken: "",
        fontWeight: 600, fontWeightToken: "text/weight/semibold",
        colorToken: "focus/paper", letterSpacing: 0, lineHeight: 0, textTransform: "none" },
      { role: "action", content: "실행 취소",
        fontSize: 14, fontSizeToken: "",
        fontWeight: 800, fontWeightToken: "text/weight/bold",
        colorToken: "focus/accent", letterSpacing: 0, lineHeight: 0, textTransform: "none" },
    ],
    variants: [
      // action === "undo-delete" 인 유일한 호출처(app-store.ts:94-99)
      { props: { Tone: "Info", Action: "Undo" }, overrides: {} },
      // 나머지 info 배너는 메시지만이다(:116-120 복원 완료 등)
      { props: { Tone: "Info", Action: "None" },
        overrides: {
          texts: [{ role: "message", content: "노트를 복원했습니다",
            fontSize: 14, fontSizeToken: "", fontWeight: 600, colorToken: "focus/paper",
            letterSpacing: 0, lineHeight: 0, textTransform: "none" }],
        } },
      // tone === "error" 는 3곳 모두 action 없이 쓴다(app-store.ts:132 · note-actions.ts:24 · TabletWorkspace.tsx:223)
      { props: { Tone: "Error", Action: "None" },
        overrides: {
          fillToken: "focus/err-bg",
          texts: [{ role: "message", content: "노트를 삭제하지 못했습니다",
            fontSize: 14, fontSizeToken: "", fontWeight: 600, colorToken: "focus/err-text",
            letterSpacing: 0, lineHeight: 0, textTransform: "none" }],
        } },
      // 조합만 제안이다 — 색은 코드의 tone 규칙(:46-47)을 그대로 따른다.
      { props: { Tone: "Error", Action: "Undo" },
        overrides: {
          fillToken: "focus/err-bg",
          texts: [
            { role: "message", content: "노트를 삭제하지 못했습니다",
              fontSize: 14, fontSizeToken: "", fontWeight: 600, colorToken: "focus/err-text",
              letterSpacing: 0, lineHeight: 0, textTransform: "none" },
            { role: "action", content: "다시 시도",
              fontSize: 14, fontSizeToken: "", fontWeight: 800, colorToken: "focus/accent",
              letterSpacing: 0, lineHeight: 0, textTransform: "none" },
          ],
        },
        proposed: true,
        why: "오류 배너에 행동 버튼을 붙이는 호출처가 없다 — tone='error' 인 3곳 모두 action 없이 쓴다. " +
             "색은 코드의 tone 규칙을 그대로 따랐지만 err-bg 위 accent 대비는 측정된 적이 없다." },
    ],
  },

  {
    name: "Checkbox",
    ko: "할 일 체크박스",
    level: "atom",
    status: "planned",
    reference:
      "shadcn/ui Checkbox — 상자와 라벨을 하나의 터치 영역으로 묶는 구조만 참고했다.",
    description:
      "할 일 블록(todo)의 체크 상태. 데이터 모델과 마크다운 계약에는 이미 있는데 화면에 그리는 코드가 없다. " +
      "NoteEditor 의 렌더 분기가 quote 와 paragraph 뿐이라(:175-192) todo 블록은 ParagraphInput 으로 새고, " +
      "handleCommit 이 paragraph 가 아니면 조기 반환하므로(:105) 입력이 조용히 버려진다(drift B28).",
    sources: [
      "src/domain/types.ts:21 (BlockNode 의 todo — { checked, text })",
      "wiki/contracts/CONTRACT-MD-NOTE.md:51, :64 (`- [x]` / `- [ ]` 는 바꿀 수 없는 고정 토큰)",
      "src/editor/NoteEditor.tsx:175-192 (렌더 분기에 todo 가 없다), :105 (handleCommit 조기 반환)",
    ],
    a11y:
      "새로 만드는 것이므로 RULE-UI-004 를 처음부터 충족한다 — 행 전체가 minHeight 44 의 터치 영역이다. " +
      "체크 표시는 색이 아니라 글리프가 바뀐다([ ] → [x]) — RULE-UI-005 를 색만으로 뜻을 전하지 않도록 지킨다. " +
      "구현할 때 accessibilityRole='checkbox' 와 accessibilityState={{ checked }} 가 필요하다.",
    divergences: [
      "상자를 아이콘이 아니라 글자([ ] / [x])로 그렸다. icons.js 에는 앱이 실제로 import 하는 9개만 있고 " +
        "Square·CheckSquare 는 없다 — 없는 벡터를 지어내지 않고, 마크다운 계약의 토큰을 그대로 보여 준다. " +
        "todo 블록을 구현할 때 lucide 아이콘을 추가하면 그때 교체한다.",
      "코드에 없는 컴포넌트라 색·간격은 이 앱의 다른 목록 행(NavRow)에서 가져온 값이다.",
    ],
    base: {
      layoutMode: "HORIZONTAL",
      padding: { t: 10, r: 12, b: 10, l: 12 },
      paddingTokens: { t: "space/10", r: "space/12", b: "space/10", l: "space/12" },
      itemSpacing: 12, itemSpacingToken: "space/12",
      cornerRadius: 0, cornerRadiusToken: "",
      minHeight: 44, minHeightToken: "touch/min", fixedWidth: 0,
      primaryAxisAlign: "MIN", counterAxisAlign: "CENTER",
      fillToken: "", strokeToken: "", strokeWeight: 0, strokeSide: "",
    },
    texts: [
      { role: "box", content: "[ ]",
        fontSize: 16, fontSizeToken: "",
        fontWeight: 400, fontWeightToken: "text/weight/regular",
        colorToken: "focus/ink-3", letterSpacing: 0, lineHeight: 0, textTransform: "none" },
      { role: "label", content: "심방 가기",
        fontSize: 16, fontSizeToken: "",
        fontWeight: 400, fontWeightToken: "text/weight/regular",
        colorToken: "focus/ink", letterSpacing: 0, lineHeight: 0, textTransform: "none" },
    ],
    variants: [
      { props: { State: "Unchecked" }, overrides: {} },
      { props: { State: "Checked" },
        overrides: {
          texts: [
            { role: "box", content: "[x]", fontSize: 16, fontSizeToken: "", fontWeight: 700,
              colorToken: "focus/accent", letterSpacing: 0, lineHeight: 0, textTransform: "none" },
            { role: "label", content: "심방 가기", fontSize: 16, fontSizeToken: "", fontWeight: 400,
              colorToken: "focus/ink-3", letterSpacing: 0, lineHeight: 0, textTransform: "none" },
          ],
        } },
      { props: { State: "Disabled" }, overrides: { opacity: DISABLED },
        proposed: true,
        why: "할 일을 잠그는 경로가 데이터 모델에도 계약에도 없다. 저장소 선례(opacity 0.3)에서 도출한 값이다." },
    ],
  },
];
