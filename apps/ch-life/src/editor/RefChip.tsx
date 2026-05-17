import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

type Props = {
  refLabel: string;
  onConfirm: () => void;
};

export function RefChip({ refLabel, onConfirm }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onConfirm}
      style={[styles.chip, { backgroundColor: colors.chipBg }]}
      accessibilityRole="button"
      accessibilityLabel={`${refLabel} 인용 채우기`}
      hitSlop={8}
    >
      <Text style={[styles.label, { color: colors.chipText }]}>
        ↹ {refLabel} 채움
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginVertical: 4,
    minHeight: 32,
  },
  label: { fontSize: 14 },
});
