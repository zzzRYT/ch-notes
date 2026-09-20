import '../global.css';
import { useCallback } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import Constants from 'expo-constants';
import { HotUpdater } from '@hot-updater/react-native';
import {
  NoteRepoProvider,
  makeSqliteNoteRepo,
  runNoteMigrations,
} from '@/entities/note';
import { StoreUpdateDialog } from '@/features/app-update/notice';
import {
  useSettingsPersistence,
  useSettingsStore,
} from '@/features/settings/change';
import { openSqliteDatabase } from '@/shared/lib';
import { ActionBannerHost, ThemeProvider, useTheme } from '@/shared/ui';

// Composition Root(ADR-0024). 어댑터와 마이그레이션 순서는 여기서만 조립한다.
// DB는 첫 질의 때 열리므로 부팅 렌더를 막지 않는다(RULE-OTA-002).
const noteRepo = makeSqliteNoteRepo(
  openSqliteDatabase('ch-life.db', [runNoteMigrations]),
);

function ThemedStack() {
  const { colors } = useTheme();
  // Headers are rendered per-screen via the shared AppHeader,
  // so the native Stack header stays hidden app-wide.
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    />
  );
}

function StoreUpdateNotice() {
  const dismissedVersion = useSettingsStore(
    (s) => s.settings.dismissedUpdateVersion,
  );
  const settingsLoaded = useSettingsStore((s) => s.settingsLoaded);
  const setSettings = useSettingsStore((s) => s.setSettings);
  const onDismiss = useCallback(
    (version: string) => setSettings({ dismissedUpdateVersion: version }),
    [setSettings],
  );
  return (
    <StoreUpdateDialog
      dismissedVersion={dismissedVersion}
      settingsLoaded={settingsLoaded}
      onDismiss={onDismiss}
    />
  );
}

function RootLayout() {
  useSettingsPersistence();
  const settings = useSettingsStore((s) => s.settings);

  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <ThemeProvider settings={settings}>
          <NoteRepoProvider value={noteRepo}>
            <View style={{ flex: 1 }}>
              <ThemedStack />
              <ActionBannerHost />
              <StoreUpdateNotice />
            </View>
          </NoteRepoProvider>
        </ThemeProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}

const hotUpdaterBaseUrl = Constants.expoConfig?.extra?.hotUpdaterBaseUrl;

export default HotUpdater.wrap({
  baseURL: () => {
    if (
      typeof hotUpdaterBaseUrl !== 'string' ||
      hotUpdaterBaseUrl.length === 0
    ) {
      throw new Error('Hot Updater server URL is not configured.');
    }
    return hotUpdaterBaseUrl;
  },
  updateStrategy: 'appVersion',
  // Even a server-directed rollback waits for the next cold launch. An update
  // must never interrupt an in-progress worship session.
  reloadOnForceUpdate: false,
  onError: (error) => console.warn('Hot Updater check failed', error),
})(RootLayout);
