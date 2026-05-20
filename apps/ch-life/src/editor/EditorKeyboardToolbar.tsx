import React, { useEffect, useState } from "react";
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme, scaled } from "@/theme/ThemeProvider";

export const EDITOR_ACCESSORY_ID = "ch-life-editor-accessory";

type Props = {
  recents: ReadonlyArray<string>;
  onInsertRef: (ref: string) => void;
  onOpenBrowser: () => void;
};

function ToolbarBody({ recents, onInsertRef, onOpenBrowser }: Props) {
  const { colors, fontScale } = useTheme();
  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.paper,
          borderTopColor: colors.rule,
        },
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
      {recents.slice(0, 3).map((r) => (
        <Pressable
          key={r}
          onPress={() => onInsertRef(r)}
          accessibilityRole="button"
          accessibilityLabel={`${r} 인용 삽입`}
          style={[
            styles.chip,
            { backgroundColor: colors.bg, borderColor: colors.rule },
          ]}
        >
          <Text
            style={[
              styles.chipText,
              { color: colors.ink2, fontSize: scaled(12, fontScale) },
            ]}
          >
            {r}
          </Text>
        </Pressable>
      ))}
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
  if (Platform.OS === "ios") {
    return (
      <InputAccessoryView nativeID={EDITOR_ACCESSORY_ID}>
        <ToolbarBody {...props} />
      </InputAccessoryView>
    );
  }
  return <AndroidToolbar {...props} />;
}

function AndroidToolbar(props: Props) {
  const [visible, setVisible] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (e) => {
      setOffset(e.endCoordinates.height);
      setVisible(true);
    });
    const hide = Keyboard.addListener("keyboardDidHide", () => {
      setVisible(false);
      setOffset(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (!visible) return null;
  return (
    <View
      style={[styles.androidWrap, { bottom: offset }]}
      pointerEvents="box-none"
    >
      <ToolbarBody {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  androidWrap: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
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
  primaryText: { fontWeight: "600" },
  divider: { width: StyleSheet.hairlineWidth, height: 18 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipText: { fontWeight: "500" },
  spacer: { flex: 1 },
  iconBtn: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 18 },
});
