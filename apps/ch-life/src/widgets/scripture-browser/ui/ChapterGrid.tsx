import React, { useMemo } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import {
  chapterCount,
  findBookMeta,
  type BookCode,
} from "@/entities/scripture";

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
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-ink-3 text-center">
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
      contentContainerClassName="p-3 gap-2"
      columnWrapperClassName="gap-2"
      renderItem={({ item }) => (
        <Pressable
          className="flex-1 aspect-square bg-chip-bg rounded-8 items-center justify-center min-h-12"
          onPress={() => onSelect(item)}
          accessibilityRole="button"
          accessibilityLabel={`${meta?.nameKo ?? book} ${item}장`}
        >
          <Text className="text-body text-ink">{item}</Text>
        </Pressable>
      )}
    />
  );
}

