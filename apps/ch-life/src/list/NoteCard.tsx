import React from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import type { Note } from "@/domain/types";
import { formatNoteCard } from "./format-card";
import { useTheme, scaled } from "@/theme/ThemeProvider";
import { SwipeToDelete } from "./SwipeToDelete";

type Props = {
  note: Note;
  onPress: () => void;
  isFirst?: boolean;
  swipeOpen?: boolean;
  onSwipeOpen?: () => void;
  onSwipeClose?: () => void;
  onDelete?: () => void;
};

export function NoteCard({
  note,
  onPress,
  isFirst,
  swipeOpen = false,
  onSwipeOpen,
  onSwipeClose,
  onDelete,
}: Props) {
  const { colors, fontScale, density } = useTheme();
  const compact = density === "compact";
  const { title, timeLabel, preacher, scripture } = formatNoteCard(note);
  const hasSub = !!(preacher || scripture);
  const a11yLabel = [timeLabel, title, preacher, scripture]
    .filter(Boolean)
    .join(", ");

  const card = (
    <Pressable
      onPress={swipeOpen ? onSwipeClose : onPress}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityActions={
        onDelete ? [{ name: "delete", label: `${title} 노트 삭제` }] : undefined
      }
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === "delete") onDelete?.();
      }}
      style={[
        styles.row,
        compact ? styles.rowCompact : styles.rowRegular,
        {
          backgroundColor: colors.bg,
          borderTopColor: isFirst ? "transparent" : colors.rule,
        },
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

  if (!onDelete) return card;

  return (
    <SwipeToDelete
      open={swipeOpen}
      onOpen={() => onSwipeOpen?.()}
      onClose={() => onSwipeClose?.()}
      onDelete={onDelete}
      deleteLabel={`${title} 노트 삭제`}
    >
      {card}
    </SwipeToDelete>
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
