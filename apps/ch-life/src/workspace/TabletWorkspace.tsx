import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { openNoteRepo } from "@/db/expo-adapter";
import { useAppStore } from "@/state/app-store";
import { useTheme, scaled } from "@/theme/ThemeProvider";
import { NoteEditor } from "@/editor/NoteEditor";
import { useAutoSave } from "@/editor/useAutoSave";
import { extractCitedRefs } from "@/editor/cited-refs";
import { lookupVerses } from "@/parser/verse-lookup";
import { exportNote } from "@/share/export-note";
import { noteTitleOrFallback } from "@/list/group-notes";
import type { BlockNode, Note } from "@/domain/types";
import { NoteListSidebar } from "./NoteListSidebar";
import { BibleLookupPanel } from "./BibleLookupPanel";
import { PanelRail } from "./PanelRail";

function monthLabel(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
}

function dayLabel(ts: number): string {
  const d = new Date(ts);
  return `${d.getDate()}일`;
}

export function TabletWorkspace() {
  const { colors, fontScale, fontStack } = useTheme();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [body, setBody] = useState<BlockNode[]>([
    { type: "paragraph", text: "" },
  ]);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  // Initial load — fetch notes, pick first as active.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const repo = await openNoteRepo();
      const list = await repo.listRecent({ limit: 200 });
      if (cancelled) return;
      setNotes(list);
      const first = list[0];
      if (first) {
        setSelectedId(first.id);
        setTitle(first.title);
        setBody(
          first.body.length ? first.body : [{ type: "paragraph", text: "" }],
        );
      }
    })().catch((e) => console.warn("workspace load failed", e));
    return () => {
      cancelled = true;
    };
  }, []);

  // When the user switches the active note, load it fresh.
  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    (async () => {
      const repo = await openNoteRepo();
      const n = await repo.findById(selectedId);
      if (cancelled || !n) return;
      setTitle(n.title);
      setBody(n.body.length ? n.body : [{ type: "paragraph", text: "" }]);
      useAppStore.getState().setCurrentNoteId(n.id);
    })().catch((e) => console.warn("note load failed", e));
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const save = useCallback(
    async (patch: {
      title: string | null;
      body: BlockNode[];
      citedRefs: string[];
    }) => {
      if (!selectedId) return;
      const repo = await openNoteRepo();
      await repo.update(selectedId, patch);
      setNotes((prev) =>
        prev.map((n) =>
          n.id === selectedId
            ? {
                ...n,
                title: patch.title,
                body: patch.body,
                citedRefs: patch.citedRefs,
                updatedAt: Date.now(),
              }
            : n,
        ),
      );
      setSaveErr(null);
    },
    [selectedId],
  );

  useAutoSave({
    title,
    body,
    save,
    onError: (e) => {
      console.warn("autosave failed", e);
      setSaveErr("저장 실패");
    },
  });

  const insertRef = useCallback((ref: string) => {
    const verses = lookupVerses(ref);
    if (!verses) return;
    setBody((b) => [
      ...b,
      { type: "quote", ref, verses, status: "loaded" },
      { type: "paragraph", text: "" },
    ]);
  }, []);

  const createNote = useCallback(async () => {
    const repo = await openNoteRepo();
    const id = await repo.create({
      title: null,
      body: [{ type: "paragraph", text: "" }],
      citedRefs: [],
    });
    const fresh = await repo.listRecent({ limit: 200 });
    setNotes(fresh);
    setSelectedId(id);
  }, []);

  const handleExport = useCallback(async () => {
    if (!selectedId) return;
    try {
      const repo = await openNoteRepo();
      const fresh = await repo.findById(selectedId);
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
  }, [selectedId, body, title]);

  const activeNote = useMemo(
    () => notes.find((n) => n.id === selectedId) ?? null,
    [notes, selectedId],
  );

  const breadcrumbMonth = activeNote ? monthLabel(activeNote.createdAt) : "";
  const breadcrumbDay = activeNote ? dayLabel(activeNote.createdAt) : "";
  const breadcrumbTitle = activeNote
    ? noteTitleOrFallback(activeNote)
    : "노트 선택";

  const citedRefs = useMemo(() => extractCitedRefs(body), [body]);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      {leftOpen ? (
        <View style={styles.leftPane}>
          <NoteListSidebar
            notes={notes}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onCreate={createNote}
            onCollapse={() => setLeftOpen(false)}
          />
        </View>
      ) : (
        <PanelRail
          side="left"
          label="노트"
          glyph="≡"
          onExpand={() => setLeftOpen(true)}
        />
      )}

      <View style={styles.centerPane}>
        <View style={[styles.centerHead, { borderBottomColor: colors.rule }]}>
          <View style={styles.breadcrumb}>
            {!leftOpen && (
              <Pressable
                onPress={() => setLeftOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="노트 목록 펼치기"
                hitSlop={8}
                style={styles.crumbBtn}
              >
                <Text style={[styles.crumbBtnText, { color: colors.ink2 }]}>
                  ≡
                </Text>
              </Pressable>
            )}
            {breadcrumbMonth ? (
              <>
                <Text style={[styles.crumb, { color: colors.ink3 }]}>
                  {breadcrumbMonth}
                </Text>
                <Text style={[styles.crumbChev, { color: colors.ink4 }]}>
                  ›
                </Text>
                <Text style={[styles.crumb, { color: colors.ink3 }]}>
                  {breadcrumbDay}
                </Text>
                <Text style={[styles.crumbChev, { color: colors.ink4 }]}>
                  ›
                </Text>
              </>
            ) : null}
            <Text
              style={[styles.crumbActive, { color: colors.ink }]}
              numberOfLines={1}
            >
              {breadcrumbTitle}
            </Text>
          </View>
          <View style={styles.centerActions}>
            <Pressable
              onPress={handleExport}
              accessibilityRole="button"
              accessibilityLabel="노트 공유"
              hitSlop={8}
              style={styles.crumbBtn}
            >
              <Text style={[styles.crumbBtnText, { color: colors.ink2 }]}>
                ↑
              </Text>
            </Pressable>
            {!rightOpen && (
              <Pressable
                onPress={() => setRightOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="성경 보기 펼치기"
                hitSlop={8}
                style={styles.crumbBtn}
              >
                <Text
                  style={[styles.crumbBtnText, { color: colors.accent }]}
                >
                  ◧
                </Text>
              </Pressable>
            )}
          </View>
        </View>
        {saveErr && (
          <View style={[styles.errBanner, { backgroundColor: colors.errBg }]}>
            <Text style={{ color: colors.errText }}>{saveErr}</Text>
          </View>
        )}
        {selectedId ? (
          <>
            <TextInput
              style={[
                styles.titleInput,
                {
                  color: colors.ink,
                  fontFamily: fontStack,
                  fontSize: scaled(24, fontScale),
                  lineHeight: scaled(32, fontScale),
                },
              ]}
              value={title ?? ""}
              onChangeText={(t) => setTitle(t.length === 0 ? null : t)}
              placeholder="제목"
              placeholderTextColor={colors.ink3}
              accessibilityLabel="노트 제목"
              maxLength={120}
            />
            <NoteEditor body={body} onChangeBody={setBody} />
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.ink3 }]}>
              왼쪽에서 노트를 선택하거나 새 노트를 만드세요
            </Text>
            <Pressable
              onPress={createNote}
              accessibilityRole="button"
              accessibilityLabel="새 노트 만들기"
              style={[styles.startBtn, { backgroundColor: colors.ink }]}
            >
              <Text style={[styles.startBtnText, { color: colors.paper }]}>
                새 노트
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {rightOpen ? (
        <View
          style={[
            styles.rightPane,
            { borderLeftColor: colors.rule },
          ]}
        >
          <BibleLookupPanel
            citedRefs={citedRefs}
            onInsert={insertRef}
            onCollapse={() => setRightOpen(false)}
          />
        </View>
      ) : (
        <PanelRail
          side="right"
          label="성경"
          glyph="✦"
          onExpand={() => setRightOpen(true)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: "row" },
  leftPane: { width: 280 },
  centerPane: { flex: 1 },
  rightPane: {
    width: 340,
    borderLeftWidth: StyleSheet.hairlineWidth,
  },
  centerHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  crumb: { fontSize: 12, fontWeight: "500" },
  crumbChev: { fontSize: 12 },
  crumbActive: { fontSize: 13, fontWeight: "600", flex: 1 },
  crumbBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  crumbBtnText: { fontSize: 15 },
  centerActions: { flexDirection: "row", gap: 4 },
  errBanner: { paddingHorizontal: 20, paddingVertical: 8 },
  titleInput: {
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 8,
    fontWeight: "700",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  emptyText: { fontSize: 14 },
  startBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  startBtnText: { fontWeight: "600", fontSize: 14 },
});
