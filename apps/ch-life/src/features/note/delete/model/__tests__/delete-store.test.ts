import type { Note } from "@/entities/note";
import { useNoteDeleteStore } from "../delete-store";

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

describe("delete-store", () => {
  beforeEach(() => {
    useNoteDeleteStore.setState({
      deletedNote: null,
      noteRevision: 0,
      lastRestoredNoteId: null,
    });
  });

  it("offerDeleteUndo가 최신 삭제만 보관하고 revision을 올린다", () => {
    useNoteDeleteStore.getState().offerDeleteUndo(makeNote("A"));
    useNoteDeleteStore.getState().offerDeleteUndo(makeNote("B"));
    expect(useNoteDeleteStore.getState().deletedNote?.id).toBe("B");
    expect(useNoteDeleteStore.getState().noteRevision).toBe(2);
  });

  it("finishDeleteUndo가 복원 ID를 남기고 revision을 올린다", () => {
    useNoteDeleteStore.getState().offerDeleteUndo(makeNote("A"));
    const before = useNoteDeleteStore.getState().noteRevision;
    useNoteDeleteStore.getState().finishDeleteUndo("A");
    expect(useNoteDeleteStore.getState().deletedNote).toBeNull();
    expect(useNoteDeleteStore.getState().lastRestoredNoteId).toBe("A");
    expect(useNoteDeleteStore.getState().noteRevision).toBe(before + 1);
  });

  it("이전 복원이 늦게 끝나도 최신 삭제 실행 취소를 보존한다", () => {
    useNoteDeleteStore.getState().offerDeleteUndo(makeNote("A"));
    useNoteDeleteStore.getState().offerDeleteUndo(makeNote("B"));

    useNoteDeleteStore.getState().finishDeleteUndo("A");

    expect(useNoteDeleteStore.getState().deletedNote?.id).toBe("B");
    expect(useNoteDeleteStore.getState().lastRestoredNoteId).toBe("A");
  });

  it("이전 복원 실패가 최신 삭제 실행 취소를 지우지 않는다", () => {
    useNoteDeleteStore.getState().offerDeleteUndo(makeNote("A"));
    useNoteDeleteStore.getState().offerDeleteUndo(makeNote("B"));

    useNoteDeleteStore.getState().failDeleteUndo("A");

    expect(useNoteDeleteStore.getState().deletedNote?.id).toBe("B");
  });
});
