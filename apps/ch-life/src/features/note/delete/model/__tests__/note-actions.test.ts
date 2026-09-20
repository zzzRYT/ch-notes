import type { Note } from "@/entities/note";
import { useFeedbackStore } from "@/shared/lib";
import { useNoteDeleteStore } from "../delete-store";
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

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

// 삭제 배너까지 띄운 상태를 만든다 — 실제 흐름과 같은 진입점을 쓴다.
async function deletedWithBanner(id: string) {
  const repo = {
    delete: jest.fn().mockResolvedValue(makeNote(id)),
    restore: jest.fn(),
  };
  await deleteNoteWithUndo(repo, id);
}

describe("note actions", () => {
  beforeEach(() => {
    useFeedbackStore.setState({ feedback: null });
    useNoteDeleteStore.setState({
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

    await expect(deleteNoteWithUndo(repo, "A")).resolves.toBe(true);

    expect(repo.delete).toHaveBeenCalledWith("A");
    expect(useNoteDeleteStore.getState().deletedNote).toEqual(note);
    expect(useFeedbackStore.getState().feedback?.action?.label).toBe(
      "실행 취소",
    );
    expect(useNoteDeleteStore.getState().noteRevision).toBe(1);
  });

  it("없는 노트 삭제는 오류 피드백을 내고 false를 반환한다", async () => {
    const repo = {
      delete: jest.fn().mockResolvedValue(null),
      restore: jest.fn(),
    };

    await expect(deleteNoteWithUndo(repo, "MISSING")).resolves.toBe(false);
    expect(useFeedbackStore.getState().feedback?.message).toBe(
      "노트를 삭제하지 못했습니다",
    );
  });

  it("배너의 실행 취소는 같은 저장소로 복원한다", async () => {
    const note = makeNote("A");
    const repo = {
      delete: jest.fn().mockResolvedValue(note),
      restore: jest.fn().mockResolvedValue(undefined),
    };
    await deleteNoteWithUndo(repo, "A");

    await useFeedbackStore.getState().feedback!.action!.onPress();

    expect(repo.restore).toHaveBeenCalledWith(note);
    expect(useNoteDeleteStore.getState().deletedNote).toBeNull();
  });

  it("undoLatestNoteDeletion은 복원 뒤 대상을 비운다", async () => {
    const note = makeNote("A");
    useNoteDeleteStore.getState().offerDeleteUndo(note);
    const repo = {
      delete: jest.fn(),
      restore: jest.fn().mockResolvedValue(undefined),
    };

    await expect(undoLatestNoteDeletion(repo)).resolves.toBe(true);

    expect(repo.restore).toHaveBeenCalledWith(note);
    expect(useNoteDeleteStore.getState().deletedNote).toBeNull();
    expect(useNoteDeleteStore.getState().lastRestoredNoteId).toBe("A");
  });

  it("복원 실패는 스냅샷을 비우고 오류 피드백을 표시한다", async () => {
    useNoteDeleteStore.getState().offerDeleteUndo(makeNote("A"));
    const repo = {
      delete: jest.fn(),
      restore: jest.fn().mockRejectedValue(new Error("restore failed")),
    };

    await expect(undoLatestNoteDeletion(repo)).resolves.toBe(false);

    expect(useNoteDeleteStore.getState().deletedNote).toBeNull();
    expect(useFeedbackStore.getState().feedback?.message).toBe(
      "노트를 복원하지 못했습니다",
    );
  });

  it("복원 중 안내가 만료돼도 복원한 노트 ID를 남긴다", async () => {
    await deletedWithBanner("A");
    const feedbackId = useFeedbackStore.getState().feedback!.id;
    const restore = deferred();
    const repo = {
      delete: jest.fn(),
      restore: jest.fn(() => restore.promise),
    };

    const undo = undoLatestNoteDeletion(repo);
    useFeedbackStore.getState().clearFeedback(feedbackId);
    restore.resolve();

    await expect(undo).resolves.toBe(true);
    expect(useNoteDeleteStore.getState().lastRestoredNoteId).toBe("A");
    expect(useFeedbackStore.getState().feedback?.message).toBe(
      "노트를 복원했습니다",
    );
  });

  it("이전 복원 완료가 더 최신 삭제의 실행 취소를 지우지 않는다", async () => {
    useNoteDeleteStore.getState().offerDeleteUndo(makeNote("A"));
    const restore = deferred();
    const repo = {
      delete: jest.fn(),
      restore: jest.fn(() => restore.promise),
    };

    const undo = undoLatestNoteDeletion(repo);
    await deletedWithBanner("B");
    restore.resolve();

    await expect(undo).resolves.toBe(true);
    expect(useNoteDeleteStore.getState().lastRestoredNoteId).toBe("A");
    expect(useNoteDeleteStore.getState().deletedNote?.id).toBe("B");
    expect(useFeedbackStore.getState().feedback?.action?.label).toBe(
      "실행 취소",
    );
  });

  it("동시에 실행 취소를 눌러도 복원은 한 번만 수행한다", async () => {
    useNoteDeleteStore.getState().offerDeleteUndo(makeNote("A"));
    const restore = deferred();
    const repo = {
      delete: jest.fn(),
      restore: jest.fn(() => restore.promise),
    };

    const first = undoLatestNoteDeletion(repo);
    const second = undoLatestNoteDeletion(repo);
    expect(second).toBe(first);
    restore.resolve();

    await expect(Promise.all([first, second])).resolves.toEqual([true, true]);
    expect(repo.restore).toHaveBeenCalledTimes(1);
  });
});
