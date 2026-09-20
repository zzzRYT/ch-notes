import React, { useCallback, useEffect, useRef } from "react";
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFeedbackStore } from "../lib/feedback";

export function ActionBannerHost({ passive = false }: { passive?: boolean }) {
  const feedback = useFeedbackStore((state) => state.feedback);
  const clearFeedback = useFeedbackStore((state) => state.clearFeedback);
  const runningRef = useRef(false);
  const action = feedback?.action;

  // 액션은 한 번에 하나만 — 두 번 눌러도 두 번 실행되지 않는다.
  const handleAction = useCallback(async () => {
    if (!action || runningRef.current) return;
    runningRef.current = true;
    try {
      await action.onPress();
    } finally {
      runningRef.current = false;
    }
  }, [action]);

  useEffect(() => {
    if (!feedback || passive) return;
    if (Platform.OS === "ios") {
      AccessibilityInfo.announceForAccessibility(feedback.message);
    }
    const timer = setTimeout(
      () => clearFeedback(feedback.id),
      Math.max(0, feedback.expiresAt - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [feedback, clearFeedback, passive]);

  if (!feedback) return null;

  const isError = feedback.tone === "error";

  return (
    <View
      pointerEvents="box-none"
      className="absolute left-4 right-4 bottom-6 items-center z-[1000]"
    >
      <View
        pointerEvents="auto"
        className={`min-h-12 max-w-[560px] w-full rounded-12 pl-4 pr-2 py-2.5 flex-row items-center gap-3 ${
          isError ? "bg-err-bg" : "bg-ink"
        }`}
        style={styles.shadow}
      >
        <Text
          accessibilityLiveRegion={passive ? "none" : "polite"}
          className={`flex-1 text-label font-semibold ${
            isError ? "text-err-text" : "text-paper"
          }`}
        >
          {feedback.message}
        </Text>
        {action ? (
          <Pressable
            onPress={() => void handleAction()}
            accessibilityRole="button"
            accessibilityLabel={action.accessibilityLabel ?? action.label}
            hitSlop={8}
            className="min-h-10 min-w-[72px] items-center justify-center px-2"
          >
            <Text className="text-accent text-label font-extrabold">
              {action.label}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

// 그림자는 iOS(shadow*)와 Android(elevation)가 갈려 style로 남긴다.
const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
});
