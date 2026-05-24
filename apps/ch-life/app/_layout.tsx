import { useEffect, useRef } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useAppStore } from "@/state/app-store";
import { loadSettings, saveSettings } from "@/state/settings-persist";
import { ThemeProvider, useTheme } from "@/theme/ThemeProvider";

function ThemedStack() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="index" options={{ title: "노트" }} />
      <Stack.Screen name="note/[id]" options={{ title: "" }} />
      <Stack.Screen name="settings" options={{ title: "설정" }} />
    </Stack>
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
          <ThemedStack />
        </ThemeProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
