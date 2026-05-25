import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, scaled } from "@/theme/ThemeProvider";

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
  const { colors, fontScale } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 8,
          backgroundColor: colors.bg,
          borderBottomColor: showRule ? colors.rule : "transparent",
          borderBottomWidth: showRule ? StyleSheet.hairlineWidth : 0,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.leading}>{left}</View>
        {title ? (
          <Text
            numberOfLines={1}
            style={[
              styles.title,
              { color: colors.ink, fontSize: scaled(17, fontScale) },
            ]}
          >
            {title}
          </Text>
        ) : null}
        <View style={styles.spacer} />
        <View style={styles.trailing}>{right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 20,
    paddingRight: 12,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 40,
  },
  leading: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontWeight: "700",
    letterSpacing: -0.3,
    marginLeft: 6,
  },
  spacer: { flex: 1 },
  trailing: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
});
