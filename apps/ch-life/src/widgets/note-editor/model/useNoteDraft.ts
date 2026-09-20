import { useCallback, useEffect, useRef, useState } from "react";
import {
  extractCitedRefs,
  type BlockNode,
  type Note,
  type NoteRepo,
} from "@/entities/note";
import { useAutoSave } from "@/features/note/autosave";
import { insertVerse } from "@/features/scripture/insert";
import { showFeedback } from "@/shared/lib";

const EMPTY_BODY = (): BlockNode[] => [{ type: "paragraph", text: "" }];

/** 자동저장이 저장소에 쓰는 필드 묶음 — `Note`에서 식별자·시각을 뺀 것. */
export type NoteDraftPatch = Omit<Note, "id" | "createdAt" | "updatedAt">;

export type NoteDraftStatus =
  /** 아직 아무 노트도 요청하지 않았다(`noteId === null`). */
  | "idle"
  | "loading"
  | "loaded"
  /** 저장소에 없는 id. 편집은 되지만 저장하지 않는다. */
  | "missing";

type Options = {
  repo: NoteRepo;
  noteId: string | null;
  /** 삭제 진행 중처럼 자동저장을 잠시 멈춰야 할 때 false. */
  enabled?: boolean;
  /** 저장이 끝난 뒤 — 태블릿이 목록 캐시를 갱신하는 데 쓴다. */
  onSaved?: (id: string, patch: NoteDraftPatch) => void;
  saveErrorMessage: string;
};

/**
 * 노트 한 편의 편집 상태. 폰 에디터 화면과 태블릿 작업공간이 같은 훅을 쓴다 —
 * 불러오기 → 필드 상태 → 자동저장(`features/note/autosave`) → 성경 삽입
 * (`features/scripture/insert`)까지가 한 묶음이다(ADR-0024 "Widget이 조합").
 *
 * `noteId`가 바뀌면 이전 노트의 자동저장은 `enabled`가 꺼지며 취소된다.
 * 화면을 떠나기 전에 반드시 저장해야 하면 `flush()`를 기다린다.
 */
export function useNoteDraft({
  repo,
  noteId,
  enabled = true,
  onSaved,
  saveErrorMessage,
}: Options) {
  const [title, setTitle] = useState<string | null>(null);
  const [sermonDate, setSermonDate] = useState<string | null>(null);
  const [preacher, setPreacher] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [scripture, setScripture] = useState<string | null>(null);
  const [body, setBodyState] = useState<BlockNode[]>(EMPTY_BODY);
  const [status, setStatus] = useState<NoteDraftStatus>("idle");
  // status가 어느 id의 것인지 — id를 바꾸는 순간 옛 노트의 저장이 새 id로 가면 안 된다.
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  // 삽입 콜백은 안정적이어야 하므로(브라우저 시트가 props로 받는다) 본문은 ref로도 든다.
  const bodyRef = useRef(body);

  const setBody = useCallback((next: BlockNode[]) => {
    bodyRef.current = next;
    setBodyState(next);
  }, []);

  useEffect(() => {
    setLoadedId(null);
    setSaveErr(null);
    if (!noteId) {
      setTitle(null);
      setSermonDate(null);
      setPreacher(null);
      setLocation(null);
      setScripture(null);
      setBody(EMPTY_BODY());
      setStatus("idle");
      return;
    }
    setStatus("loading");
    let cancelled = false;
    (async () => {
      const note = await repo.findById(noteId);
      if (cancelled) return;
      if (note) {
        setTitle(note.title);
        setSermonDate(note.sermonDate);
        setPreacher(note.preacher);
        setLocation(note.location);
        setScripture(note.scripture);
        setBody(note.body.length ? note.body : EMPTY_BODY());
        setStatus("loaded");
      } else {
        setStatus("missing");
      }
      setLoadedId(noteId);
    })().catch((e) => {
      console.warn("note load failed", e);
      if (cancelled) return;
      setStatus("missing");
      setLoadedId(noteId);
    });
    return () => {
      cancelled = true;
    };
  }, [repo, noteId, setBody]);

  const save = useCallback(
    async (patch: NoteDraftPatch) => {
      if (!noteId) return;
      await repo.update(noteId, patch);
      setSaveErr(null);
      onSaved?.(noteId, patch);
    },
    [repo, noteId, onSaved],
  );

  const onError = useCallback(
    (e: unknown) => {
      console.warn("autosave failed", e);
      setSaveErr(saveErrorMessage);
    },
    [saveErrorMessage],
  );

  const { flush } = useAutoSave({
    title,
    body,
    sermonDate,
    preacher,
    location,
    scripture,
    save,
    onError,
    enabled:
      enabled &&
      noteId !== null &&
      loadedId === noteId &&
      status === "loaded",
  });

  // 성경 브라우저에서 고른 절을 본문 맨 끝에 붙인다(RULE-EDIT-004 A21).
  const insertRef = useCallback(
    (ref: string) => {
      const result = insertVerse(bodyRef.current, ref);
      if (result.ok) setBody(result.body);
      showFeedback({
        message: result.message,
        tone: result.ok ? "info" : "error",
        durationMs: 3000,
      });
    },
    [setBody],
  );

  /** 지금 화면에 있는 값으로 만든 저장 페이로드 — 내보내기가 쓴다. */
  const snapshot = useCallback(
    (): NoteDraftPatch => ({
      title,
      body,
      sermonDate,
      preacher,
      location,
      scripture,
      citedRefs: extractCitedRefs(body),
    }),
    [title, body, sermonDate, preacher, location, scripture],
  );

  return {
    status,
    title,
    sermonDate,
    preacher,
    location,
    scripture,
    body,
    setTitle,
    setSermonDate,
    setPreacher,
    setLocation,
    setScripture,
    setBody,
    saveErr,
    setSaveErr,
    flush,
    insertRef,
    snapshot,
  };
}

export type NoteDraft = ReturnType<typeof useNoteDraft>;
