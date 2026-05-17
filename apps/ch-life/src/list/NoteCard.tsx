import React from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import type { Note } from "@/domain/types";
import { formatNoteCard } from "./format-card";

type Props = {
  note: Note;
  onPress: () => void;
};

export function NoteCard({ note, onPress }: Props) {
  const { mainLabel, refChips } = formatNoteCard(note);
  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={mainLabel}
    >
      <Text style={styles.title} numberOfLines={1}>
        {mainLabel}
      </Text>
      {(refChips.visible.length > 0 || refChips.moreCount > 0) && (
        <View style={styles.chips}>
          {refChips.visible.map((r) => (
            <View key={r} style={styles.chip}>
              <Text style={styles.chipText}>{r}</Text>
            </View>
          ))}
          {refChips.moreCount > 0 && (
            <View style={styles.chip}>
              <Text style={styles.chipText}>+{refChips.moreCount}</Text>
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
    borderColor: "#eee",
    justifyContent: "center",
  },
  title: { fontSize: 18, fontWeight: "500", marginBottom: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  chipText: { color: "#555", fontSize: 13 },
});
