import React, { useMemo } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
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
    <View className="flex-1">
      <View className="flex-row items-center justify-between px-3 py-2 border-b border-rule">
        <Pressable
          onPress={() => canPrev && onChangeChapter(chapter - 1)}
          disabled={!canPrev}
          accessibilityRole="button"
          accessibilityLabel="이전 장"
          className={`${NAV_BTN} ${canPrev ? "" : "opacity-30"}`}
        >
          <Text className={NAV_TEXT}>← 이전</Text>
        </Pressable>
        <Text className="text-body font-semibold text-ink">
          {nameKo} {chapter}장
        </Text>
        <Pressable
          onPress={() => canNext && onChangeChapter(chapter + 1)}
          disabled={!canNext}
          accessibilityRole="button"
          accessibilityLabel="다음 장"
          className={`${NAV_BTN} ${canNext ? "" : "opacity-30"}`}
        >
          <Text className={NAV_TEXT}>다음 →</Text>
        </Pressable>
      </View>

      {verses.length === 0 ? (
        <ScrollView contentContainerClassName="p-6 items-center">
          <Text className="text-ink-3">
            {nameKo} {chapter}장 본문이 아직 없습니다
          </Text>
        </ScrollView>
      ) : (
        <FlatList
          data={verses}
          keyExtractor={(v) => String(v.num)}
          renderItem={({ item }) => (
            <View className="flex-row items-start px-4 py-2.5 border-b border-rule gap-2">
              <Text className="w-7 text-ink-3 tabular-nums">{item.num}</Text>
              <Text className="flex-1 text-body-large leading-[1.5] text-ink font-body">
                {item.text}
              </Text>
              {insertMode !== "none" && (
                <Pressable
                  onPress={() => onInsert?.(`${nameKo} ${chapter}:${item.num}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`${nameKo} ${chapter}:${item.num} 노트에 인용`}
                  hitSlop={8}
                  className="size-8 rounded-16 bg-ink items-center justify-center"
                >
                  <Text className="text-paper text-[18px] leading-[22px]">＋</Text>
                </Pressable>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const NAV_BTN = "px-3 py-3 min-h-12 justify-center";
const NAV_TEXT = "text-ink-2 text-label";
