import React from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import type { Note } from "@/domain/types";
import { formatTime, notePreview, noteTitleOrFallback } from "./group-notes";
import { useTheme, scaled } from "@/theme/ThemeProvider";

type Props = {
  note: Note;
  onPress: () => void;
  isFirst?: boolean;
};

export function NoteCard({ note, onPress, isFirst }: Props) {
  const { colors, fontScale, density } = useTheme();
  const compact = density === "compact";
  const title = noteTitleOrFallback(note);
  const passage = note.citedRefs[0];
  const preview = notePreview(note);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={[
        styles.row,
        compact ? styles.rowCompact : styles.rowRegular,
        {
          borderTopColor: isFirst ? "transparent" : colors.rule,
        },
      ]}
    >
      <Text
        style={[
          styles.time,
          {
            color: colors.ink3,
            fontSize: scaled(13, fontScale),
          },
        ]}
      >
        {formatTime(note.createdAt)}
      </Text>
      <View style={styles.body}>
        <Text
          numberOfLines={1}
          style={[
            styles.title,
            { color: colors.ink, fontSize: scaled(17, fontScale) },
          ]}
        >
          {title}
        </Text>
        {passage && (
          <View style={styles.metaRow}>
            <Text
              style={[
                styles.passage,
                { color: colors.accent, fontSize: scaled(13, fontScale) },
              ]}
            >
              {passage}
            </Text>
            {note.citedRefs.length > 1 && (
              <Text
                style={[
                  styles.metaMore,
                  { color: colors.ink3, fontSize: scaled(13, fontScale) },
                ]}
              >
                +{note.citedRefs.length - 1}
              </Text>
            )}
          </View>
        )}
        {!compact && preview.length > 0 && (
          <Text
            numberOfLines={2}
            style={[
              styles.preview,
              {
                color: colors.ink2,
                fontSize: scaled(14, fontScale),
                lineHeight: scaled(21, fontScale),
              },
            ]}
          >
            {preview}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingHorizontal: 22,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rowRegular: { paddingVertical: 16 },
  rowCompact: { paddingVertical: 10 },
  time: {
    width: 60,
    paddingTop: 3,
  },
  body: { flex: 1 },
  title: { fontWeight: "600", letterSpacing: -0.2 },
  metaRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: 4,
  },
  passage: { fontWeight: "600" },
  metaMore: {},
  preview: {
    marginTop: 8,
  },
});
