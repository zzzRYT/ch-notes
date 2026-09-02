import { useCallback, useState } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import * as Updates from "expo-updates";

import {
  buildContactDraft,
  buildMailtoUrl,
  SUPPORT_EMAIL,
  type SupportEnv,
} from "./contact-draft";

/**
 * 네이티브 쪽 값을 모은다.
 *
 * `expo-updates`의 상수들은 업데이트가 비활성이거나 임베디드 실행일 때 예외
 * 대신 null을 돌려주지만(SDK 54), 개발 빌드 조합에 따라 접근 자체가 실패하는
 * 경우를 배제할 수 없어 통째로 감싼다. 진단 정보 수집 실패가 문의 자체를
 * 막아서는 안 된다.
 */
function readSupportEnv(): SupportEnv {
  let updateId: string | null = null;
  let channel: string | null = null;
  let runtimeVersion: string | null = null;

  try {
    updateId = Updates.updateId ?? null;
    channel = Updates.channel ?? null;
    runtimeVersion = Updates.runtimeVersion ?? null;
  } catch {
    // 값이 없는 것과 같게 다룬다 — 진단 블록에 embedded로 찍힌다.
  }

  // 네이티브 매니페스트에서 읽는다 — `Constants.expoConfig`의 값은 OTA로
  // 갱신될 수 있어 실제로 설치된 바이너리를 가리키지 못한다.
  const iosBuild = Constants.platform?.ios?.buildNumber ?? null;
  const androidBuild = Constants.platform?.android?.versionCode ?? null;
  const buildNumber =
    iosBuild ?? (androidBuild === null ? null : String(androidBuild));

  return {
    appVersion: Constants.expoConfig?.version ?? null,
    buildNumber,
    osName: Platform.OS,
    osVersion: String(Platform.Version),
    deviceName: Constants.deviceName ?? null,
    updateId,
    channel,
    runtimeVersion,
  };
}

export type ContactSupport = {
  /** 문의 메일 작성 화면을 연다. 실패하면 화면 내 폴백을 켠다. */
  openContact: () => Promise<void>;
  /** 메일 앱을 열지 못해 주소를 직접 안내해야 하는 상태. */
  showAddressFallback: boolean;
  supportEmail: string;
};

export function useContactSupport(): ContactSupport {
  const [showAddressFallback, setShowAddressFallback] = useState(false);

  const openContact = useCallback(async () => {
    const url = buildMailtoUrl(buildContactDraft(readSupportEnv(), new Date()));

    // `canOpenURL`을 먼저 묻지 않는다. Android 11+의 패키지 가시성 규칙
    // 때문에 메일 앱이 있어도 false가 나올 수 있어, 열어보고 실패를 받는 쪽이
    // 실제 가용성에 가깝다.
    try {
      await Linking.openURL(url);
      setShowAddressFallback(false);
    } catch (e) {
      console.warn("failed to open mail composer", e);
      setShowAddressFallback(true);
    }
  }, []);

  return { openContact, showAddressFallback, supportEmail: SUPPORT_EMAIL };
}
