import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { useNavigationContainerRef } from "expo-router";
import type { Route } from "@react-navigation/native";
import { getAnalytics, logScreenView } from "@react-native-firebase/analytics";

const SCREENS: Record<string, { screen_class: string; screen_name: string }> = {
  index: { screen_class: "index", screen_name: "notes" },
  "note/[id]": { screen_class: "note/[id]", screen_name: "note_editor" },
  bible: { screen_class: "bible", screen_name: "bible" },
  settings: { screen_class: "settings", screen_name: "settings" },
  licenses: { screen_class: "licenses", screen_name: "licenses" },
};

export function useScreenTracking() {
  const navigation = useNavigationContainerRef();
  const previous = useRef<{ key: string; noteId: unknown } | null>(null);

  useEffect(() => {
    if (Platform.OS !== "ios" && Platform.OS !== "android") return;
    const trackScreen = () => {
      if (!navigation.isReady()) return;
      const route = navigation.getCurrentRoute() as Route<string, { id?: unknown }> | undefined;
      if (!route) return;
      const noteId = route.name === "note/[id]"
        ? route.params?.id
        : undefined;
      if (previous.current?.key === route.key && previous.current.noteId === noteId) return;
      previous.current = { key: route.key, noteId };
      // 키·노트 ID는 중복 판정에만 쓰고, 전송 값은 고정 목록으로 제한한다.
      const screen = Object.hasOwn(SCREENS, route.name) ? SCREENS[route.name] : undefined;
      if (!screen) return;
      try {
        void logScreenView(getAnalytics(), screen).catch(() => {
          console.warn("Screen view tracking failed");
        });
      } catch {
        console.warn("Screen view tracking failed");
      }
    };
    const unsubscribeReady = navigation.addListener("ready", trackScreen);
    const unsubscribeState = navigation.addListener("state", trackScreen);
    trackScreen();
    return () => {
      unsubscribeReady();
      unsubscribeState();
    };
  }, [navigation]);
}
