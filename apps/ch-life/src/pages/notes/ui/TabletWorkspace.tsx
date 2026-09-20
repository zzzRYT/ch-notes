import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Trash2 } from "lucide-react-native";
import {
  extractCitedRefs,
  noteTitleOrFallback,
  useNoteRepo,
  type Note,
} from "@/entities/note";
import { createBlankNote } from "@/features/note/create";
import { deleteNoteWithUndo, useNoteDeleteStore } from "@/features/note/delete";
import { exportNote } from "@/features/note/export";
import { useNoteImport } from "@/features/note/import";
import { showFeedback } from "@/shared/lib";
import { useTheme } from "@/shared/ui";
import {
  NoteEditor,
  SermonMetaHeader,
  useNoteDraft,
  type NoteDraftPatch,
} from "@/widgets/note-editor";
import { NoteListSidebar } from "./NoteListSidebar";
import { BiblePanel } from "./BiblePanel";
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
  const { colors } = useTheme();
  const router = useRouter();
  const repo = useNoteRepo();
  const { runImport } = useNoteImport(repo);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deletingRef = useRef(false);
  const noteRevision = useNoteDeleteStore((state) => state.noteRevision);

  // 저장이 끝나면 사이드바 캐시도 같은 값으로 맞춘다 — 다시 읽지 않는다.
  const handleSaved = useCallback((id: string, patch: NoteDraftPatch) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n,
      ),
    );
  }, []);

  const draft = useNoteDraft({
    repo,
    noteId: selectedId,
    enabled: deletingId !== selectedId,
    onSaved: handleSaved,
    saveErrorMessage: "저장 실패",
  });
  const {
    title,
    body,
    sermonDate,
    preacher,
    location,
    scripture,
    saveErr,
    setSaveErr,
    flush: flushAutoSave,
    insertRef,
    snapshot,
  } = draft;

  // Reload after note deletion/restoration, selecting a restored note first.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await repo.listRecent({ limit: 200 });
      if (cancelled) return;
      setNotes(list);
      const restoredId = useNoteDeleteStore.getState().lastRestoredNoteId;
      setSelectedId((current) => {
        if (restoredId && list.some((note) => note.id === restoredId)) {
          return restoredId;
        }
        if (current && list.some((note) => note.id === current)) return current;
        return list[0]?.id ?? null;
      });
    })().catch((e) => console.warn("workspace load failed", e));
    return () => {
      cancelled = true;
    };
  }, [repo, noteRevision]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (deletingRef.current) return;
      deletingRef.current = true;
      setDeletingId(id);
      try {
        if (id === selectedId) {
          await flushAutoSave();
        }

        const deleted = await deleteNoteWithUndo(repo, id);
        if (deleted) {
          const remaining = notes.filter((note) => note.id !== id);
          setNotes(remaining);
          if (selectedId === id) setSelectedId(remaining[0]?.id ?? null);
        }
      } catch (error) {
        if (id === selectedId) {
          console.warn("save before delete failed", error);
          showFeedback({
            message: "저장 중 오류가 발생해 노트를 삭제하지 못했습니다",
            tone: "error",
            durationMs: 3000,
          });
        }
      } finally {
        deletingRef.current = false;
        setDeletingId(null);
      }
    },
    [repo, selectedId, flushAutoSave, notes],
  );

  const createNote = useCallback(async () => {
    const id = await createBlankNote(repo);
    const fresh = await repo.listRecent({ limit: 200 });
    setNotes(fresh);
    setSelectedId(id);
  }, [repo]);

  const handleImport = useCallback(async () => {
    const { summary, message } = await runImport();
    if (summary && summary.imported > 0) {
      setNotes(await repo.listRecent({ limit: 200 }));
    }
    const acted = summary
      ? summary.imported > 0 || summary.skipped > 0
      : Boolean(message);
    if (acted) Alert.alert("가져오기", message);
  }, [repo, runImport]);

  const handleExport = useCallback(async () => {
    if (!selectedId) return;
    try {
      const fresh = await repo.findById(selectedId);
      if (!fresh) return;
      await exportNote({ ...fresh, ...snapshot() });
    } catch (e) {
      console.warn("export failed", e);
      setSaveErr("공유 실패");
    }
  }, [repo, selectedId, snapshot, setSaveErr]);

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
            onDelete={(id) => void handleDelete(id)}
            onCreate={createNote}
            onImport={handleImport}
            onSettings={() => router.push("/settings")}
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
            {selectedId && (
              <Pressable
                onPress={() => void handleDelete(selectedId)}
                disabled={deletingId !== null}
                accessibilityRole="button"
                accessibilityLabel="현재 노트 삭제"
                style={styles.deleteBtn}
              >
                <Trash2 size={17} color={colors.errText} strokeWidth={1.8} />
              </Pressable>
            )}
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
            <SermonMetaHeader
              title={title}
              sermonDate={sermonDate}
              preacher={preacher}
              location={location}
              scripture={scripture}
              onChangeTitle={draft.setTitle}
              onChangeSermonDate={draft.setSermonDate}
              onChangePreacher={draft.setPreacher}
              onChangeLocation={draft.setLocation}
              onChangeScripture={draft.setScripture}
            />
            <NoteEditor body={body} onChangeBody={draft.setBody} />
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
          <BiblePanel
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
  deleteBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  centerActions: { flexDirection: "row", gap: 4 },
  errBanner: { paddingHorizontal: 20, paddingVertical: 8 },
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
