import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Download, Settings } from "lucide-react-native";
import { useTheme, scaled } from "@/theme/ThemeProvider";
import {
  groupNotesByDay,
  formatTime,
  noteTitleOrFallback,
} from "@/list/group-notes";
import type { Note } from "@/domain/types";
import { formatRef } from "@/parser/format-ref";

type Props = {
  notes: ReadonlyArray<Note>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onImport: () => void;
  onSettings: () => void;
  onCollapse: () => void;
};

export function NoteListSidebar({
  notes,
  selectedId,
  onSelect,
  onCreate,
  onImport,
  onSettings,
  onCollapse,
}: Props) {
  const { colors, fontScale } = useTheme();
  const [query, setQuery] = useState("");

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
    <View
      style={[
        styles.root,
        { backgroundColor: colors.paper, borderRightColor: colors.rule },
      ]}
    >
      <View style={styles.head}>
        <Text style={[styles.title, { color: colors.ink }]}>노트</Text>
        <View style={styles.headActions}>
          <Pressable
            onPress={onCreate}
            accessibilityRole="button"
            accessibilityLabel="새 노트"
            hitSlop={10}
            style={styles.iconBtn}
          >
            <Text style={[styles.iconBtnText, { color: colors.accent }]}>
              ＋
            </Text>
          </Pressable>
          <Pressable
            onPress={onImport}
            accessibilityRole="button"
            accessibilityLabel="마크다운 노트 가져오기"
            hitSlop={10}
            style={styles.iconBtn}
          >
            <Download size={16} color={colors.ink2} strokeWidth={1.8} />
          </Pressable>
          <Pressable
            onPress={onSettings}
            accessibilityRole="button"
            accessibilityLabel="설정"
            hitSlop={10}
            style={styles.iconBtn}
          >
            <Settings size={16} color={colors.ink2} strokeWidth={1.8} />
          </Pressable>
          <Pressable
            onPress={onCollapse}
            accessibilityRole="button"
            accessibilityLabel="노트 목록 접기"
            hitSlop={10}
            style={styles.iconBtn}
          >
            <Text style={[styles.iconBtnText, { color: colors.ink2 }]}>‹</Text>
          </Pressable>
        </View>
      </View>
      <View
        style={[styles.searchWrap, { backgroundColor: colors.chipBg }]}
      >
        <Text style={[styles.searchIcon, { color: colors.ink3 }]}>⌕</Text>
        <TextInput
          style={[
            styles.searchInput,
            { color: colors.ink, fontSize: scaled(13, fontScale) },
          ]}
          value={query}
          onChangeText={setQuery}
          placeholder="검색 — 제목, 인용"
          placeholderTextColor={colors.ink3}
          autoCorrect={false}
          autoCapitalize="none"
          accessibilityLabel="노트 검색"
        />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {groups.map((g) => (
          <View key={g.key} style={styles.group}>
            <Text
              style={[styles.groupLabel, { color: colors.ink3 }]}
              numberOfLines={1}
            >
              {g.date} · {g.dow}
            </Text>
            {g.notes.map((n) => {
              const active = n.id === selectedId;
              return (
                <Pressable
                  key={n.id}
                  onPress={() => onSelect(n.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={noteTitleOrFallback(n)}
                  style={[
                    styles.item,
                    {
                      backgroundColor: active ? colors.accentSoft : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.itemTitle,
                      {
                        color: colors.ink,
                        fontSize: scaled(13, fontScale),
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {noteTitleOrFallback(n)}
                  </Text>
                  <View style={styles.itemMeta}>
                    <Text
                      style={[
                        styles.itemMetaText,
                        { color: colors.ink3, fontSize: scaled(11, fontScale) },
                      ]}
                    >
                      {formatTime(n.createdAt)}
                    </Text>
                    {n.citedRefs[0] && (
                      <>
                        <Text style={{ color: colors.ink4 }}>·</Text>
                        <Text
                          style={[
                            styles.itemPassage,
                            { color: colors.accent, fontSize: scaled(11, fontScale) },
                          ]}
                        >
                          {formatRef(n.citedRefs[0])}
                        </Text>
                      </>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
        {groups.length === 0 && (
          <Text style={[styles.emptyText, { color: colors.ink3 }]}>
            노트가 없습니다
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, borderRightWidth: StyleSheet.hairlineWidth },
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  title: { fontSize: 16, fontWeight: "700", letterSpacing: -0.2 },
  headActions: { flexDirection: "row", gap: 4 },
  iconBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  iconBtnText: { fontSize: 16, fontWeight: "600" },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    minHeight: 36,
  },
  searchIcon: { fontSize: 13 },
  searchInput: { flex: 1, paddingVertical: 6 },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 8, paddingBottom: 40 },
  group: { marginBottom: 12 },
  groupLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 2,
  },
  itemTitle: { fontWeight: "600" },
  itemMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  itemMetaText: { fontWeight: "500" },
  itemPassage: { fontWeight: "600" },
  emptyText: { fontSize: 13, textAlign: "center", paddingTop: 30 },
});
