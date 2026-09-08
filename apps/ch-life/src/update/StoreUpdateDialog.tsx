import React, { useCallback, useEffect, useState } from 'react';
import {
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Constants from 'expo-constants';
import { usePathname } from 'expo-router';
import { HotUpdater } from '@hot-updater/react-native';
import { useAppStore } from '@/state/app-store';
import { scaled, useTheme } from '@/theme/ThemeProvider';
import { isStoreVersionNewer } from './compare-version';
import {
  currentStorePlatform,
  fetchLatestStoreVersion,
} from './latest-store-version';
import { openStorePage } from './store-link';

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
export function StoreUpdateDialog() {
  const { colors, fontScale } = useTheme();
  const pathname = usePathname();
  const dismissedVersion = useAppStore(
    (s) => s.settings.dismissedUpdateVersion,
  );
  // settings.json을 읽기 전에는 dismissedUpdateVersion이 기본값 null이다.
  // 그 사이에 띄우면 이미 닫은 버전이 깜빡였다 사라지고, 그때 누른 것은
  // 뒤이어 도착한 로드가 덮어써서 사라진다.
  const settingsLoaded = useAppStore((s) => s.settingsLoaded);
  const setSettings = useAppStore((s) => s.setSettings);

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
    if (latest) setSettings({ dismissedUpdateVersion: latest });
  }, [latest, setSettings]);

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
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.paper }]}>
          <Text
            accessibilityRole="header"
            style={[
              styles.title,
              { color: colors.ink, fontSize: scaled(20, fontScale) },
            ]}
          >
            새 버전이 있어요!
          </Text>
          <Text
            style={[
              styles.body,
              {
                color: colors.ink2,
                fontSize: scaled(15, fontScale),
                lineHeight: scaled(24, fontScale),
              },
            ]}
          >
            {`스토어에서 씀씀 ${latest} 버전을 받을 수 있습니다.\n지금 쓰던 노트는 그대로 있습니다.`}
          </Text>

          <Pressable
            onPress={goToStore}
            accessibilityRole="button"
            accessibilityLabel="스토어로 이동해서 업데이트하기"
            style={[styles.primaryBtn, { backgroundColor: colors.ink }]}
          >
            <Text
              style={[
                styles.primaryText,
                { color: colors.paper, fontSize: scaled(16, fontScale) },
              ]}
            >
              스토어로 이동
            </Text>
          </Pressable>

          <Pressable
            onPress={dismiss}
            accessibilityRole="button"
            accessibilityLabel="나중에 하기"
            style={[styles.secondaryBtn, { borderColor: colors.chipBg }]}
          >
            <Text
              style={[
                styles.secondaryText,
                { color: colors.ink2, fontSize: scaled(16, fontScale) },
              ]}
            >
              나중에
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    padding: 24,
    gap: 12,
  },
  title: { fontWeight: '800', letterSpacing: -0.4 },
  body: { marginBottom: 4 },
  // POL-A11Y-001 — 탭 타깃 44~48px.
  primaryBtn: {
    minHeight: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryText: { fontWeight: '700' },
  secondaryBtn: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  secondaryText: { fontWeight: '600' },
});
