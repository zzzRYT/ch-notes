# editor-core extraction — plan & study log

A learning-driven extraction of the ch-life note editor's pure logic into a
standalone, headless package (`@ch-life/editor-core`). Goals, in order:

1. **Full separation** of model/logic from view/platform.
2. **Package-management practice** (workspaces, build, versioning, publishing).
3. **System-design study** (layered architecture, dependency inversion, headless
   editor pattern, API contract design).

> Branch: `feat/editor-core-pkg` · worktree: `.worktrees/editor-core-pkg`

## Stack decisions

| Choice | Decision | Why |
| --- | --- | --- |
| Monorepo | pnpm workspace only (Turborepo later) | KISS; 2 packages don't justify Turbo yet |
| Core build | tsup (esbuild) | dual ESM/CJS + dts with minimal config; teaches `exports` |
| Core tests | Vitest | pure-TS lib; faster + simpler than jest-expo (app keeps jest) |
| Bible data | dependency-injected, never bundled | CC BY-SA license isolation + small package |
| Persistence (`db/`) | NOT extracted now | it's a separate domain; future `@ch-life/note-store` |

## Core ↔ view boundary (from code map)

**Extract to `editor-core` (pure, RN/Expo deps = 0):**

| Module | Source files | Key exports |
| --- | --- | --- |
| domain | `src/domain/types.ts` | `BlockNode`, `Note`, `Verse` |
| parser | `src/parser/{ref-parser,book-map,format-ref,verse-lookup}.ts` | `parseRef`, `resolveBookCode`, `bookDisplayName`, `formatRef`, `lookupVerses`* |
| editor logic | `src/editor/{useAutocomplete,inlineMarks,cited-refs,field-nav,scripture-field,calendar}.ts`, `useAutoSave.ts::buildSavePayload` | `detectRefAtCursor`, `detectTriggeredRef`, `splitAtRef`, `stripInlineMarks`, `extractCitedRefs`, `nextMetaField`, `firstParagraphIndex`, `validateScripture`*, date utils |
| markdown | `src/markdown/{parse,serialize}.ts` | `markdownToNote`, `parseBody`, `noteToMarkdown`, `blockToMarkdown`, `noteFileName` |

\* `lookupVerses` / `validateScripture` need the bible-data DI refactor.

**Stay in the app (view/platform):** all `.tsx` (NoteEditor, ParagraphInput,
QuoteBlock, SermonMetaHeader, modals), `db/expo-adapter.ts`, `db/index.ts`,
`share/{export,import}-note.ts`, hooks (`useAutoSave`, `useNoteImport`),
`assets/bible.json`.

**Deferred (pure but not "editor"):** `db/note-repo.ts`, `db/migrate.ts`.

## Phase roadmap

- [ ] **Phase 1 — workspace + scaffold.** Root pnpm workspace (`packages/*`),
      `@ch-life/editor-core` scaffold (tsup + vitest + exports map). App untouched.
      Verify: build + smoke test green; `git status` shows no changes under `apps/`.
      _Done once (build emitted ESM+CJS+dts, smoke test passed, app dir unchanged;
      pnpm 10 needed `onlyBuiltDependencies: [esbuild]` in root), then **reverted
      out of `main` on 2026-09-06** — see below._

> **The scaffold is not in `main`.** Phase 1 landed on `main` and was removed again:
> the root workspace made pnpm v10 hijack the app install, which cost every workflow
> an `--ignore-workspace` flag, while nothing consumed `@ch-life/editor-core` yet —
> a live cost for a package with one smoke test in it. The work survives in
> `feat/editor-core-pkg` and in git history; redo Phase 1 on a branch when Phase 2
> actually starts, and keep it there until the app is ready to consume the package.
- [ ] **Phase 2 — port pure logic (TDD).** Move modules above into `editor-core`,
      port their tests, do the `createBibleLookup(data)` DI refactor. ≥80% coverage.
- [ ] **Phase 3 — versioning/publishing.** Add Changesets; cut a version; run the
      publish flow (internal/registry) once end-to-end.
- [ ] **Phase 4 — app integration (the risky one).** Fold `apps/ch-life` into the
      workspace, add Expo monorepo Metro config + hoisted linker, repoint app
      imports to `@ch-life/editor-core`, delete now-duplicated app source, verify
      typecheck + jest + `expo start`.
- [ ] **Phase 5 (stretch) — native module.** Move the input layer to a real Expo
      Module (Swift/Kotlin) via `create-expo-module`.

## System-design concepts this exercise teaches

- Layered architecture & acyclic dependency direction (core → nothing; app → core)
- Headless pattern: model separated from view (cf. Lexical `@lexical/core`)
- Dependency inversion: bible data + DB adapter injected, not imported
- API contract design & semver discipline (what's a breaking change in an editor?)
- "Promote a module to its own package when it earns it" (don't pre-split)
