import React from "react";
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  KeyboardStickyView,
  useKeyboardState,
} from "react-native-keyboard-controller";
import {
  useBridgeState,
  type EditorBridge,
} from "@10play/tentap-editor";
import { useTheme, scaled, type Theme } from "@/theme/ThemeProvider";

type Props = {
  editor: EditorBridge;
  onOpenBrowser: () => void;
};

type ButtonProps = {
  label: string;
  active?: boolean;
  onPress: () => void;
  theme: Theme;
  accessibilityLabel: string;
};

function ToolButton({
  label,
  active = false,
  onPress,
  theme,
  accessibilityLabel,
}: ButtonProps) {
  const { colors, fontScale } = theme;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: active }}
      style={[
        styles.btn,
        {
          backgroundColor: active ? colors.accentSoft : colors.bg,
          borderColor: active ? colors.accent : colors.rule,
        },
      ]}
      hitSlop={4}
    >
      <Text
        style={[
          styles.btnText,
          {
            color: active ? colors.accent : colors.ink2,
            fontSize: scaled(13, fontScale),
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ToolbarBody({ editor, onOpenBrowser }: Props) {
  const theme = useTheme();
  const { colors } = theme;
  const state = useBridgeState(editor);

  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: colors.paper, borderTopColor: colors.rule },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        contentContainerStyle={styles.scroll}
      >
        <ToolButton
          label="제목1"
          accessibilityLabel="제목 1"
          active={state.headingLevel === 1}
          onPress={() => editor.toggleHeading(1)}
          theme={theme}
        />
        <ToolButton
          label="제목2"
          accessibilityLabel="제목 2"
          active={state.headingLevel === 2}
          onPress={() => editor.toggleHeading(2)}
          theme={theme}
        />
        <ToolButton
          label="제목3"
          accessibilityLabel="제목 3"
          active={state.headingLevel === 3}
          onPress={() => editor.toggleHeading(3)}
          theme={theme}
        />
        <View style={[styles.divider, { backgroundColor: colors.rule }]} />
        <ToolButton
          label="굵게"
          accessibilityLabel="굵게"
          active={state.isBoldActive}
          onPress={() => editor.toggleBold()}
          theme={theme}
        />
        <ToolButton
          label="기울임"
          accessibilityLabel="기울임"
          active={state.isItalicActive}
          onPress={() => editor.toggleItalic()}
          theme={theme}
        />
        <ToolButton
          label="밑줄"
          accessibilityLabel="밑줄"
          active={state.isUnderlineActive}
          onPress={() => editor.toggleUnderline()}
          theme={theme}
        />
        <View style={[styles.divider, { backgroundColor: colors.rule }]} />
        <ToolButton
          label="• 목록"
          accessibilityLabel="목록"
          active={state.isBulletListActive}
          onPress={() => editor.toggleBulletList()}
          theme={theme}
        />
        <ToolButton
          label="☑ 체크"
          accessibilityLabel="체크박스"
          active={state.isTaskListActive}
          onPress={() => editor.toggleTaskList()}
          theme={theme}
        />
        <ToolButton
          label="❝ 인용문"
          accessibilityLabel="인용문"
          active={state.isBlockquoteActive}
          onPress={() => editor.toggleBlockquote()}
          theme={theme}
        />
        <View style={[styles.divider, { backgroundColor: colors.rule }]} />
        <ToolButton
          label="＋ 성경"
          accessibilityLabel="성경 인용 추가"
          onPress={onOpenBrowser}
          theme={theme}
        />
      </ScrollView>
      <Pressable
        onPress={() => Keyboard.dismiss()}
        accessibilityRole="button"
        accessibilityLabel="키보드 닫기"
        style={[styles.iconBtn, { borderLeftColor: colors.rule }]}
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
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  scroll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
  },
  btn: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  btnText: { fontWeight: "600" },
  divider: { width: StyleSheet.hairlineWidth, height: 20, marginHorizontal: 2 },
  iconBtn: {
    width: 44,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: StyleSheet.hairlineWidth,
  },
  iconText: { fontSize: 18 },
});
