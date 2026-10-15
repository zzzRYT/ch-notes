import React from "react";
import { Pressable } from "react-native";
import { useTheme } from "./ThemeProvider";

export type ActionTint = "ink" | "accent" | "error";

export function IconButton({
  icon: Icon,
  label,
  onPress,
  tint = "ink",
  selected,
  disabled = false,
  iconSize = 21,
  strokeWidth = 1.8,
}: {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  onPress: () => void;
  tint?: ActionTint;
  selected?: boolean;
  disabled?: boolean;
  iconSize?: number;
  strokeWidth?: number;
}) {
  const { colors } = useTheme();
  const color = selected || tint === "accent"
    ? colors.accent
    : tint === "error" ? colors.errText : colors.ink2;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      hitSlop={8}
      className={`size-touch rounded-8 items-center justify-center ${
        selected ? "bg-accent-soft" : ""
      } ${disabled ? "opacity-40" : "active:opacity-60"}`}
    >
      <Icon size={iconSize} color={color} strokeWidth={strokeWidth} />
    </Pressable>
  );
}
