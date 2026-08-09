import { useAppStore } from "../app-store";
import type { Note } from "@/domain/types";

function makeNote(id: string): Note {
  return {
    id,
    title: `노트 ${id}`,
    body: [{ type: "paragraph", text: id }],
    createdAt: 1,
    updatedAt: 2,
    citedRefs: [],
    sermonDate: null,
    preacher: null,
    location: null,
    scripture: null,
  };
}

describe("app-store", () => {
  beforeEach(() => {
    useAppStore.setState({
      currentNoteId: null,
      pendingInsertRef: null,
      settings: {
        fontScale: 1.2,
        themePreference: "system",
        variation: "minimal",
        blockStyle: "default",
        fontFamily: "sans",
        accentChoice: "default",
        lastOpenedNoteId: null,
      lastBibleRef: null,
      },
      feedback: null,
      deletedNote: null,
      noteRevision: 0,
      lastRestoredNoteId: null,
    });
  });

  it("currentNoteId 초기값은 null", () => {
    expect(useAppStore.getState().currentNoteId).toBeNull();
  });

  it("setCurrentNoteId가 동작한다", () => {
    useAppStore.getState().setCurrentNoteId("01HABC");
    expect(useAppStore.getState().currentNoteId).toBe("01HABC");
  });

  it("기본 fontScale은 1.2", () => {
    expect(useAppStore.getState().settings.fontScale).toBe(1.2);
  });

  it("setSettings는 부분 머지", () => {
    useAppStore.getState().setSettings({ fontScale: 1.4 });
    const s = useAppStore.getState().settings;
    expect(s.fontScale).toBe(1.4);
    expect(s.themePreference).toBe("system");
  });

  it("pendingInsertRef 초기값은 null", () => {
    expect(useAppStore.getState().pendingInsertRef).toBeNull();
  });

  it("requestInsertRef → consumePendingInsert 흐름", () => {
    useAppStore.getState().requestInsertRef("Col 3:20");
    expect(useAppStore.getState().pendingInsertRef).toBe("Col 3:20");
    const popped = useAppStore.getState().consumePendingInsert();
    expect(popped).toBe("Col 3:20");
    expect(useAppStore.getState().pendingInsertRef).toBeNull();
  });

  it("consumePendingInsert가 비었으면 null", () => {
    expect(useAppStore.getState().consumePendingInsert()).toBeNull();
  });

  it("기본 lastBibleRef는 null", () => {
    expect(useAppStore.getState().settings.lastBibleRef).toBeNull();
  });

  it("setSettings로 lastBibleRef 갱신", () => {
    useAppStore.getState().setSettings({ lastBibleRef: "Gen 1" });
    expect(useAppStore.getState().settings.lastBibleRef).toBe("Gen 1");
  });

  it("showFeedback가 메시지와 만료 시각을 저장한다", () => {
    useAppStore.getState().showFeedback({
      message: "추가했습니다",
      tone: "info",
      durationMs: 3000,
    });
    const feedback = useAppStore.getState().feedback;
    expect(feedback?.message).toBe("추가했습니다");
    expect(feedback?.tone).toBe("info");
    expect(feedback?.expiresAt).toBeGreaterThan(Date.now());
  });

  it("offerDeleteUndo가 최신 삭제만 보관하고 revision을 올린다", () => {
    useAppStore.getState().offerDeleteUndo(makeNote("A"));
    useAppStore.getState().offerDeleteUndo(makeNote("B"));
    expect(useAppStore.getState().deletedNote?.id).toBe("B");
    expect(useAppStore.getState().feedback?.action).toBe("undo-delete");
    expect(useAppStore.getState().noteRevision).toBe(2);
  });

  it("finishDeleteUndo가 복원 ID를 남기고 revision을 올린다", () => {
    useAppStore.getState().offerDeleteUndo(makeNote("A"));
    const before = useAppStore.getState().noteRevision;
    useAppStore.getState().finishDeleteUndo();
    expect(useAppStore.getState().deletedNote).toBeNull();
    expect(useAppStore.getState().lastRestoredNoteId).toBe("A");
    expect(useAppStore.getState().feedback?.message).toBe("노트를 복원했습니다");
    expect(useAppStore.getState().noteRevision).toBe(before + 1);
  });

  it("stale clear는 새 피드백을 지우지 않고 undo 만료는 스냅샷을 비운다", () => {
    useAppStore.getState().offerDeleteUndo(makeNote("A"));
    const undoId = useAppStore.getState().feedback!.id;
    useAppStore.getState().showFeedback({
      message: "새 안내",
      tone: "info",
      durationMs: 3000,
    });
    useAppStore.getState().clearFeedback(undoId);
    expect(useAppStore.getState().feedback?.message).toBe("새 안내");

    useAppStore.getState().offerDeleteUndo(makeNote("B"));
    const currentId = useAppStore.getState().feedback!.id;
    useAppStore.getState().clearFeedback(currentId);
    expect(useAppStore.getState().feedback).toBeNull();
    expect(useAppStore.getState().deletedNote).toBeNull();
  });

  it("삭제 안내를 다른 안내가 교체하면 실행 취소 스냅샷도 비운다", () => {
    useAppStore.getState().offerDeleteUndo(makeNote("A"));
    useAppStore.getState().showFeedback({
      message: "요한복음 3:16을 노트에 추가했습니다",
      tone: "info",
      durationMs: 3000,
    });

    expect(useAppStore.getState().feedback?.action).toBeUndefined();
    expect(useAppStore.getState().deletedNote).toBeNull();
  });
});
