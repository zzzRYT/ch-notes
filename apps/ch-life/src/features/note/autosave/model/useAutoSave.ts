import { useCallback, useEffect, useRef } from "react";
import type { BlockNode } from "@/entities/note";
import { buildSavePayload, type SavePayload } from "./save-payload";

type SaveFn = (patch: SavePayload) => Promise<void>;

export type AutoSaveHandle = {
  /**
   * 대기 중인 저장을 지금 끝낸다. `body`를 주면 화면 상태 대신 그 본문을 저장한다 —
   * 에디터(WebView)가 아직 RN 상태로 보내지 않은 마지막 입력을 담을 때 쓴다.
   */
  flush: (live?: { body: BlockNode[] }) => Promise<void>;
  cancel: () => void;
};

export function useAutoSave(opts: {
  title: string | null;
  body: BlockNode[];
  sermonDate: string | null;
  preacher: string | null;
  location: string | null;
  scripture: string | null;
  save: SaveFn;
  delayMs?: number;
  onError?: (e: unknown) => void;
  enabled?: boolean;
}): AutoSaveHandle {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    title,
    body,
    sermonDate,
    preacher,
    location,
    scripture,
    save,
    delayMs = 500,
    onError,
    enabled = true,
  } = opts;

  const cancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const handleError = useCallback(
    (error: unknown) => {
      if (onError) onError(error);
      else console.warn("autosave failed", error);
    },
    [onError],
  );

  const flush = useCallback(async (live?: { body: BlockNode[] }) => {
    cancel();
    if (!enabled) return;
    await save(
      buildSavePayload({
        title,
        body: live?.body ?? body,
        sermonDate,
        preacher,
        location,
        scripture,
      }),
    );
  }, [
    enabled,
    save,
    title,
    body,
    sermonDate,
    preacher,
    location,
    scripture,
    cancel,
  ]);

  useEffect(() => {
    cancel();
    if (!enabled) return;
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      save(
        buildSavePayload({
          title,
          body,
          sermonDate,
          preacher,
          location,
          scripture,
        }),
      ).catch(handleError);
    }, delayMs);
    return cancel;
  }, [
    enabled,
    title,
    body,
    sermonDate,
    preacher,
    location,
    scripture,
    save,
    delayMs,
    handleError,
    cancel,
  ]);

  return { flush, cancel };
}
