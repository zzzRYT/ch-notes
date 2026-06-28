import { describe, it, expect } from "vitest";
import { EDITOR_CORE_VERSION } from "../index";

describe("editor-core scaffold", () => {
  it("exposes a version constant", () => {
    expect(EDITOR_CORE_VERSION).toBe("0.0.0");
  });
});
