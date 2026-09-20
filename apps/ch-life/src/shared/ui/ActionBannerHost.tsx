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
import { useTheme } from "./ThemeProvider";

export function ActionBannerHost({ passive = false }: { passive?: boolean }) {
  const feedback = useFeedbackStore((state) => state.feedback);
  const clearFeedback = useFeedbackStore((state) => state.clearFeedback);
  const { colors } = useTheme();
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

  const backgroundColor =
    feedback.tone === "error" ? colors.errBg : colors.ink;
  const textColor =
    feedback.tone === "error" ? colors.errText : colors.paper;

  return (
    <View pointerEvents="box-none" style={styles.host}>
      <View
        pointerEvents="auto"
        style={[styles.banner, { backgroundColor }]}
      >
        <Text
          accessibilityLiveRegion={passive ? "none" : "polite"}
          style={[styles.message, { color: textColor }]}
        >
          {feedback.message}
        </Text>
        {action ? (
          <Pressable
            onPress={() => void handleAction()}
            accessibilityRole="button"
            accessibilityLabel={action.accessibilityLabel ?? action.label}
            hitSlop={8}
            style={styles.actionButton}
          >
            <Text style={[styles.action, { color: colors.accent }]}>
              {action.label}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    alignItems: "center",
    zIndex: 1000,
  },
  banner: {
    minHeight: 48,
    maxWidth: 560,
    width: "100%",
    borderRadius: 12,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  message: { flex: 1, fontSize: 14, fontWeight: "600" },
  actionButton: {
    minHeight: 40,
    minWidth: 72,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  action: { fontSize: 14, fontWeight: "800" },
});
