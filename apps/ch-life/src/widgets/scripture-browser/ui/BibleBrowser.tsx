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
import { useResponsiveLayout } from "@/shared/lib";
import { ActionBannerHost, useTheme } from "@/shared/ui";
import { BibleReader, type BrowserLevel } from "./BibleReader";
import { useBiblePosition } from "../model/useBiblePosition";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Bottom-sheet timing. Enter eases out (decelerates into place), exit eases in.
const ENTER_MS = 240;
const EXIT_MS = 190;

type Props = {
  visible: boolean;
  onClose: () => void;
  onInsertVerse: (ref: string) => void;
  insertMode?: "currentNote";
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
  // Animated.View에는 className이 닿지 않아 시트 배경만 style로 준다.
  const { colors } = useTheme();
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
    <View className="flex-1">
      <View className="flex-row items-center px-3 py-3 border-b border-rule">
        {/* 좌측 스페이서 — 우측 닫기 버튼과 균형을 맞춰 제목을 중앙 정렬. 뒤로가기는 BibleReader 본문 안에 있음. */}
        <View className={HEADER_BTN} />
        <Text
          className="flex-1 text-body-large font-semibold text-center text-ink"
          numberOfLines={1}
        >
          {headerTitle}
        </Text>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="브라우저 닫기"
          hitSlop={12}
          className={HEADER_BTN}
        >
          <Text className="text-[20px] text-ink-2">✕</Text>
        </Pressable>
      </View>
      <BibleReader
        onInsertVerse={onInsertVerse}
        insertMode={insertMode}
        initialRef={initialRef}
        onPositionChange={onPositionChange}
        onTitleChange={handleTitleChange}
      />
      <ActionBannerHost passive />
    </View>
  );

  if (mode === "sidebar") {
    if (!visible) return null;
    return (
      <View className="absolute right-0 top-0 bottom-0 w-1/3 bg-paper border-l border-rule">
        {body}
      </View>
    );
  }
  if (!rendered) return null;
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0],
  });
  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        {/* Full-screen dim as its own layer — fades uniformly, independent of the sheet's slide. */}
        <AnimatedPressable
          style={[styles.dim, { opacity: progress }]}
          onPress={onClose}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
        <Animated.View
          style={[
            styles.sheet,
            { backgroundColor: colors.paper, transform: [{ translateY }] },
          ]}
        >
          {body}
        </Animated.View>
      </View>
    </Modal>
  );
}

const HEADER_BTN = "size-10 items-center justify-center";

// Animated 컴포넌트 전용 — className 대신 style.
const styles = StyleSheet.create({
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    height: "70%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});
