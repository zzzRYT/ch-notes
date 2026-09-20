import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert, Pressable, Text, View } from "react-native";
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
  // lucide 아이콘 색만 prop으로.
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
    <View className="flex-1 flex-row bg-bg">
      {leftOpen ? (
        <View className="w-pane-left">
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

      <View className="flex-1">
        <View className="flex-row items-center justify-between px-5 py-3 border-b-hairline border-rule gap-3">
          <View className="flex-row items-center gap-1.5 flex-1">
            {!leftOpen && (
              <Pressable
                onPress={() => setLeftOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="노트 목록 펼치기"
                hitSlop={8}
                className={CRUMB_BTN}
              >
                <Text className={`${CRUMB_GLYPH} text-ink-2`}>≡</Text>
              </Pressable>
            )}
            {breadcrumbMonth ? (
              <>
                <Text className={CRUMB}>{breadcrumbMonth}</Text>
                <Text className={CRUMB_CHEV}>›</Text>
                <Text className={CRUMB}>{breadcrumbDay}</Text>
                <Text className={CRUMB_CHEV}>›</Text>
              </>
            ) : null}
            <Text
              className="text-label font-semibold flex-1 text-ink"
              numberOfLines={1}
            >
              {breadcrumbTitle}
            </Text>
          </View>
          <View className="flex-row gap-1">
            {selectedId && (
              <Pressable
                onPress={() => void handleDelete(selectedId)}
                disabled={deletingId !== null}
                accessibilityRole="button"
                accessibilityLabel="현재 노트 삭제"
                className="size-10 items-center justify-center rounded-8"
              >
                <Trash2 size={17} color={colors.errText} strokeWidth={1.8} />
              </Pressable>
            )}
            <Pressable
              onPress={handleExport}
              accessibilityRole="button"
              accessibilityLabel="노트 공유"
              hitSlop={8}
              className={CRUMB_BTN}
            >
              <Text className={`${CRUMB_GLYPH} text-ink-2`}>↑</Text>
            </Pressable>
            {!rightOpen && (
              <Pressable
                onPress={() => setRightOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="성경 보기 펼치기"
                hitSlop={8}
                className={CRUMB_BTN}
              >
                <Text className={`${CRUMB_GLYPH} text-accent`}>◧</Text>
              </Pressable>
            )}
          </View>
        </View>
        {saveErr && (
          <View className="px-5 py-2 bg-err-bg">
            <Text className="text-err-text">{saveErr}</Text>
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
          <View className="flex-1 items-center justify-center gap-4">
            <Text className="text-label text-ink-3">
              왼쪽에서 노트를 선택하거나 새 노트를 만드세요
            </Text>
            <Pressable
              onPress={createNote}
              accessibilityRole="button"
              accessibilityLabel="새 노트 만들기"
              className="px-5 py-3 rounded-full bg-ink"
            >
              <Text className="font-semibold text-label text-paper">새 노트</Text>
            </Pressable>
          </View>
        )}
      </View>

      {rightOpen ? (
        <View className="w-pane-right border-l-hairline border-rule">
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

// 브레드크럼 글리프(≡ ↑ ◧)는 아이콘 — 고정 크기. ⚠️ 28px 버튼은 44px 기준 미달(drift B22).
const CRUMB = "text-caption font-medium text-ink-3";
const CRUMB_CHEV = "text-[12px] text-ink-4";
const CRUMB_BTN = "size-7 items-center justify-center rounded-6";
const CRUMB_GLYPH = "text-[15px]";
