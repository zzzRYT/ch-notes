// ⚠️ 자동 생성 파일 — 직접 수정하지 말 것.
// 소스: tokens.colors.js (ThemeProvider.tsx에서 추출) + primitives.js + main.js
// 재생성: node build.mjs
// 자동 생성 — apps/ch-life/src/theme/ThemeProvider.tsx 에서 추출. 직접 수정하지 말 것.
// 재생성: python3 docs/design-system/figma-plugin/extract-colors.py
const COLOR_TOKENS = [
 {
  "name": "minimal/bg",
  "r": 0.980392,
  "g": 0.980392,
  "b": 0.968627,
  "a": 1.0,
  "code": "colors.bg",
  "desc": "캔버스 배경. paper와 다르다(focus만 동일)",
  "raw": "#fafaf7"
 },
 {
  "name": "minimal/paper",
  "r": 1.0,
  "g": 1.0,
  "b": 1.0,
  "a": 1.0,
  "code": "colors.paper",
  "desc": "카드·시트 표면. 레거시 surface와 4팔레트 전부 동일 → 통일",
  "raw": "#ffffff"
 },
 {
  "name": "minimal/ink",
  "r": 0.047059,
  "g": 0.039216,
  "b": 0.031373,
  "a": 1.0,
  "code": "colors.ink",
  "desc": "본문 텍스트. 레거시 text와 4팔레트 전부 동일 → 통일",
  "raw": "#0c0a08"
 },
 {
  "name": "minimal/ink-2",
  "r": 0.047059,
  "g": 0.039216,
  "b": 0.031373,
  "a": 0.6,
  "code": "colors.ink2",
  "desc": "보조 텍스트",
  "raw": "rgba(12,10,8,0.6)"
 },
 {
  "name": "minimal/ink-3",
  "r": 0.047059,
  "g": 0.039216,
  "b": 0.031373,
  "a": 0.4,
  "code": "colors.ink3",
  "desc": "흐린 텍스트·placeholder",
  "raw": "rgba(12,10,8,0.4)"
 },
 {
  "name": "minimal/ink-4",
  "r": 0.047059,
  "g": 0.039216,
  "b": 0.031373,
  "a": 0.18,
  "code": "colors.ink4",
  "desc": "가장 흐림. 레거시 quoteBar와 4팔레트 전부 동일 → 통일",
  "raw": "rgba(12,10,8,0.18)"
 },
 {
  "name": "minimal/subtle",
  "r": 0.047059,
  "g": 0.039216,
  "b": 0.031373,
  "a": 0.55,
  "code": "colors.subtle",
  "desc": "⚠️ ink2와 값이 다르다(4팔레트 전부). 통합하지 말 것",
  "raw": "rgba(12,10,8,0.55)"
 },
 {
  "name": "minimal/rule",
  "r": 0.047059,
  "g": 0.039216,
  "b": 0.031373,
  "a": 0.08,
  "code": "colors.rule",
  "desc": "구분선. 레거시 line과 4팔레트 전부 동일 → 통일",
  "raw": "rgba(12,10,8,0.08)"
 },
 {
  "name": "minimal/accent",
  "r": 0.117647,
  "g": 0.435294,
  "b": 0.85098,
  "a": 1.0,
  "code": "colors.accent",
  "desc": "강조색. 사용자가 accentChoice로 덮어쓸 수 있다",
  "raw": "#1e6fd9"
 },
 {
  "name": "minimal/accent-soft",
  "r": 0.117647,
  "g": 0.435294,
  "b": 0.85098,
  "a": 0.08,
  "code": "colors.accentSoft",
  "desc": "강조색 옅은 배경. ⚠️ 변형 내장 알파는 8/9/8/14%인데 사용자가 색을 직접 고르면 항상 8%로 파생된다(규칙이 둘)",
  "raw": "rgba(30,111,217,0.08)"
 },
 {
  "name": "minimal/accent-text",
  "r": 1.0,
  "g": 1.0,
  "b": 1.0,
  "a": 1.0,
  "code": "colors.accentText",
  "desc": "accent 위에 얹는 텍스트색",
  "raw": "#ffffff"
 },
 {
  "name": "minimal/chip-bg",
  "r": 0.047059,
  "g": 0.039216,
  "b": 0.031373,
  "a": 0.06,
  "code": "colors.chipBg",
  "desc": "칩 배경",
  "raw": "rgba(12,10,8,0.06)"
 },
 {
  "name": "minimal/chip-text",
  "r": 0.047059,
  "g": 0.039216,
  "b": 0.031373,
  "a": 0.6,
  "code": "colors.chipText",
  "desc": "칩 텍스트. minimal·focus는 ink2와 같고 paper·dark는 다르다 — 규칙성 없음(확인필요)",
  "raw": "rgba(12,10,8,0.6)"
 },
 {
  "name": "minimal/err-bar",
  "r": 0.784314,
  "g": 0.203922,
  "b": 0.164706,
  "a": 1.0,
  "code": "colors.errBar",
  "desc": "오류 막대·테두리",
  "raw": "#c8342a"
 },
 {
  "name": "minimal/err-bg",
  "r": 0.992157,
  "g": 0.886275,
  "b": 0.882353,
  "a": 1.0,
  "code": "colors.errBg",
  "desc": "오류 배경. ⚠️ paper만 알파(0.12), 나머지는 solid",
  "raw": "#fde2e1"
 },
 {
  "name": "minimal/err-text",
  "r": 0.784314,
  "g": 0.203922,
  "b": 0.164706,
  "a": 1.0,
  "code": "colors.errText",
  "desc": "오류 텍스트. ⚠️ dark만 errBar와 다르다",
  "raw": "#c8342a"
 },
 {
  "name": "paper/bg",
  "r": 0.968627,
  "g": 0.952941,
  "b": 0.92549,
  "a": 1.0,
  "code": "colors.bg",
  "desc": "캔버스 배경. paper와 다르다(focus만 동일)",
  "raw": "#f7f3ec"
 },
 {
  "name": "paper/paper",
  "r": 0.988235,
  "g": 0.976471,
  "b": 0.952941,
  "a": 1.0,
  "code": "colors.paper",
  "desc": "카드·시트 표면. 레거시 surface와 4팔레트 전부 동일 → 통일",
  "raw": "#fcf9f3"
 },
 {
  "name": "paper/ink",
  "r": 0.121569,
  "g": 0.101961,
  "b": 0.07451,
  "a": 1.0,
  "code": "colors.ink",
  "desc": "본문 텍스트. 레거시 text와 4팔레트 전부 동일 → 통일",
  "raw": "#1f1a13"
 },
 {
  "name": "paper/ink-2",
  "r": 0.121569,
  "g": 0.101961,
  "b": 0.07451,
  "a": 0.68,
  "code": "colors.ink2",
  "desc": "보조 텍스트",
  "raw": "rgba(31,26,19,0.68)"
 },
 {
  "name": "paper/ink-3",
  "r": 0.121569,
  "g": 0.101961,
  "b": 0.07451,
  "a": 0.44,
  "code": "colors.ink3",
  "desc": "흐린 텍스트·placeholder",
  "raw": "rgba(31,26,19,0.44)"
 },
 {
  "name": "paper/ink-4",
  "r": 0.121569,
  "g": 0.101961,
  "b": 0.07451,
  "a": 0.2,
  "code": "colors.ink4",
  "desc": "가장 흐림. 레거시 quoteBar와 4팔레트 전부 동일 → 통일",
  "raw": "rgba(31,26,19,0.2)"
 },
 {
  "name": "paper/subtle",
  "r": 0.121569,
  "g": 0.101961,
  "b": 0.07451,
  "a": 0.6,
  "code": "colors.subtle",
  "desc": "⚠️ ink2와 값이 다르다(4팔레트 전부). 통합하지 말 것",
  "raw": "rgba(31,26,19,0.6)"
 },
 {
  "name": "paper/rule",
  "r": 0.121569,
  "g": 0.101961,
  "b": 0.07451,
  "a": 0.09,
  "code": "colors.rule",
  "desc": "구분선. 레거시 line과 4팔레트 전부 동일 → 통일",
  "raw": "rgba(31,26,19,0.09)"
 },
 {
  "name": "paper/accent",
  "r": 0.694118,
  "g": 0.360784,
  "b": 0.180392,
  "a": 1.0,
  "code": "colors.accent",
  "desc": "강조색. 사용자가 accentChoice로 덮어쓸 수 있다",
  "raw": "#b15c2e"
 },
 {
  "name": "paper/accent-soft",
  "r": 0.694118,
  "g": 0.360784,
  "b": 0.180392,
  "a": 0.09,
  "code": "colors.accentSoft",
  "desc": "강조색 옅은 배경. ⚠️ 변형 내장 알파는 8/9/8/14%인데 사용자가 색을 직접 고르면 항상 8%로 파생된다(규칙이 둘)",
  "raw": "rgba(177,92,46,0.09)"
 },
 {
  "name": "paper/accent-text",
  "r": 0.988235,
  "g": 0.976471,
  "b": 0.952941,
  "a": 1.0,
  "code": "colors.accentText",
  "desc": "accent 위에 얹는 텍스트색",
  "raw": "#fcf9f3"
 },
 {
  "name": "paper/chip-bg",
  "r": 0.121569,
  "g": 0.101961,
  "b": 0.07451,
  "a": 0.06,
  "code": "colors.chipBg",
  "desc": "칩 배경",
  "raw": "rgba(31,26,19,0.06)"
 },
 {
  "name": "paper/chip-text",
  "r": 0.121569,
  "g": 0.101961,
  "b": 0.07451,
  "a": 0.6,
  "code": "colors.chipText",
  "desc": "칩 텍스트. minimal·focus는 ink2와 같고 paper·dark는 다르다 — 규칙성 없음(확인필요)",
  "raw": "rgba(31,26,19,0.6)"
 },
 {
  "name": "paper/err-bar",
  "r": 0.603922,
  "g": 0.219608,
  "b": 0.137255,
  "a": 1.0,
  "code": "colors.errBar",
  "desc": "오류 막대·테두리",
  "raw": "#9a3823"
 },
 {
  "name": "paper/err-bg",
  "r": 0.603922,
  "g": 0.219608,
  "b": 0.137255,
  "a": 0.12,
  "code": "colors.errBg",
  "desc": "오류 배경. ⚠️ paper만 알파(0.12), 나머지는 solid",
  "raw": "rgba(154,56,35,0.12)"
 },
 {
  "name": "paper/err-text",
  "r": 0.603922,
  "g": 0.219608,
  "b": 0.137255,
  "a": 1.0,
  "code": "colors.errText",
  "desc": "오류 텍스트. ⚠️ dark만 errBar와 다르다",
  "raw": "#9a3823"
 },
 {
  "name": "focus/bg",
  "r": 1.0,
  "g": 1.0,
  "b": 1.0,
  "a": 1.0,
  "code": "colors.bg",
  "desc": "캔버스 배경. paper와 다르다(focus만 동일)",
  "raw": "#ffffff"
 },
 {
  "name": "focus/paper",
  "r": 1.0,
  "g": 1.0,
  "b": 1.0,
  "a": 1.0,
  "code": "colors.paper",
  "desc": "카드·시트 표면. 레거시 surface와 4팔레트 전부 동일 → 통일",
  "raw": "#ffffff"
 },
 {
  "name": "focus/ink",
  "r": 0.082353,
  "g": 0.078431,
  "b": 0.054902,
  "a": 1.0,
  "code": "colors.ink",
  "desc": "본문 텍스트. 레거시 text와 4팔레트 전부 동일 → 통일",
  "raw": "#15140e"
 },
 {
  "name": "focus/ink-2",
  "r": 0.082353,
  "g": 0.078431,
  "b": 0.054902,
  "a": 0.55,
  "code": "colors.ink2",
  "desc": "보조 텍스트",
  "raw": "rgba(21,20,14,0.55)"
 },
 {
  "name": "focus/ink-3",
  "r": 0.082353,
  "g": 0.078431,
  "b": 0.054902,
  "a": 0.35,
  "code": "colors.ink3",
  "desc": "흐린 텍스트·placeholder",
  "raw": "rgba(21,20,14,0.35)"
 },
 {
  "name": "focus/ink-4",
  "r": 0.082353,
  "g": 0.078431,
  "b": 0.054902,
  "a": 0.15,
  "code": "colors.ink4",
  "desc": "가장 흐림. 레거시 quoteBar와 4팔레트 전부 동일 → 통일",
  "raw": "rgba(21,20,14,0.15)"
 },
 {
  "name": "focus/subtle",
  "r": 0.082353,
  "g": 0.078431,
  "b": 0.054902,
  "a": 0.5,
  "code": "colors.subtle",
  "desc": "⚠️ ink2와 값이 다르다(4팔레트 전부). 통합하지 말 것",
  "raw": "rgba(21,20,14,0.5)"
 },
 {
  "name": "focus/rule",
  "r": 0.082353,
  "g": 0.078431,
  "b": 0.054902,
  "a": 0.06,
  "code": "colors.rule",
  "desc": "구분선. 레거시 line과 4팔레트 전부 동일 → 통일",
  "raw": "rgba(21,20,14,0.06)"
 },
 {
  "name": "focus/accent",
  "r": 0.419608,
  "g": 0.447059,
  "b": 0.501961,
  "a": 1.0,
  "code": "colors.accent",
  "desc": "강조색. 사용자가 accentChoice로 덮어쓸 수 있다",
  "raw": "#6b7280"
 },
 {
  "name": "focus/accent-soft",
  "r": 0.419608,
  "g": 0.447059,
  "b": 0.501961,
  "a": 0.08,
  "code": "colors.accentSoft",
  "desc": "강조색 옅은 배경. ⚠️ 변형 내장 알파는 8/9/8/14%인데 사용자가 색을 직접 고르면 항상 8%로 파생된다(규칙이 둘)",
  "raw": "rgba(107,114,128,0.08)"
 },
 {
  "name": "focus/accent-text",
  "r": 1.0,
  "g": 1.0,
  "b": 1.0,
  "a": 1.0,
  "code": "colors.accentText",
  "desc": "accent 위에 얹는 텍스트색",
  "raw": "#ffffff"
 },
 {
  "name": "focus/chip-bg",
  "r": 0.082353,
  "g": 0.078431,
  "b": 0.054902,
  "a": 0.05,
  "code": "colors.chipBg",
  "desc": "칩 배경",
  "raw": "rgba(21,20,14,0.05)"
 },
 {
  "name": "focus/chip-text",
  "r": 0.082353,
  "g": 0.078431,
  "b": 0.054902,
  "a": 0.55,
  "code": "colors.chipText",
  "desc": "칩 텍스트. minimal·focus는 ink2와 같고 paper·dark는 다르다 — 규칙성 없음(확인필요)",
  "raw": "rgba(21,20,14,0.55)"
 },
 {
  "name": "focus/err-bar",
  "r": 0.784314,
  "g": 0.203922,
  "b": 0.164706,
  "a": 1.0,
  "code": "colors.errBar",
  "desc": "오류 막대·테두리",
  "raw": "#c8342a"
 },
 {
  "name": "focus/err-bg",
  "r": 0.992157,
  "g": 0.886275,
  "b": 0.882353,
  "a": 1.0,
  "code": "colors.errBg",
  "desc": "오류 배경. ⚠️ paper만 알파(0.12), 나머지는 solid",
  "raw": "#fde2e1"
 },
 {
  "name": "focus/err-text",
  "r": 0.784314,
  "g": 0.203922,
  "b": 0.164706,
  "a": 1.0,
  "code": "colors.errText",
  "desc": "오류 텍스트. ⚠️ dark만 errBar와 다르다",
  "raw": "#c8342a"
 },
 {
  "name": "dark/bg",
  "r": 0.054902,
  "g": 0.05098,
  "b": 0.047059,
  "a": 1.0,
  "code": "colors.bg",
  "desc": "캔버스 배경. paper와 다르다(focus만 동일)",
  "raw": "#0e0d0c"
 },
 {
  "name": "dark/paper",
  "r": 0.101961,
  "g": 0.098039,
  "b": 0.086275,
  "a": 1.0,
  "code": "colors.paper",
  "desc": "카드·시트 표면. 레거시 surface와 4팔레트 전부 동일 → 통일",
  "raw": "#1a1916"
 },
 {
  "name": "dark/ink",
  "r": 0.960784,
  "g": 0.952941,
  "b": 0.933333,
  "a": 1.0,
  "code": "colors.ink",
  "desc": "본문 텍스트. 레거시 text와 4팔레트 전부 동일 → 통일",
  "raw": "#f5f3ee"
 },
 {
  "name": "dark/ink-2",
  "r": 0.960784,
  "g": 0.952941,
  "b": 0.933333,
  "a": 0.66,
  "code": "colors.ink2",
  "desc": "보조 텍스트",
  "raw": "rgba(245,243,238,0.66)"
 },
 {
  "name": "dark/ink-3",
  "r": 0.960784,
  "g": 0.952941,
  "b": 0.933333,
  "a": 0.42,
  "code": "colors.ink3",
  "desc": "흐린 텍스트·placeholder",
  "raw": "rgba(245,243,238,0.42)"
 },
 {
  "name": "dark/ink-4",
  "r": 0.960784,
  "g": 0.952941,
  "b": 0.933333,
  "a": 0.2,
  "code": "colors.ink4",
  "desc": "가장 흐림. 레거시 quoteBar와 4팔레트 전부 동일 → 통일",
  "raw": "rgba(245,243,238,0.2)"
 },
 {
  "name": "dark/subtle",
  "r": 0.960784,
  "g": 0.952941,
  "b": 0.933333,
  "a": 0.6,
  "code": "colors.subtle",
  "desc": "⚠️ ink2와 값이 다르다(4팔레트 전부). 통합하지 말 것",
  "raw": "rgba(245,243,238,0.6)"
 },
 {
  "name": "dark/rule",
  "r": 0.960784,
  "g": 0.952941,
  "b": 0.933333,
  "a": 0.1,
  "code": "colors.rule",
  "desc": "구분선. 레거시 line과 4팔레트 전부 동일 → 통일",
  "raw": "rgba(245,243,238,0.1)"
 },
 {
  "name": "dark/accent",
  "r": 0.960784,
  "g": 0.701961,
  "b": 0.368627,
  "a": 1.0,
  "code": "colors.accent",
  "desc": "강조색. 사용자가 accentChoice로 덮어쓸 수 있다",
  "raw": "#f5b35e"
 },
 {
  "name": "dark/accent-soft",
  "r": 0.960784,
  "g": 0.701961,
  "b": 0.368627,
  "a": 0.14,
  "code": "colors.accentSoft",
  "desc": "강조색 옅은 배경. ⚠️ 변형 내장 알파는 8/9/8/14%인데 사용자가 색을 직접 고르면 항상 8%로 파생된다(규칙이 둘)",
  "raw": "rgba(245,179,94,0.14)"
 },
 {
  "name": "dark/accent-text",
  "r": 0.101961,
  "g": 0.098039,
  "b": 0.086275,
  "a": 1.0,
  "code": "colors.accentText",
  "desc": "accent 위에 얹는 텍스트색",
  "raw": "#1a1916"
 },
 {
  "name": "dark/chip-bg",
  "r": 0.960784,
  "g": 0.952941,
  "b": 0.933333,
  "a": 0.06,
  "code": "colors.chipBg",
  "desc": "칩 배경",
  "raw": "rgba(245,243,238,0.06)"
 },
 {
  "name": "dark/chip-text",
  "r": 0.960784,
  "g": 0.952941,
  "b": 0.933333,
  "a": 0.7,
  "code": "colors.chipText",
  "desc": "칩 텍스트. minimal·focus는 ink2와 같고 paper·dark는 다르다 — 규칙성 없음(확인필요)",
  "raw": "rgba(245,243,238,0.7)"
 },
 {
  "name": "dark/err-bar",
  "r": 1.0,
  "g": 0.419608,
  "b": 0.419608,
  "a": 1.0,
  "code": "colors.errBar",
  "desc": "오류 막대·테두리",
  "raw": "#ff6b6b"
 },
 {
  "name": "dark/err-bg",
  "r": 0.227451,
  "g": 0.090196,
  "b": 0.086275,
  "a": 1.0,
  "code": "colors.errBg",
  "desc": "오류 배경. ⚠️ paper만 알파(0.12), 나머지는 solid",
  "raw": "#3a1716"
 },
 {
  "name": "dark/err-text",
  "r": 1.0,
  "g": 0.545098,
  "b": 0.501961,
  "a": 1.0,
  "code": "colors.errText",
  "desc": "오류 텍스트. ⚠️ dark만 errBar와 다르다",
  "raw": "#ff8b80"
 }
];


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


// 자동 생성 — lucide-react-native@1.16.0 패키지에서 추출. 직접 수정하지 말 것.
// 재생성: node docs/design-system/figma-plugin/extract-icons.mjs
// stroke-width 1.8 은 앱이 실제로 쓰는 값이다(HeaderControls.tsx:43, NoteListSidebar.tsx:87 등).
// ChevronLeft 만 2를 쓴다(HeaderControls.tsx:65) — 시트에는 1.8 기준으로 그린다.
const LUCIDE_SVG = {
 "BookOpen": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 7v14\"/><path d=\"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z\"/></svg>",
 "Calendar": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M8 2v4\"/><path d=\"M16 2v4\"/><rect width=\"18\" height=\"18\" x=\"3\" y=\"4\" rx=\"2\"/><path d=\"M3 10h18\"/></svg>",
 "ChevronLeft": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m15 18-6-6 6-6\"/></svg>",
 "Download": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 15V3\"/><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><path d=\"m7 10 5 5 5-5\"/></svg>",
 "NotebookPen": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4\"/><path d=\"M2 6h4\"/><path d=\"M2 10h4\"/><path d=\"M2 14h4\"/><path d=\"M2 18h4\"/><path d=\"M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z\"/></svg>",
 "Search": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m21 21-4.34-4.34\"/><circle cx=\"11\" cy=\"11\" r=\"8\"/></svg>",
 "Settings": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></svg>",
 "Share": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 2v13\"/><path d=\"m16 6-4-4-4 4\"/><path d=\"M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8\"/></svg>",
 "Trash2": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10 11v6\"/><path d=\"M14 11v6\"/><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6\"/><path d=\"M3 6h18\"/><path d=\"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"/></svg>"
};


// 자동 생성 — apps/ch-life 전수 조사 결과. 재생성은 조사 워크플로를 다시 돌린다.
// lucide 벡터의 도형은 icons.js(설치된 패키지에서 추출)에서 온다.
// glyph 는 앱과 동일하게 텍스트로 그린다 — 코드에서도 <Text> 이기 때문이다.
const ICON_INVENTORY = [
 {
  "symbol": "ChevronLeft",
  "kind": "lucide",
  "meaning": "뒤로가기(헤더 좌측, 이전 화면으로)",
  "sizes": [
   24
  ],
  "colorTokens": [
   "ink2"
  ],
  "usedAt": [
   "src/chrome/HeaderControls.tsx:65",
   "app/settings.tsx:124",
   "app/licenses.tsx:36",
   "app/note/[id].tsx:201"
  ],
  "inconsistency": "크기·색 자체는 4개 호출부 전부 24/ink2로 일관됨. 다만 '뒤로가기'라는 같은 의미가 src/browser/BibleReader.tsx:111 에서는 텍스트 글리프 \"← 뒤로\"(15px, 하드코딩 #555)로 별도 구현되어 있어, 이 화면(성경 브라우저) 안에서만 뒤로가기가 벡터 대신 글리프로 새어나감."
 },
 {
  "symbol": "NotebookPen",
  "kind": "lucide",
  "meaning": "앱 브랜드 아이콘(노트 목록 상단 '설교 노트' 이름 옆)",
  "sizes": [
   16
  ],
  "colorTokens": [
   "ink3"
  ],
  "usedAt": [
   "src/chrome/HeaderControls.tsx:117",
   "app/index.tsx:146"
  ],
  "inconsistency": ""
 },
 {
  "symbol": "Trash2",
  "kind": "lucide",
  "meaning": "현재 노트 삭제",
  "sizes": [
   17,
   21
  ],
  "colorTokens": [
   "errText"
  ],
  "usedAt": [
   "src/workspace/TabletWorkspace.tsx:366 (17px, 태블릿 센터 헤더)",
   "src/chrome/HeaderControls.tsx:43 (내부 고정 21px)",
   "app/note/[id].tsx:214-217 (21px, 폰 헤더, tint=\"error\")"
  ],
  "inconsistency": "완전히 같은 동작(현재 노트 삭제)에 같은 벡터 아이콘을 쓰면서도 태블릿 센터 헤더는 17px, 폰 헤더는 HeaderIconButton이 강제하는 21px — 17은 어떤 크기 토큰과도 맞지 않는 임의값."
 },
 {
  "symbol": "Download",
  "kind": "lucide",
  "meaning": "마크다운 노트 가져오기(import)",
  "sizes": [
   16,
   21
  ],
  "colorTokens": [
   "ink2"
  ],
  "usedAt": [
   "src/workspace/NoteListSidebar.tsx:87 (16px, 태블릿 사이드바)",
   "src/chrome/HeaderControls.tsx:43 (내부 고정 21px)",
   "app/index.tsx:159-163 (21px, 폰 헤더)"
  ],
  "inconsistency": "동일 액션이 태블릿에서는 16px, 폰 헤더에서는 21px — Settings 아이콘과 똑같은 패턴(사이드바 버튼 vs 헤더 버튼)으로 반복됨. 기기별 역할 차이로 의도된 것일 수 있으나 문서화된 규칙이 코드 어디에도 없음."
 },
 {
  "symbol": "Settings",
  "kind": "lucide",
  "meaning": "설정 화면 열기",
  "sizes": [
   16,
   21
  ],
  "colorTokens": [
   "ink2"
  ],
  "usedAt": [
   "src/workspace/NoteListSidebar.tsx:96 (16px, 태블릿 사이드바)",
   "src/chrome/HeaderControls.tsx:43 (내부 고정 21px)",
   "app/index.tsx:164-168 (21px, 폰 헤더)"
  ],
  "inconsistency": "Download와 동일: 태블릿 16px / 폰 21px."
 },
 {
  "symbol": "Calendar",
  "kind": "lucide",
  "meaning": "날짜 선택 달력 열기(설교 날짜 필드 옆 버튼)",
  "sizes": [
   18
  ],
  "colorTokens": [
   "accent"
  ],
  "usedAt": [
   "src/editor/SermonMetaHeader.tsx:176-180 (scaled(18, fontScale))"
  ],
  "inconsistency": "이 앱의 유일한 스케일링(scaled()) 벡터 아이콘 — 다른 8개 lucide 아이콘은 전부 고정 픽셀인데 이것만 폰트 스케일을 따라 커진다."
 },
 {
  "symbol": "BookOpen",
  "kind": "lucide",
  "meaning": "성경 읽기 화면 열기",
  "sizes": [
   21
  ],
  "colorTokens": [
   "ink2"
  ],
  "usedAt": [
   "src/chrome/HeaderControls.tsx:43",
   "app/index.tsx:149-153",
   "app/note/[id].tsx:204-208"
  ],
  "inconsistency": "'성경/본문' 계열 의미가 src/editor/SermonMetaHeader.tsx:253 에서는 완전히 다른 기술(이모지 📖, 18px, 색상 토큰 미적용)로도 그려짐 — 벡터·이모지 두 체계 혼재."
 },
 {
  "symbol": "Search",
  "kind": "lucide",
  "meaning": "노트 검색 입력창으로 포커스 이동(액션 버튼)",
  "sizes": [
   21
  ],
  "colorTokens": [
   "ink2"
  ],
  "usedAt": [
   "src/chrome/HeaderControls.tsx:43",
   "app/index.tsx:154-158"
  ],
  "inconsistency": "'검색'이라는 같은 개념이 검색창 내부 장식 아이콘으로는 텍스트 글리프 ⌕(13~14px, ink3, 아래 별도 항목)로 또 그려짐 — 액션 버튼은 벡터, 장식 아이콘은 글리프로 역할에 따라 두 체계가 나뉘어 있음(용도 차이는 있지만 시각 언어가 통일되어 있지 않음)."
 },
 {
  "symbol": "Share",
  "kind": "lucide",
  "meaning": "노트 공유(마크다운으로 내보내기)",
  "sizes": [
   21
  ],
  "colorTokens": [
   "ink2"
  ],
  "usedAt": [
   "src/chrome/HeaderControls.tsx:43",
   "app/note/[id].tsx:209-213"
  ],
  "inconsistency": "이 아이콘의 벡터/글리프 분리가 이 인벤토리에서 가장 뚜렷한 사례다: 태블릿(TabletWorkspace.tsx:376-378)에서 완전히 동일한 handleExport 동작이 이 Share 벡터 대신 \"↑\" 텍스트 글리프(15px, ink2)로 그려진다. 심지어 app/settings.tsx:263 안내 문구 \"내보내기는 노트 화면 오른쪽 위의 ↑ 버튼을 사용하세요\"가 이 글리프를 유일한 정본처럼 설명하고 있어, 폰에서 실제로 보이는 아이콘(Share)과 앱 자체 도움말이 서로 다른 기호를 가리킨다."
 },
 {
  "symbol": "›",
  "kind": "glyph",
  "meaning": "브레드크럼 구분자(월 › 일 › 제목, 클릭 불가한 순수 구분 기호)",
  "sizes": [
   12
  ],
  "colorTokens": [
   "ink4"
  ],
  "usedAt": [
   "src/workspace/TabletWorkspace.tsx:339-341",
   "src/workspace/TabletWorkspace.tsx:345-347"
  ],
  "inconsistency": "같은 문자 ›가 이 파일 안에서만도 최소 3가지 다른 크기·역할로 또 쓰인다 — 패널 펼치기(14px, PanelRail), 성경 패널 접기(18px, BiblePanel/BibleLookupPanel), 설정 하위 이동(22px, settings.tsx), 날짜 다음 달(24px, DatePickerModal). 순수 구분자와 클릭 가능한 내비게이션 화살표가 같은 글자를 공유해 접근성 라벨 없이는 구분이 안 된다."
 },
 {
  "symbol": "› / ‹",
  "kind": "glyph",
  "meaning": "접힌 패널을 다시 펼치기(레일 형태, 방향은 좌/우 위치에 따라 반전)",
  "sizes": [
   14
  ],
  "colorTokens": [
   "ink3"
  ],
  "usedAt": [
   "src/workspace/PanelRail.tsx:40-42"
  ],
  "inconsistency": "같은 '노트 패널 펼치기/접기' 쌍에서 펼치기(이 레일, 14px·ink3)와 접기(NoteListSidebar의 ‹, 16px·ink2)가 크기·색 둘 다 다르다 — 정확히 과제에서 예로 든 '펼치기/접기가 서로 다른 스타일' 패턴."
 },
 {
  "symbol": "›",
  "kind": "glyph",
  "meaning": "성경 패널/보기 접기",
  "sizes": [
   18
  ],
  "colorTokens": [
   "ink2"
  ],
  "usedAt": [
   "src/workspace/BiblePanel.tsx:38-46",
   "src/workspace/BibleLookupPanel.tsx:60-68"
  ],
  "inconsistency": "이 둘끼리는 18px/ink2로 일관되지만, 반대 동작인 '성경 패널 펼치기'는 같은 크기가 아니라 ◧(15px) 또는 ✦(16px)로 완전히 다른 기호를 쓴다 — 접기/펼치기가 짝을 이루지 않음."
 },
 {
  "symbol": "‹",
  "kind": "glyph",
  "meaning": "노트 목록 사이드바 접기",
  "sizes": [
   16
  ],
  "colorTokens": [
   "ink2"
  ],
  "usedAt": [
   "src/workspace/NoteListSidebar.tsx:98-106"
  ],
  "inconsistency": "짝이 되는 '펼치기'는 PanelRail의 14px·ink3 ‹/›로 그려져 접기(16·ink2)와 펼치기(14·ink3)가 크기·색 둘 다 어긋난다."
 },
 {
  "symbol": "‹ / ›",
  "kind": "glyph",
  "meaning": "날짜 선택 모달의 이전 달/다음 달 이동",
  "sizes": [
   24
  ],
  "colorTokens": [
   "ink2"
  ],
  "usedAt": [
   "src/editor/DatePickerModal.tsx:51-59 (이전)",
   "src/editor/DatePickerModal.tsx:68-76 (다음)"
  ],
  "inconsistency": "과제에서 예시로 든 '이전/다음 ‹›가 14와 24로 갈린다'의 실체 확인 결과: 24는 이 날짜 모달의 ‹›이고, 14는 사실 다른 글자인 ←/→(성경 장 이전/다음, VerseList.tsx)다. 즉 '같은 기호가 다른 크기'가 아니라 '같은 의미(이전/다음 이동)에 서로 다른 기호(‹› vs ←→)와 서로 다른 크기(24 vs 14)와 서로 다른 색 체계(토큰 ink2 vs 하드코딩 #222)'가 동시에 벌어지는, 더 심각한 이원화."
 },
 {
  "symbol": "›",
  "kind": "glyph",
  "meaning": "설정 화면 안의 하위 항목으로 이동(라이선스 화면)",
  "sizes": [
   22
  ],
  "colorTokens": [
   "ink3"
  ],
  "usedAt": [
   "app/settings.tsx:272-284"
  ],
  "inconsistency": "같은 settings.tsx 안, 같은 navRowChevron 스타일(22px·ink3)을 '외부 링크 열기'(↗)와 '메일 문의'(✉)에도 그대로 재사용 — 세 가지 다른 목적지(내부 화면 이동/외부 웹/메일 앱)가 시각적으로 구분되지 않는다."
 },
 {
  "symbol": "≡",
  "kind": "glyph",
  "meaning": "접힌 노트 목록을 다시 펼치기(센터 헤더의 브레드크럼 버튼)",
  "sizes": [
   15
  ],
  "colorTokens": [
   "ink2"
  ],
  "usedAt": [
   "src/workspace/TabletWorkspace.tsx:320-333"
  ],
  "inconsistency": "이 버튼은 leftOpen===false일 때만 보이는데, 바로 그 조건에서 화면 맨 왼쪽에는 PanelRail(같은 동작, ≡ 글리프 16px·accent)이 이미 렌더링되어 있다. 즉 정확히 같은 onPress(setLeftOpen(true))에 대해 서로 다른 크기·색의 ≡ 두 개가 동시에 화면에 뜬다."
 },
 {
  "symbol": "≡",
  "kind": "glyph",
  "meaning": "접힌 노트 패널 레일의 표시 아이콘('노트' 레이블 위)",
  "sizes": [
   16
  ],
  "colorTokens": [
   "accent"
  ],
  "usedAt": [
   "src/workspace/PanelRail.tsx:29-42",
   "src/workspace/TabletWorkspace.tsx:310-316 (glyph=\"≡\")"
  ],
  "inconsistency": "위 항목(TabletWorkspace 크럼 버튼의 ≡, 15px·ink2)과 동시에 화면에 존재하는 중복 컨트롤. 두 ≡가 크기(15/16)와 색(ink2/accent) 모두 다르다."
 },
 {
  "symbol": "◧",
  "kind": "glyph",
  "meaning": "접힌 성경 패널을 다시 펼치기(센터 헤더의 브레드크럼 버튼)",
  "sizes": [
   15
  ],
  "colorTokens": [
   "accent"
  ],
  "usedAt": [
   "src/workspace/TabletWorkspace.tsx:380-394"
  ],
  "inconsistency": "rightOpen===false일 때만 보이는데, 같은 조건에서 화면 오른쪽 끝 PanelRail이 이미 같은 동작(setRightOpen(true))을 ✦ 글리프(16px·accent)로 표시하며 동시에 떠 있다 — 완전히 동일한 클릭 타겟에 서로 다른 두 기호(◧/✦)가 화면에 함께 존재하는, 이 인벤토리에서 가장 명백한 중복."
 },
 {
  "symbol": "✦",
  "kind": "glyph",
  "meaning": "접힌 성경 패널 레일의 표시 아이콘('성경' 레이블 위)",
  "sizes": [
   16
  ],
  "colorTokens": [
   "accent"
  ],
  "usedAt": [
   "src/workspace/PanelRail.tsx:29-42",
   "src/workspace/TabletWorkspace.tsx:457-463 (glyph=\"✦\")"
  ],
  "inconsistency": "◧ 항목과 동일한 중복 문제의 짝. 색은 우연히 같지만(accent) 기호 자체가 다르고 크기도 15/16으로 다르다."
 },
 {
  "symbol": "↑",
  "kind": "glyph",
  "meaning": "노트 공유(내보내기) — 태블릿 센터 헤더 버전",
  "sizes": [
   15
  ],
  "colorTokens": [
   "ink2"
  ],
  "usedAt": [
   "src/workspace/TabletWorkspace.tsx:369-379",
   "app/settings.tsx:262-264 (도움말 문구가 이 글리프를 지칭)"
  ],
  "inconsistency": "폰에서는 같은 동작(handleExport)이 lucide Share 벡터(21px·ink2)로 그려진다. 완전히 다른 기술(벡터 vs 글리프)·크기(21 vs 15)로 같은 의미를 표현하는, 벡터/글리프 이원화의 대표 사례. 게다가 설정 화면 도움말이 이 태블릿 전용 글리프를 유일한 공유 버튼처럼 설명해 폰 사용자에게는 실제 UI(Share 아이콘)와 안내 문구(↑)가 어긋난다."
 },
 {
  "symbol": "✕",
  "kind": "glyph",
  "meaning": "닫기·지우기(성경 검색어 지우기 / 성경 브라우저 모달 닫기, 두 가지 의미가 같은 기호를 공유)",
  "sizes": [
   12,
   20
  ],
  "colorTokens": [
   "ink3",
   "hardcoded:#555"
  ],
  "usedAt": [
   "src/workspace/BibleLookupPanel.tsx:90-100 (12px, ink3, '검색어 지우기')",
   "src/browser/BibleBrowser.tsx:82-90 (20px, 하드코딩 #555, '브라우저 닫기')"
  ],
  "inconsistency": "과제에 언급된 '닫기 ✕가 12와 20 두 크기'를 그대로 확인함. 크기 차이(12↔20)뿐 아니라 색상 체계 자체가 다르다 — 하나는 테마 토큰(ink3), 하나는 하드코딩 헥스(#555)라 다크모드/테마 변경 시 후자만 색이 안 바뀐다. 또한 두 사용처는 각각 '입력값 지우기'와 '모달 닫기'로 의미가 미묘하게 다른데도 같은 크기 계열 안에서 임의로 갈렸다."
 },
 {
  "symbol": "⌕",
  "kind": "glyph",
  "meaning": "검색 입력창 안의 장식용 돋보기 아이콘(성경 참조 검색)",
  "sizes": [
   13,
   14
  ],
  "colorTokens": [
   "ink3"
  ],
  "usedAt": [
   "src/workspace/NoteListSidebar.tsx:109-113 (13px)",
   "src/workspace/BibleLookupPanel.tsx:71-73 (14px)"
  ],
  "inconsistency": "1px 차이지만 두 값 모두 하드코딩된 숫자라 크기 토큰이 실제로 강제되지 않는다는 증거. 또 '검색' 개념은 헤더의 실행 가능한 Search 벡터 버튼(21px)과도 겹쳐, 같은 의미에 장식용 글리프(13/14px)·액션 벡터(21px) 두 체계가 공존한다."
 },
 {
  "symbol": "＋",
  "kind": "glyph",
  "meaning": "새 노트 만들기",
  "sizes": [
   16,
   28
  ],
  "colorTokens": [
   "accent",
   "paper (28px 버전은 ink 배경 위 paper색 글자)"
  ],
  "usedAt": [
   "src/workspace/NoteListSidebar.tsx:69-79 (16px, 태블릿 사이드바 버튼)",
   "app/index.tsx:291-301 (28px, 폰 FAB)"
  ],
  "inconsistency": "폰은 FAB(28, fab 토큰), 태블릿은 인라인 버튼(16, md 토큰) — 두 문맥이 다르다는 점에서 완전히 부당한 차이는 아니지만, 이 규칙이 코드 어디에도 명시되어 있지 않다. 또한 같은 ＋ 기호가 아래 두 항목(구절 삽입)에서 전혀 다른 의미로도 쓰인다."
 },
 {
  "symbol": "＋",
  "kind": "glyph",
  "meaning": "성경 구절을 현재 노트에 인용 삽입",
  "sizes": [
   13,
   18
  ],
  "colorTokens": [
   "accent",
   "hardcoded:white (18px 버전, #222 원형 배지 위)"
  ],
  "usedAt": [
   "src/workspace/BibleLookupPanel.tsx:140-152 ('＋ 노트에 삽입', 13px, accent, 인라인 텍스트형)",
   "src/browser/VerseList.tsx:91-101 (18px, 하드코딩 white on #222, 원형 배지형)"
  ],
  "inconsistency": "같은 '구절 삽입' 의미에 완전히 다른 두 시각 형태(인라인 텍스트 vs 원형 배지)와 크기(13/18)가 쓰이고, 후자는 색상 토큰을 아예 쓰지 않는 하드코딩(#222 배경 + white 글자) — 이 파일(VerseList.tsx) 전체가 테마 시스템 밖에 있다."
 },
 {
  "symbol": "✓",
  "kind": "glyph",
  "meaning": "확인/선택 표시(생명양식 본문 형식이 유효함 / 설정에서 현재 테마가 선택됨 — 서로 다른 두 의미가 같은 기호 공유)",
  "sizes": [
   16
  ],
  "colorTokens": [
   "accent"
  ],
  "usedAt": [
   "src/editor/SermonMetaHeader.tsx:236-238 (16px, fontWeight 700, '생명양식 형식 유효')",
   "app/settings.tsx:165-169 (fontSize 미지정 — 플랫폼 기본값 상속, fontWeight 600, '테마 선택됨')"
  ],
  "inconsistency": "두 번째 사용처는 fontSize를 아예 지정하지 않아 플랫폼 기본 텍스트 크기를 그대로 물려받는다 — 즉 이 항목은 실질적으로 '토큰이 없다'. fontWeight도 700 vs 600으로 다르다. 의미도 '형식 검증'과 '옵션 선택'으로 다른데 같은 기호를 재사용."
 },
 {
  "symbol": "▾ / ▸",
  "kind": "glyph",
  "meaning": "성경 인용 블록(QuoteBlock)의 아코디언 펼침/접힘",
  "sizes": [
   11
  ],
  "colorTokens": [
   "accent"
  ],
  "usedAt": [
   "src/editor/QuoteBlock.tsx:176-183 (scaled(11, fontScale))"
  ],
  "inconsistency": "'펼치기/접기'라는 같은 인터랙션 패턴에 이 채워진 삼각형(▾▸, 11px)과 홑화살괄호 계열(‹›, 14~18px)이 함께 쓰인다 — 하나의 상호작용 문법에 최소 2가지 기하학적 기호가 혼재. 이 아이콘도 SermonMetaHeader의 Calendar처럼 스케일링(scaled())되는 몇 안 되는 글리프 중 하나."
 },
 {
  "symbol": "↵",
  "kind": "glyph",
  "meaning": "자동 인용 삽입 완료를 위한 Return 키 안내(키보드 힌트 배지)",
  "sizes": [
   11
  ],
  "colorTokens": [
   "ink3"
  ],
  "usedAt": [
   "src/editor/NoteEditor.tsx:208-214"
  ],
  "inconsistency": ""
 },
 {
  "symbol": "📖",
  "kind": "glyph",
  "meaning": "생명양식(설교 본문) 미리보기 열기",
  "sizes": [
   18
  ],
  "colorTokens": [
   "색상 토큰 없음 — 이모지라 텍스트 color가 적용되지 않고 opacity만 토글됨"
  ],
  "usedAt": [
   "src/editor/SermonMetaHeader.tsx:239-255"
  ],
  "inconsistency": "같은 '성경/본문 읽기' 의미 영역에서 헤더는 lucide BookOpen 벡터(21px, 색 지정 가능)를 쓰는데 여기는 컬러 이모지 📖를 쓴다 — lucide 벡터·텍스트 글리프에 더해 '이모지'라는 세 번째 아이콘 기술까지 섞여 있다는 증거."
 },
 {
  "symbol": "✉",
  "kind": "glyph",
  "meaning": "이메일로 문의하기",
  "sizes": [
   22
  ],
  "colorTokens": [
   "ink3"
  ],
  "usedAt": [
   "app/settings.tsx:298-310"
  ],
  "inconsistency": "설정 화면의 navRowChevron 스타일을 그대로 재사용해 '›'(내부 이동), '↗'(외부 링크)와 시각적으로 구분되지 않는다."
 },
 {
  "symbol": "↗",
  "kind": "glyph",
  "meaning": "외부 웹페이지로 이동(개인정보 처리방침)",
  "sizes": [
   22
  ],
  "colorTokens": [
   "ink3"
  ],
  "usedAt": [
   "app/settings.tsx:285-297"
  ],
  "inconsistency": "위 ✉·아래 › 항목과 같은 22px·ink3 스타일 재사용 — '내부 이동/외부 링크/메일 실행'이라는 서로 다른 목적지 유형이 오직 기호 모양만으로 구분되고 크기·색으로는 전혀 구분되지 않는다."
 },
 {
  "symbol": "← / →",
  "kind": "glyph",
  "meaning": "성경 장(chapter) 이전/다음 이동",
  "sizes": [
   14
  ],
  "colorTokens": [
   "hardcoded:#222"
  ],
  "usedAt": [
   "src/browser/VerseList.tsx:53-75"
  ],
  "inconsistency": "같은 '이전/다음 이동' 개념인 DatePickerModal의 ‹›(24px, ink2 토큰)와 기호·크기·색 셋 다 다르다. 이 컴포넌트 전체(VerseList.tsx)가 #222/#888/#111/white 등 하드코딩 색만 쓰고 useTheme()를 전혀 호출하지 않아, 다크모드에서도 색이 안 바뀐다."
 },
 {
  "symbol": "←",
  "kind": "glyph",
  "meaning": "성경 브라우저 안에서 책 목록으로 뒤로가기",
  "sizes": [
   15
  ],
  "colorTokens": [
   "hardcoded:#555"
  ],
  "usedAt": [
   "src/browser/BibleReader.tsx:103-112"
  ],
  "inconsistency": "앱의 표준 '뒤로가기'는 lucide ChevronLeft 벡터(24px, ink2 토큰, 헤더 좌측)인데, 성경 브라우저 내부에서만 별도로 텍스트 \"← 뒤로\"(15px, 하드코딩 #555)를 쓴다 — 벡터/글리프 이원화 + 컬러 토큰 이탈이 겹친 사례이며, src/browser/ 서브트리(BibleReader·VerseList·BibleBrowser)가 통째로 테마 시스템 밖에 있다는 패턴의 일부."
 }
];

const ICON_NOTES = [
 "글리프→lucide 벡터 치환 매핑표를 만들어 하나씩 교체한다: ✕→X, ‹/›→ChevronLeft/ChevronRight, ＋→Plus, ✓→Check, ⌕→Search, ↑→Share, ≡→PanelLeft(또는 Menu), ◧/✦→PanelRight(우선 코드에서부터 하나로 통합), 📖→BookOpen, ✉→Mail, ↗→ExternalLink, ▾/▸→ChevronDown/ChevronRight, ↵→CornerDownLeft, ←/→→ChevronLeft/ChevronRight. 이 작업의 실질 목표는 'Figma에 벡터 심볼을 하나 더 그리는 것'이 아니라, 지금 텍스트 글리프로만 존재하는 12개 이상의 의미를 lucide 라이브러리가 이미 가진 아이콘으로 흡수하는 것이다.",
 "'펼치기/접기'라는 하나의 인터랙션 패턴에 지금 최소 4가지 서로 다른 기호 체계(‹›, ≡, ◧/✦, ▾▸)가 쓰인다. 방향성 chevron(ChevronLeft/Right/Down) 하나로 통일하고, '어떤 패널인지'는 별도의 라벨/아이콘(노트=PanelLeft, 성경=BookOpen)으로, '열림/닫힘 상태'는 오직 chevron 방향으로만 표현하도록 역할을 분리한다.",
 "코드 차원의 진짜 버그부터 고친다: TabletWorkspace에서 leftOpen===false, rightOpen===false일 때 각각 ≡(15px/16px)와 ◧/✦(15px/16px)가 동일한 클릭 동작에 대해 두 벌씩 동시에 렌더링된다. Figma 시트를 그리기 전에 이 중복 컨트롤을 하나로 합쳐야, 시트에 그릴 '정본 아이콘'이 명확해진다.",
 "src/browser/(BibleReader.tsx, VerseList.tsx, BibleBrowser.tsx) 서브트리는 useTheme()를 전혀 쓰지 않고 #222/#555/#888/#111/#eee/#f4f4f4/white 등을 하드코딩한 완전히 별도의 컬러 체계다. 아이콘 색상을 focus/ink·ink2·ink3·ink4·accent·err-text·paper 토큰으로 통일하기 전에, 이 서브트리를 먼저 테마 토큰 기반으로 옮겨야 한다 — 안 그러면 벡터 아이콘을 새로 넣어도 색만 따로 논다.",
 "제안된 크기 토큰(glyph: xs12/sm14/md16/lg18/fab28, vector: sm16/header21/lg24) 중 상당수 값(11, 13, 15, 17, 20, 22, 24-글리프-버전)이 실제 코드에서 스케일 밖에 있다. 아이콘 전용 래퍼 컴포넌트를 만들어 숫자 대신 토큰 이름만 지정하게 강제하지 않으면, 토큰을 문서화해도 실제 코드는 계속 새어나간다.",
 "기기별 크기 차이(Download/Settings: 사이드바 16 vs 헤더 21, ＋: 사이드바 16 vs FAB 28)는 '툴바 문맥 vs 헤더/FAB 문맥'이라는 의도로 보이며 각 값이 개별 토큰과는 일치하므로 유지해도 된다 — 다만 이 규칙을 코드 주석이나 컴포넌트 이름으로 명시할 것. 반면 Trash2의 17px(태블릿 헤더)는 어떤 토큰과도 안 맞고 정당화할 문맥 차이도 없어 21(header)로 맞추는 단순 버그 수정이 필요하다.",
 "'뒤로가기/이전/다음'류 방향 이동이 ChevronLeft 벡터(24, 표준 헤더) / \"← 뒤로\"(15, 성경 브라우저) / \"← 이전·다음 →\"(14, 장 탐색) / ‹›(24, 날짜 선택) 넷으로 흩어져 있다. 최소한 이 네 가지를 ChevronLeft/ChevronRight 벡터 하나로 합치는 것을 1순위 통합 대상으로 삼는다.",
 "공유(Share) 아이콘은 폰(lucide Share, 21px)과 태블릿(↑ 글리프, 15px)이 다를 뿐 아니라, 설정 화면 도움말 문구(app/settings.tsx:263)가 태블릿 전용 ↑ 글리프를 유일한 정본처럼 설명하고 있다. 아이콘을 통일하면서 이 안내 문구도 함께 검토해 실제 UI와 어긋나지 않게 한다.",
 "Figma 시트는 '기호'가 아니라 '의미' 단위로 컴포넌트를 만들고, 크기는 variant(xs/sm/md/lg/fab, sm/header/lg)로만 바꾸도록 설계한다. 이번 조사에서 확인됐듯 같은 의미가 여러 기호로 새는 근본 원인은 크기·색을 매번 숫자로 하드코딩하는 습관이므로, 시트 자체가 '의미 하나 = 컴포넌트 하나'라는 제약을 강제해야 한다."
];


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
