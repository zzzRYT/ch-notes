import type { ScreenView } from "./screen-view";

// 웹은 Firebase 웹 설정이 없다(ADR-0029는 네이티브 빌드 한정).
export function logScreenView(_view: ScreenView): void {}
