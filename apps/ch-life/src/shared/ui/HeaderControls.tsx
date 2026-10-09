import React from "react";
import { Pressable, Text, View } from "react-native";
import { ChevronLeft, NotebookPen } from "lucide-react-native";
import { useTheme } from "./ThemeProvider";
import { IconButton, type ActionTint } from "./IconButton";

const TINT_CLASS: Record<ActionTint, string> = {
  ink: "text-ink-2",
  accent: "text-accent",
  error: "text-err-text",
};

/** Icon-only header action (search, settings, share, …). */
export { IconButton as HeaderIconButton } from "./IconButton";

/** Back affordance: chevron + optional label (e.g. "노트"). */
export function HeaderBack({
  label,
  onPress,
}: {
  label?: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  if (!label) {
    return <IconButton icon={ChevronLeft} label="뒤로" onPress={onPress} iconSize={24} strokeWidth={2} />;
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label ? `${label} 화면으로 돌아가기` : "뒤로"}
      hitSlop={8}
      className="flex-row items-center gap-0.5 min-h-10 pr-2 -ml-1.5"
    >
      <ChevronLeft size={24} color={colors.ink2} strokeWidth={2} />
      {label ? (
        <Text className="text-ink-2 text-body font-medium tracking-[-0.2px]">
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

/** Text CTA in the trailing slot (e.g. "완료"). */
export function HeaderTextButton({
  label,
  onPress,
  tint = "accent",
}: {
  label: string;
  onPress: () => void;
  tint?: ActionTint;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      className="px-2 min-h-10 justify-center"
    >
      <Text
        className={`${TINT_CLASS[tint]} text-body font-semibold tracking-[-0.2px]`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Brand eyebrow shown on the notes list ("설교 노트"). */
export function HeaderBrand({ label }: { label: string }) {
  const { colors } = useTheme();
  return (
    <View className="flex-row items-center gap-1.5" accessibilityRole="header">
      <NotebookPen size={16} color={colors.ink3} strokeWidth={1.8} />
      <Text className="text-ink-3 text-label font-medium tracking-[-0.1px]">
        {label}
      </Text>
    </View>
  );
}
