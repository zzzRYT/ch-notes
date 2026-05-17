import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { NoteEditor } from "@/editor/NoteEditor";
import { useAutoSave } from "@/editor/useAutoSave";
import { openNoteRepo } from "@/db/expo-adapter";
import type { BlockNode } from "@/domain/types";

export default function NoteEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [title, _setTitle] = useState<string | null>(null);
  const [body, setBody] = useState<BlockNode[]>([
    { type: "paragraph", text: "" },
  ]);
  const [ready, setReady] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);

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
    <View style={styles.root}>
      {saveErr && (
        <View style={styles.errBanner}>
          <Text style={styles.errText}>{saveErr}</Text>
        </View>
      )}
      <NoteEditor body={body} onChangeBody={setBody} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  errBanner: { backgroundColor: "#fde2e1", padding: 8 },
  errText: { color: "#c8342a" },
});
