import React, { useMemo } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  chapterCount,
  chapterVerses,
  findBookMeta,
  type BookCode,
} from "@/entities/scripture";

export type InsertMode = "currentNote" | "none";

type Props = {
  book: BookCode;
  chapter: number;
  insertMode?: InsertMode;
  /** Omitted in read-only mode (`insertMode="none"`); the insert button isn't rendered then. */
  onInsert?: (ref: string) => void;
  onChangeChapter: (chapter: number) => void;
};

type VerseRow = { num: number; text: string };

export function VerseList({
  book,
  chapter,
  insertMode = "currentNote",
  onInsert,
  onChangeChapter,
}: Props) {
  const meta = findBookMeta(book);
  const nameKo = meta?.nameKo ?? book;
  const verses = useMemo<VerseRow[]>(
    () => chapterVerses(book, chapter),
    [book, chapter],
  );

  const maxChapter = chapterCount(book);
  const canPrev = chapter > 1;
  const canNext = chapter < maxChapter;

  return (
    <View style={styles.root}>
      <View style={styles.navBar}>
        <Pressable
          onPress={() => canPrev && onChangeChapter(chapter - 1)}
          disabled={!canPrev}
          accessibilityRole="button"
          accessibilityLabel="이전 장"
          style={[styles.navBtn, !canPrev && styles.navBtnDisabled]}
        >
          <Text style={styles.navText}>← 이전</Text>
        </Pressable>
        <Text style={styles.navTitle}>
          {nameKo} {chapter}장
        </Text>
        <Pressable
          onPress={() => canNext && onChangeChapter(chapter + 1)}
          disabled={!canNext}
          accessibilityRole="button"
          accessibilityLabel="다음 장"
          style={[styles.navBtn, !canNext && styles.navBtnDisabled]}
        >
          <Text style={styles.navText}>다음 →</Text>
        </Pressable>
      </View>

      {verses.length === 0 ? (
        <ScrollView contentContainerStyle={styles.empty}>
          <Text style={styles.emptyText}>
            {nameKo} {chapter}장 본문이 아직 없습니다
          </Text>
        </ScrollView>
      ) : (
        <FlatList
          data={verses}
          keyExtractor={(v) => String(v.num)}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.num}>{item.num}</Text>
              <Text style={styles.text}>{item.text}</Text>
              {insertMode !== "none" && (
                <Pressable
                  onPress={() => onInsert?.(`${nameKo} ${chapter}:${item.num}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`${nameKo} ${chapter}:${item.num} 노트에 인용`}
                  hitSlop={8}
                  style={styles.insertBtn}
                >
                  <Text style={styles.insertBtnText}>＋</Text>
                </Pressable>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  navBtn: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 48,
    justifyContent: "center",
  },
  navBtnDisabled: { opacity: 0.3 },
  navText: { color: "#222", fontSize: 14 },
  navTitle: { fontSize: 15, fontWeight: "600" },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#f4f4f4",
    gap: 8,
  },
  num: { width: 28, color: "#888", fontVariant: ["tabular-nums"] },
  text: { flex: 1, fontSize: 16, lineHeight: 24, color: "#111" },
  insertBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#222",
    alignItems: "center",
    justifyContent: "center",
  },
  insertBtnText: { color: "white", fontSize: 18, lineHeight: 22 },
  empty: { padding: 24, alignItems: "center" },
  emptyText: { color: "#888" },
});
