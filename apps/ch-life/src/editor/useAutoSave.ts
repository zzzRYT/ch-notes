import { useEffect, useRef } from "react";
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
}): void {
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
  } = opts;

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      save(
        buildSavePayload({
          title,
          body,
          sermonDate,
          preacher,
          location,
          scripture,
        }),
      ).catch((e) => {
        if (onError) onError(e);
        else console.warn("autosave failed", e);
      });
    }, delayMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [title, body, sermonDate, preacher, location, scripture, save, delayMs, onError]);
}
