import { resolveImportConflict } from "../import-decision";
import type { Note } from "@/domain/types";

const stub: Note = {
  id: "x",
  title: null,
  body: [],
  createdAt: 0,
  updatedAt: 0,
  citedRefs: [],
  sermonDate: null,
  preacher: null,
  location: null,
  scripture: null,
};

describe("resolveImportConflict", () => {
  it("기존 노트 없음 → insert", () => {
    expect(resolveImportConflict(null, "overwrite")).toBe("insert");
    expect(resolveImportConflict(null, "skip")).toBe("insert");
    expect(resolveImportConflict(null, "new-id")).toBe("insert");
  });

  it("기존 노트 + overwrite → update", () => {
    expect(resolveImportConflict(stub, "overwrite")).toBe("update");
  });

  it("기존 노트 + new-id → reinsert", () => {
    expect(resolveImportConflict(stub, "new-id")).toBe("reinsert");
  });

  it("기존 노트 + skip → skip", () => {
    expect(resolveImportConflict(stub, "skip")).toBe("skip");
  });
});
