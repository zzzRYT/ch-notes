import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

type Props = {
  refLabel: string;
  onConfirm: () => void;
};

export function RefChip({ refLabel, onConfirm }: Props) {
  return (
    <Pressable
      onPress={onConfirm}
      style={styles.chip}
      accessibilityRole="button"
      accessibilityLabel={`${refLabel} 인용 채우기`}
      hitSlop={8}
    >
      <Text style={styles.label}>↹ {refLabel} 채움</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: "flex-start",
    backgroundColor: "#e6e6e6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginVertical: 4,
    minHeight: 32,
  },
  label: { color: "#333", fontSize: 14 },
});
