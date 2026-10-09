// 테마를 결정하는 표현 축. 도메인 의미가 없으므로 여기(shared)가 정본이고,
// 설정 모델(features/settings)이 이 타입을 가져다 쓴다. React가 없는 파일이어야
// 검증기(순수 모델)가 UI 런타임 없이 import할 수 있다. 허용값은 아래 옵션 배열
// 하나에만 적는다 — 유니온 타입·검증기 허용 목록·설정 화면이 모두 여기서 나온다.
export const VARIATION_OPTIONS = [
  { value: "minimal", label: "밝은 화면", hint: "옅은 회색 배경" },
  { value: "paper", label: "종이색", hint: "크림색 배경" },
  { value: "focus", label: "흰 화면", hint: "흰색 배경" },
  { value: "dark", label: "어두운 화면", hint: "검은색 배경" },
] as const;
export const BLOCK_STYLE_OPTIONS = [
  { value: "default", label: "테마에 맞추기", hint: "배경에 어울리는 인용 모양을 사용합니다" },
  { value: "card", label: "카드", hint: "테두리로 본문과 구분합니다" },
  { value: "quote", label: "왼쪽 선", hint: "색이 있는 선으로 구절을 표시합니다" },
  { value: "collapse", label: "접고 펼치기", hint: "화살표를 눌러 구절을 접거나 펼칩니다" },
] as const;
export const FONT_FAMILY_OPTIONS = [
  { value: "sans", label: "기본 글꼴" },
  { value: "serif", label: "명조" },
  { value: "mono", label: "고정폭" },
] as const;
// hex는 settings.json에 저장되는 사용자 데이터다(drift B26). 팔레트 accent와 값이
// 같아도 따라 바꾸지 않는다 — 바꾸면 저장값이 검증에서 떨어져 default로 리셋된다.
export const ACCENT_OPTIONS = [
  { value: "default", label: "테마에 맞추기" },
  { value: "#1e6fd9", label: "파랑" },
  { value: "#b15c2e", label: "갈색" },
  { value: "#1f8a5b", label: "초록" },
  { value: "#f5b35e", label: "주황" },
  { value: "#7a5af0", label: "보라" },
  { value: "#6b7280", label: "회색" },
] as const;

export type Variation = (typeof VARIATION_OPTIONS)[number]["value"];
export type BlockStyle = (typeof BLOCK_STYLE_OPTIONS)[number]["value"];
export type FontFamily = (typeof FONT_FAMILY_OPTIONS)[number]["value"];
export type AccentChoice = (typeof ACCENT_OPTIONS)[number]["value"];
