import { useEffect, useRef } from "react";
import type { BlockNode } from "@/domain/types";
import { extractCitedRefs } from "./cited-refs";

type SavePayload = {
  title: string | null;
  body: BlockNode[];
  citedRefs: string[];
};

type SaveFn = (patch: SavePayload) => Promise<void>;

export function useAutoSave(opts: {
  title: string | null;
  body: BlockNode[];
  save: SaveFn;
  delayMs?: number;
  onError?: (e: unknown) => void;
}): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { title, body, save, delayMs = 500, onError } = opts;

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      save({
        title,
        body,
        citedRefs: extractCitedRefs(body),
      }).catch((e) => {
        if (onError) onError(e);
        else console.warn("autosave failed", e);
      });
    }, delayMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [title, body, save, delayMs, onError]);
}
