import type { Note } from "@/domain/types";
import { useAppStore } from "@/state/app-store";
import {
  deleteNoteWithUndo,
  undoLatestNoteDeletion,
} from "../note-actions";

function makeNote(id: string): Note {
  return {
    id,
    title: `노트 ${id}`,
    body: [{ type: "paragraph", text: "본문" }],
    createdAt: 1,
    updatedAt: 2,
    citedRefs: [],
    sermonDate: null,
    preacher: null,
    location: null,
    scripture: null,
  };
}

describe("note actions", () => {
  beforeEach(() => {
    useAppStore.setState({
      feedback: null,
      deletedNote: null,
      noteRevision: 0,
      lastRestoredNoteId: null,
    });
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("deleteNoteWithUndo는 삭제 스냅샷과 revision을 등록한다", async () => {
    const note = makeNote("A");
    const repo = {
      delete: jest.fn().mockResolvedValue(note),
      restore: jest.fn(),
    };

    await expect(deleteNoteWithUndo("A", async () => repo)).resolves.toBe(true);

    expect(repo.delete).toHaveBeenCalledWith("A");
    expect(useAppStore.getState().deletedNote).toEqual(note);
    expect(useAppStore.getState().feedback?.action).toBe("undo-delete");
    expect(useAppStore.getState().noteRevision).toBe(1);
  });

  it("없는 노트 삭제는 오류 피드백을 내고 false를 반환한다", async () => {
    const repo = {
      delete: jest.fn().mockResolvedValue(null),
      restore: jest.fn(),
    };

    await expect(
      deleteNoteWithUndo("MISSING", async () => repo),
    ).resolves.toBe(false);
    expect(useAppStore.getState().feedback?.message).toBe(
      "노트를 삭제하지 못했습니다",
    );
  });

  it("undoLatestNoteDeletion은 복원 뒤 대상을 비운다", async () => {
    const note = makeNote("A");
    useAppStore.getState().offerDeleteUndo(note);
    const repo = {
      delete: jest.fn(),
      restore: jest.fn().mockResolvedValue(undefined),
    };

    await expect(undoLatestNoteDeletion(async () => repo)).resolves.toBe(true);

    expect(repo.restore).toHaveBeenCalledWith(note);
    expect(useAppStore.getState().deletedNote).toBeNull();
    expect(useAppStore.getState().lastRestoredNoteId).toBe("A");
  });

  it("복원 실패는 스냅샷을 비우고 오류 피드백을 표시한다", async () => {
    useAppStore.getState().offerDeleteUndo(makeNote("A"));
    const repo = {
      delete: jest.fn(),
      restore: jest.fn().mockRejectedValue(new Error("restore failed")),
    };

    await expect(undoLatestNoteDeletion(async () => repo)).resolves.toBe(false);

    expect(useAppStore.getState().deletedNote).toBeNull();
    expect(useAppStore.getState().feedback?.message).toBe(
      "노트를 복원하지 못했습니다",
    );
  });

  it("복원 중 안내가 만료돼도 복원한 노트 ID를 남긴다", async () => {
    const note = makeNote("A");
    useAppStore.getState().offerDeleteUndo(note);
    const feedbackId = useAppStore.getState().feedback!.id;
    let finishRestore!: () => void;
    const restorePromise = new Promise<void>((resolve) => {
      finishRestore = resolve;
    });
    const repo = {
      delete: jest.fn(),
      restore: jest.fn(() => restorePromise),
    };

    const undo = undoLatestNoteDeletion(async () => repo);
    useAppStore.getState().clearFeedback(feedbackId);
    finishRestore();

    await expect(undo).resolves.toBe(true);
    expect(useAppStore.getState().lastRestoredNoteId).toBe("A");
    expect(useAppStore.getState().feedback?.message).toBe("노트를 복원했습니다");
  });

  it("이전 복원 완료가 더 최신 삭제의 실행 취소를 지우지 않는다", async () => {
    useAppStore.getState().offerDeleteUndo(makeNote("A"));
    let finishRestore!: () => void;
    const restorePromise = new Promise<void>((resolve) => {
      finishRestore = resolve;
    });
    const repo = {
      delete: jest.fn(),
      restore: jest.fn(() => restorePromise),
    };

    const undo = undoLatestNoteDeletion(async () => repo);
    useAppStore.getState().offerDeleteUndo(makeNote("B"));
    finishRestore();

    await expect(undo).resolves.toBe(true);
    expect(useAppStore.getState().lastRestoredNoteId).toBe("A");
    expect(useAppStore.getState().deletedNote?.id).toBe("B");
    expect(useAppStore.getState().feedback?.action).toBe("undo-delete");
  });

  it("동시에 실행 취소를 눌러도 복원은 한 번만 수행한다", async () => {
    useAppStore.getState().offerDeleteUndo(makeNote("A"));
    let finishRestore!: () => void;
    const restorePromise = new Promise<void>((resolve) => {
      finishRestore = resolve;
    });
    const repo = {
      delete: jest.fn(),
      restore: jest.fn(() => restorePromise),
    };

    const first = undoLatestNoteDeletion(async () => repo);
    const second = undoLatestNoteDeletion(async () => repo);
    expect(second).toBe(first);
    finishRestore();

    await expect(Promise.all([first, second])).resolves.toEqual([true, true]);
    expect(repo.restore).toHaveBeenCalledTimes(1);
  });
});
