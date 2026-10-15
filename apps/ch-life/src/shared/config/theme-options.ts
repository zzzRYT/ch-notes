// 테마를 결정하는 표현 축. 도메인 의미가 없으므로 여기(shared)가 정본이고,
// 설정 모델(features/settings)이 이 타입을 가져다 쓴다. React가 없는 파일이어야
// 검증기(순수 모델)가 UI 런타임 없이 import할 수 있다. 허용값은 아래 옵션 배열
// 하나에만 적는다 — 유니온 타입·검증기 허용 목록·설정 화면이 모두 여기서 나온다.
export const VARIATION_OPTIONS = [
  { value: "minimal", label: "A · 미니멀", hint: "깨끗한 화이트 · 파랑" },
  { value: "paper", label: "B · 종이", hint: "크림 톤 · 갈색" },
  { value: "focus", label: "C · 포커스", hint: "여백 중심 · 슬레이트" },
  { value: "dark", label: "D · 다크", hint: "긴 설교용 · 호박" },
] as const;
export const BLOCK_STYLE_OPTIONS = [
  { value: "default", label: "변형별 기본값" },
  { value: "card", label: "카드" },
  { value: "quote", label: "인용바" },
  { value: "collapse", label: "접힘" },
] as const;
export const FONT_FAMILY_OPTIONS = [
  { value: "sans", label: "Sans" },
  { value: "serif", label: "Serif" },
  { value: "mono", label: "Mono" },
] as const;
// hex는 settings.json에 저장되는 사용자 데이터다(drift B26). 팔레트 accent와 값이
// 같아도 따라 바꾸지 않는다 — 바꾸면 저장값이 검증에서 떨어져 default로 리셋된다.
export const ACCENT_OPTIONS = [
  { value: "default", label: "변형별 기본 색상" },
  { value: "#1e6fd9", label: "파랑" },
  { value: "#b15c2e", label: "갈색 (종이톤)" },
  { value: "#1f8a5b", label: "녹색 (말씀)" },
  { value: "#f5b35e", label: "호박 (다크)" },
  { value: "#7a5af0", label: "보라" },
  { value: "#6b7280", label: "슬레이트 (포커스)" },
] as const;

export type Variation = (typeof VARIATION_OPTIONS)[number]["value"];
export type BlockStyle = (typeof BLOCK_STYLE_OPTIONS)[number]["value"];
export type FontFamily = (typeof FONT_FAMILY_OPTIONS)[number]["value"];
export type AccentChoice = (typeof ACCENT_OPTIONS)[number]["value"];
