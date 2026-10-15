# editor-core extraction — plan & study log

A learning-driven extraction of the ch-life note editor's pure logic into a
standalone, headless package (`@ch-life/editor-core`). Goals, in order:

1. **Full separation** of model/logic from view/platform.
2. **Package-management practice** (workspaces, build, versioning, publishing).
3. **System-design study** (layered architecture, dependency inversion, headless
   editor pattern, API contract design).

> Tracking issue: #24. No branch carries this work right now — the Phase 1 code
> exists only in git history (`798f095` from #16, removed by `cb85692` in #21).
> Phase 1 is redone on an integration branch in #50.

## Stack decisions

| Choice | Decision | Why |
| --- | --- | --- |
| Monorepo | pnpm workspace only (Turborepo later) | KISS; 2 packages don't justify Turbo yet |
| Core build | tsup (esbuild) | dual ESM/CJS + dts with minimal config; teaches `exports` |
| Core tests | Vitest | pure-TS lib; faster + simpler than jest-expo (app keeps jest) |
| Bible data | dependency-injected, never bundled | CC BY-SA license isolation + small package |
| Persistence (`src/entities/note/api/`) | NOT extracted now | it's a separate domain; future `@ch-life/note-store` |

## Core ↔ view boundary (from code map)

Paths are relative to `apps/ch-life/` and follow the FSD layout (2026-09-20, #28).

**Extract to `editor-core` (pure, RN/Expo deps = 0):**

| Module | Source files | Key exports |
| --- | --- | --- |
| domain | `src/entities/note/model/types.ts`, `src/entities/scripture/model/types.ts` | `BlockNode`, `Note`, `Verse` |
| parser | `src/entities/scripture/model/{ref-parser,book-map,format-ref}.ts`, `src/entities/scripture/api/verse-lookup.ts` | `parseRef`, `resolveBookCode`, `bookDisplayName`, `formatRef`, `lookupVerses`* |
| note pure logic | `src/entities/note/model/{cited-refs,citation}.ts`, `src/entities/note/lib/inline-marks.ts` | `extractCitedRefs`, `makeQuoteBlock`, `withCitationEdition`, `stripInlineMarks`, `toggleInlineMark` |
| markdown | `src/entities/note/api/markdown-{parse,serialize}.ts` | `markdownToNote`, `noteToMarkdown`, `blockToMarkdown`, `noteFileName` |
| editor logic | `src/features/scripture/insert/model/{autocomplete,scripture-field,split-paragraph}.ts`, `src/widgets/note-editor/lib/{field-nav,calendar}.ts`, `src/features/note/autosave/model/useAutoSave.ts::buildSavePayload` | `detectRefAtCursor`, `detectTriggeredRef`, `splitAtRef`, `splitParagraphWithQuote`, `validateScripture`*, `nextMetaField`, `firstParagraphIndex`, date utils, `buildSavePayload` |

\* `lookupVerses` / `validateScripture` need the bible-data DI refactor (#48).
`buildSavePayload` shares a file with the React hook and moves out first (#49).

**Stay in the app (view/platform):** all `.tsx` (`src/widgets/note-editor/ui/` —
NoteEditor, ParagraphInput, QuoteBlock, SermonMetaHeader, modals),
`src/shared/lib/sqlite.ts`, `src/entities/note/api/sqlite-note-repo.ts`,
`src/features/note/export/model/export-note.ts`,
`src/features/note/import/model/import-note.ts`, hooks
(`useAutoSave`, `src/features/note/import/model/use-note-import.ts`),
`assets/bible.json`.

**Deferred (pure but not "editor"):** `src/entities/note/model/note-repo.ts`,
`src/entities/note/api/migrate.ts`.

## Phase roadmap

Each phase is tracked as a sub-issue of #24.

- [ ] **Prep (in the app, `main`).** Fix this plan (#47), `createBibleLookup(data)`
      DI (#48), split `buildSavePayload` out of the hook file (#49).
- [ ] **Phase 1 — workspace + scaffold (#50).** Root pnpm workspace (`packages/*`),
      `@ch-life/editor-core` scaffold (tsup + vitest + exports map). App untouched.
      Verify: build + smoke test green; `git status` shows no changes under `apps/`.
      _Done once (build emitted ESM+CJS+dts, smoke test passed, app dir unchanged;
      pnpm 10 needed `onlyBuiltDependencies: [esbuild]` in root), then **reverted
      out of `main` on 2026-09-06** — see below._

> **The scaffold is not in `main`.** Phase 1 landed on `main` and was removed again:
> the root workspace made pnpm v10 hijack the app install, which cost every workflow
> an `--ignore-workspace` flag, while nothing consumed `@ch-life/editor-core` yet —
> a live cost for a package with one smoke test in it. The work survives only in
> git history (`798f095`, removed by `cb85692`); redo Phase 1 on an integration
> branch when Phase 2 actually starts (#50), and keep it there until the app is
> ready to consume the package.
- [ ] **Phase 2 — port pure logic (TDD).** Move modules above into `editor-core`,
      port their tests, do the `createBibleLookup(data)` DI refactor. ≥80% coverage.
      Sub-issues: parser #51, bible lookup #52, note domain #53, markdown #54,
      editor logic #55.
- [ ] **Phase 3 — versioning/publishing (#57).** Add Changesets; cut a version; run the
      publish flow (internal/registry) once end-to-end.
- [ ] **Phase 4 — app integration (the risky one).** Fold `apps/ch-life` into the
      workspace, add Expo monorepo Metro config + hoisted linker (#58), repoint app
      imports to `@ch-life/editor-core`, delete now-duplicated app source, verify
      typecheck + jest + `expo start` (#59).
- [ ] **Phase 5 (stretch) — native module.** Move the input layer to a real Expo
      Module (Swift/Kotlin) via `create-expo-module`.

## System-design concepts this exercise teaches

- Layered architecture & acyclic dependency direction (core → nothing; app → core)
- Headless pattern: model separated from view (cf. Lexical `@lexical/core`)
- Dependency inversion: bible data + DB adapter injected, not imported
- API contract design & semver discipline (what's a breaking change in an editor?)
- "Promote a module to its own package when it earns it" (don't pre-split)
