import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  TextInput,
} from "react-native";
import type { BookCode } from "@/parser/book-map";
import {
  BOOKS_META,
  findBookMeta,
  type BookMeta,
  type Testament,
} from "./books-meta";
import { ChapterGrid } from "./ChapterGrid";
import { VerseList, type InsertMode } from "./VerseList";
import { resolveBrowserQuery } from "./browser-search";
import { levelFromRef } from "./level-from-ref";

export type BrowserLevel =
  | { kind: "books" }
  | { kind: "chapters"; book: BookCode }
  | { kind: "verses"; book: BookCode; chapter: number };

type Props = {
  onInsertVerse: (ref: string) => void;
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
    <View style={styles.body}>
      {showBackBtn && (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          hitSlop={12}
          style={styles.inlineBack}
        >
          <Text style={styles.inlineBackText}>← 뒤로</Text>
        </Pressable>
      )}

      {level.kind === "books" && (
        <>
          <View style={styles.searchWrap}>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={onSubmitSearch}
              placeholder="책·장·절 (예: 골 3:20)"
              accessibilityLabel="성경 검색"
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="go"
            />
          </View>
          <View style={styles.segment}>
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
          onInsert={(ref) => onInsertVerse(ref)}
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
      style={[styles.segmentBtn, active && styles.segmentBtnActive]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
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
      style={styles.bookRow}
      accessibilityRole="button"
      accessibilityLabel={meta.nameKo}
    >
      <Text style={styles.bookName}>{meta.nameKo}</Text>
      <Text style={styles.bookCode}>{meta.code}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  inlineBack: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    justifyContent: "center",
  },
  inlineBackText: { fontSize: 15, color: "#555" },
  searchWrap: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  searchInput: {
    backgroundColor: "#f4f4f4",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    minHeight: 40,
  },
  segment: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  segmentBtnActive: { backgroundColor: "#222" },
  segmentText: { color: "#555", fontSize: 15 },
  segmentTextActive: { color: "white", fontWeight: "600" },
  bookRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#f4f4f4",
    minHeight: 48,
  },
  bookName: { fontSize: 16, color: "#111" },
  bookCode: { fontSize: 13, color: "#999" },
});
