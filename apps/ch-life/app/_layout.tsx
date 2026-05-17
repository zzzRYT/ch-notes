import { useEffect, useRef } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAppStore } from "@/state/app-store";
import { loadSettings, saveSettings } from "@/state/settings-persist";

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
      <Stack screenOptions={{ headerShown: true }}>
        <Stack.Screen name="index" options={{ title: "노트" }} />
        <Stack.Screen name="note/[id]" options={{ title: "" }} />
        <Stack.Screen name="settings" options={{ title: "설정" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
