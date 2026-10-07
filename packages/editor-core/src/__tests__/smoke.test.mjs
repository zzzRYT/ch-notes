import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "vitest";

test("built package supports ESM and CJS with matching declarations", () => {
  const root = fileURLToPath(new URL("../../", import.meta.url));
  execFileSync(process.execPath, ["--input-type=module", "-e", `
    import { strict as assert } from "node:assert";
    import { createRequire } from "node:module";
    import { EDITOR_CORE_VERSION } from "@ch-life/editor-core";
    assert.equal(EDITOR_CORE_VERSION, "0.0.0");
    assert.equal(createRequire(import.meta.url)("@ch-life/editor-core").EDITOR_CORE_VERSION, "0.0.0");
  `], { cwd: root, stdio: "inherit" });

  const fixture = mkdtempSync(join(tmpdir(), "ch-life-core-"));
  try {
    mkdirSync(join(fixture, "node_modules/@ch-life"), { recursive: true });
    symlinkSync(root, join(fixture, "node_modules/@ch-life/editor-core"), "junction");
    const source = 'import { EDITOR_CORE_VERSION } from "@ch-life/editor-core"; const version: "0.0.0" = EDITOR_CORE_VERSION;';
    const entries = [join(fixture, "esm.mts"), join(fixture, "cjs.cts")];
    for (const entry of entries) writeFileSync(entry, source);
    const require = createRequire(import.meta.url);
    execFileSync(process.execPath, [require.resolve("typescript/bin/tsc"),
      "--noEmit", "--strict", "--module", "Node16", "--moduleResolution", "Node16",
      ...entries,
    ], { cwd: root, stdio: "inherit" });
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});
