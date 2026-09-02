# Note Delete and Scripture Insert Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add reversible note deletion from list rows and editor headers, plus accessible transient feedback when scripture verses are appended to a note.

**Architecture:** Keep persistence in `note-repo`, coordinate delete/restore in a small note action service, and keep only transient cross-route feedback in Zustand. Render one root-level banner host so feedback survives navigation; use a controlled `PanResponder` row wrapper for swipe reveal without adding a native dependency. Extract scripture insertion into a pure function so phone and tablet share identical success/failure behavior.

**Tech Stack:** Expo SDK 54, React Native 0.81 (`Animated`, `PanResponder`, accessibility properties), Expo Router 6, Zustand 5, expo-sqlite, Jest 29, TypeScript 5.9.

**Design:** `docs/superpowers/specs/2026-08-09-note-delete-and-insert-feedback-design.md`

**Version references:** [Expo SDK 54](https://docs.expo.dev/versions/v54.0.0/), [React Native 0.81 PanResponder](https://reactnative.dev/docs/0.81/panresponder), [React Native 0.81 accessibility](https://reactnative.dev/docs/0.81/accessibility)

---

## File map

- Create `apps/ch-life/src/notes/note-actions.ts`: delete/restore orchestration and shared user-facing messages.
- Create `apps/ch-life/src/notes/__tests__/note-actions.test.ts`: action-service success and failure contracts.
- Create `apps/ch-life/src/feedback/ActionBannerHost.tsx`: root overlay, expiry handling, live-region announcement, and undo button.
- Create `apps/ch-life/src/list/SwipeToDelete.tsx`: controlled horizontal gesture and accessible delete action.
- Create `apps/ch-life/src/list/swipe-geometry.ts`: pure gesture thresholds.
- Create `apps/ch-life/src/list/__tests__/swipe-geometry.test.ts`: horizontal-intent and settle tests.
- Create `apps/ch-life/src/editor/insert-verse.ts`: pure scripture insertion result.
- Create `apps/ch-life/src/editor/__tests__/insert-verse.test.ts`: success/failure and message tests.
- Modify `apps/ch-life/src/db/note-repo.ts`: return the deleted snapshot and restore a complete note.
- Modify `apps/ch-life/src/db/__tests__/note-repo.test.ts`: deletion/restore persistence coverage.
- Modify `apps/ch-life/src/state/app-store.ts`: transient feedback, pending deleted note, and note revision.
- Modify `apps/ch-life/src/state/__tests__/app-store.test.ts`: replacement, expiry metadata, and revision coverage.
- Modify `apps/ch-life/app/_layout.tsx`: mount the global banner host above the router stack.
- Modify `apps/ch-life/src/editor/useAutoSave.ts`: allow deletion flows to disable and cancel autosave.
- Modify `apps/ch-life/src/chrome/HeaderControls.tsx`: support destructive header icon tint.
- Modify `apps/ch-life/src/list/NoteCard.tsx`: accept and render swipe-delete behavior.
- Modify `apps/ch-life/app/index.tsx`: delete from phone list and reload after undo.
- Modify `apps/ch-life/src/workspace/NoteListSidebar.tsx`: swipe-delete each tablet row.
- Modify `apps/ch-life/app/note/[id].tsx`: editor trash button, autosave cancellation, and insert feedback.
- Modify `apps/ch-life/src/browser/BibleBrowser.tsx`: render feedback inside the native modal layer.
- Modify `apps/ch-life/src/workspace/TabletWorkspace.tsx`: tablet delete/selection rules and insert feedback.

### Task 1: Make note deletion reversible at the repository boundary

**Files:**
- Modify: `apps/ch-life/src/db/note-repo.ts`
- Test: `apps/ch-life/src/db/__tests__/note-repo.test.ts`

- [ ] **Step 1: Write failing repository tests**

Add tests that assert `delete` returns the complete snapshot, a missing ID returns `null`, `restore` preserves every field and timestamp, and duplicate restore rejects without overwriting:

```ts
it("delete가 완전한 스냅샷을 반환하고 restore가 그대로 복원한다", async () => {
  const repo = setup();
  const id = await repo.create({
    title: "복원할 노트",
    body: [{ type: "paragraph", text: "본문" }],
    citedRefs: ["John 3:16"],
    sermonDate: "2026-08-09",
    preacher: "홍길동",
    location: "본당",
    scripture: "요한복음 3:16",
  });
  const before = await repo.findById(id);
  expect(before).not.toBeNull();

  const deleted = await repo.delete(id);
  expect(deleted).toEqual(before);
  expect(await repo.findById(id)).toBeNull();

  await repo.restore(deleted!);
  expect(await repo.findById(id)).toEqual(before);
});

it("없는 노트 delete는 null을 반환한다", async () => {
  expect(await setup().delete("MISSING")).toBeNull();
});

it("restore는 같은 ID의 기존 노트를 덮어쓰지 않는다", async () => {
  const repo = setup();
  const id = await repo.create({ title: "원본", body: [], citedRefs: [] });
  const note = await repo.findById(id);
  await expect(repo.restore(note!)).rejects.toThrow();
  expect((await repo.findById(id))?.title).toBe("원본");
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
cd apps/ch-life
pnpm test -- --runInBand src/db/__tests__/note-repo.test.ts
```

Expected: FAIL because `delete` currently returns `void` and `restore` does not exist.

- [ ] **Step 3: Implement snapshot deletion and exact restore**

Change the repository methods to:

```ts
async delete(id: string): Promise<Note | null> {
  const note = await this.findById(id);
  if (!note) return null;
  await db.runAsync(`DELETE FROM notes WHERE id = ?`, [id]);
  return note;
},

async restore(note: Note): Promise<void> {
  await db.runAsync(
    `INSERT INTO notes(id, title, body_json, created_at, updated_at, cited_refs, sermon_date, preacher, location, scripture)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      note.id,
      note.title,
      JSON.stringify(note.body),
      note.createdAt,
      note.updatedAt,
      JSON.stringify(note.citedRefs),
      note.sermonDate,
      note.preacher,
      note.location,
      note.scripture,
    ],
  );
},
```

Because object-literal methods cannot safely call `this.findById` through the inferred return type, define a local `findById` function before the returned object and reuse it from both the public method and `delete`:

```ts
const findById = async (id: string): Promise<Note | null> => {
  const row = await db.getFirstAsync<Row>(`SELECT * FROM notes WHERE id = ?`, [id]);
  return row ? rowToNote(row) : null;
};
```

- [ ] **Step 4: Run repository tests and verify GREEN**

Run the focused command from Step 2. Expected: all `note-repo` tests PASS.

- [ ] **Step 5: Commit the repository contract**

```bash
git add apps/ch-life/src/db/note-repo.ts apps/ch-life/src/db/__tests__/note-repo.test.ts
git commit -m "feat(notes): support exact delete restoration"
```

### Task 2: Add transient feedback state

**Files:**
- Modify: `apps/ch-life/src/state/app-store.ts`
- Test: `apps/ch-life/src/state/__tests__/app-store.test.ts`

- [ ] **Step 1: Write failing store tests**

Extend the test reset with `feedback: null`, `deletedNote: null`, `noteRevision: 0`, and `lastRestoredNoteId: null`, then add:

```ts
it("showFeedback가 메시지와 만료 시각을 저장한다", () => {
  useAppStore.getState().showFeedback({ message: "추가했습니다", tone: "info", durationMs: 3000 });
  const feedback = useAppStore.getState().feedback;
  expect(feedback?.message).toBe("추가했습니다");
  expect(feedback?.tone).toBe("info");
  expect(feedback?.expiresAt).toBeGreaterThan(Date.now());
});

it("offerDeleteUndo가 최신 삭제만 보관하고 revision을 올린다", () => {
  const first = makeNote("A");
  const second = makeNote("B");
  useAppStore.getState().offerDeleteUndo(first);
  useAppStore.getState().offerDeleteUndo(second);
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
```

Define `makeNote` in the test with all required `Note` fields so there are no partial fixtures.

- [ ] **Step 2: Run the store test and verify RED**

```bash
cd apps/ch-life
pnpm test -- --runInBand src/state/__tests__/app-store.test.ts
```

Expected: FAIL because the feedback fields and actions are not defined.

- [ ] **Step 3: Implement the store contract**

Add these types and state actions:

```ts
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

// AppState additions
feedback: Feedback | null;
deletedNote: Note | null;
noteRevision: number;
lastRestoredNoteId: string | null;
showFeedback: (input: FeedbackInput) => void;
clearFeedback: (id: number) => void;
offerDeleteUndo: (note: Note) => void;
finishDeleteUndo: () => void;
failDeleteUndo: () => void;
```

Implement them with functional updates and a collision-free module counter:

```ts
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

// Initial state and actions inside create<AppState>
feedback: null,
deletedNote: null,
noteRevision: 0,
lastRestoredNoteId: null,
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
```

`clearFeedback` ignores stale timer IDs and removes the stored snapshot when its matching undo banner expires. A later deletion replaces both the feedback and the prior undo snapshot.

- [ ] **Step 4: Run the store test and verify GREEN**

Run the Step 2 command. Expected: all `app-store` tests PASS.

- [ ] **Step 5: Commit feedback state**

```bash
git add apps/ch-life/src/state/app-store.ts apps/ch-life/src/state/__tests__/app-store.test.ts
git commit -m "feat(feedback): track transient actions"
```

### Task 3: Coordinate delete and undo operations

**Files:**
- Create: `apps/ch-life/src/notes/note-actions.ts`
- Test: `apps/ch-life/src/notes/__tests__/note-actions.test.ts`
- Create: `apps/ch-life/src/feedback/ActionBannerHost.tsx`
- Modify: `apps/ch-life/app/_layout.tsx`
- Modify: `apps/ch-life/src/browser/BibleBrowser.tsx`

- [ ] **Step 1: Write failing action-service tests**

Make the service accept an injectable repo for tests while exported app functions default to `openNoteRepo()`:

```ts
it("deleteNoteWithUndo는 삭제 스냅샷과 revision을 등록한다", async () => {
  const note = makeNote("A");
  const repo = { delete: jest.fn().mockResolvedValue(note), restore: jest.fn() };
  await deleteNoteWithUndo("A", async () => repo);
  expect(repo.delete).toHaveBeenCalledWith("A");
  expect(useAppStore.getState().deletedNote).toEqual(note);
  expect(useAppStore.getState().feedback?.action).toBe("undo-delete");
});

it("없는 노트 삭제는 오류 피드백을 내고 false를 반환한다", async () => {
  const repo = { delete: jest.fn().mockResolvedValue(null), restore: jest.fn() };
  await expect(deleteNoteWithUndo("MISSING", async () => repo)).resolves.toBe(false);
  expect(useAppStore.getState().feedback?.message).toBe("노트를 삭제하지 못했습니다");
});

it("undoLatestNoteDeletion은 복원 뒤 대상을 비운다", async () => {
  const note = makeNote("A");
  useAppStore.getState().offerDeleteUndo(note);
  const repo = { delete: jest.fn(), restore: jest.fn().mockResolvedValue(undefined) };
  await undoLatestNoteDeletion(async () => repo);
  expect(repo.restore).toHaveBeenCalledWith(note);
  expect(useAppStore.getState().deletedNote).toBeNull();
});
```

Reset the app store before each test and add a restore-rejection test asserting `노트를 복원하지 못했습니다` and `deletedNote === null`, because the failed restore has replaced the undo action with an error-only banner.

- [ ] **Step 2: Run the action test and verify RED**

```bash
cd apps/ch-life
pnpm test -- --runInBand src/notes/__tests__/note-actions.test.ts
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the action service**

```ts
type NoteActionRepo = Pick<NoteRepo, "delete" | "restore">;
type RepoFactory = () => Promise<NoteActionRepo>;

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

export async function undoLatestNoteDeletion(
  repoFactory: RepoFactory = openNoteRepo,
): Promise<boolean> {
  const note = useAppStore.getState().deletedNote;
  if (!note) return false;
  try {
    const repo = await repoFactory();
    await repo.restore(note);
    useAppStore.getState().finishDeleteUndo();
    return true;
  } catch (error) {
    console.warn("note restore failed", error);
    useAppStore.getState().failDeleteUndo();
    return false;
  }
}
```

- [ ] **Step 4: Run action and store tests and verify GREEN**

```bash
pnpm test -- --runInBand src/notes/__tests__/note-actions.test.ts src/state/__tests__/app-store.test.ts
```

Expected: both suites PASS.

- [ ] **Step 5: Create and mount the banner host**

Implement `ActionBannerHost` as a root overlay. It calculates remaining lifetime from `expiresAt`, clears timers on replacement, invokes `undoLatestNoteDeletion`, and exposes updates through a polite live region:

```tsx
export function ActionBannerHost({ passive = false }: { passive?: boolean }) {
  const feedback = useAppStore((s) => s.feedback);
  const clearFeedback = useAppStore((s) => s.clearFeedback);
  const { colors } = useTheme();

  useEffect(() => {
    if (!feedback || passive) return;
    if (Platform.OS === "ios") {
      AccessibilityInfo.announceForAccessibility(feedback.message);
    }
    const timer = setTimeout(
      () => clearFeedback(feedback.id),
      Math.max(0, feedback.expiresAt - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [feedback, clearFeedback, passive]);

  if (!feedback) return null;
  const backgroundColor = feedback.tone === "error" ? colors.errBg : colors.ink;
  const textColor = feedback.tone === "error" ? colors.errText : colors.paper;
  return (
    <View pointerEvents="box-none" style={styles.host}>
      <View pointerEvents="auto" style={[styles.banner, { backgroundColor }]}>
        <Text accessibilityLiveRegion="polite" style={[styles.message, { color: textColor }]}>{feedback.message}</Text>
        {feedback.action === "undo-delete" ? (
          <Pressable onPress={() => void undoLatestNoteDeletion()} accessibilityRole="button" accessibilityLabel="노트 삭제 실행 취소">
            <Text style={[styles.action, { color: colors.accent }]}>실행 취소</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
```

Import `AccessibilityInfo` and `Platform` from React Native. Use absolute positioning with safe horizontal margins and `bottom: 24`. In `app/_layout.tsx`, wrap `ThemedStack` and `<ActionBannerHost />` in a flex-1 `View`. Render `<ActionBannerHost passive />` as the final child of `BibleBrowser`'s modal `body`: the root host owns expiry and the one screen-reader announcement, while the passive copy only makes the banner visible in the native modal presentation layer. Tablet scripture uses `BiblePanel` and the root host.

- [ ] **Step 6: Typecheck the banner integration**

```bash
pnpm typecheck
```

Expected: PASS with the `Pick<NoteRepo, "delete" | "restore">` dependency contract intact.

- [ ] **Step 7: Commit the action service and banner**

```bash
git add apps/ch-life/src/notes apps/ch-life/src/feedback apps/ch-life/app/_layout.tsx apps/ch-life/src/browser/BibleBrowser.tsx
git commit -m "feat(notes): coordinate delete undo feedback"
```

### Task 4: Share scripture insertion results and cancel autosave during deletion

**Files:**
- Create: `apps/ch-life/src/editor/insert-verse.ts`
- Test: `apps/ch-life/src/editor/__tests__/insert-verse.test.ts`
- Modify: `apps/ch-life/src/editor/useAutoSave.ts`

- [ ] **Step 1: Write failing insertion tests**

```ts
describe("insertVerse", () => {
  const body: BlockNode[] = [{ type: "paragraph", text: "메모" }];

  it("인용 블록과 빈 문단을 붙이고 표시용 성공 문구를 반환한다", () => {
    const result = insertVerse(body, "요 3:16");
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected success");
    expect(result.body.slice(-2)).toEqual([
      expect.objectContaining({ type: "quote", ref: "요 3:16", status: "loaded" }),
      { type: "paragraph", text: "" },
    ]);
    expect(result.message).toBe("요한복음 3:16을 노트에 추가했습니다");
  });

  it("조회 실패 시 원래 본문과 오류 문구를 반환한다", () => {
    expect(insertVerse(body, "없는 구절")).toEqual({
      ok: false,
      body,
      message: "성경 구절을 추가하지 못했습니다",
    });
  });
});
```

- [ ] **Step 2: Run the insertion test and verify RED**

```bash
cd apps/ch-life
pnpm test -- --runInBand src/editor/__tests__/insert-verse.test.ts
```

Expected: FAIL because `insert-verse.ts` does not exist.

- [ ] **Step 3: Implement the pure insertion result**

```ts
export type InsertVerseResult =
  | { ok: true; body: BlockNode[]; message: string }
  | { ok: false; body: BlockNode[]; message: string };

export function insertVerse(body: BlockNode[], ref: string): InsertVerseResult {
  const verses = lookupVerses(ref);
  if (!verses) {
    return { ok: false, body, message: "성경 구절을 추가하지 못했습니다" };
  }
  return {
    ok: true,
    body: [
      ...body,
      { type: "quote", ref, verses, status: "loaded" },
      { type: "paragraph", text: "" },
    ],
    message: `${formatRef(ref)}을 노트에 추가했습니다`,
  };
}
```

- [ ] **Step 4: Run insertion tests and verify GREEN**

Run the Step 2 command. Expected: PASS.

- [ ] **Step 5: Add an autosave gate and synchronous flush handle**

Add `enabled?: boolean` to `useAutoSave`, default it to `true`, and return a handle that can flush the current payload before editor deletion:

```ts
export type AutoSaveHandle = {
  flush: () => Promise<void>;
  cancel: () => void;
};

const {
  title, body, sermonDate, preacher, location, scripture,
  save, delayMs = 500, onError, enabled = true,
} = opts;

const cancel = useCallback(() => {
  if (timerRef.current) clearTimeout(timerRef.current);
  timerRef.current = null;
}, []);

const flush = useCallback(async () => {
  cancel();
  if (!enabled) return;
  await save(buildSavePayload({
    title, body, sermonDate, preacher, location, scripture,
  }));
}, [enabled, save, title, body, sermonDate, preacher, location, scripture, cancel]);

useEffect(() => {
  cancel();
  if (!enabled) return;
  timerRef.current = setTimeout(() => {
    save(buildSavePayload({
      title, body, sermonDate, preacher, location, scripture,
    })).catch(handleError);
  }, delayMs);
  return cancel;
}, [enabled, title, body, sermonDate, preacher, location, scripture, save, delayMs, onError, cancel]);

return { flush, cancel };
```

Keep `buildSavePayload` unchanged. Define `handleError` as the existing `onError`/`console.warn` branch and change the function return type to `AutoSaveHandle`. Do not add a dependency solely to render-test this hook; its deletion integration is verified in Tasks 6 and 7 plus manual checks.

- [ ] **Step 6: Commit insertion and autosave primitives**

```bash
git add apps/ch-life/src/editor/insert-verse.ts apps/ch-life/src/editor/__tests__/insert-verse.test.ts apps/ch-life/src/editor/useAutoSave.ts
git commit -m "feat(editor): report verse insertion results"
```

### Task 5: Add a controlled swipe-to-delete row

**Files:**
- Create: `apps/ch-life/src/list/swipe-geometry.ts`
- Test: `apps/ch-life/src/list/__tests__/swipe-geometry.test.ts`
- Create: `apps/ch-life/src/list/SwipeToDelete.tsx`
- Modify: `apps/ch-life/src/list/NoteCard.tsx`

- [ ] **Step 1: Write failing gesture-geometry tests**

```ts
import { isHorizontalSwipe, settleSwipeOffset } from "../swipe-geometry";

it("세로 스크롤보다 뚜렷한 왼쪽 이동만 가로 제스처로 잡는다", () => {
  expect(isHorizontalSwipe(-12, 3)).toBe(true);
  expect(isHorizontalSwipe(-4, 16)).toBe(false);
  expect(isHorizontalSwipe(12, 3)).toBe(false);
});

it("절반 이상 밀면 삭제 폭까지 열고 아니면 닫는다", () => {
  expect(settleSwipeOffset(-50, 84)).toBe(-84);
  expect(settleSwipeOffset(-30, 84)).toBe(0);
});
```

- [ ] **Step 2: Run the geometry test and verify RED**

```bash
cd apps/ch-life
pnpm test -- --runInBand src/list/__tests__/swipe-geometry.test.ts
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement geometry helpers**

```ts
export function isHorizontalSwipe(dx: number, dy: number): boolean {
  return dx < -8 && Math.abs(dx) > Math.abs(dy) * 1.25;
}

export function settleSwipeOffset(dx: number, actionWidth: number): number {
  return dx <= -actionWidth / 2 ? -actionWidth : 0;
}

export function clampSwipeOffset(value: number, actionWidth: number): number {
  return Math.max(-actionWidth, Math.min(0, value));
}
```

- [ ] **Step 4: Run geometry tests and verify GREEN**

Run the Step 2 command. Expected: PASS.

- [ ] **Step 5: Implement `SwipeToDelete`**

Create a component with this public interface:

```ts
type Props = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onDelete: () => void;
  deleteLabel: string;
  children: React.ReactNode;
};
```

Use an `Animated.Value`, `PanResponder.create`, and the pure helpers. Claim the responder only through `onMoveShouldSetPanResponder` when `isHorizontalSwipe(dx, dy)` is true so vertical list scrolling remains available. Clamp movement to `[-84, 0]`, animate to `-84` or `0` on release/termination, and animate closed when `open` changes to false. Render the delete `Pressable` behind the translated content:

```tsx
<View style={styles.root}>
  <Pressable
    onPress={onDelete}
    accessibilityRole="button"
    accessibilityLabel={deleteLabel}
    style={styles.deleteAction}
  >
    <Text style={styles.deleteText}>삭제</Text>
  </Pressable>
  <Animated.View {...panResponder.panHandlers} style={{ transform: [{ translateX }] }}>
    {children}
  </Animated.View>
</View>
```

Use `#c8342a` for the destructive background, white text, `overflow: "hidden"`, and a minimum 48 px delete target. Do not add `react-native-gesture-handler`; Expo SDK 54 already targets RN 0.81 and the core API supports this bounded gesture.

- [ ] **Step 6: Make `NoteCard` swipe-aware**

Extend props with `swipeOpen`, `onSwipeOpen`, `onSwipeClose`, and `onDelete`. Wrap the existing `Pressable` in `SwipeToDelete`, passing `deleteLabel={`${title} 노트 삭제`}`. Preserve the existing tap navigation and accessibility label.

- [ ] **Step 7: Run list tests and typecheck**

```bash
pnpm test -- --runInBand src/list/__tests__
pnpm typecheck
```

Expected: all list tests and typecheck PASS.

- [ ] **Step 8: Commit the swipe component**

```bash
git add apps/ch-life/src/list
git commit -m "feat(notes): reveal delete action by swiping"
```

### Task 6: Wire phone deletion and insert feedback

**Files:**
- Modify: `apps/ch-life/app/index.tsx`
- Modify: `apps/ch-life/app/note/[id].tsx`
- Modify: `apps/ch-life/src/chrome/HeaderControls.tsx`

- [ ] **Step 1: Wire list deletion and undo refresh**

In `PhoneNotesList`, subscribe to `noteRevision`, track one `openSwipeId`, and let `reload` close any open row. Add:

```ts
const noteRevision = useAppStore((s) => s.noteRevision);
const [openSwipeId, setOpenSwipeId] = useState<string | null>(null);

useEffect(() => {
  reload().catch((e) => console.warn("revision reload failed", e));
}, [noteRevision, reload]);

const handleDelete = useCallback(async (id: string) => {
  setOpenSwipeId(null);
  const deleted = await deleteNoteWithUndo(id);
  if (deleted) {
    setNotes((prev) => prev.filter((note) => note.id !== id));
    setResults((prev) => prev?.filter((note) => note.id !== id) ?? null);
  }
}, []);
```

Pass the controlled swipe props to every `NoteCard`. Keep `keyExtractor` and tap navigation unchanged.

- [ ] **Step 2: Add editor trash deletion with autosave cancellation**

Import `Trash2`, add `const [deleting, setDeleting] = useState(false)`, and change the existing autosave call to capture its flush handle:

```ts
const { flush: flushAutoSave } = useAutoSave({
  title,
  body,
  sermonDate,
  preacher,
  location,
  scripture,
  save,
  onError,
  enabled: !deleting,
});
```

Then add:

```ts
const handleDelete = useCallback(async () => {
  if (!id || deleting) return;
  try {
    await flushAutoSave();
  } catch (error) {
    console.warn("pre-delete save failed", error);
    useAppStore.getState().showFeedback({
      message: "노트를 삭제하지 못했습니다",
      tone: "error",
      durationMs: 3000,
    });
    return;
  }
  setDeleting(true);
  const deleted = await deleteNoteWithUndo(id);
  if (deleted) router.replace("/");
  else setDeleting(false);
}, [id, deleting, flushAutoSave, router]);
```

Render a destructive-tint `HeaderIconButton` with `Trash2`, label `현재 노트 삭제`, and this handler before Share. Extend the shared tint contract without changing existing callers:

```ts
type Tint = "ink" | "accent" | "error";

function useTint(tint: Tint): string {
  const { colors } = useTheme();
  if (tint === "accent") return colors.accent;
  if (tint === "error") return colors.errText;
  return colors.ink2;
}
```

```tsx
<HeaderIconButton
  icon={Trash2}
  label="현재 노트 삭제"
  tint="error"
  onPress={handleDelete}
/>
```

- [ ] **Step 3: Replace local insertion logic with the pure result**

```ts
const insertVerseFromBrowser = useCallback((ref: string) => {
  const result = insertVerse(body, ref);
  setBody(result.body);
  useAppStore.getState().showFeedback({
    message: result.message,
    tone: result.ok ? "info" : "error",
    durationMs: 3000,
  });
}, [body]);
```

This same callback handles direct modal insertions and pending store insertions. `BibleBrowser` renders the shared host inside the native modal layer, so this feedback remains visible without closing the modal.

- [ ] **Step 4: Run focused tests, typecheck, and lint changed phone files**

```bash
cd apps/ch-life
pnpm test -- --runInBand src/db/__tests__/note-repo.test.ts src/notes/__tests__/note-actions.test.ts src/editor/__tests__/insert-verse.test.ts src/list/__tests__
pnpm typecheck
pnpm eslint app/index.tsx 'app/note/[id].tsx' src/chrome/HeaderControls.tsx
```

Expected: tests PASS, TypeScript reports no errors, ESLint reports no errors.

- [ ] **Step 5: Commit phone integration**

```bash
git add apps/ch-life/app/index.tsx 'apps/ch-life/app/note/[id].tsx' apps/ch-life/src/chrome/HeaderControls.tsx
git commit -m "feat(notes): delete notes from phone surfaces"
```

### Task 7: Wire tablet deletion, selection, and insert feedback

**Files:**
- Modify: `apps/ch-life/src/workspace/NoteListSidebar.tsx`
- Modify: `apps/ch-life/src/workspace/TabletWorkspace.tsx`

- [ ] **Step 1: Add controlled swipe rows to the sidebar**

Add `onDelete: (id: string) => void` to `NoteListSidebar` props and track one open ID inside the sidebar:

```tsx
const [openSwipeId, setOpenSwipeId] = useState<string | null>(null);

<SwipeToDelete
  open={openSwipeId === n.id}
  onOpen={() => setOpenSwipeId(n.id)}
  onClose={() => setOpenSwipeId((current) => current === n.id ? null : current)}
  onDelete={() => {
    setOpenSwipeId(null);
    onDelete(n.id);
  }}
  deleteLabel={`${noteTitleOrFallback(n)} 노트 삭제`}
>
  <Pressable
    onPress={() => onSelect(n.id)}
    accessibilityRole="button"
    accessibilityState={{ selected: active }}
    accessibilityLabel={noteTitleOrFallback(n)}
    style={[
      styles.item,
      { backgroundColor: active ? colors.accentSoft : "transparent" },
    ]}
  >
    <Text
      numberOfLines={1}
      style={[styles.itemTitle, { color: colors.ink, fontSize: scaled(13, fontScale) }]}
    >
      {noteTitleOrFallback(n)}
    </Text>
    <View style={styles.itemMeta}>
      <Text style={[styles.itemMetaText, { color: colors.ink3, fontSize: scaled(11, fontScale) }]}>
        {formatTime(n.createdAt)}
      </Text>
      {n.citedRefs[0] ? (
        <Text style={[styles.itemPassage, { color: colors.accent, fontSize: scaled(11, fontScale) }]}>
          {formatRef(n.citedRefs[0])}
        </Text>
      ) : null}
    </View>
  </Pressable>
</SwipeToDelete>
```

- [ ] **Step 2: Add one tablet delete state transition**

Track `deletingId` and subscribe to `noteRevision`. Implement a single handler used by sidebar and header:

```ts
const handleDelete = useCallback(async (id: string) => {
  if (deletingId) return;
  if (id === selectedId) {
    try {
      await flushAutoSave();
    } catch (error) {
      console.warn("pre-delete save failed", error);
      useAppStore.getState().showFeedback({
        message: "노트를 삭제하지 못했습니다",
        tone: "error",
        durationMs: 3000,
      });
      return;
    }
  }
  setDeletingId(id);
  const deleted = await deleteNoteWithUndo(id);
  if (!deleted) {
    setDeletingId(null);
    return;
  }
  const remaining = notes.filter((note) => note.id !== id);
  setNotes(remaining);
  if (selectedId === id) setSelectedId(remaining[0]?.id ?? null);
  setDeletingId(null);
}, [deletingId, flushAutoSave, notes, selectedId]);
```

Capture `{ flush: flushAutoSave }` from `useAutoSave` and pass `enabled={selectedId !== null && deletingId !== selectedId}`. When `id === selectedId`, call `await flushAutoSave()` before setting `deletingId`; if it rejects, show `노트를 삭제하지 못했습니다` and abort deletion. When `selectedId` becomes `null`, reset the local editor fields to the empty-state defaults so a later note creation cannot briefly show deleted content. On `noteRevision`, reload the list; retain the current selected ID when it exists, otherwise select `lastRestoredNoteId` when present, falling back to the newest note. This makes undo of a selected-note deletion explicitly reselect the restored note regardless of its creation order.

- [ ] **Step 3: Add the tablet trash action**

Render a `Trash2` pressable in `centerActions` when `selectedId` is non-null. Give it `accessibilityLabel="현재 노트 삭제"`, `colors.errText`, and `onPress={() => handleDelete(selectedId)}`. Pass `onDelete={handleDelete}` to `NoteListSidebar`.

- [ ] **Step 4: Replace tablet insertion logic with shared feedback**

```ts
const insertRef = useCallback((ref: string) => {
  const result = insertVerse(body, ref);
  setBody(result.body);
  useAppStore.getState().showFeedback({
    message: result.message,
    tone: result.ok ? "info" : "error",
    durationMs: 3000,
  });
}, [body]);
```

- [ ] **Step 5: Run focused tests, typecheck, and lint tablet files**

```bash
cd apps/ch-life
pnpm test -- --runInBand src/editor/__tests__/insert-verse.test.ts src/list/__tests__ src/state/__tests__/app-store.test.ts
pnpm typecheck
pnpm eslint src/workspace/NoteListSidebar.tsx src/workspace/TabletWorkspace.tsx
```

Expected: tests PASS, TypeScript reports no errors, ESLint reports no errors.

- [ ] **Step 6: Commit tablet integration**

```bash
git add apps/ch-life/src/workspace/NoteListSidebar.tsx apps/ch-life/src/workspace/TabletWorkspace.tsx
git commit -m "feat(notes): delete and restore notes on tablet"
```

### Task 8: Verify complete behavior and document evidence

**Files:**
- Modify only files needed to fix failures found by this task.

- [ ] **Step 1: Run the complete automated suite**

```bash
cd apps/ch-life
pnpm test:ci
pnpm typecheck
pnpm lint
```

Expected: all Jest suites PASS, TypeScript exits 0, ESLint exits 0.

- [ ] **Step 2: Run the web app for responsive manual verification**

```bash
cd apps/ch-life
pnpm web
```

Expected: Expo starts without bundle errors and prints a local web URL.

- [ ] **Step 3: Verify phone-width behavior**

At a viewport below 900 px:

1. Create two notes with distinguishable titles and content.
2. Drag one row left; verify vertical scrolling still works and only one row remains open.
3. Press `삭제`; verify immediate removal and a 5-second `실행 취소` banner.
4. Undo; verify the same title, content, metadata, and ordering return.
5. Open a note, make an unsaved edit, immediately press the trash icon, and verify no later autosave error or resurrection.
6. Open the Bible modal, add `요한복음 3:16`, and verify the modal remains open while the 3-second success text appears.
7. Add another verse immediately; verify the message and timer reset to the latest verse.

- [ ] **Step 4: Verify tablet-width behavior**

At a viewport of at least 900 px:

1. Repeat sidebar swipe delete and undo.
2. Delete the selected note from the center header; verify the next newest note is selected.
3. Delete the final note; verify the empty state appears.
4. Undo; verify the restored note returns and becomes selected.
5. Add consecutive scripture verses from the right panel and verify latest-message replacement.

- [ ] **Step 5: Verify accessibility and error presentation**

Use the browser accessibility tree plus TalkBack/VoiceOver on an available emulator/device:

1. Confirm each revealed delete control is announced as `<제목> 노트 삭제`, button.
2. Confirm the editor trash control is announced as `현재 노트 삭제`, button.
3. Confirm feedback changes are announced politely and do not steal focus.
4. Temporarily force insertion lookup and restore to reject in a development-only check; verify the approved error messages display and the app remains usable. Revert the forced failure before continuing.

- [ ] **Step 6: Inspect the final diff for scope and accidental changes**

```bash
git status --short
git diff --check
git diff --stat 256fc86..HEAD
```

Expected: only the files in this plan plus any narrowly justified test fix appear; no whitespace errors.

- [ ] **Step 7: Commit any verification fixes**

If Step 1–5 required changes, rerun all three commands from Step 1 and then commit only those fixes:

```bash
git add apps/ch-life/app apps/ch-life/src
git commit -m "fix(notes): address deletion feedback verification"
```

If no changes were required, do not create an empty commit.
