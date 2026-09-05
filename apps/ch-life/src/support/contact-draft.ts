/**
 * 문의 메일 초안 조립 — 순수 함수.
 *
 * 이 모듈은 네이티브 모듈도 앱 상태도 import하지 않는다. 필요한 값은 전부
 * `SupportEnv`로 주입받는다. 그래서 노트 제목·본문·설교 메타·성경 인용에
 * 닿을 통로가 타입에 존재하지 않는다 — 콘텐츠 무유출이 규칙이 아니라 구조다.
 */

/** 지원 문의 수신 주소. `docs/store/support.md`에 공개된 주소와 같아야 한다. */
export const SUPPORT_EMAIL = "jinjinstar3@gmail.com";

/** OTA 식별자가 없는 실행(스토어 빌드에 박힌 번들 그대로)의 표기. */
export const EMBEDDED_LABEL = "embedded";

const UNKNOWN_LABEL = "알 수 없음";

/**
 * 진단 블록에 들어갈 값의 전부. 여기 없는 것은 메일에 실릴 수 없다.
 */
export type SupportEnv = {
  /** `Constants.expoConfig?.version` */
  appVersion: string | null;
  /**
   * 네이티브 바이너리에 박힌 빌드 번호 — iOS `CFBundleVersion`, Android
   * `versionCode`. OTA로 갱신되는 매니페스트 값이 아니라 **그 바이너리에서
   * 절대 바뀌지 않는 값**이라, `updateId`와 짝을 이뤄 "어느 빌드 위에 어느
   * 번들"인지를 가른다.
   */
  buildNumber: string | null;
  /** `Platform.OS` */
  osName: string;
  /** `Platform.Version` */
  osVersion: string | null;
  /** `Constants.deviceName` */
  deviceName: string | null;
  /** `HotUpdater.getBundleId()` — 임베디드 실행이면 null로 정규화 */
  updateId: string | null;
  /** `HotUpdater.getChannel()` */
  channel: string | null;
  /** `HotUpdater.getAppVersion()` — OTA 호환성 기준 */
  updateAppVersion: string | null;
};

export type ContactDraft = {
  to: string;
  subject: string;
  body: string;
};

const orUnknown = (value: string | null): string =>
  value && value.length > 0 ? value : UNKNOWN_LABEL;

const orEmbedded = (value: string | null): string =>
  value && value.length > 0 ? value : EMBEDDED_LABEL;

const pad = (value: number, width = 2): string =>
  String(Math.abs(value)).padStart(width, "0");

/**
 * `2026-08-23 14:32 (UTC+09:00)` 꼴 — 기기의 로컬 시각 + UTC 오프셋.
 *
 * 메일 헤더의 발신 시각과 다를 수 있다. 사용자가 초안만 써두고 며칠 뒤에
 * 보내거나 다른 사람이 전달하면 헤더는 그 시점을 가리키므로, **문제가 일어난
 * 때에 가까운 시각**은 본문에 따로 박아야 남는다. 오프셋을 함께 적는 이유는
 * 로그와 대조할 때 기기가 어느 시간대였는지가 필요하기 때문이다.
 *
 * `Intl`에 기대지 않고 `Date`의 로컬 게터만 쓴다 — 플랫폼별 ICU 차이로 형식이
 * 흔들리지 않게 하기 위해서다.
 */
export function formatContactTime(now: Date): string {
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  // getTimezoneOffset은 UTC보다 앞선 지역에서 음수를 돌려준다.
  const offsetMinutes = -now.getTimezoneOffset();
  const sign = offsetMinutes < 0 ? "-" : "+";
  const offset = `UTC${sign}${pad(Math.trunc(offsetMinutes / 60))}:${pad(offsetMinutes % 60)}`;

  return `${date} ${time} (${offset})`;
}

/** `1.0.0+12` 꼴. 빌드 번호를 못 읽으면 버전만 남긴다. */
export function formatAppVersion(env: SupportEnv): string {
  const version = orUnknown(env.appVersion);
  return env.buildNumber && env.buildNumber.length > 0
    ? `${version}+${env.buildNumber}`
    : version;
}

/**
 * 개발자가 재현에 쓰는 정보 블록.
 *
 * 낯선 사용자는 자기 기기와 앱 버전을 설명하지 못한다. 이 블록이 그 자리를
 * 대신하므로, 사용자가 본문에 아무것도 안 써도 최소한의 단서는 남는다.
 */
export function formatDiagnostics(env: SupportEnv, now: Date): string {
  return [
    `문의 시각: ${formatContactTime(now)}`,
    `앱 버전: ${formatAppVersion(env)}`,
    `업데이트: ${orEmbedded(env.updateId)}`,
    `채널: ${orEmbedded(env.channel)}`,
    `OTA 대상 앱 버전: ${orUnknown(env.updateAppVersion)}`,
    `기기: ${orUnknown(env.deviceName)}`,
    `운영체제: ${env.osName} ${orUnknown(env.osVersion)}`,
  ].join("\n");
}

export function buildContactDraft(env: SupportEnv, now: Date): ContactDraft {
  const version = formatAppVersion(env);
  const body = [
    "문의하실 내용을 이 줄 위에 적어 주세요.",
    "",
    "--------------------",
    "아래는 문제를 확인하기 위한 정보입니다.",
    "지우고 보내셔도 되지만, 남겨 주시면 더 빨리 도와드릴 수 있습니다.",
    "",
    formatDiagnostics(env, now),
  ].join("\n");

  return {
    to: SUPPORT_EMAIL,
    subject: `[씀씀] 문의 (v${version})`,
    body,
  };
}

/**
 * `mailto:` URL 조립.
 *
 * `expo-mail-composer` 대신 이 경로를 쓴다 — MailComposer는 네이티브 모듈이라
 * 추가하면 이 티켓이 OTA로 나갈 수 없게 되고, 우리가 필요로 하는 기능(수신자·
 * 제목·본문 채우기)은 mailto로 전부 된다. 첨부파일은 쓰지 않는다.
 */
export function buildMailtoUrl(draft: ContactDraft): string {
  const query = [
    `subject=${encodeURIComponent(draft.subject)}`,
    `body=${encodeURIComponent(draft.body)}`,
  ].join("&");
  return `mailto:${draft.to}?${query}`;
}
