import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  SectionList,
  Pressable,
  Text,
  TextInput,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Search, Settings } from "lucide-react-native";
import { openNoteRepo } from "@/db/expo-adapter";
import { NoteCard } from "@/list/NoteCard";
import { groupNotesByDay, type NoteGroup } from "@/list/group-notes";
import { useTheme, scaled } from "@/theme/ThemeProvider";
import { AppHeader } from "@/chrome/AppHeader";
import { HeaderBrand, HeaderIconButton } from "@/chrome/HeaderControls";
import { TabletWorkspace } from "@/workspace/TabletWorkspace";
import type { Note } from "@/domain/types";

const TABLET_BREAKPOINT = 900;

type Section = {
  key: string;
  date: string;
  dow: string;
  data: Note[];
};

function toSections(groups: ReadonlyArray<NoteGroup>): Section[] {
  return groups.map((g) => ({
    key: g.key,
    date: g.date,
    dow: g.dow,
    data: g.notes,
  }));
}

export default function NotesList() {
  const { width } = useWindowDimensions();
  // Tablet keeps its own panel chrome; phone gets the custom AppHeader.
  return width >= TABLET_BREAKPOINT ? <TabletWorkspace /> : <PhoneNotesList />;
}

function PhoneNotesList() {
  const router = useRouter();
  const { colors, fontScale } = useTheme();
  const searchRef = useRef<TextInput>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Note[] | null>(null);

  const reload = useCallback(async () => {
    const repo = await openNoteRepo();
    setNotes(await repo.listRecent({ limit: 200 }));
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload().catch((e) => console.warn("reload failed", e));
    }, [reload]),
  );

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults(null);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const repo = await openNoteRepo();
        setResults(await repo.searchNotes(q));
      } catch (e) {
        console.warn("search failed", e);
        setResults([]);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  const createNote = useCallback(async () => {
    const repo = await openNoteRepo();
    const id = await repo.create({
      title: null,
      body: [{ type: "paragraph", text: "" }],
      citedRefs: [],
    });
    router.push(`/note/${id}`);
  }, [router]);

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
              icon={Search}
              label="노트 검색"
              onPress={() => searchRef.current?.focus()}
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
        contentContainerStyle={styles.listContent}
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
        style={[styles.fab, { backgroundColor: colors.ink }]}
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
    bottom: 36,
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
