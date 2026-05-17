import React, { useCallback, useState } from "react";
import {
  View,
  FlatList,
  Pressable,
  Text,
  StyleSheet,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { getDb } from "@/db";
import { makeNoteRepo, type DbAdapter } from "@/db/note-repo";
import { NoteCard } from "@/list/NoteCard";
import type { Note } from "@/domain/types";

function adapterFromExpoDb(db: Awaited<ReturnType<typeof getDb>>): DbAdapter {
  return {
    execAsync: (sql: string) => db.execAsync(sql),
    runAsync: async (sql, params = []) => {
      await db.runAsync(sql, params as never);
    },
    getAllAsync: async <T,>(sql: string, params: unknown[] = []) =>
      (await db.getAllAsync(sql, params as never)) as T[],
    getFirstAsync: async <T,>(sql: string, params: unknown[] = []) => {
      const r = await db.getFirstAsync(sql, params as never);
      return (r as T | null) ?? null;
    },
  };
}

export default function NotesList() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);

  const reload = useCallback(async () => {
    const db = await getDb();
    const repo = makeNoteRepo(adapterFromExpoDb(db));
    setNotes(await repo.listRecent({ limit: 200 }));
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload().catch((e) => console.warn("reload failed", e));
    }, [reload]),
  );

  const createNote = useCallback(async () => {
    const db = await getDb();
    const repo = makeNoteRepo(adapterFromExpoDb(db));
    const id = await repo.create({
      title: null,
      body: [{ type: "paragraph", text: "" }],
      citedRefs: [],
    });
    router.push(`/note/${id}`);
  }, [router]);

  return (
    <View style={styles.root}>
      <FlatList
        data={notes}
        keyExtractor={(n) => n.id}
        renderItem={({ item }) => (
          <NoteCard
            note={item}
            onPress={() => router.push(`/note/${item.id}`)}
          />
        )}
        ListEmptyComponent={
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
