// GA 화면 추적의 단일 매핑(#95). screen_class는 라우트 템플릿(파일 식별자)이고
// 실제 노트 ID·쿼리는 담지 않는다 — useSegments()가 이미 `[id]` 템플릿을 준다.
const SCREEN_NAMES: Record<string, string> = {
  index: "notes",
  "note/[id]": "note_editor",
  bible: "bible",
  settings: "settings",
  licenses: "licenses",
};

export type ScreenView = { screen_class: string; screen_name: string };

/** 매핑에 없는 라우트(+not-found 등)는 null — 보내지 않는다. */
export function resolveScreenView(segments: readonly string[]): ScreenView | null {
  const screen_class = segments.join("/") || "index";
  const screen_name = SCREEN_NAMES[screen_class];
  return screen_name ? { screen_class, screen_name } : null;
}
