import { View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import Constants from 'expo-constants';
import { HotUpdater } from '@hot-updater/react-native';
import { useSettingsPersistence } from '@/state/useSettingsPersistence';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { ActionBannerHost } from '@/feedback/ActionBannerHost';
import { StoreUpdateDialog } from '@/update/StoreUpdateDialog';

function ThemedStack() {
  const { colors } = useTheme();
  // Headers are rendered per-screen via the custom AppHeader (src/chrome),
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

function RootLayout() {
  useSettingsPersistence();

  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <ThemeProvider>
          <View style={{ flex: 1 }}>
            <ThemedStack />
            <ActionBannerHost />
          </View>
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
