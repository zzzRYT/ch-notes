import React from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { ChevronLeft, NotebookPen } from "lucide-react-native";
import { useTheme, scaled } from "@/theme/ThemeProvider";

/** Shape of a lucide-react-native icon component. */
type IconComponent = React.ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

type Tint = "ink" | "accent";

function useTint(tint: Tint): string {
  const { colors } = useTheme();
  return tint === "accent" ? colors.accent : colors.ink2;
}

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
      style={styles.iconBtn}
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
  const { colors, fontScale } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label ? `${label} 화면으로 돌아가기` : "뒤로"}
      hitSlop={8}
      style={styles.backBtn}
    >
      <ChevronLeft size={24} color={colors.ink2} strokeWidth={2} />
      {label ? (
        <Text
          style={[
            styles.backLabel,
            { color: colors.ink2, fontSize: scaled(15, fontScale) },
          ]}
        >
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
  const { fontScale } = useTheme();
  const color = useTint(tint);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={styles.textBtn}
    >
      <Text
        style={[
          styles.textBtnLabel,
          { color, fontSize: scaled(15, fontScale) },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Brand eyebrow shown on the notes list ("설교 노트"). */
export function HeaderBrand({ label }: { label: string }) {
  const { colors, fontScale } = useTheme();
  return (
    <View style={styles.brand} accessibilityRole="header">
      <NotebookPen size={16} color={colors.ink3} strokeWidth={1.8} />
      <Text
        style={[
          styles.brandLabel,
          { color: colors.ink3, fontSize: scaled(13, fontScale) },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    minHeight: 40,
    paddingRight: 8,
    marginLeft: -6,
  },
  backLabel: { fontWeight: "500", letterSpacing: -0.2 },
  textBtn: {
    paddingHorizontal: 8,
    minHeight: 40,
    justifyContent: "center",
  },
  textBtnLabel: { fontWeight: "600", letterSpacing: -0.2 },
  brand: { flexDirection: "row", alignItems: "center", gap: 6 },
  brandLabel: { fontWeight: "500", letterSpacing: -0.1 },
});
