import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTheme, scaled } from "@/theme/ThemeProvider";
import { QuoteBlock } from "@/editor/QuoteBlock";
import { lookupVerses } from "@/parser/verse-lookup";
import { suggestBooks } from "./book-suggest";

type Props = {
  citedRefs: ReadonlyArray<string>;
  onInsert: (ref: string) => void;
  onCollapse: () => void;
};

const RECENT_REFS = [
  "요 3:16",
  "시 23:1-4",
  "마 5:3-12",
  "롬 8:28",
  "빌 4:13",
  "엡 2:8-10",
];

export function BibleLookupPanel({ citedRefs, onInsert, onCollapse }: Props) {
  const { colors, fontScale } = useTheme();
  const [query, setQuery] = useState("");
  const trimmed = query.trim();

  const resolved = useMemo(() => {
    if (!trimmed) return null;
    const verses = lookupVerses(trimmed);
    return verses ? { ref: trimmed, verses } : null;
  }, [trimmed]);

  const suggestions = useMemo(
    () => (resolved ? [] : suggestBooks(trimmed)),
    [resolved, trimmed],
  );

  const showCited = !trimmed;
  const showEmpty = trimmed && !resolved;

  return (
    <View style={[styles.root, { backgroundColor: colors.paper }]}>
      <View style={[styles.head, { borderBottomColor: colors.rule }]}>
        <Text style={[styles.title, { color: colors.ink }]}>성경 보기</Text>
        <Pressable
          onPress={onCollapse}
          accessibilityRole="button"
          accessibilityLabel="성경 보기 접기"
          hitSlop={10}
          style={styles.iconBtn}
        >
          <Text style={[styles.iconBtnText, { color: colors.ink2 }]}>›</Text>
        </Pressable>
      </View>
      <View style={[styles.searchWrap, { backgroundColor: colors.chipBg }]}>
        <Text style={[styles.searchIcon, { color: colors.ink3 }]}>⌕</Text>
        <TextInput
          style={[
            styles.searchInput,
            {
              color: colors.ink,
              fontSize: scaled(14, fontScale),
            },
          ]}
          value={query}
          onChangeText={setQuery}
          placeholder="창1:1 · 시 23 · 마5:3-12"
          placeholderTextColor={colors.ink3}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          accessibilityLabel="성경 참조 검색"
        />
        {!!query && (
          <Pressable
            onPress={() => setQuery("")}
            accessibilityRole="button"
            accessibilityLabel="검색어 지우기"
            hitSlop={6}
            style={styles.clearBtn}
          >
            <Text style={[styles.clearText, { color: colors.ink3 }]}>✕</Text>
          </Pressable>
        )}
      </View>
      {suggestions.length > 0 && (
        <View style={styles.suggestRow}>
          {suggestions.map((b) => (
            <Pressable
              key={b.code}
              onPress={() => setQuery(`${b.shortKo} `)}
              accessibilityRole="button"
              accessibilityLabel={`${b.fullKo} 책 선택`}
              style={[styles.suggestChip, { backgroundColor: colors.chipBg }]}
            >
              <Text style={[styles.suggestShort, { color: colors.ink }]}>
                {b.shortKo}
              </Text>
              <Text style={[styles.suggestFull, { color: colors.ink3 }]}>
                {b.fullKo}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {resolved && (
          <View style={styles.resultBlock}>
            <Text style={[styles.sectionLabel, { color: colors.ink3 }]}>
              검색 결과
            </Text>
            <QuoteBlock
              {...{
                type: "quote" as const,
                ref: resolved.ref,
                verses: resolved.verses,
                status: "loaded" as const,
              }}
            />
            <Pressable
              onPress={() => {
                onInsert(resolved.ref);
                setQuery("");
              }}
              accessibilityRole="button"
              accessibilityLabel="노트에 인용 삽입"
              style={[styles.insertBtn, { borderColor: colors.accent }]}
            >
              <Text style={[styles.insertText, { color: colors.accent }]}>
                ＋ 노트에 삽입
              </Text>
            </Pressable>
          </View>
        )}
        {showEmpty && (
          <View style={styles.emptyBlock}>
            <Text style={[styles.emptyTitle, { color: colors.ink2 }]}>
              참조를 인식하지 못했어요
            </Text>
            <Text style={[styles.emptyHint, { color: colors.ink3 }]}>
              예: 창1:1 · 창세기 1:1-5 · 시 23
            </Text>
          </View>
        )}
        {showCited && (
          <View>
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionLabel, { color: colors.ink3 }]}>
                현재 노트의 인용
              </Text>
              <View
                style={[styles.countPill, { backgroundColor: colors.chipBg }]}
              >
                <Text style={[styles.countText, { color: colors.ink3 }]}>
                  {citedRefs.length}
                </Text>
              </View>
            </View>
            {citedRefs.length === 0 && (
              <Text style={[styles.emptyHint, { color: colors.ink3 }]}>
                아직 인용이 없습니다. 본문에 창1:1 처럼 입력해 보세요.
              </Text>
            )}
            {citedRefs.map((ref) => {
              const verses = lookupVerses(ref);
              if (!verses) return null;
              return (
                <QuoteBlock
                  key={ref}
                  {...{
                    type: "quote" as const,
                    ref,
                    verses,
                    status: "loaded" as const,
                  }}
                />
              );
            })}
            <Text
              style={[
                styles.sectionLabel,
                { color: colors.ink3, marginTop: 18 },
              ]}
            >
              최근
            </Text>
            <View style={styles.recentRow}>
              {RECENT_REFS.map((r) => (
                <Pressable
                  key={r}
                  onPress={() => setQuery(r)}
                  accessibilityRole="button"
                  accessibilityLabel={`${r} 검색`}
                  style={[
                    styles.recentChip,
                    { backgroundColor: colors.chipBg },
                  ]}
                >
                  <Text style={[styles.recentText, { color: colors.ink2 }]}>
                    {r}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 15, fontWeight: "600" },
  iconBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  iconBtnText: { fontSize: 18 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 12,
    marginTop: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    minHeight: 40,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, paddingVertical: 8 },
  clearBtn: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  clearText: { fontSize: 12 },
  suggestRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 6,
  },
  suggestChip: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  suggestShort: { fontWeight: "600", fontSize: 12 },
  suggestFull: { fontSize: 11 },
  scroll: { flex: 1 },
  scrollContent: { padding: 12, gap: 8, paddingBottom: 40 },
  resultBlock: { gap: 8 },
  sectionLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontWeight: "600",
    marginBottom: 4,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  countPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  countText: { fontSize: 10, fontWeight: "600" },
  insertBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  insertText: { fontWeight: "600", fontSize: 13 },
  emptyBlock: { paddingVertical: 12, gap: 4 },
  emptyTitle: { fontSize: 13, fontWeight: "600" },
  emptyHint: { fontSize: 12 },
  recentRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  recentChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  recentText: { fontSize: 12, fontWeight: "500" },
});
