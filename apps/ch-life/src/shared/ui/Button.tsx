import React from "react";
import { Pressable, Text } from "react-native";

export function Button({
  label,
  onPress,
  selected,
  disabled = false,
  leading,
}: {
  label: string;
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
  leading?: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      className={`flex-row items-center justify-center gap-2 px-4 py-3 rounded-full min-h-touch max-w-full ${
        selected ? "bg-ink" : "bg-chip-bg"
      } ${disabled ? "opacity-40" : "active:opacity-60"}`}
    >
      {leading}
      <Text
        className={`shrink text-label ${
          selected ? "text-paper font-semibold" : "text-ink-2 font-normal"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
