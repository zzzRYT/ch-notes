import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  useWindowDimensions,
} from "react-native";
import { useResponsiveLayout } from "./useResponsiveLayout";
import { BibleReader, type BrowserLevel } from "./BibleReader";
import { useBiblePosition } from "./useBiblePosition";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Bottom-sheet timing. Enter eases out (decelerates into place), exit eases in.
const ENTER_MS = 240;
const EXIT_MS = 190;

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
  const { height } = useWindowDimensions();
  const { initialRef, onPositionChange } = useBiblePosition();
  const [headerTitle, setHeaderTitle] = useState("성경");

  // Drive the dim and sheet from one 0→1 value so the backdrop fades over the
  // whole screen while the sheet slides up — instead of slide dragging both as
  // one block. `rendered` keeps the Modal mounted through the exit animation.
  const progress = useRef(new Animated.Value(0)).current;
  const [rendered, setRendered] = useState(visible);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: ENTER_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(progress, {
        toValue: 0,
        duration: EXIT_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setRendered(false);
      });
    }
  }, [visible, progress]);

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
  if (!rendered) return null;
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0],
  });
  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.sheetBackdrop}>
        {/* Full-screen dim as its own layer — fades uniformly, independent of the sheet's slide. */}
        <AnimatedPressable
          style={[styles.dim, { opacity: progress }]}
          onPress={onClose}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          {body}
        </Animated.View>
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
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    height: "70%",
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});
