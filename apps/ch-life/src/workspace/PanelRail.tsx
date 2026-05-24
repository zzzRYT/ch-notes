import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

type Props = {
  side: "left" | "right";
  label: string;
  glyph: string;
  onExpand: () => void;
};

export function PanelRail({ side, label, glyph, onExpand }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onExpand}
      accessibilityRole="button"
      accessibilityLabel={`${label} 펼치기`}
      style={[
        styles.rail,
        {
          backgroundColor: colors.bg,
          borderLeftWidth: side === "right" ? StyleSheet.hairlineWidth : 0,
          borderRightWidth: side === "left" ? StyleSheet.hairlineWidth : 0,
          borderColor: colors.rule,
        },
      ]}
    >
      <Text style={[styles.glyph, { color: colors.accent }]}>{glyph}</Text>
      <View style={styles.labelBox}>
        {label.split("").map((ch, i) => (
          <Text
            key={`${ch}-${i}`}
            style={[styles.labelCh, { color: colors.ink2 }]}
          >
            {ch}
          </Text>
        ))}
      </View>
      <Text style={[styles.chev, { color: colors.ink3 }]}>
        {side === "left" ? "›" : "‹"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rail: {
    width: 38,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 18,
  },
  glyph: { fontSize: 16, fontWeight: "600" },
  labelBox: { alignItems: "center" },
  labelCh: { fontSize: 11, fontWeight: "600", lineHeight: 14 },
  chev: { fontSize: 14, marginTop: "auto" },
});
