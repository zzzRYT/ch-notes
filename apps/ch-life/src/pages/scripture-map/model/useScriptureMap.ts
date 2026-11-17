import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useNoteRepo } from "@/entities/note";
import { useNoteDeleteStore } from "@/features/note/delete";
import { matchNotes, type MapData, type PlaceLink } from "@/features/scripture/map";

export type ScriptureMapState =
  | { status: "loading" }
  /** 조회 실패. 빈 지도와 구분해 다시 시도를 제공한다. */
  | { status: "error" }
  | { status: "ready"; links: PlaceLink[] };

/**
 * 저장된 전체 노트를 지도 연결표와 대조한다(R11). 화면에 들어올 때마다, 그리고
 * 삭제·복원(`noteRevision`) 뒤에 다시 읽는다. 늦게 끝난 이전 조회는 버린다.
 */
export function useScriptureMap(data: MapData) {
  const repo = useNoteRepo();
  const revision = useNoteDeleteStore((s) => s.noteRevision);
  const [state, setState] = useState<ScriptureMapState>({ status: "loading" });
  const latest = useRef(0);

  const load = useCallback(async () => {
    const mine = ++latest.current;
    try {
      const notes = await repo.listRefSummaries();
      if (mine === latest.current) {
        setState({ status: "ready", links: matchNotes(notes, data) });
      }
    } catch (e) {
      console.warn("scripture map load failed", e);
      if (mine === latest.current) setState({ status: "error" });
    }
  }, [repo, data]);

  useFocusEffect(
    useCallback(() => {
      void load();
      // 화면을 떠나면 진행 중인 조회 결과를 무시한다.
      return () => {
        latest.current++;
      };
      // revision이 바뀌면 같은 화면에서도 다시 읽는다.
    }, [load, revision]), // eslint-disable-line react-hooks/exhaustive-deps
  );

  const retry = useCallback(() => {
    setState({ status: "loading" });
    void load();
  }, [load]);

  return { state, retry };
}
