import React from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import type { Note } from "@/domain/types";
import { formatNoteCard } from "./format-card";
import { useTheme, scaled } from "@/theme/ThemeProvider";

type Props = {
  note: Note;
  onPress: () => void;
  isFirst?: boolean;
};

export function NoteCard({ note, onPress, isFirst }: Props) {
  const { colors, fontScale, density } = useTheme();
  const compact = density === "compact";
  const { title, timeLabel, preacher, scripture } = formatNoteCard(note);
  const hasSub = !!(preacher || scripture);
  const a11yLabel = [timeLabel, title, preacher, scripture]
    .filter(Boolean)
    .join(", ");

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      style={[
        styles.row,
        compact ? styles.rowCompact : styles.rowRegular,
        { borderTopColor: isFirst ? "transparent" : colors.rule },
      ]}
    >
      <Text
        style={[styles.time, { color: colors.ink3, fontSize: scaled(13, fontScale) }]}
      >
        {timeLabel}
      </Text>
      <View style={styles.body}>
        <Text
          numberOfLines={1}
          style={[styles.title, { color: colors.ink, fontSize: scaled(17, fontScale) }]}
        >
          {title}
        </Text>
        {hasSub && (
          <Text numberOfLines={1} style={[styles.sub, { fontSize: scaled(13, fontScale) }]}>
            {preacher && <Text style={{ color: colors.ink3 }}>{preacher}</Text>}
            {preacher && scripture && (
              <Text style={{ color: colors.ink3 }}>{"  ·  "}</Text>
            )}
            {scripture && (
              <Text style={{ color: colors.ink2, fontWeight: "600" }}>
                {scripture}
              </Text>
            )}
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
  rowRegular: { paddingVertical: 14 },
  rowCompact: { paddingVertical: 10 },
  time: { width: 56, paddingTop: 2 },
  body: { flex: 1, gap: 3 },
  title: { fontWeight: "600", letterSpacing: -0.2 },
  sub: {},
});
