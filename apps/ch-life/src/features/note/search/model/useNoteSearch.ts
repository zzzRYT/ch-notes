import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { Note, NoteRepo } from "@/entities/note";

const DEBOUNCE_MS = 200;

/**
 * 폰 목록의 FTS 검색(RULE-SEARCH-001). 비어 있으면 `null`(검색 중 아님),
 * 검색 중이면 결과 배열. `revision`이 바뀌면(삭제·복원) 같은 질의를 다시 돈다.
 */
export function useNoteSearch(
  repo: NoteRepo,
  query: string,
  revision: number,
): {
  results: Note[] | null;
  /** 목록에서 지운 노트를 검색 결과에서도 빼는 데 쓴다. */
  setResults: Dispatch<SetStateAction<Note[] | null>>;
} {
  const [results, setResults] = useState<Note[] | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults(null);
      return;
    }
    const t = setTimeout(async () => {
      try {
        setResults(await repo.searchNotes(q));
      } catch (e) {
        console.warn("search failed", e);
        setResults([]);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [repo, query, revision]);

  return { results, setResults };
}
