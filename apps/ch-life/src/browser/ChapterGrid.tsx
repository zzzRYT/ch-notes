import React, { useMemo } from "react";
import { FlatList, Pressable, Text, StyleSheet, View } from "react-native";
import type { BookCode } from "@/parser/book-map";
import { chapterCount, findBookMeta } from "./books-meta";

type Props = {
  book: BookCode;
  onSelect: (chapter: number) => void;
};

export function ChapterGrid({ book, onSelect }: Props) {
  const count = chapterCount(book);
  const meta = findBookMeta(book);
  const data = useMemo(
    () => Array.from({ length: count }, (_, i) => i + 1),
    [count],
  );

  if (count === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          {meta?.nameKo ?? book}의 장 데이터가 아직 없습니다
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(n) => String(n)}
      numColumns={4}
      contentContainerStyle={styles.gridContent}
      columnWrapperStyle={styles.columnWrap}
      renderItem={({ item }) => (
        <Pressable
          style={styles.cell}
          onPress={() => onSelect(item)}
          accessibilityRole="button"
          accessibilityLabel={`${meta?.nameKo ?? book} ${item}장`}
        >
          <Text style={styles.cellText}>{item}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  gridContent: { padding: 12, gap: 8 },
  columnWrap: { gap: 8 },
  cell: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: "#f4f4f4",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  cellText: { fontSize: 16, color: "#111" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyText: { color: "#888", textAlign: "center" },
});
