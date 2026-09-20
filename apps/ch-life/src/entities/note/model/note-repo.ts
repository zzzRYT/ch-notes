import { createContext, useContext } from "react";
import type { BlockNode, Note } from "./types";

export type NoteInput = {
  id?: string;
  title?: string | null;
  body: BlockNode[];
  citedRefs: string[];
  sermonDate?: string | null;
  preacher?: string | null;
  location?: string | null;
  scripture?: string | null;
};

/** read-then-merge 패치: `null`은 비움, `undefined`는 유지(RULE-NOTE-005). */
export type NotePatch = {
  title?: string | null;
  body?: BlockNode[];
  citedRefs?: string[];
  sermonDate?: string | null;
  preacher?: string | null;
  location?: string | null;
  scripture?: string | null;
};

/**
 * 노트 저장소 인터페이스(CONTRACT-NOTE-REPO). 구현은 `api/`의 SQLite 어댑터이고,
 * 사용처는 Composition Root(`app/_layout.tsx`)가 `NoteRepoProvider`로 넘긴 것만 쓴다.
 */
export type NoteRepo = {
  create(input: NoteInput): Promise<string>;
  update(id: string, patch: NotePatch): Promise<void>;
  findById(id: string): Promise<Note | null>;
  listRecent(opts: { limit: number }): Promise<Note[]>;
  delete(id: string): Promise<Note | null>;
  restore(note: Note): Promise<void>;
  searchNotes(query: string): Promise<Note[]>;
};

const NoteRepoContext = createContext<NoteRepo | null>(null);

export const NoteRepoProvider = NoteRepoContext.Provider;

export function useNoteRepo(): NoteRepo {
  const repo = useContext(NoteRepoContext);
  if (!repo) {
    throw new Error("NoteRepoProvider is missing above this component.");
  }
  return repo;
}
