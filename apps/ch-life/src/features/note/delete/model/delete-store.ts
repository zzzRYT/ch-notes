import { create } from "zustand";
import type { Note } from "@/entities/note";

/**
 * 삭제 → 실행 취소 창구의 상태. 화면을 넘어 살아야 하므로(목록으로 돌아간 뒤에도
 * 복원) Zustand에 둔다. 배너 자체는 `shared/lib`의 피드백 스토어가 그린다.
 */
type DeleteState = {
  /** 마지막으로 지운 노트의 스냅샷. 복원 한 번에 소모된다. */
  deletedNote: Note | null;
  /** 삭제·복원마다 +1. 목록 화면이 이 값을 보고 다시 읽는다. */
  noteRevision: number;
  /** 방금 복원된 노트 — 태블릿이 다시 읽은 뒤 이 노트를 선택한다. */
  lastRestoredNoteId: string | null;
  offerDeleteUndo: (note: Note) => void;
  finishDeleteUndo: (restoredNoteId: string) => void;
  failDeleteUndo: (failedNoteId: string) => void;
};

export const useNoteDeleteStore = create<DeleteState>((set) => ({
  deletedNote: null,
  noteRevision: 0,
  lastRestoredNoteId: null,
  offerDeleteUndo: (note) =>
    set((state) => ({
      deletedNote: note,
      lastRestoredNoteId: null,
      noteRevision: state.noteRevision + 1,
    })),
  finishDeleteUndo: (restoredNoteId) =>
    set((state) => {
      const restoredState = {
        lastRestoredNoteId: restoredNoteId,
        noteRevision: state.noteRevision + 1,
      };
      // 복원 중에 다른 노트가 지워졌으면 그 스냅샷은 건드리지 않는다.
      if (state.deletedNote && state.deletedNote.id !== restoredNoteId) {
        return restoredState;
      }
      return { ...restoredState, deletedNote: null };
    }),
  failDeleteUndo: (failedNoteId) =>
    set((state) => {
      if (state.deletedNote && state.deletedNote.id !== failedNoteId) {
        return state;
      }
      return { deletedNote: null };
    }),
}));
