import { Platform } from "react-native";

/**
 * 스토어에 올라간 최신 버전을 알려 주는 정적 JSON.
 *
 * hot-updater는 이 값을 모른다 — 서버 질의는 `(platform, appVersion, channel, …)`로
 * **그 appVersion에 맞는 번들 하나**를 돌려줄 뿐이고 "스토어의 최신 버전"이라는
 * 개념 자체가 없다(`RULE-OTA-004`). 그래서 별도의 버전 소스가 필요하다.
 *
 * 이미 GitHub Pages로 발행 중인 `website/`에 얹었다 — 인프라가 늘지 않고,
 * 저장소의 파일이라 릴리스 절차가 git 위에서 끝난다(`ADR-0022`).
 */
export const APP_VERSION_URL =
  "https://zzzryt.github.io/ch-notes/app-version.json";

/** 확인이 앱을 붙잡지 못하게 하는 상한(`RULE-OTA-002`). */
export const VERSION_FETCH_TIMEOUT_MS = 5000;

export type StorePlatform = "ios" | "android";

/**
 * 응답에서 이 플랫폼의 버전을 꺼낸다.
 *
 * 플랫폼별로 나눠 둔 이유는 심사 지연이다 — iOS와 Android의 스토어 버전은
 * 며칠씩 어긋난다. 아직 올라가지도 않은 스토어로 어르신을 보내지 않는다.
 *
 * 모르는 키, 빠진 플랫폼, 문자열이 아닌 값은 전부 `null`이다.
 */
export function readLatestVersion(
  payload: unknown,
  platform: StorePlatform,
): string | null {
  if (typeof payload !== "object" || payload === null) return null;
  const value = (payload as Record<string, unknown>)[platform];
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** 현재 플랫폼. iOS/Android가 아니면(웹·테스트) `null`. */
export function currentStorePlatform(): StorePlatform | null {
  if (Platform.OS === "ios") return "ios";
  if (Platform.OS === "android") return "android";
  return null;
}

/**
 * 최신 스토어 버전을 한 번 읽는다.
 *
 * **실패는 전부 `null`이고 화면에 아무것도 남기지 않는다**(`RULE-OTA-002`,
 * `POL-RELEASE-002`). 네트워크에 한 번도 닿지 않는 기기가 정상 사용자다.
 */
export async function fetchLatestStoreVersion(
  platform: StorePlatform,
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), VERSION_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(APP_VERSION_URL, {
      signal: controller.signal,
    });
    if (!response.ok) return null;
    return readLatestVersion((await response.json()) as unknown, platform);
  } catch (error) {
    console.warn("store version check failed", error);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
