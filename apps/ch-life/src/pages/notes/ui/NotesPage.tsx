import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  SectionList,
  Pressable,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  useWindowDimensions,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BookOpen, Download, Search, Settings } from "lucide-react-native";
import {
  groupNotesByDay,
  useNoteRepo,
  type Note,
  type NoteGroup,
} from "@/entities/note";
import { createBlankNote } from "@/features/note/create";
import { deleteNoteWithUndo, useNoteDeleteStore } from "@/features/note/delete";
import { useNoteImport } from "@/features/note/import";
import { useNoteSearch } from "@/features/note/search";
import { TABLET_BREAKPOINT } from "@/shared/lib";
import {
  AppHeader,
  HeaderBrand,
  HeaderIconButton,
  scaled,
  useTheme,
} from "@/shared/ui";
import { NoteCard } from "./NoteCard";
import { TabletWorkspace } from "./TabletWorkspace";

type Section = {
  key: string;
  date: string;
  dow: string;
  data: Note[];
};

function toSections(groups: readonly NoteGroup[]): Section[] {
  return groups.map((g) => ({
    key: g.key,
    date: g.date,
    dow: g.dow,
    data: g.notes,
  }));
}

export function NotesPage() {
  const { width } = useWindowDimensions();
  // Tablet keeps its own panel chrome; phone gets the custom AppHeader.
  return width >= TABLET_BREAKPOINT ? <TabletWorkspace /> : <PhoneNotesList />;
}

function PhoneNotesList() {
  const router = useRouter();
  const { colors, fontScale } = useTheme();
  const insets = useSafeAreaInsets();
  const searchRef = useRef<TextInput>(null);
  const repo = useNoteRepo();
  const { runImport } = useNoteImport(repo);
  const noteRevision = useNoteDeleteStore((state) => state.noteRevision);
  const [notes, setNotes] = useState<Note[]>([]);
  const [query, setQuery] = useState("");
  const { results, setResults } = useNoteSearch(repo, query, noteRevision);
  const [openSwipeId, setOpenSwipeId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setNotes(await repo.listRecent({ limit: 200 }));
    setOpenSwipeId(null);
  }, [repo]);

  useEffect(() => {
    reload().catch((error) =>
      console.warn("revision reload failed", error),
    );
  }, [noteRevision, reload]);

  const handleImport = useCallback(async () => {
    const { summary, message } = await runImport();
    if (summary && summary.imported > 0) await reload();
    // Surface feedback only when a file was actually picked (skip silent cancels).
    const acted = summary
      ? summary.imported > 0 || summary.skipped > 0
      : Boolean(message);
    if (acted) Alert.alert("가져오기", message);
  }, [runImport, reload]);

  useFocusEffect(
    useCallback(() => {
      reload().catch((e) => console.warn("reload failed", e));
    }, [reload]),
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setOpenSwipeId(null);
      const deleted = await deleteNoteWithUndo(repo, id);
      if (!deleted) return;
      setNotes((previous) => previous.filter((note) => note.id !== id));
      setResults((previous) =>
        previous?.filter((note) => note.id !== id) ?? null,
      );
    },
    [repo, setResults],
  );

  const createNote = useCallback(async () => {
    const id = await createBlankNote(repo);
    router.push(`/note/${id}`);
  }, [repo, router]);

  const data = results ?? notes;
  const isSearching = results !== null;

  const sections = useMemo<Section[]>(
    () => toSections(groupNotesByDay(data)),
    [data],
  );

  const subtitleText = useMemo(() => {
    if (data.length === 0) return "노트 없음";
    const month = new Date().getMonth() + 1;
    return `최근 ${data.length}편 · ${month}월`;
  }, [data.length]);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <AppHeader
        left={<HeaderBrand label="설교 노트" />}
        right={
          <>
            <HeaderIconButton
              icon={BookOpen}
              label="성경 읽기"
              onPress={() => router.push("/bible")}
            />
            <HeaderIconButton
              icon={Search}
              label="노트 검색"
              onPress={() => searchRef.current?.focus()}
            />
            <HeaderIconButton
              icon={Download}
              label="마크다운 노트 가져오기"
              onPress={handleImport}
            />
            <HeaderIconButton
              icon={Settings}
              label="설정"
              onPress={() => router.push("/settings")}
            />
          </>
        }
      />
      <SectionList
        sections={sections}
        keyExtractor={(n) => n.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 120 + insets.bottom },
        ]}
        ListHeaderComponent={
          <View>
            <View style={styles.listHead}>
              <Text
                style={[
                  styles.listTitle,
                  { color: colors.ink, fontSize: scaled(30, fontScale) },
                ]}
              >
                노트
              </Text>
              <Text
                style={[
                  styles.listSub,
                  { color: colors.ink3, fontSize: scaled(13, fontScale) },
                ]}
              >
                {subtitleText}
              </Text>
            </View>
            <View
              style={[styles.searchBar, { backgroundColor: colors.chipBg }]}
            >
              <TextInput
                ref={searchRef}
                style={[styles.searchInput, { color: colors.ink }]}
                value={query}
                onChangeText={setQuery}
                placeholder="검색 — 제목, 본문, 인용"
                placeholderTextColor={colors.ink3}
                accessibilityLabel="노트 검색"
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
              />
            </View>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.groupHead}>
            <Text
              style={[
                styles.groupDate,
                { color: colors.ink, fontSize: scaled(22, fontScale) },
              ]}
            >
              {section.date}
            </Text>
            <Text
              style={[
                styles.groupDow,
                { color: colors.ink3, fontSize: scaled(13, fontScale) },
              ]}
            >
              {section.dow}
            </Text>
            <View
              style={[styles.groupCount, { backgroundColor: colors.chipBg }]}
            >
              <Text
                style={[
                  styles.groupCountText,
                  { color: colors.ink3, fontSize: scaled(11, fontScale) },
                ]}
              >
                {section.data.length}
              </Text>
            </View>
          </View>
        )}
        renderItem={({ item, index }) => (
          <NoteCard
            note={item}
            isFirst={index === 0}
            onPress={() => router.push(`/note/${item.id}`)}
            swipeOpen={openSwipeId === item.id}
            onSwipeOpen={() => setOpenSwipeId(item.id)}
            onSwipeClose={() =>
              setOpenSwipeId((current) =>
                current === item.id ? null : current,
              )
            }
            onDelete={() => void handleDelete(item.id)}
          />
        )}
        ListEmptyComponent={
          isSearching ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.ink3 }]}>
                검색 결과 없음
              </Text>
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.ink3 }]}>
                첫 번째 설교 노트를 시작하세요
              </Text>
              <Pressable
                style={[styles.startBtn, { backgroundColor: colors.ink }]}
                onPress={createNote}
                accessibilityRole="button"
                accessibilityLabel="시작하기"
              >
                <Text style={[styles.startBtnText, { color: colors.paper }]}>
                  시작하기
                </Text>
              </Pressable>
            </View>
          )
        }
      />
      <Pressable
        style={[
          styles.fab,
          { backgroundColor: colors.ink, bottom: 24 + insets.bottom },
        ]}
        onPress={createNote}
        accessibilityRole="button"
        accessibilityLabel="새 노트"
      >
        <Text style={[styles.fabText, { color: colors.paper }]}>＋</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  listContent: { paddingBottom: 120 },
  listHead: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 12,
  },
  listTitle: {
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  listSub: {
    marginTop: 4,
  },
  searchBar: {
    marginHorizontal: 22,
    marginBottom: 18,
    paddingHorizontal: 12,
    borderRadius: 10,
    minHeight: 40,
    justifyContent: "center",
  },
  searchInput: {
    paddingVertical: 8,
    fontSize: 14,
    minHeight: 40,
  },
  groupHead: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 8,
    gap: 10,
  },
  groupDate: { fontWeight: "700", letterSpacing: -0.4 },
  groupDow: {},
  groupCount: {
    marginLeft: "auto",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    alignSelf: "center",
  },
  groupCountText: { fontWeight: "600" },
  empty: { alignItems: "center", paddingTop: 120, gap: 16 },
  emptyText: { fontSize: 18 },
  startBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    minHeight: 48,
    justifyContent: "center",
  },
  startBtnText: { fontSize: 16, fontWeight: "600" },
  fab: {
    position: "absolute",
    right: 18,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  fabText: { fontSize: 28, lineHeight: 32, fontWeight: "300" },
});
