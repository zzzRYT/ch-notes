import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  FlatList,
} from "react-native";
import type { BookCode } from "@/parser/book-map";
import { useResponsiveLayout } from "./useResponsiveLayout";
import {
  BOOKS_META,
  findBookMeta,
  type BookMeta,
  type Testament,
} from "./books-meta";
import { ChapterGrid } from "./ChapterGrid";

export type BrowserLevel =
  | { kind: "books" }
  | { kind: "chapters"; book: BookCode }
  | { kind: "verses"; book: BookCode; chapter: number };

type Props = {
  visible: boolean;
  onClose: () => void;
  onInsertVerse: (ref: string) => void;
};

export function BibleBrowser({ visible, onClose, onInsertVerse: _onInsertVerse }: Props) {
  const { mode } = useResponsiveLayout();
  const [level, setLevel] = useState<BrowserLevel>({ kind: "books" });
  const [testament, setTestament] = useState<Testament>("OT");

  const filteredBooks = useMemo(
    () => BOOKS_META.filter((m) => m.testament === testament),
    [testament],
  );

  const headerTitle =
    level.kind === "books"
      ? "성경"
      : level.kind === "chapters"
        ? (findBookMeta(level.book)?.nameKo ?? level.book)
        : `${findBookMeta(level.book)?.nameKo ?? level.book} ${level.chapter}장`;

  const showBackBtn = level.kind !== "books";

  const onBack = () => {
    if (level.kind === "chapters") setLevel({ kind: "books" });
    else if (level.kind === "verses")
      setLevel({ kind: "chapters", book: level.book });
  };

  const body = (
    <View style={styles.body}>
      <View style={styles.header}>
        {showBackBtn ? (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="뒤로"
            hitSlop={12}
            style={styles.headerBtn}
          >
            <Text style={styles.headerBtnText}>←</Text>
          </Pressable>
        ) : (
          <View style={styles.headerBtn} />
        )}
        <Text style={styles.headerTitle} numberOfLines={1}>
          {headerTitle}
        </Text>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="브라우저 닫기"
          hitSlop={12}
          style={styles.headerBtn}
        >
          <Text style={styles.headerBtnText}>✕</Text>
        </Pressable>
      </View>

      {level.kind === "books" && (
        <>
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
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            {level.book} {level.chapter}장 절 (Lv3 — Task 3.4c)
          </Text>
        </View>
      )}
    </View>
  );

  if (mode === "sidebar") {
    if (!visible) return null;
    return <View style={styles.sidebar}>{body}</View>;
  }
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.sheetBackdrop}>
        <Pressable style={styles.backdropTap} onPress={onClose} />
        <View style={styles.sheet}>{body}</View>
      </View>
    </Modal>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBtnText: { fontSize: 20, color: "#555" },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  segment: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
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
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  placeholderText: { color: "#666" },
  sidebar: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "33%",
    backgroundColor: "white",
    borderLeftWidth: 1,
    borderColor: "#eee",
  },
  sheetBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  backdropTap: { flex: 1 },
  sheet: {
    height: "70%",
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});
