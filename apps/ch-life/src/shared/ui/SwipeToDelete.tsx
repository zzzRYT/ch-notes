import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Animated, PanResponder, Pressable, Text, View } from "react-native";
import {
  clampSwipeOffset,
  isHorizontalSwipe,
  settleSwipeOffset,
} from "../lib/swipe-geometry";

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
    <View className="relative overflow-hidden bg-err-bar">
      <Pressable
        onPress={onDelete}
        accessibilityRole="button"
        accessibilityLabel={deleteLabel}
        accessibilityElementsHidden={!open}
        importantForAccessibility={open ? "yes" : "no-hide-descendants"}
        className="absolute top-0 right-0 bottom-0 min-h-12 items-center justify-center bg-err-bar"
        style={{ width: ACTION_WIDTH }}
      >
        <Text className="text-white text-label font-bold">삭제</Text>
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

