import React from "react";
import { Pressable, Text, View } from "react-native";
import type { Note } from "@/entities/note";
import { SwipeToDelete, useTheme } from "@/shared/ui";
import { formatNoteCard } from "../lib/format-card";

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
  const { density } = useTheme();
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
      className={`flex-row px-5.5 gap-3 border-t-hairline bg-bg ${
        compact ? "py-2.5" : "py-3.5"
      } ${isFirst ? "border-transparent" : "border-rule"}`}
    >
      <Text className="w-14 pt-0.5 text-ink-3 text-label">{timeLabel}</Text>
      <View className="flex-1 gap-[3px]">
        <Text
          numberOfLines={1}
          className="font-semibold tracking-[-0.2px] text-ink text-body-large"
        >
          {title}
        </Text>
        {/* 부제가 없어도 줄을 비워 두어 카드 높이를 2줄로 고정한다. */}
        <Text numberOfLines={1} className="text-label">
          {hasSub ? (
            <>
              {preacher && <Text className="text-ink-3">{preacher}</Text>}
              {preacher && scripture && (
                <Text className="text-ink-3">{"  ·  "}</Text>
              )}
              {scripture && (
                <Text className="text-ink-2 font-semibold">{scripture}</Text>
              )}
            </>
          ) : (
            "\u00a0"
          )}
        </Text>
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

