import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { NoteEditor } from "@/editor/NoteEditor";
import { useAutoSave } from "@/editor/useAutoSave";
import { BibleBrowser } from "@/browser/BibleBrowser";
import { lookupVerses } from "@/parser/verse-lookup";
import { openNoteRepo } from "@/db/expo-adapter";
import { useAppStore } from "@/state/app-store";
import { exportNote } from "@/share/export-note";
import { extractCitedRefs } from "@/editor/cited-refs";
import { useTheme } from "@/theme/ThemeProvider";
import type { BlockNode } from "@/domain/types";

export default function NoteEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const [title, _setTitle] = useState<string | null>(null);
  const [body, setBody] = useState<BlockNode[]>([
    { type: "paragraph", text: "" },
  ]);
  const [ready, setReady] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [browserOpen, setBrowserOpen] = useState(false);

  const handleExport = useCallback(async () => {
    if (!id) return;
    try {
      const repo = await openNoteRepo();
      const fresh = await repo.findById(id);
      if (!fresh) return;
      await exportNote({
        ...fresh,
        body,
        title,
        citedRefs: extractCitedRefs(body),
      });
    } catch (e) {
      console.warn("export failed", e);
      setSaveErr("공유 실패");
    }
  }, [id, body, title]);

  const insertVerseFromBrowser = useCallback((ref: string) => {
    const verses = lookupVerses(ref);
    if (!verses) return;
    setBody((b) => [
      ...b,
      { type: "quote", ref, verses, status: "loaded" },
      { type: "paragraph", text: "" },
    ]);
  }, []);

  // 에디터 진입/종료 시 currentNoteId 동기화
  useEffect(() => {
    if (!id) return;
    useAppStore.getState().setCurrentNoteId(id);
    return () => {
      // 다른 노트 진입 또는 목록 복귀 시 클리어
      const cur = useAppStore.getState().currentNoteId;
      if (cur === id) useAppStore.getState().setCurrentNoteId(null);
    };
  }, [id]);

  // ready 직후 pendingInsertRef 소비 (외부 진입점이 큐잉한 경우)
  useEffect(() => {
    if (!ready) return;
    const pending = useAppStore.getState().consumePendingInsert();
    if (!pending) return;
    insertVerseFromBrowser(pending);
  }, [ready, insertVerseFromBrowser]);

  // 노트 로드
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const repo = await openNoteRepo();
      const note = await repo.findById(id);
      if (cancelled) return;
      if (note) {
        _setTitle(note.title);
        setBody(
          note.body.length ? note.body : [{ type: "paragraph", text: "" }],
        );
      }
      setReady(true);
    })().catch((e) => {
      console.warn("load failed", e);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const save = useCallback(
    async (patch: {
      title: string | null;
      body: BlockNode[];
      citedRefs: string[];
    }) => {
      if (!id) return;
      const repo = await openNoteRepo();
      await repo.update(id, patch);
      setSaveErr(null);
    },
    [id],
  );

  const onError = useMemo(
    () => (e: unknown) => {
      console.warn("autosave failed", e);
      setSaveErr("저장 실패. 다시 시도 중...");
    },
    [],
  );

  useAutoSave({ title, body, save, onError });

  if (!ready) return null;
  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={styles.toolbar}>
        <Pressable
          onPress={handleExport}
          accessibilityRole="button"
          accessibilityLabel="노트 공유"
          hitSlop={12}
          style={styles.toolbarBtn}
        >
          <Text style={[styles.toolbarIcon, { color: colors.text }]}>📤</Text>
        </Pressable>
        <Pressable
          onPress={() => setBrowserOpen((b) => !b)}
          accessibilityRole="button"
          accessibilityLabel="성경 브라우저 열기"
          hitSlop={12}
          style={styles.toolbarBtn}
        >
          <Text style={[styles.toolbarIcon, { color: colors.text }]}>📖</Text>
        </Pressable>
      </View>
      {saveErr && (
        <View style={[styles.errBanner, { backgroundColor: colors.errBg }]}>
          <Text style={{ color: colors.errText }}>{saveErr}</Text>
        </View>
      )}
      <NoteEditor body={body} onChangeBody={setBody} />
      <BibleBrowser
        visible={browserOpen}
        onClose={() => setBrowserOpen(false)}
        onInsertVerse={insertVerseFromBrowser}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  toolbar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  toolbarBtn: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  toolbarIcon: { fontSize: 24 },
  errBanner: { padding: 8 },
});
