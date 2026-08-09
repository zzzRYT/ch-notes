import { create } from "zustand";
import type { Note, Settings } from "@/domain/types";

export type Feedback = {
  id: number;
  message: string;
  tone: "info" | "error";
  expiresAt: number;
  action?: "undo-delete";
};

type FeedbackInput = Pick<Feedback, "message" | "tone"> & {
  durationMs: number;
  action?: Feedback["action"];
};

type AppState = {
  currentNoteId: string | null;
  pendingInsertRef: string | null;
  feedback: Feedback | null;
  deletedNote: Note | null;
  noteRevision: number;
  lastRestoredNoteId: string | null;
  settings: Settings;
  setCurrentNoteId: (id: string | null) => void;
  requestInsertRef: (ref: string) => void;
  consumePendingInsert: () => string | null;
  showFeedback: (input: FeedbackInput) => void;
  clearFeedback: (id: number) => void;
  offerDeleteUndo: (note: Note) => void;
  finishDeleteUndo: () => void;
  failDeleteUndo: () => void;
  setSettings: (next: Partial<Settings>) => void;
};

let feedbackSequence = 0;

function makeFeedback(input: FeedbackInput): Feedback {
  return {
    id: ++feedbackSequence,
    message: input.message,
    tone: input.tone,
    action: input.action,
    expiresAt: Date.now() + input.durationMs,
  };
}

const DEFAULT_SETTINGS: Settings = {
  fontScale: 1.2,
  themePreference: "system",
  variation: "focus",
  blockStyle: "default",
  fontFamily: "sans",
  accentChoice: "default",
  lastOpenedNoteId: null,
  lastBibleRef: null,
};

export const useAppStore = create<AppState>((set, get) => ({
  currentNoteId: null,
  pendingInsertRef: null,
  feedback: null,
  deletedNote: null,
  noteRevision: 0,
  lastRestoredNoteId: null,
  settings: DEFAULT_SETTINGS,
  setCurrentNoteId: (id) => set({ currentNoteId: id }),
  requestInsertRef: (ref) => set({ pendingInsertRef: ref }),
  consumePendingInsert: () => {
    const ref = get().pendingInsertRef;
    if (ref !== null) set({ pendingInsertRef: null });
    return ref;
  },
  showFeedback: (input) => set({ feedback: makeFeedback(input) }),
  clearFeedback: (id) =>
    set((state) => {
      if (state.feedback?.id !== id) return state;
      return {
        feedback: null,
        deletedNote:
          state.feedback.action === "undo-delete" ? null : state.deletedNote,
      };
    }),
  offerDeleteUndo: (note) =>
    set((state) => ({
      deletedNote: note,
      lastRestoredNoteId: null,
      noteRevision: state.noteRevision + 1,
      feedback: makeFeedback({
        message: "노트를 삭제했습니다",
        tone: "info",
        durationMs: 5000,
        action: "undo-delete",
      }),
    })),
  finishDeleteUndo: () =>
    set((state) => ({
      deletedNote: null,
      lastRestoredNoteId: state.deletedNote?.id ?? null,
      noteRevision: state.noteRevision + 1,
      feedback: makeFeedback({
        message: "노트를 복원했습니다",
        tone: "info",
        durationMs: 3000,
      }),
    })),
  failDeleteUndo: () =>
    set({
      deletedNote: null,
      feedback: makeFeedback({
        message: "노트를 복원하지 못했습니다",
        tone: "error",
        durationMs: 3000,
      }),
    }),
  setSettings: (next) =>
    set((s) => ({ settings: { ...s.settings, ...next } })),
}));
