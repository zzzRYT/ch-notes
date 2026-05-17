import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
} from "react-native";
import type { BookCode } from "@/parser/book-map";
import { useResponsiveLayout } from "./useResponsiveLayout";

export type BrowserLevel =
  | { kind: "books" }
  | { kind: "chapters"; book: BookCode }
  | { kind: "verses"; book: BookCode; chapter: number };

type Props = {
  visible: boolean;
  onClose: () => void;
  onInsertVerse: (ref: string) => void;
};

export function BibleBrowser({ visible, onClose, onInsertVerse: _onInsertVerse }: Props) {
  const { mode } = useResponsiveLayout();
  const [level, _setLevel] = useState<BrowserLevel>({ kind: "books" });

  const body = (
    <View style={styles.body}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>성경</Text>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="브라우저 닫기"
          hitSlop={12}
        >
          <Text style={styles.closeBtn}>✕</Text>
        </Pressable>
      </View>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          {level.kind === "books" && "책 목록 (Lv1)"}
          {level.kind === "chapters" && `${level.book} 장 (Lv2)`}
          {level.kind === "verses" &&
            `${level.book} ${level.chapter}장 절 (Lv3)`}
        </Text>
      </View>
    </View>
  );

  if (mode === "sidebar") {
    if (!visible) return null;
    return <View style={styles.sidebar}>{body}</View>;
  }
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.sheetBackdrop}>
        <Pressable style={styles.backdropTap} onPress={onClose} />
        <View style={styles.sheet}>{body}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  closeBtn: { fontSize: 20, color: "#555", padding: 4 },
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  placeholderText: { color: "#666" },
  sidebar: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "33%",
    backgroundColor: "white",
    borderLeftWidth: 1,
    borderColor: "#eee",
  },
  sheetBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  backdropTap: { flex: 1 },
  sheet: {
    height: "70%",
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});
