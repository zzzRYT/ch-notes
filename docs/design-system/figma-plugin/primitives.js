// 수치 토큰 — 전부 apps/ch-life 코드 census 실측값이다.
// [figmaName, value, scopes, description, codeSyntax]
const NUMBER_TOKENS = [
  // ── spacing · 2px 그리드 유지(결정 #4). 시각 변경 0건 ──
  ...[2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24].map((n) => [
    "space/" + n, n, ["GAP", "WIDTH_HEIGHT"],
    "census 실측값. 4의 배수가 아닌 6/10/14/18/22는 전부 '4의 배수 ±2' — 2px 그리드로 유지한다", String(n),
  ]),
  ["space/section/40", 40, ["GAP", "WIDTH_HEIGHT"], "사이드바 계열 스크롤 하단 여백", "40"],
  ["space/section/80", 80, ["GAP", "WIDTH_HEIGHT"], "설정·라이선스·에디터 스크롤 하단 여백", "80"],
  ["space/section/120", 120, ["GAP", "WIDTH_HEIGHT"], "홈 리스트 하단 여백(+ insets.bottom)", "120"],

  // ── radius ──
  ...[3, 4, 6, 8, 10, 12, 16].map((n) => [
    "radius/" + n, n, ["CORNER_RADIUS"], "census 실측값", String(n),
  ]),
  ["radius/full", 999, ["CORNER_RADIUS"],
    "알약 모양. 크기 토큰이 아니라 상태값 — 실제 곡률은 컨테이너 높이가 정한다. 원형 버튼은 radius = size/2 파생 규칙을 쓴다(FAB 56/2=28)", "999"],

  // ── borderWidth ──
  ["border/hairline", 0.5, ["STROKE_FLOAT"],
    "코드는 StyleSheet.hairlineWidth(17곳). 실제 값은 기기 픽셀 밀도가 정하므로 0.5는 Figma 표현용 근사치다", "StyleSheet.hairlineWidth"],
  ["border/1", 1, ["STROKE_FLOAT"], "하드코딩 1px 5곳 — hairline 대신 쓴 이유는 미기록(확인필요)", "1"],
  ["border/2", 2, ["STROKE_FLOAT"], "BiblePanel 선택 탭 밑줄 1곳", "2"],

  // ── 타입 스케일 6단계 (base 값만. ×fontScale 곱셈은 앱의 scaled()가 한다 — 결정 #5) ──
  ["text/size/display", 30, ["FONT_SIZE"], "홈 화면 제목", "scaled(30, fontScale)"],
  ["text/size/title", 20, ["FONT_SIZE"], "그룹 헤더·패널 제목. 현재 20/22/16이 섞여 있다", "scaled(20, fontScale)"],
  ["text/size/body-large", 17, ["FONT_SIZE"], "노트 카드 제목·본문 에디터", "scaled(17, fontScale)"],
  ["text/size/body", 15, ["FONT_SIZE"], "인용 본문·설정 라벨", "scaled(15, fontScale)"],
  ["text/size/label", 13, ["FONT_SIZE"], "메타·칩·부제. census 최빈값(16건)", "scaled(13, fontScale)"],
  ["text/size/caption", 11, ["FONT_SIZE"], "배지·eyebrow 라벨", "scaled(11, fontScale)"],

  // ── 행간: 실측된 것과 제안값을 구분한다 ──
  ["text/line-height/editor", 1.625, ["LINE_HEIGHT"], "실측 — ParagraphInput 16/26", "scaled(26, fontScale)"],
  ["text/line-height/body", 1.6, ["LINE_HEIGHT"], "실측 — QuoteBlock 인용 본문 15/24", "scaled(24, fontScale)"],
  ["text/line-height/verse-num", 1.82, ["LINE_HEIGHT"], "실측 — QuoteBlock 절 번호 11/20", "scaled(20, fontScale)"],
  ["text/line-height/title", 1.3, ["LINE_HEIGHT"],
    "⚠️ 제안값(확인필요) — 코드에 근거 없음. title 단계에는 lineHeight 지정이 아예 없다", "미정"],
  ["text/line-height/display", 1.2, ["LINE_HEIGHT"], "⚠️ 제안값(확인필요) — 위와 같은 이유", "미정"],

  // ── 굵기: 6종 중 400/600/700이 95% 이상을 덮는다 ──
  ["text/weight/regular", 400, ["FONT_WEIGHT"], "미선택 칩 2곳", '"400"'],
  ["text/weight/semibold", 600, ["FONT_WEIGHT"], "사실상 기본 강조 웨이트 — 58건 중 40건(69%)", '"600"'],
  ["text/weight/bold", 700, ["FONT_WEIGHT"], "그룹 날짜 헤더·앱 헤더 타이틀 7곳", '"700"'],

  // ── 자간 ──
  ["text/tracking/eyebrow", 0.6, ["LETTER_SPACING"],
    "대문자 섹션 라벨. 4곳 중 3곳이 0.6이고 NoteListSidebar만 0.4로 이미 표류 — 0.6을 정본으로 삼는다", "0.6"],
  ["text/tracking/title", -0.3, ["LETTER_SPACING"], "제목류 음수 자간(-0.5~-0.1)의 대표값", "-0.3"],

  // ── 아이콘: 텍스트 글리프와 벡터 아이콘이 코드에서 분리되어 있다 ──
  ["icon/glyph/xs", 12, ["WIDTH_HEIGHT", "FONT_SIZE"], "✕ 닫기. 같은 글리프가 다른 곳에선 20 — 표류", "12"],
  ["icon/glyph/sm", 14, ["WIDTH_HEIGHT", "FONT_SIZE"], "‹/› 이전·다음. DatePickerModal은 24 — 표류", "14"],
  ["icon/glyph/md", 16, ["WIDTH_HEIGHT", "FONT_SIZE"], "≡ · ‹ · ✓", "16"],
  ["icon/glyph/lg", 18, ["WIDTH_HEIGHT", "FONT_SIZE"], "› 펼치기 · ＋ 절 삽입", "18"],
  ["icon/glyph/fab", 28, ["WIDTH_HEIGHT", "FONT_SIZE"], "홈 FAB의 ＋ 전용", "28"],
  ["icon/vector/sm", 16, ["WIDTH_HEIGHT"], "lucide Download·Settings", "16"],
  ["icon/vector/header", 21, ["WIDTH_HEIGHT"],
    "⚠️ 4의 배수가 아니지만 가장 널리 쓰인다 — HeaderControls 정의 1개가 렌더 7곳에 전파된다", "21"],
  ["icon/vector/lg", 24, ["WIDTH_HEIGHT"], "lucide ChevronLeft", "24"],

  // ── 터치 영역 (RULE-UI-004: 44~48px) ──
  ["touch/min", 44, ["WIDTH_HEIGHT"], "RULE-UI-004 기준선. 새 컴포넌트는 이 값 이상이어야 한다", "44"],
  ["touch/compact", 28, ["WIDTH_HEIGHT"],
    "⚠️ 현행값이나 기준 미달 — NoteListSidebar 헤더 아이콘. 이웃 hitSlop 잠식까지 겹쳐 실효 32px(drift B22)", "28"],
  ["touch/regular", 40, ["WIDTH_HEIGHT"],
    "⚠️ 단독이면 hitSlop 8로 48px이 되지만 간격이 좁으면 실효 42px로 떨어진다(drift B22)", "40"],
  ["touch/fab", 56, ["WIDTH_HEIGHT"], "홈 FAB", "56"],
  ["touch/hit-slop/8", 8, ["WIDTH_HEIGHT"], "가장 흔한 hitSlop(10곳)", "8"],
  ["touch/hit-slop/10", 10, ["WIDTH_HEIGHT"], "NoteListSidebar 전용(6곳)", "10"],
  ["touch/hit-slop/12", 12, ["WIDTH_HEIGHT"], "성경 브라우저·리더·날짜 모달(4곳)", "12"],

  // ── 모션 ──
  ["motion/enter", 240, ["ALL_SCOPES"], "폰 성경 시트 진입(RULE-UI-003)", "ENTER_MS"],
  ["motion/exit", 190, ["ALL_SCOPES"], "폰 성경 시트 종료(RULE-UI-003)", "EXIT_MS"],

  // ── 레이아웃 계약 (토큰이라기보다 상수. 바꾸면 화면 구조가 바뀐다) ──
  ["layout/breakpoint/tablet", 900, ["WIDTH_HEIGHT"],
    "폰/태블릿 분기(RULE-UI-001). ⚠️ 코드에 두 곳 복제되어 있다(drift B2)", "TABLET_BREAKPOINT"],
  ["layout/pane/left", 280, ["WIDTH_HEIGHT"], "태블릿 노트 목록 패널(RULE-UI-002)", "280"],
  ["layout/pane/right", 340, ["WIDTH_HEIGHT"], "태블릿 성경/인용 패널(RULE-UI-002)", "340"],
  ["layout/rail/collapsed", 38, ["WIDTH_HEIGHT"], "⚠️ 접힌 패널 레일. 44px 기준 미달(drift B21)", "38"],
];
