import React from "react";
import { Pressable, Text, View } from "react-native";
import { ChevronLeft, NotebookPen } from "lucide-react-native";
import { useTheme } from "./ThemeProvider";

/** Shape of a lucide-react-native icon component. */
type IconComponent = React.ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

type Tint = "ink" | "accent" | "error";

// lucide 아이콘은 color prop으로만 색을 받으므로 여기만 useTheme을 유지한다.
function useTint(tint: Tint): string {
  const { colors } = useTheme();
  if (tint === "accent") return colors.accent;
  if (tint === "error") return colors.errText;
  return colors.ink2;
}

const TINT_CLASS: Record<Tint, string> = {
  ink: "text-ink-2",
  accent: "text-accent",
  error: "text-err-text",
};

/** Icon-only header action (search, settings, share, …). */
export function HeaderIconButton({
  icon: Icon,
  label,
  onPress,
  tint = "ink",
}: {
  icon: IconComponent;
  label: string;
  onPress: () => void;
  tint?: Tint;
}) {
  const color = useTint(tint);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      className="size-10 items-center justify-center"
    >
      <Icon size={21} color={color} strokeWidth={1.8} />
    </Pressable>
  );
}

/** Back affordance: chevron + optional label (e.g. "노트"). */
export function HeaderBack({
  label,
  onPress,
}: {
  label?: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
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
  tint?: Tint;
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
