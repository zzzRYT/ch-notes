import React from "react";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  /** Leading slot — brand eyebrow, back button, etc. */
  left?: React.ReactNode;
  /** Trailing slot — action icons / CTA. Multiple children render in a row. */
  right?: React.ReactNode;
  /** Optional title shown after the leading slot (settings / licenses). */
  title?: string;
  /** Draw a hairline rule along the bottom edge. */
  showRule?: boolean;
};

/**
 * Custom app header replacing the Expo Router native Stack header.
 * Mirrors the design's `.phone-header`: transparent over the screen
 * background, leading + trailing slots, no rule by default.
 */
export function AppHeader({ left, right, title, showRule = false }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={`bg-bg pl-5 pr-3 pb-2 ${
        showRule ? "border-b-hairline border-rule" : ""
      }`}
      style={{ paddingTop: insets.top + 8 }}
    >
      <View className="flex-row items-center min-h-10">
        <View className="flex-row items-center">{left}</View>
        {title ? (
          <Text
            numberOfLines={1}
            className="text-ink text-body-large font-bold tracking-title ml-1.5"
          >
            {title}
          </Text>
        ) : null}
        <View className="flex-1" />
        <View className="flex-row items-center gap-0.5">{right}</View>
      </View>
    </View>
  );
}
