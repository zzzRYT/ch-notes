import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  clampSwipeOffset,
  isHorizontalSwipe,
  settleSwipeOffset,
} from "./swipe-geometry";

const ACTION_WIDTH = 84;

type Props = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onDelete: () => void;
  deleteLabel: string;
  children: React.ReactNode;
};

export function SwipeToDelete({
  open,
  onOpen,
  onClose,
  onDelete,
  deleteLabel,
  children,
}: Props) {
  const translateX = useRef(new Animated.Value(0)).current;
  const startOffset = useRef(0);

  const animateTo = useCallback((value: number) => {
    Animated.spring(translateX, {
      toValue: value,
      useNativeDriver: true,
      tension: 220,
      friction: 24,
    }).start();
  }, [translateX]);

  useEffect(() => {
    animateTo(open ? -ACTION_WIDTH : 0);
  }, [open, animateTo]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gesture) => {
          if (open) {
            return (
              Math.abs(gesture.dx) > 8 &&
              Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.25
            );
          }
          return isHorizontalSwipe(gesture.dx, gesture.dy);
        },
        onPanResponderGrant: () => {
          startOffset.current = open ? -ACTION_WIDTH : 0;
          translateX.stopAnimation();
        },
        onPanResponderMove: (_, gesture) => {
          translateX.setValue(
            clampSwipeOffset(
              startOffset.current + gesture.dx,
              ACTION_WIDTH,
            ),
          );
        },
        onPanResponderRelease: (_, gesture) => {
          const finalOffset = clampSwipeOffset(
            startOffset.current + gesture.dx,
            ACTION_WIDTH,
          );
          const target = settleSwipeOffset(finalOffset, ACTION_WIDTH);
          if (target === -ACTION_WIDTH) onOpen();
          else onClose();
          animateTo(target);
        },
        onPanResponderTerminate: () => {
          onClose();
          animateTo(0);
        },
        onPanResponderTerminationRequest: () => true,
      }),
    [open, onOpen, onClose, translateX, animateTo],
  );

  return (
    <View style={styles.root}>
      <Pressable
        onPress={onDelete}
        accessibilityRole="button"
        accessibilityLabel={deleteLabel}
        accessibilityElementsHidden={!open}
        importantForAccessibility={open ? "yes" : "no-hide-descendants"}
        style={styles.deleteAction}
      >
        <Text style={styles.deleteText}>삭제</Text>
      </Pressable>
      <Animated.View
        {...panResponder.panHandlers}
        style={{ transform: [{ translateX }] }}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#c8342a",
  },
  deleteAction: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: ACTION_WIDTH,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#c8342a",
  },
  deleteText: { color: "white", fontSize: 14, fontWeight: "700" },
});
