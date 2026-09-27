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
        onMoveShouldSetPanResponderCapture: (_, gesture) =>
          isHorizontalSwipe(gesture.dx, gesture.dy),
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
          const target = settleSwipeOffset(
            finalOffset,
            ACTION_WIDTH,
            gesture.vx,
          );
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

  // 자식 배경이 반투명(예: 선택 행의 accent-soft)이어도 삭제 레이어가 비치지 않게,
  // 행이 왼쪽으로 실제 움직인 만큼만 드러낸다.
  const actionOpacity = translateX.interpolate({
    inputRange: [-ACTION_WIDTH / 2, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <View className="relative overflow-hidden">
      {/* Animated.View에는 className이 닿지 않아 배치는 style로 준다. */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: ACTION_WIDTH,
          opacity: actionOpacity,
        }}
      >
        <Pressable
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel={deleteLabel}
          accessibilityElementsHidden={!open}
          importantForAccessibility={open ? "yes" : "no-hide-descendants"}
          className="flex-1 min-h-12 items-center justify-center bg-err-bar"
        >
          <Text className="text-white text-label font-bold">삭제</Text>
        </Pressable>
      </Animated.View>
      <Animated.View
        {...panResponder.panHandlers}
        style={{ transform: [{ translateX }] }}
      >
        {children}
      </Animated.View>
    </View>
  );
}
