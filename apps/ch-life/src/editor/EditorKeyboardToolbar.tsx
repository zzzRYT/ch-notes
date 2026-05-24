import React from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  KeyboardStickyView,
  useKeyboardState,
} from 'react-native-keyboard-controller';
import { useTheme, scaled } from '@/theme/ThemeProvider';

type Props = {
  onOpenBrowser: () => void;
};

function ToolbarBody({ onOpenBrowser }: Props) {
  const { colors, fontScale } = useTheme();
  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: colors.paper, borderTopColor: colors.rule },
      ]}
    >
      <Pressable
        onPress={onOpenBrowser}
        accessibilityRole="button"
        accessibilityLabel="성경 인용 추가"
        style={[
          styles.primary,
          { backgroundColor: colors.bg, borderColor: colors.rule },
        ]}
      >
        <Text
          style={[
            styles.primaryText,
            { color: colors.accent, fontSize: scaled(13, fontScale) },
          ]}
        >
          ＋ 인용
        </Text>
      </Pressable>
      <View style={[styles.divider, { backgroundColor: colors.rule }]} />
      <View style={styles.spacer} />
      <Pressable
        onPress={() => Keyboard.dismiss()}
        accessibilityRole="button"
        accessibilityLabel="키보드 닫기"
        style={styles.iconBtn}
        hitSlop={8}
      >
        <Text style={[styles.iconText, { color: colors.ink2 }]}>⌨︎</Text>
      </Pressable>
    </View>
  );
}

export function EditorKeyboardToolbar(props: Props) {
  const isVisible = useKeyboardState((s) => s.isVisible);
  if (!isVisible) return null;
  return (
    <KeyboardStickyView offset={STICKY_OFFSET}>
      <ToolbarBody {...props} />
    </KeyboardStickyView>
  );
}

const STICKY_OFFSET = { closed: 0, opened: 0 };

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  primary: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  primaryText: { fontWeight: '600' },
  divider: { width: StyleSheet.hairlineWidth, height: 18 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipText: { fontWeight: '500' },
  spacer: { flex: 1 },
  iconBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 18 },
});
