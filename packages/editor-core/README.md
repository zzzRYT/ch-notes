# @ch-life/editor-core

Headless, platform-agnostic core for the ch-life note editor.

This package contains **pure logic only** — no React, no React Native, no Expo,
no file/DB I/O. It is the model + behavior layer that both the mobile app and the
web app can share. The view/input layer (React Native components, Expo bindings)
lives in the app, not here.

## What's in here (after Phase 2)

| Module | Responsibility |
| --- | --- |
| `domain` | `BlockNode`, `Note`, `Verse` — the shared vocabulary |
| `parser` | Bible reference parsing, book-name mapping, verse lookup |
| `editor` | Reference detection at cursor, block transforms, cited-ref extraction |
| `markdown` | BlockNode ⇄ Markdown (share format) serialization |

## Deliberately NOT in here

- **`assets/bible.json`** (CC BY-SA 4.0). The verse-lookup functions take Bible
  data via **dependency injection** (`createBibleLookup(data)`); the app supplies
  it at runtime. This keeps the license boundary clean and the package small.
- **Persistence** (`note-repo`, `migrate`). That's a separate concern; it may
  become its own `@ch-life/note-store` package later.

## Scripts

| Command | Action |
| --- | --- |
| `pnpm build` | Bundle to `dist/` (ESM + CJS + types) via tsup |
| `pnpm test` | Run unit tests via Vitest |
| `pnpm typecheck` | `tsc --noEmit` |
