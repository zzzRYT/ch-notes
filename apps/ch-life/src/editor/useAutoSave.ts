import { useCallback, useEffect, useRef } from "react";
import type { BlockNode } from "@/domain/types";
import { extractCitedRefs } from "./cited-refs";

type SaveState = {
  title: string | null;
  body: BlockNode[];
  sermonDate: string | null;
  preacher: string | null;
  location: string | null;
  scripture: string | null;
};

type SavePayload = SaveState & { citedRefs: string[] };

type SaveFn = (patch: SavePayload) => Promise<void>;

export type AutoSaveHandle = {
  flush: () => Promise<void>;
  cancel: () => void;
};

export function buildSavePayload(state: SaveState): SavePayload {
  return {
    title: state.title,
    body: state.body,
    citedRefs: extractCitedRefs(state.body),
    sermonDate: state.sermonDate,
    preacher: state.preacher,
    location: state.location,
    scripture: state.scripture,
  };
}

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

  const flush = useCallback(async () => {
    cancel();
    if (!enabled) return;
    await save(
      buildSavePayload({
        title,
        body,
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
