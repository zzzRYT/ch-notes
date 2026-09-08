import { Linking, Platform } from "react-native";

/**
 * 스토어 페이지 주소. 값의 정본은 `eas.json`(`ascAppId`)과
 * `app.config.ts`(`android.package`)이고 여기 있는 것은 손으로 옮겨 적은 사본이다
 * (`CONTRACT-RELEASE`).
 */
export const IOS_STORE_URL = "https://apps.apple.com/app/id6772700147";
export const ANDROID_STORE_URL =
  "market://details?id=com.leejaejin.chlife";
/** Play 스토어 앱이 없는 기기(일부 태블릿)를 위한 웹 폴백. */
export const ANDROID_STORE_WEB_URL =
  "https://play.google.com/store/apps/details?id=com.leejaejin.chlife";

/** 이 플랫폼에서 시도할 주소를 앞에서부터 차례로. */
export function storeUrlCandidates(): string[] {
  if (Platform.OS === "ios") return [IOS_STORE_URL];
  if (Platform.OS === "android")
    return [ANDROID_STORE_URL, ANDROID_STORE_WEB_URL];
  return [];
}

/**
 * 스토어를 연다. 열었으면 `true`.
 *
 * `canOpenURL`을 먼저 묻지 않는다 — Android 11+의 패키지 가시성 규칙 때문에
 * 스토어 앱이 있어도 `false`가 나올 수 있다(`use-contact-support.ts`와 같은 이유).
 */
export async function openStorePage(): Promise<boolean> {
  for (const url of storeUrlCandidates()) {
    try {
      await Linking.openURL(url);
      return true;
    } catch (error) {
      console.warn("failed to open store page", url, error);
    }
  }
  return false;
}
