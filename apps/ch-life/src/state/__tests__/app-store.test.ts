import { useAppStore } from "../app-store";

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
});
