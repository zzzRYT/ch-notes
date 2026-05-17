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
import type { Note } from "@/domain/types";

export default function NotesList() {
  const router = useRouter();
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

  // 검색 디바운스 200ms
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
    <View style={styles.root}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="검색 (제목·인용)"
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
              <Text style={styles.emptyText}>검색 결과 없음</Text>
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>첫 번째 설교 노트를 시작하세요</Text>
              <Pressable
                style={styles.startBtn}
                onPress={createNote}
                accessibilityRole="button"
                accessibilityLabel="시작하기"
              >
                <Text style={styles.startBtnText}>시작하기</Text>
              </Pressable>
            </View>
          )
        }
      />
      <Pressable
        style={styles.fab}
        onPress={createNote}
        accessibilityRole="button"
        accessibilityLabel="새 노트"
      >
        <Text style={styles.fabText}>＋</Text>
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
    borderColor: "#eee",
  },
  searchInput: {
    backgroundColor: "#f4f4f4",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 40,
  },
  empty: { alignItems: "center", paddingTop: 120, gap: 16 },
  emptyText: { fontSize: 18, color: "#666" },
  startBtn: {
    backgroundColor: "#222",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    minHeight: 48,
    justifyContent: "center",
  },
  startBtnText: { color: "white", fontSize: 16 },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 36,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#222",
    alignItems: "center",
    justifyContent: "center",
  },
  fabText: { color: "white", fontSize: 32, lineHeight: 36 },
});
