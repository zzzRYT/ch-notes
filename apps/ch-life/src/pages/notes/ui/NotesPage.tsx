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
import { AppHeader, HeaderBrand, HeaderIconButton } from "@/shared/ui";
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
    <View className="flex-1 bg-bg">
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
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
        ListHeaderComponent={
          <View>
            <View className="px-5.5 pt-3 pb-3">
              <Text className="font-extrabold tracking-[-0.5px] text-ink text-display">
                노트
              </Text>
              <Text className="mt-1 text-ink-3 text-label">{subtitleText}</Text>
            </View>
            <View className="mx-5.5 mb-[18px] px-3 rounded-10 min-h-10 justify-center bg-chip-bg">
              <TextInput
                ref={searchRef}
                className="py-2 text-label min-h-10 text-ink"
                value={query}
                onChangeText={setQuery}
                placeholder="검색 — 제목, 본문, 인용"
                placeholderTextColorClassName="text-ink-3"
                accessibilityLabel="노트 검색"
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
              />
            </View>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View className="flex-row items-baseline px-5.5 pt-5.5 pb-2 gap-2.5">
            <Text className="font-bold tracking-[-0.4px] text-ink text-title">
              {section.date}
            </Text>
            <Text className="text-ink-3 text-label">{section.dow}</Text>
            <View className="ml-auto px-2 py-0.5 rounded-full self-center bg-chip-bg">
              <Text className="font-semibold text-ink-3 text-caption">
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
            <View className={EMPTY}>
              <Text className={EMPTY_TEXT}>검색 결과 없음</Text>
            </View>
          ) : (
            <View className={EMPTY}>
              <Text className={EMPTY_TEXT}>첫 번째 설교 노트를 시작하세요</Text>
              <Pressable
                className="px-6 py-3 rounded-full min-h-12 justify-center bg-ink"
                onPress={createNote}
                accessibilityRole="button"
                accessibilityLabel="시작하기"
              >
                <Text className="text-body font-semibold text-paper">
                  시작하기
                </Text>
              </Pressable>
            </View>
          )
        }
      />
      <Pressable
        className="absolute right-[18px] size-fab rounded-full items-center justify-center bg-ink"
        style={[styles.fabShadow, { bottom: 24 + insets.bottom }]}
        onPress={createNote}
        accessibilityRole="button"
        accessibilityLabel="새 노트"
      >
        {/* ＋ 글리프는 icon/glyph/fab 28 고정 */}
        <Text className="text-[28px] leading-[32px] font-light text-paper">＋</Text>
      </Pressable>
    </View>
  );
}

const EMPTY = "items-center pt-[120px] gap-4";
const EMPTY_TEXT = "text-body-large text-ink-3";

// 그림자는 iOS(shadow*)와 Android(elevation)가 갈려 style로 남긴다.
const styles = StyleSheet.create({
  fabShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
