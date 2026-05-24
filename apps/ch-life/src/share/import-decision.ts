import type { Note } from "@/domain/types";

export type ConflictPolicy = "overwrite" | "new-id" | "skip";
export type ConflictResult = "insert" | "update" | "reinsert" | "skip";

export function resolveImportConflict(
  existing: Note | null,
  policy: ConflictPolicy,
): ConflictResult {
  if (!existing) return "insert";
  if (policy === "overwrite") return "update";
  if (policy === "new-id") return "reinsert";
  return "skip";
}
