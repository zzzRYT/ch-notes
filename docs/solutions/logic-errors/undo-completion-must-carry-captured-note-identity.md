---
title: Async undo completion must carry captured identity
date: 2026-09-02
category: logic-errors
module: note deletion and undo
problem_type: logic_error
component: frontend
symptoms:
  - "An undo accepted near expiry restores the row but loses the restored note selection"
  - "An older restore completion can clear a newer deletion's undo state"
root_cause: concurrency
resolution_type: code_fix
severity: medium
tags: [undo, async-state, race-condition, zustand, data-integrity]
---

# Async undo completion must carry captured identity

## Problem

The delete undo flow restored the correct database snapshot but completed its UI transition from whichever `deletedNote` happened to be current afterward. A feedback-expiry timer or a newer deletion could change that state while the asynchronous restore was running.

## Symptoms

- Pressing undo just before the five-second deadline could restore the note without leaving its ID for tablet reselection.
- Starting another deletion before an earlier restore finished could make the earlier completion clear the newer undo action.
- Two visible undo controls could start duplicate inserts for the same snapshot.

## What Didn't Work

- Deriving `lastRestoredNoteId` from the Zustand state at completion time did not identify the operation that had actually finished.
- A component-local in-flight ref prevented repeated presses only within that component instance. It did not serialize the root banner and the modal banner together.

## Solution

Capture the note before awaiting persistence, then pass that identity into both completion transitions:

```ts
const note = useAppStore.getState().deletedNote;
await repo.restore(note);
useAppStore.getState().finishDeleteUndo(note.id);
```

The store records the supplied ID. It clears the pending snapshot only when there is no different, newer deletion:

```ts
if (state.deletedNote && state.deletedNote.id !== restoredNoteId) {
  return {
    lastRestoredNoteId: restoredNoteId,
    noteRevision: state.noteRevision + 1,
  };
}
```

Keep one module-level promise for the restore operation so every banner instance returns the same in-flight result instead of inserting the snapshot twice.

Regression tests must cover three orderings:

1. feedback expires before restore resolves;
2. deletion B starts before restore A resolves;
3. two undo calls arrive before the first restore resolves.

## Why This Works

The note ID belongs to the asynchronous operation, so it is immutable for that operation's lifetime. Current UI state is still consulted to protect a newer deletion, but it is no longer used to infer which note finished restoring. Serializing the restore also makes duplicate button presses idempotent at the action boundary.

## Prevention

- Every asynchronous state transition must carry its captured entity ID or operation token through success and failure handlers. Never reconstruct operation identity from mutable global state after an `await`.

## Related Issues

- CHL-T1 note deletion and undo implementation.
