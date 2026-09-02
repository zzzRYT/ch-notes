import { openNoteRepo } from "@/db/expo-adapter";
import type { NoteRepo } from "@/db/note-repo";
import { useAppStore } from "@/state/app-store";

type NoteActionRepo = Pick<NoteRepo, "delete" | "restore">;
type RepoFactory = () => Promise<NoteActionRepo>;

let undoInFlight: Promise<boolean> | null = null;

export async function deleteNoteWithUndo(
  id: string,
  repoFactory: RepoFactory = openNoteRepo,
): Promise<boolean> {
  try {
    const repo = await repoFactory();
    const deleted = await repo.delete(id);
    if (!deleted) throw new Error(`note not found: ${id}`);
    useAppStore.getState().offerDeleteUndo(deleted);
    return true;
  } catch (error) {
    console.warn("note delete failed", error);
    useAppStore.getState().showFeedback({
      message: "노트를 삭제하지 못했습니다",
      tone: "error",
      durationMs: 3000,
    });
    return false;
  }
}

export function undoLatestNoteDeletion(
  repoFactory: RepoFactory = openNoteRepo,
): Promise<boolean> {
  if (undoInFlight) return undoInFlight;
  const note = useAppStore.getState().deletedNote;
  if (!note) return Promise.resolve(false);

  const operation = (async () => {
    try {
      const repo = await repoFactory();
      await repo.restore(note);
      useAppStore.getState().finishDeleteUndo(note.id);
      return true;
    } catch (error) {
      console.warn("note restore failed", error);
      useAppStore.getState().failDeleteUndo(note.id);
      return false;
    }
  })();
  undoInFlight = operation;
  void operation.finally(() => {
    if (undoInFlight === operation) undoInFlight = null;
  });
  return operation;
}
