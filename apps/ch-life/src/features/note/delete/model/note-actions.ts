import { Alert } from "react-native";
import type { NoteRepo } from "@/entities/note";
import { showFeedback } from "@/shared/lib";
import { useNoteDeleteStore } from "./delete-store";

type DeleteRepo = Pick<NoteRepo, "delete" | "restore">;

let undoInFlight: Promise<boolean> | null = null;

/** 에디터 휴지통 버튼의 확인창. 폰·태블릿 에디터가 같은 문구·흐름을 쓴다(RULE-NOTE-007). */
export function confirmNoteDelete(onConfirm: () => void): void {
  Alert.alert("노트 삭제", "삭제하시겠습니까?", [
    { text: "취소", style: "cancel" },
    { text: "삭제", style: "destructive", onPress: onConfirm },
  ]);
}

/** 노트를 지우고 5초짜리 "실행 취소" 배너를 띄운다(POL-NOTE-002). */
export async function deleteNoteWithUndo(
  repo: DeleteRepo,
  id: string,
): Promise<boolean> {
  try {
    const deleted = await repo.delete(id);
    if (!deleted) throw new Error(`note not found: ${id}`);
    useNoteDeleteStore.getState().offerDeleteUndo(deleted);
    showFeedback({
      message: "노트를 삭제했습니다",
      tone: "info",
      durationMs: 5000,
      action: {
        label: "실행 취소",
        accessibilityLabel: "노트 삭제 실행 취소",
        onPress: async () => {
          await undoLatestNoteDeletion(repo);
        },
      },
    });
    return true;
  } catch (error) {
    console.warn("note delete failed", error);
    showFeedback({
      message: "노트를 삭제하지 못했습니다",
      tone: "error",
      durationMs: 3000,
    });
    return false;
  }
}

export function undoLatestNoteDeletion(repo: DeleteRepo): Promise<boolean> {
  if (undoInFlight) return undoInFlight;
  const note = useNoteDeleteStore.getState().deletedNote;
  if (!note) return Promise.resolve(false);

  const operation = (async () => {
    try {
      await repo.restore(note);
      useNoteDeleteStore.getState().finishDeleteUndo(note.id);
      // 복원 중 다른 노트가 지워졌으면 그 배너를 덮지 않는다.
      if (useNoteDeleteStore.getState().deletedNote === null) {
        showFeedback({
          message: "노트를 복원했습니다",
          tone: "info",
          durationMs: 3000,
        });
      }
      return true;
    } catch (error) {
      console.warn("note restore failed", error);
      useNoteDeleteStore.getState().failDeleteUndo(note.id);
      if (useNoteDeleteStore.getState().deletedNote === null) {
        showFeedback({
          message: "노트를 복원하지 못했습니다",
          tone: "error",
          durationMs: 3000,
        });
      }
      return false;
    }
  })();
  undoInFlight = operation;
  void operation.finally(() => {
    if (undoInFlight === operation) undoInFlight = null;
  });
  return operation;
}
