import * as FileSystem from "expo-file-system/legacy";
import * as DocumentPicker from "expo-document-picker";
import type { Note } from "@/domain/types";
import { markdownToNote } from "@/markdown/parse";
import { openNoteRepo } from "@/db/expo-adapter";
import {
  resolveImportConflict,
  type ConflictPolicy,
} from "./import-decision";

export type { ConflictPolicy, ConflictResult } from "./import-decision";
export { resolveImportConflict } from "./import-decision";

export type ImportSummary = { imported: number; skipped: number };

export async function pickAndImport(
  promptPolicy: (existing: Note) => Promise<ConflictPolicy>,
): Promise<ImportSummary> {
  const picked = await DocumentPicker.getDocumentAsync({
    type: ["text/markdown", "text/plain", "application/octet-stream"],
    multiple: false,
    copyToCacheDirectory: true,
  });
  if (picked.canceled) return { imported: 0, skipped: 0 };
  const file = picked.assets[0];
  if (!file?.uri) return { imported: 0, skipped: 0 };

  const content = await FileSystem.readAsStringAsync(file.uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  const note = markdownToNote(content);
  if (!note) return { imported: 0, skipped: 0 };

  const repo = await openNoteRepo();
  const existing = await repo.findById(note.id);
  const policy: ConflictPolicy = existing
    ? await promptPolicy(existing)
    : "overwrite";
  const action = resolveImportConflict(existing, policy);

  if (action === "insert" || action === "reinsert") {
    await repo.create({
      title: note.title,
      body: note.body,
      citedRefs: note.citedRefs,
    });
    return { imported: 1, skipped: 0 };
  }
  if (action === "update") {
    await repo.update(note.id, {
      title: note.title,
      body: note.body,
      citedRefs: note.citedRefs,
    });
    return { imported: 1, skipped: 0 };
  }
  return { imported: 0, skipped: 1 };
}
