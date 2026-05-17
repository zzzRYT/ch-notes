import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  FlatList,
  Pressable,
  Text,
  TextInput,
  StyleSheet,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { openNoteRepo } from "@/db/expo-adapter";
import { NoteCard } from "@/list/NoteCard";
import { useTheme } from "@/theme/ThemeProvider";
import type { Note } from "@/domain/types";

export default function NotesList() {
  const router = useRouter();
  const { colors } = useTheme();
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

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={[styles.searchBar, { borderColor: colors.line }]}>
        <TextInput
          style={[
            styles.searchInput,
            { backgroundColor: colors.chipBg, color: colors.text },
          ]}
          value={query}
          onChangeText={setQuery}
          placeholder="검색 (제목·인용)"
          placeholderTextColor={colors.subtle}
          accessibilityLabel="노트 검색"
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>
      <FlatList
        data={data}
        keyExtractor={(n) => n.id}
        renderItem={({ item }) => (
          <NoteCard
            note={item}
            onPress={() => router.push(`/note/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          isSearching ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.subtle }]}>
                검색 결과 없음
              </Text>
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.subtle }]}>
                첫 번째 설교 노트를 시작하세요
              </Text>
              <Pressable
                style={[styles.startBtn, { backgroundColor: colors.accent }]}
                onPress={createNote}
                accessibilityRole="button"
                accessibilityLabel="시작하기"
              >
                <Text style={[styles.startBtnText, { color: colors.accentText }]}>
                  시작하기
                </Text>
              </Pressable>
            </View>
          )
        }
      />
      <Pressable
        style={[styles.fab, { backgroundColor: colors.accent }]}
        onPress={createNote}
        accessibilityRole="button"
        accessibilityLabel="새 노트"
      >
        <Text style={[styles.fabText, { color: colors.accentText }]}>＋</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  searchBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  searchInput: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 40,
  },
  empty: { alignItems: "center", paddingTop: 120, gap: 16 },
  emptyText: { fontSize: 18 },
  startBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    minHeight: 48,
    justifyContent: "center",
  },
  startBtnText: { fontSize: 16 },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 36,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  fabText: { fontSize: 32, lineHeight: 36 },
});
