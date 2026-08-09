import React, { useEffect } from "react";
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { undoLatestNoteDeletion } from "@/notes/note-actions";
import { useAppStore } from "@/state/app-store";
import { useTheme } from "@/theme/ThemeProvider";

export function ActionBannerHost({ passive = false }: { passive?: boolean }) {
  const feedback = useAppStore((state) => state.feedback);
  const clearFeedback = useAppStore((state) => state.clearFeedback);
  const { colors } = useTheme();

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
          accessibilityLiveRegion="polite"
          style={[styles.message, { color: textColor }]}
        >
          {feedback.message}
        </Text>
        {feedback.action === "undo-delete" ? (
          <Pressable
            onPress={() => void undoLatestNoteDeletion()}
            accessibilityRole="button"
            accessibilityLabel="노트 삭제 실행 취소"
            hitSlop={8}
            style={styles.actionButton}
          >
            <Text style={[styles.action, { color: colors.accent }]}>실행 취소</Text>
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
