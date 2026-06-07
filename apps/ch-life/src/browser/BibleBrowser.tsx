import React, { useState } from "react";
import { View, Text, Modal, Pressable, StyleSheet } from "react-native";
import { useResponsiveLayout } from "./useResponsiveLayout";
import { BibleReader, type BrowserLevel } from "./BibleReader";
import { useBiblePosition } from "./useBiblePosition";

type Props = {
  visible: boolean;
  onClose: () => void;
  onInsertVerse: (ref: string) => void;
  insertMode?: "currentNote" | "newNote";
};

export { type BrowserLevel };

export function BibleBrowser({
  visible,
  onClose,
  onInsertVerse,
  insertMode,
}: Props) {
  const { mode } = useResponsiveLayout();
  const { initialRef, onPositionChange } = useBiblePosition();
  const [headerTitle, setHeaderTitle] = useState("성경");

  const handleTitleChange = (title: string) => {
    setHeaderTitle(title);
  };

  const body = (
    <View style={styles.body}>
      <View style={styles.header}>
        {/* 좌측 스페이서 — 우측 닫기 버튼과 균형을 맞춰 제목을 중앙 정렬. 뒤로가기는 BibleReader 본문 안에 있음. */}
        <View style={styles.headerBtn} />
        <Text style={styles.headerTitle} numberOfLines={1}>
          {headerTitle}
        </Text>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="브라우저 닫기"
          hitSlop={12}
          style={styles.headerBtn}
        >
          <Text style={styles.headerBtnText}>✕</Text>
        </Pressable>
      </View>
      <BibleReader
        onInsertVerse={onInsertVerse}
        insertMode={insertMode}
        initialRef={initialRef}
        onPositionChange={onPositionChange}
        onTitleChange={handleTitleChange}
      />
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
        <Pressable
          style={styles.backdropTap}
          onPress={onClose}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
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
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBtnText: { fontSize: 20, color: "#555" },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
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
