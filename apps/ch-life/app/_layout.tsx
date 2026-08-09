import { useEffect, useRef } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useAppStore } from "@/state/app-store";
import { loadSettings, saveSettings } from "@/state/settings-persist";
import { ThemeProvider, useTheme } from "@/theme/ThemeProvider";
import { ActionBannerHost } from "@/feedback/ActionBannerHost";

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

export default function RootLayout() {
  const loadedRef = useRef(false);

  useEffect(() => {
    loadSettings()
      .then((s) => {
        if (s) useAppStore.getState().setSettings(s);
      })
      .finally(() => {
        loadedRef.current = true;
      });
  }, []);

  useEffect(() => {
    const unsub = useAppStore.subscribe((state, prev) => {
      if (!loadedRef.current) return;
      if (state.settings === prev.settings) return;
      saveSettings(state.settings).catch((e) =>
        console.warn("saveSettings failed", e),
      );
    });
    return () => unsub();
  }, []);

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
