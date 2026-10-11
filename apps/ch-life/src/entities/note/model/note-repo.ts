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

/** 말씀 지도처럼 본문을 읽지 않는 조회용 투영. 본문(body)은 싣지 않는다. */
export type NoteRefSummary = {
  id: string;
  title: string | null;
  scripture: string | null;
  citedRefs: string[];
  createdAt: number;
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
  /** 저장된 **모든** 노트의 설교 본문·인용 요약. 200건 상한 없음, 최신순. */
  listRefSummaries(): Promise<NoteRefSummary[]>;
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
