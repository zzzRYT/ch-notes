// @ch-life/editor-core — public surface (barrel).
//
// Phase 2 populates this with the ported pure modules:
//   export * from "./domain/types";
//   export * from "./parser";
//   export * from "./editor";
//   export * from "./markdown";
//
// Keep this file as the SINGLE public entry point. Anything not re-exported here
// is package-internal — that boundary is what lets us refactor internals freely.
export const EDITOR_CORE_VERSION = "0.0.0";
