import { useCallback, useState } from "react";
import { Alert } from "react-native";
import type { Note } from "@/domain/types";
import {
  pickAndImport,
  type ConflictPolicy,
  type ImportSummary,
} from "./import-note";

/** Conflict dialog shown when an incoming note shares an id with an existing one. */
function promptPolicy(existing: Note): Promise<ConflictPolicy> {
  return new Promise((resolve) => {
    const label = existing.title ?? existing.id;
    Alert.alert(
      "이미 존재하는 노트",
      `"${label}" 와 동일한 id의 노트가 있습니다.`,
      [
        { text: "건너뛰기", style: "cancel", onPress: () => resolve("skip") },
        { text: "새 id로 추가", onPress: () => resolve("new-id") },
        {
          text: "덮어쓰기",
          style: "destructive",
          onPress: () => resolve("overwrite"),
        },
      ],
    );
  });
}

/** User-facing one-liner describing an import result. */
export function summaryMessage(r: ImportSummary): string {
  if (r.imported > 0) return `${r.imported}개 가져옴`;
  if (r.skipped > 0) return "건너뜀";
  return "취소됨";
}

export type ImportOutcome = {
  /** null when the import threw; otherwise the pick/import tally. */
  summary: ImportSummary | null;
  message: string;
};

/**
 * Shared markdown-import flow: file pick → conflict prompt → repo write.
 * Owns the busy flag so a button can disable itself; callers decide how to
 * surface the resulting message (inline text on settings, Alert on the list).
 */
export function useNoteImport() {
  const [busy, setBusy] = useState(false);

  const runImport = useCallback(async (): Promise<ImportOutcome> => {
    if (busy) return { summary: null, message: "" };
    setBusy(true);
    try {
      const r = await pickAndImport(promptPolicy);
      return { summary: r, message: summaryMessage(r) };
    } catch (e) {
      console.warn("import failed", e);
      return { summary: null, message: "가져오기 실패" };
    } finally {
      setBusy(false);
    }
  }, [busy]);

  return { busy, runImport };
}
