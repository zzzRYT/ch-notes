import React, { useMemo, useState, useEffect, useRef } from "react";
import { View, Text, Pressable, FlatList, TextInput } from "react-native";
import {
  BOOKS_META,
  findBookMeta,
  type BookCode,
  type BookMeta,
  type Testament,
} from "@/entities/scripture";
import { ChapterGrid } from "./ChapterGrid";
import { VerseList, type InsertMode } from "./VerseList";
import { resolveBrowserQuery } from "../lib/browser-search";
import { levelFromRef } from "../lib/level-from-ref";

export type BrowserLevel =
  | { kind: "books" }
  | { kind: "chapters"; book: BookCode }
  | { kind: "verses"; book: BookCode; chapter: number };

type Props = {
  /** Omitted in read-only mode (`insertMode="none"`). */
  onInsertVerse?: (ref: string) => void;
  insertMode?: InsertMode;
  initialRef?: string | null;
  onPositionChange?: (book: BookCode, chapter: number) => void;
  onTitleChange?: (title: string, canGoBack: boolean) => void;
};

export function BibleReader({
  onInsertVerse,
  insertMode,
  initialRef,
  onPositionChange,
  onTitleChange,
}: Props) {
  const [level, setLevel] = useState<BrowserLevel>(() =>
    levelFromRef(initialRef),
  );
  const [testament, setTestament] = useState<Testament>("OT");
  const [search, setSearch] = useState("");
  const seeded = useRef(initialRef != null);

  // Handle late-arriving initialRef once
  useEffect(() => {
    if (!seeded.current && initialRef != null) {
      seeded.current = true;
      setLevel(levelFromRef(initialRef));
    }
  }, [initialRef]);

  // Report position changes
  useEffect(() => {
    if (level.kind === "verses") {
      onPositionChange?.(level.book, level.chapter);
    }
  }, [level, onPositionChange]);

  // Report title changes
  useEffect(() => {
    const headerTitle =
      level.kind === "books"
        ? "성경"
        : level.kind === "chapters"
          ? (findBookMeta(level.book)?.nameKo ?? level.book)
          : `${findBookMeta(level.book)?.nameKo ?? level.book} ${level.chapter}장`;
    const canGoBack = level.kind !== "books";
    onTitleChange?.(headerTitle, canGoBack);
  }, [level, onTitleChange]);

  const onSubmitSearch = () => {
    const r = resolveBrowserQuery(search);
    if (!r) return;
    if (r.kind === "book") setLevel({ kind: "chapters", book: r.book });
    else if (r.kind === "chapter")
      setLevel({ kind: "verses", book: r.book, chapter: r.chapter });
    else if (r.kind === "verse")
      setLevel({ kind: "verses", book: r.book, chapter: r.chapter });
    setSearch("");
  };

  const onBack = () => {
    if (level.kind === "chapters") setLevel({ kind: "books" });
    else if (level.kind === "verses")
      setLevel({ kind: "chapters", book: level.book });
  };

  const filteredBooks = useMemo(
    () => BOOKS_META.filter((m) => m.testament === testament),
    [testament],
  );

  const showBackBtn = level.kind !== "books";

  return (
    <View className="flex-1">
      {showBackBtn && (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          hitSlop={12}
          className="px-4 py-3 min-h-12 justify-center"
        >
          <Text className="text-body text-ink-2">← 뒤로</Text>
        </Pressable>
      )}

      {level.kind === "books" && (
        <>
          <View className="px-3 pt-3">
            <TextInput
              className="bg-chip-bg rounded-8 px-3 py-2 text-body min-h-10 text-ink"
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={onSubmitSearch}
              placeholder="책·장·절 (예: 골 3:20)"
              placeholderTextColorClassName="text-ink-3"
              accessibilityLabel="성경 검색"
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="go"
            />
          </View>
          <View className="flex-row px-3 py-3 gap-2">
            <SegmentBtn
              label="구약"
              active={testament === "OT"}
              onPress={() => setTestament("OT")}
            />
            <SegmentBtn
              label="신약"
              active={testament === "NT"}
              onPress={() => setTestament("NT")}
            />
          </View>
          <FlatList
            data={filteredBooks}
            keyExtractor={(m) => m.code}
            renderItem={({ item }) => (
              <BookRow
                meta={item}
                onPress={() =>
                  setLevel({ kind: "chapters", book: item.code })
                }
              />
            )}
          />
        </>
      )}

      {level.kind === "chapters" && (
        <ChapterGrid
          book={level.book}
          onSelect={(chapter) =>
            setLevel({ kind: "verses", book: level.book, chapter })
          }
        />
      )}

      {level.kind === "verses" && (
        <VerseList
          book={level.book}
          chapter={level.chapter}
          insertMode={insertMode}
          onInsert={onInsertVerse}
          onChangeChapter={(chapter) =>
            setLevel({ kind: "verses", book: level.book, chapter })
          }
        />
      )}
    </View>
  );
}

function SegmentBtn({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 py-3 rounded-full items-center justify-center min-h-12 ${
        active ? "bg-ink" : "bg-chip-bg"
      }`}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      <Text
        className={`text-body ${
          active ? "text-paper font-semibold" : "text-ink-2"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function BookRow({
  meta,
  onPress,
}: {
  meta: BookMeta;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between px-4 py-3.5 border-b border-rule min-h-12"
      accessibilityRole="button"
      accessibilityLabel={meta.nameKo}
    >
      <Text className="text-body text-ink">{meta.nameKo}</Text>
      <Text className="text-label text-ink-3">{meta.code}</Text>
    </Pressable>
  );
}
