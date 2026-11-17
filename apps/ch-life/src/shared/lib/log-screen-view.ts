import type { ScreenView } from "./screen-view";

/**
 * 분석 실패는 앱 동작에 영향을 주지 않는다. 웹은 `.web.ts`가 대신한다.
 * 네이티브 모듈은 첫 호출 때 불러온다 — `@/shared/lib` 배럴을 import하는
 * 테스트·화면이 Firebase 네이티브 모듈에 묶이지 않게 하려는 것이다.
 */
export function logScreenView(view: ScreenView): void {
  import("@react-native-firebase/analytics")
    .then((a) => a.logScreenView(a.getAnalytics(), view))
    .catch(() => {});
}
