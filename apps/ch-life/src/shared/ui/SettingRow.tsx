import React from "react";
import { Pressable, Text, View } from "react-native";

export function SettingRow({
  label,
  description,
  marker,
  onPress,
  selected,
  preview,
  leading,
  disabled = false,
  accessibilityLabel = label,
  accessibilityHint = description,
  accessibilityRole = "button",
}: {
  label: string;
  description?: string;
  marker?: string;
  onPress: () => void;
  selected?: boolean;
  preview?: React.ReactNode;
  leading?: React.ReactNode;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: "button" | "link";
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ selected, disabled }}
      className={`gap-3 py-3 justify-center ${
        selected !== undefined
          ? "px-3.5 rounded-10 border-hairline min-h-14"
          : "mt-1 min-h-12 border-t-hairline border-rule"
      } ${
        selected === undefined ? "" : selected ? "bg-accent-soft border-accent" : "bg-paper border-rule"
      } ${disabled ? "opacity-40" : "active:opacity-60"}`}
    >
      <View className="flex-row items-center justify-between gap-3">
        {leading}
        <View className="flex-1 min-w-0 gap-0.5">
          <Text className={`text-body text-ink ${description ? "font-semibold" : ""}`}>
            {label}
          </Text>
          {description ? (
            <Text className="text-caption text-ink-3">{description}</Text>
          ) : null}
        </View>
        {selected ? (
          <Text className="text-accent font-semibold">✓</Text>
        ) : marker ? (
          <Text className="text-[22px] text-ink-3">{marker}</Text>
        ) : null}
      </View>
      {preview}
    </Pressable>
  );
}
