import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { NoteEditor } from "@/editor/NoteEditor";
import { useAutoSave } from "@/editor/useAutoSave";
import { EditorKeyboardToolbar } from "@/editor/EditorKeyboardToolbar";
import { BibleBrowser } from "@/browser/BibleBrowser";
import { lookupVerses } from "@/parser/verse-lookup";
import { openNoteRepo } from "@/db/expo-adapter";
import { useAppStore } from "@/state/app-store";
import { exportNote } from "@/share/export-note";
import { extractCitedRefs } from "@/editor/cited-refs";
import { useTheme, scaled } from "@/theme/ThemeProvider";
import type { BlockNode } from "@/domain/types";

const DEFAULT_RECENTS = ["창 1:1", "엡 2:8", "시 23:1"];

export default function NoteEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, fontScale } = useTheme();
  const [title, setTitle] = useState<string | null>(null);
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

  const handleChangeTitle = useCallback((next: string) => {
    setTitle(next.length === 0 ? null : next);
  }, []);

  const insertVerseFromBrowser = useCallback((ref: string) => {
    const verses = lookupVerses(ref);
    if (!verses) return;
    setBody((b) => [
      ...b,
      { type: "quote", ref, verses, status: "loaded" },
      { type: "paragraph", text: "" },
    ]);
  }, []);

  useEffect(() => {
    if (!id) return;
    useAppStore.getState().setCurrentNoteId(id);
    return () => {
      const cur = useAppStore.getState().currentNoteId;
      if (cur === id) useAppStore.getState().setCurrentNoteId(null);
    };
  }, [id]);

  useEffect(() => {
    if (!ready) return;
    const pending = useAppStore.getState().consumePendingInsert();
    if (!pending) return;
    insertVerseFromBrowser(pending);
  }, [ready, insertVerseFromBrowser]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const repo = await openNoteRepo();
      const note = await repo.findById(id);
      if (cancelled) return;
      if (note) {
        setTitle(note.title);
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

  const recents = useMemo<string[]>(() => {
    const refs = extractCitedRefs(body);
    if (refs.length === 0) return DEFAULT_RECENTS;
    return refs.slice(-3).reverse();
  }, [body]);

  if (!ready) return null;
  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={[styles.toolbar, { borderBottomColor: colors.rule }]}>
        <Pressable
          onPress={handleExport}
          accessibilityRole="button"
          accessibilityLabel="노트 공유"
          hitSlop={12}
          style={styles.toolbarBtn}
        >
          <Text style={[styles.toolbarIcon, { color: colors.ink2 }]}>↑</Text>
        </Pressable>
        <Pressable
          onPress={() => setBrowserOpen((b) => !b)}
          accessibilityRole="button"
          accessibilityLabel="성경 브라우저 열기"
          hitSlop={12}
          style={styles.toolbarBtn}
        >
          <Text style={[styles.toolbarIcon, { color: colors.ink2 }]}>📖</Text>
        </Pressable>
      </View>
      {saveErr && (
        <View style={[styles.errBanner, { backgroundColor: colors.errBg }]}>
          <Text style={{ color: colors.errText }}>{saveErr}</Text>
        </View>
      )}
      <TextInput
        style={[
          styles.titleInput,
          {
            color: colors.ink,
            fontSize: scaled(24, fontScale),
            lineHeight: scaled(32, fontScale),
          },
        ]}
        value={title ?? ""}
        onChangeText={handleChangeTitle}
        placeholder="제목"
        placeholderTextColor={colors.ink3}
        accessibilityLabel="노트 제목"
        returnKeyType="next"
        maxLength={120}
      />
      <NoteEditor body={body} onChangeBody={setBody} />
      <EditorKeyboardToolbar
        recents={recents}
        onInsertRef={insertVerseFromBrowser}
        onOpenBrowser={() => setBrowserOpen(true)}
      />
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
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toolbarBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  toolbarIcon: { fontSize: 20 },
  errBanner: { padding: 8 },
  titleInput: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    fontWeight: "700",
  },
});
