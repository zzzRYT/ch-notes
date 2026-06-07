import { useCallback } from "react";
import type { BookCode } from "@/parser/book-map";
import { useAppStore } from "@/state/app-store";

export function useBiblePosition(): {
  initialRef: string | null;
  onPositionChange: (book: BookCode, chapter: number) => void;
} {
  const initialRef = useAppStore((s) => s.settings.lastBibleRef);
  const setSettings = useAppStore((s) => s.setSettings);
  const onPositionChange = useCallback(
    (book: BookCode, chapter: number) => {
      setSettings({ lastBibleRef: `${book} ${chapter}` });
    },
    [setSettings],
  );
  return { initialRef, onPositionChange };
}
