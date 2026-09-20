import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Download, Settings } from "lucide-react-native";
import {
  groupNotesByDay,
  formatTime,
  noteTitleOrFallback,
  type Note,
} from "@/entities/note";
import { formatRef } from "@/entities/scripture";
import { SwipeToDelete, useTheme } from "@/shared/ui";

type Props = {
  notes: readonly Note[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onImport: () => void;
  onSettings: () => void;
  onCollapse: () => void;
};

export function NoteListSidebar({
  notes,
  selectedId,
  onSelect,
  onDelete,
  onCreate,
  onImport,
  onSettings,
  onCollapse,
}: Props) {
  // lucide 아이콘 색만 prop으로.
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [openSwipeId, setOpenSwipeId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) => {
      const title = noteTitleOrFallback(n).toLowerCase();
      if (title.includes(q)) return true;
      if (n.citedRefs.some((r) => r.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [notes, query]);

  const groups = useMemo(() => groupNotesByDay(filtered), [filtered]);

  return (
    <View className="flex-1 border-r-hairline bg-paper border-rule">
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2.5">
        <Text className="text-body-large font-bold tracking-[-0.2px] text-ink">
          노트
        </Text>
        <View className="flex-row gap-1">
          <Pressable
            onPress={onCreate}
            accessibilityRole="button"
            accessibilityLabel="새 노트"
            hitSlop={10}
            className={ICON_BTN}
          >
            <Text className="text-[16px] font-semibold text-accent">＋</Text>
          </Pressable>
          <Pressable
            onPress={onImport}
            accessibilityRole="button"
            accessibilityLabel="마크다운 노트 가져오기"
            hitSlop={10}
            className={ICON_BTN}
          >
            <Download size={16} color={colors.ink2} strokeWidth={1.8} />
          </Pressable>
          <Pressable
            onPress={onSettings}
            accessibilityRole="button"
            accessibilityLabel="설정"
            hitSlop={10}
            className={ICON_BTN}
          >
            <Settings size={16} color={colors.ink2} strokeWidth={1.8} />
          </Pressable>
          <Pressable
            onPress={onCollapse}
            accessibilityRole="button"
            accessibilityLabel="노트 목록 접기"
            hitSlop={10}
            className={ICON_BTN}
          >
            <Text className="text-[16px] font-semibold text-ink-2">‹</Text>
          </Pressable>
        </View>
      </View>
      <View className="flex-row items-center gap-2 mx-3 px-3 rounded-8 min-h-9 bg-chip-bg">
        <Text className="text-[13px] text-ink-3">⌕</Text>
        <TextInput
          className="flex-1 py-1.5 text-ink text-label"
          value={query}
          onChangeText={setQuery}
          placeholder="검색 — 제목, 인용"
          placeholderTextColorClassName="text-ink-3"
          autoCorrect={false}
          autoCapitalize="none"
          accessibilityLabel="노트 검색"
        />
      </View>
      <ScrollView
        className="flex-1"
        contentContainerClassName="pt-2 pb-10"
        keyboardShouldPersistTaps="handled"
      >
        {groups.map((g) => (
          <View key={g.key} className="mb-3">
            <Text
              className="text-caption font-semibold tracking-[0.4px] uppercase px-4 py-1.5 text-ink-3"
              numberOfLines={1}
            >
              {g.date} · {g.dow}
            </Text>
            {g.notes.map((n) => {
              const active = n.id === selectedId;
              const title = noteTitleOrFallback(n);
              return (
                <SwipeToDelete
                  key={n.id}
                  open={openSwipeId === n.id}
                  onOpen={() => setOpenSwipeId(n.id)}
                  onClose={() => setOpenSwipeId(null)}
                  onDelete={() => {
                    setOpenSwipeId(null);
                    onDelete(n.id);
                  }}
                  deleteLabel={`${title} 노트 삭제`}
                >
                  <Pressable
                    onPress={() => {
                      if (openSwipeId === n.id) setOpenSwipeId(null);
                      else onSelect(n.id);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={title}
                    accessibilityActions={[
                      { name: "delete", label: `${title} 노트 삭제` },
                    ]}
                    onAccessibilityAction={(event) => {
                      if (event.nativeEvent.actionName === "delete") {
                        onDelete(n.id);
                      }
                    }}
                    className={`px-4 py-2 gap-0.5 ${
                      active ? "bg-accent-soft" : "bg-paper"
                    }`}
                  >
                    <Text
                      className="font-semibold text-ink text-label"
                      numberOfLines={1}
                    >
                      {title}
                    </Text>
                    <View className="flex-row items-center gap-1.5">
                      <Text className="font-medium text-ink-3 text-caption">
                        {formatTime(n.createdAt)}
                      </Text>
                      {n.citedRefs[0] && (
                        <>
                          <Text className="text-ink-4">·</Text>
                          <Text className="font-semibold text-accent text-caption">
                            {formatRef(n.citedRefs[0])}
                          </Text>
                        </>
                      )}
                    </View>
                  </Pressable>
                </SwipeToDelete>
              );
            })}
          </View>
        ))}
        {groups.length === 0 && (
          <Text className="text-label text-center pt-[30px] text-ink-3">
            노트가 없습니다
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

// ⚠️ 28px — 44px 기준 미달(drift B22). 값을 옮기기만 했다.
const ICON_BTN = "size-7 items-center justify-center rounded-6";
