import React from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import type { Note } from "@/domain/types";
import { formatNoteCard } from "./format-card";
import { useTheme, scaled } from "@/theme/ThemeProvider";

type Props = {
  note: Note;
  onPress: () => void;
};

export function NoteCard({ note, onPress }: Props) {
  const { colors, fontScale } = useTheme();
  const { mainLabel, refChips } = formatNoteCard(note);
  return (
    <Pressable
      style={[styles.card, { borderColor: colors.line }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={mainLabel}
    >
      <Text
        style={[
          styles.title,
          { color: colors.text, fontSize: scaled(18, fontScale) },
        ]}
        numberOfLines={1}
      >
        {mainLabel}
      </Text>
      {(refChips.visible.length > 0 || refChips.moreCount > 0) && (
        <View style={styles.chips}>
          {refChips.visible.map((r) => (
            <View
              key={r}
              style={[styles.chip, { backgroundColor: colors.chipBg }]}
            >
              <Text style={[styles.chipText, { color: colors.chipText }]}>
                {r}
              </Text>
            </View>
          ))}
          {refChips.moreCount > 0 && (
            <View style={[styles.chip, { backgroundColor: colors.chipBg }]}>
              <Text style={[styles.chipText, { color: colors.chipText }]}>
                +{refChips.moreCount}
              </Text>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    minHeight: 72,
    borderBottomWidth: 1,
    justifyContent: "center",
  },
  title: { fontWeight: "500", marginBottom: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  chipText: { fontSize: 13 },
});
