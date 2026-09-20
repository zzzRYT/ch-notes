import React, { useCallback, useEffect, useState } from 'react';
import { Keyboard, Modal, Pressable, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { usePathname } from 'expo-router';
import { HotUpdater } from '@hot-updater/react-native';
import { isStoreVersionNewer } from '../model/compare-version';
import {
  currentStorePlatform,
  fetchLatestStoreVersion,
} from '../model/latest-store-version';
import { openStorePage } from '../model/store-link';

type Props = {
  /** 사용자가 닫은 스토어 버전. 같은 버전은 다시 띄우지 않는다. */
  dismissedVersion: string | null;
  /**
   * settings.json 읽기가 끝났는가. 읽기 전에는 `dismissedVersion`이 기본값
   * null이라, 그 사이에 띄우면 이미 닫은 버전이 깜빡였다 사라지고 그때 누른
   * 것은 뒤이어 도착한 로드가 덮어써서 사라진다.
   */
  settingsLoaded: boolean;
  onDismiss: (version: string) => void;
};

/**
 * 설치된 네이티브 버전.
 *
 * `HotUpdater.getAppVersion()`이 정본이다 — OTA 번들이 겨냥하는 바로 그 값이다.
 * Expo Go나 네이티브 연결이 빠진 개발 빌드에서는 던지므로 감싸고,
 * `Constants.expoConfig?.version`으로 폴백한다.
 */
function readInstalledVersion(): string | null {
  try {
    const fromNative = HotUpdater.getAppVersion();
    if (typeof fromNative === 'string' && fromNative.length > 0) {
      return fromNative;
    }
  } catch {
    // 값이 없는 것과 같게 다룬다.
  }
  const fromConfig = Constants.expoConfig?.version;
  return typeof fromConfig === 'string' && fromConfig.length > 0
    ? fromConfig
    : null;
}

/**
 * 스토어에 새 네이티브 빌드가 올라갔을 때 한 번 안내한다.
 *
 * OTA로 닿지 않는 변경(네이티브 의존성·`version`·되돌릴 수 없는 스키마)은
 * 새 스토어 빌드로만 전달된다(`POL-RELEASE-001`, `RULE-OTA-008`·`RULE-OTA-009`).
 * 그 사용자를 옮길 수단이 이것뿐이다.
 *
 * 지켜야 하는 것 —
 * - **첫 렌더를 막지 않는다**(`RULE-OTA-002`). 확인은 렌더 뒤에 시작하고
 *   실패는 `console.warn` 한 줄로 끝난다.
 * - **오프라인 기기에서는 아무 일도 일어나지 않는다**(`POL-RELEASE-002`).
 * - **닫을 수 있다**(`POL-RELEASE-002`). 강제 업데이트는 두지 않았다(`ADR-0022`).
 * - **쓰는 중에는 띄우지 않는다**(`ADR-0016`의 정신).
 */
export function StoreUpdateDialog({
  dismissedVersion,
  settingsLoaded,
  onDismiss,
}: Props) {
  const pathname = usePathname();

  const [latest, setLatest] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // 확인은 콜드 런치마다 한 번뿐이다. 포그라운드 복귀마다 다시 묻지 않는다 —
  // 예배 중 성경 앱을 봤다 돌아온 것과 구별할 수 없다(ADR-0016).
  useEffect(() => {
    const platform = currentStorePlatform();
    if (!platform) return;
    let alive = true;
    fetchLatestStoreVersion(platform)
      .then((version) => {
        if (alive) setLatest(version);
      })
      .catch((error) => console.warn('store version check failed', error));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const dismiss = useCallback(() => {
    if (latest) onDismiss(latest);
  }, [latest, onDismiss]);

  const goToStore = useCallback(() => {
    // 스토어를 열든 못 열든 이 버전 안내는 끝난다. 못 연 기기에서 매번 다시
    // 띄우면 그것이 어르신에게는 고장으로 보인다.
    dismiss();
    void openStorePage();
  }, [dismiss]);

  const installed = readInstalledVersion();
  const visible =
    settingsLoaded &&
    latest !== null &&
    installed !== null &&
    latest !== dismissedVersion &&
    isStoreVersionNewer(latest, installed) &&
    // 노트를 쓰고 있는 화면 위에는 띄우지 않는다. 폰은 경로로, 태블릿은
    // 한 화면에 편집 창이 늘 있으므로 키보드로 가른다.
    !pathname.startsWith('/note/') &&
    !keyboardVisible;

  if (!visible) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={dismiss}
      accessibilityViewIsModal
    >
      <View className="flex-1 bg-black/35 items-center justify-center p-6">
        <View className="w-full max-w-[420px] rounded-16 p-6 gap-3 bg-paper">
          <Text
            accessibilityRole="header"
            className="font-extrabold tracking-[-0.4px] text-ink text-title"
          >
            새 버전이 있어요!
          </Text>
          <Text className="mb-1 text-ink-2 text-body leading-[1.6]">
            {`스토어에서 씀씀 ${latest} 버전을 받을 수 있습니다.\n지금 쓰던 노트는 그대로 있습니다.`}
          </Text>

          {/* POL-A11Y-001 — 탭 타깃 44~48px. */}
          <Pressable
            onPress={goToStore}
            accessibilityRole="button"
            accessibilityLabel="스토어로 이동해서 업데이트하기"
            className={`${BTN} bg-ink`}
          >
            <Text className="font-bold text-paper text-body">스토어로 이동</Text>
          </Pressable>

          <Pressable
            onPress={dismiss}
            accessibilityRole="button"
            accessibilityLabel="나중에 하기"
            className={`${BTN} border border-chip-bg`}
          >
            <Text className="font-semibold text-ink-2 text-body">나중에</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const BTN = "min-h-[52px] rounded-12 items-center justify-center px-4";
