# 작업별 진입점

**코드를 열기 전에 여기서 자기 작업을 찾는다.** 절차 전체는 [`workflow.md`](workflow.md).

각 영역은 네 가지를 준다 — 먼저 읽을 **ID**, 손대게 될 **코드**, 지켜 줄 **테스트**, 그리고 **같은 변경에서 함께 고쳐야 하는 것**. 마지막 항목이 이 문서의 핵심이다. 이 저장소에는 같은 값을 두세 곳에 손으로 옮겨 적은 자리가 많고, 한 곳만 고치면 조용히 어긋난다.

읽는 양은 작업 크기에 맞춘다. 오타 하나면 해당 줄만 봐도 된다.

---

## 코드 경로로 찾기

| 건드릴 곳 | 영역 |
|---|---|
| `src/entities/scripture/**` | [성경 참조 해석](#1-성경-참조-해석표기) |
| `src/widgets/note-editor/**`, `src/features/scripture/insert/**`, `src/features/note/autosave/**`, `src/pages/note-editor/**` | [에디터·인용 삽입](#2-에디터인용-삽입) |
| `src/entities/note/{model,api}/**`, `src/shared/lib/sqlite.ts`, `src/app/_layout.tsx` | [노트 저장·DB 스키마](#3-노트-저장db-스키마) |
| `src/entities/note/api/sqlite-note-repo.ts` (searchNotes), `src/features/note/search/**`, `src/pages/notes/ui/NoteListSidebar.tsx` | [검색](#4-검색) |
| `src/entities/note/api/markdown-*.ts`, `src/features/note/{import,export}/**` | [마크다운 공유](#5-마크다운-내보내기가져오기) |
| `src/widgets/scripture-browser/**`, `src/pages/bible-reader/**`, `src/pages/notes/ui/BiblePanel.tsx` | [성경 리더](#6-성경-리더) |
| `src/shared/ui/**`, `src/features/settings/change/**`, `src/pages/notes/**`, `src/pages/settings/**` | [UI·테마·레이아웃](#7-ui테마레이아웃접근성) |
| `app.config.ts`, `eas.json`, `.github/workflows/**`, `src/features/app-update/notice/**`, `src/shared/config/version.ts`, `website/app-version.json` | [릴리스·개발 하네스](#8-릴리스개발-하네스) |
| `src/**` 폴더를 새로 만들거나 옮길 때, `eslint.config.js`의 경계 규칙 | [구조·레이어](#0-구조레이어) |
| 커밋·브랜치·PR·이슈·릴리스 절차 | [`git.md`](git.md) |

경로는 모두 `apps/ch-life/` 기준이다(릴리스 영역의 `.github/**` 제외).

---

## 0. 구조·레이어

`src/`는 FSD 레이어다 — `app → pages → widgets → features → entities → shared`, 의존은 이 방향으로만. Slice 밖에서는 그 Slice의 `index.ts`만 import한다. 어기면 `pnpm lint`가 실패한다.

**먼저 읽는다** — [ADR-0024](decisions/ADR-0024-fsd-ddd-architecture.md)

**코드** `src/app/_layout.tsx`(Composition Root — 저장소·마이그레이션·테마·업데이트 안내를 여기서만 조립한다) · `eslint.config.js`(경계 규칙)
**테스트** 없음 — 경계는 린트가 지킨다. 규칙이 실제로 잡는지 의심되면 위반 파일을 하나 만들어 `pnpm lint`를 돌려 본다.

**같은 변경에서 함께 고친다**
1. 새 Slice를 만들면 `index.ts`를 같이 만든다. `export *`는 린트가 거부한다.
2. 파일을 옮기면 이 문서와 `rules/**`·`contracts/**`의 `implemented_by`/`verified_by` 경로를 같이 옮긴다 — `node wiki/check.mjs`가 잡는다.
3. 노트 엔티티는 성경 엔티티를 import하지 못한다. 둘을 잇는 코드(인용 표시·삽입·마크다운 참조 해석)는 `src/features/scripture/insert`·`src/widgets/note-editor`에 있거나 주입받는다.

**함정**
- `shared`는 위 레이어를 모른다. `ThemeProvider`가 스토어 대신 `settings` prop을 받는 이유다.
- 유스케이스는 `repo`를 인자로 받는다. 화면은 `useNoteRepo()`(Composition Root가 넣어 준 것)로 꺼내 넘긴다. 기본 인자로 어댑터를 숨기지 않는다.
- `useNoteRepo()`는 `NoteRepoProvider` 밖에서 부르면 던진다. 테스트에서 화면을 렌더하려면 Provider부터.

---

## 1. 성경 참조 해석·표기

참조 문자열을 책 코드로 바꾸고(`ref-parser`·`book-map`), `bible.json`에서 본문을 찾고(`verse-lookup`), 정식 이름으로 되돌려 보여주는(`format-ref`) 순수 로직 계층.

**먼저 읽는다** — POL-SCRIPTURE-001 · RULE-REF-001 · RULE-REF-002 · RULE-REF-003 · RULE-REF-004 · RULE-REF-005 · [CONTRACT-BIBLE-JSON](contracts/CONTRACT-BIBLE-JSON.md)

**코드** `src/entities/scripture/model/{ref-parser,book-map,format-ref}.ts` · `src/entities/scripture/api/{verse-lookup,books-meta,bible-data}.ts` · 소비자: `src/features/scripture/insert/model/autocomplete.ts`, `src/widgets/scripture-browser/lib/browser-search.ts`
**테스트** `src/entities/scripture/model/__tests__/*.test.ts` · `src/entities/scripture/api/__tests__/*.test.ts` (5/5 자동 증거)

**같은 변경에서 함께 고친다**
1. **책 토큰 정규식이 세 곳에 있다** — `ref-parser.ts`, `autocomplete.ts`, `browser-search.ts`. 공유 상수가 없고 이미 서로 다르다([`drift.md`](drift.md) B12).
2. **66권 목록이 세 곳에 있다** — `book-map.ts`의 `ALIAS_TABLE`, `books-meta.ts`의 `BOOKS_META.nameKo`, `assets/bible.json`의 최상위 키. 교차 검증 테스트 없음(B13).
3. 테스트 `describe`/`it` 이름을 바꾸면 RULE-REF-002의 `verified_by` `#조각`도 같이 고친다 — 안 그러면 `check.mjs`가 실패한다.

**함정**
- ⚠️ **숫자로 시작하는 영어 책 17권이 파서에 도달하지 못한다**(B11). `book-map.test.ts`는 통과하는데 `parseRef`는 실패하는 구간이다.
- `1 John 1:1 `은 조용히 **요한복음**을 삽입한다(B10).
- 본문 조회는 all-or-nothing — 범위 끝 절이 없으면 통째로 `null`.
- 왜 외부 라이브러리 대신 자체 별칭 표인지는 기록이 없다(E9).

---

## 2. 에디터·인용 삽입

참조를 치고 space를 누르면 문단이 3분할되며 인용 블록이 끼어드는 기능. 트리거 감지 → 분할 → `citedRefs` 재계산 → 자동저장까지 한 묶음.

**먼저 읽는다** — POL-SCRIPTURE-001 · POL-NOTE-001 · RULE-EDIT-001 · RULE-EDIT-002 · RULE-EDIT-007 · RULE-EDIT-003 · RULE-EDIT-004 · [CONTRACT-DOMAIN-NOTE](contracts/CONTRACT-DOMAIN-NOTE.md) · [ADR-0001](decisions/ADR-0001-native-block-editor.md) · [ADR-0002](decisions/ADR-0002-space-trigger.md)

**코드** `src/widgets/note-editor/ui/{NoteEditor,ParagraphInput,QuoteBlock,SermonMetaHeader}.tsx` · `src/widgets/note-editor/model/useNoteDraft.ts`(불러오기→자동저장→삽입을 폰·태블릿이 공유) · `src/features/scripture/insert/model/{autocomplete,split-paragraph,insert-verse,scripture-field}.ts` · `src/features/note/autosave/model/useAutoSave.ts` · `src/entities/note/model/{cited-refs,citation}.ts` · `src/pages/note-editor/ui/NoteEditorPage.tsx` · `src/pages/notes/ui/TabletWorkspace.tsx`
**테스트** `src/features/scripture/insert/model/__tests__/{autocomplete,insert-verse,scripture-field}.test.ts` · `src/entities/note/model/__tests__/cited-refs.test.ts` · `src/features/note/autosave/model/__tests__/useAutoSave-payload.test.ts` (9/13)

**같은 변경에서 함께 고친다**
1. **인용 블록은 `makeQuoteBlock`(`src/entities/note/model/citation.ts`) 한 곳에서만 만든다.** 인용의 모양(`status`·`editionId`)을 바꾸면 여기와 마크다운 파서(`src/entities/note/api/markdown-parse.ts`)를 같이 본다 — 파서는 형식 판별자 때문에 리터럴이 남아 있다.
2. 폰과 태블릿은 `useNoteDraft` 하나를 쓴다. 삽입·자동저장 동작을 바꾸면 그 훅에서 바꾸고, 두 화면이 각자 가진 것은 **삭제 순서**(flush→delete)와 오류 문구뿐이다.
3. 트리거 정규식을 고치면 `ref-parser.ts`도 함께(1번 영역 참조).
4. 동작을 바꿨으면 `rules/editor-insert.md`의 해당 블록을 같은 커밋에서.

**함정**
- 자동완성 문법이 `parseRef`보다 좁다(B10).
- 브라우저에서 넣는 인용은 커서 자리가 아니라 **본문 맨 끝**에 붙는다(A21).
- 죽은 코드가 남아 있다 — `QuoteBlock`의 `loading`/`error`(B6). `pendingInsertRef`·`"newNote"`는 지웠다.
- 범위 인용은 붙여 써야 한다(`1:1-3`). space가 트리거라 `1:1 - 3`은 `1:1`에서 이미 확정된다.
- 삽입 후 원본 참조 텍스트를 지우기로 한 이유는 기록이 없다(E5).
- **자동 증거 없음** — 캐럿 이동, backspace 병합, 힌트 칩, 인용 불변은 전부 수동(C3).

---

## 3. 노트 저장·DB 스키마

`notes` 테이블, 마이그레이션, `note-repo` 저장소 계층.

**먼저 읽는다** — POL-NOTE-001 · POL-PRIVACY-001 · RULE-NOTE-002 · RULE-NOTE-005 · RULE-NOTE-003 · [CONTRACT-DB-NOTES](contracts/CONTRACT-DB-NOTES.md) · [CONTRACT-DOMAIN-NOTE](contracts/CONTRACT-DOMAIN-NOTE.md) · [CONTRACT-NOTE-REPO](contracts/CONTRACT-NOTE-REPO.md) · [ADR-0005](decisions/ADR-0005-idempotent-migration.md) · [ADR-0006](decisions/ADR-0006-duplicated-schema.md)

**코드** `src/entities/note/api/{schema.sql,sqlite-note-repo.ts,migrate.ts}` · `src/entities/note/model/{types,note-repo}.ts` · `src/shared/lib/sqlite.ts`(연결·지연 열기) · `src/app/_layout.tsx`(마이그레이션 순서 조립)
**테스트** `src/entities/note/api/__tests__/{note-repo,note-repo-search,migrate,migrations}.test.ts` (6/8)
**스킬** `.claude/skills/db-schema-change/SKILL.md` — 체크리스트가 이미 있다. 그것부터.

**같은 변경에서 함께 고친다** (컬럼 하나를 더한다면)
1. `src/entities/note/api/schema.sql`의 `CREATE TABLE` **그리고** `src/entities/note/api/sqlite-note-repo.ts`의 `NOTE_SCHEMA_SQL` — 두 곳 다.
2. `src/entities/note/api/migrate.ts`의 `ADDED_NOTE_COLUMNS` — 빠뜨리면 **기존 사용자에게서만** 깨진다.
3. `src/entities/note/api/sqlite-note-repo.ts` 세 곳 — `Row` 타입, `rowToNote`, `create`·`restore`의 INSERT 목록, `update`의 `next` 병합 객체·UPDATE 문 컬럼 목록. 그리고 `src/entities/note/model/note-repo.ts`의 `NoteInput`/`NotePatch`. 조회는 전부 `SELECT *`라 손댈 것이 없고, 그래서 **컬럼을 빠뜨려도 읽기는 조용히 성공한다** — 빠진 필드는 `rowToNote`에서 `undefined`가 된다.
4. `src/entities/note/model/types.ts`의 `Note`.
5. 검색 대상이라면 `notes_fts` 컬럼 + 트리거 3개(두 파일 다).
6. `src/entities/note/api/markdown-{serialize,parse}.ts`의 frontmatter 매핑 — 빠뜨리면 그 필드가 내보내기에서 조용히 사라진다.
7. `src/entities/note/index.ts`에서 새 타입을 내보낸다 — 안 하면 화면에서 import할 수 없다.

**함정**
- ⚠️ **테스트가 검증하는 DDL이 프로덕션이 실행하는 DDL이 아니다**(B1·C1). `migrations.test.ts`는 `schema.sql`만 읽는다.
- `update`는 read-then-merge — `null`=비움, `undefined`=유지. 공통 헬퍼가 없어 새 필드마다 반복 구현해야 한다.
- `"최신 updated_at 우선"` 테스트는 실제로 `created_at`을 검증한다(C2).
- `repo.delete`는 스냅샷을 반환하고 `repo.restore`가 그것을 되돌린다. **`restore`는 id·`created_at`을 보존**하므로 `create`의 발급 규칙 밖이다 — 컬럼을 더하면 `restore`의 INSERT 목록도 함께 고친다(RULE-NOTE-007).
- 왜 버전 테이블을 안 뒀는지는 기록이 없다(E11).

---

## 4. 검색

**먼저 읽는다** — POL-NOTE-003 · RULE-SEARCH-001 · RULE-SEARCH-005 · RULE-SEARCH-002 · RULE-SEARCH-006 · RULE-SEARCH-007 · [ADR-0007](decisions/ADR-0007-fts-scope.md) · [ADR-0008](decisions/ADR-0008-created-at-ordering.md)

**코드** `src/entities/note/api/sqlite-note-repo.ts`(`searchNotes`) · `src/entities/note/api/schema.sql`(FTS 트리거) · `src/pages/notes/ui/NotesPage.tsx`(검색창) · `src/pages/notes/ui/NoteListSidebar.tsx`(태블릿)
**테스트** `src/entities/note/api/__tests__/note-repo-search.test.ts` (5/7)

**같은 변경에서 함께 고친다**
1. **검색 구현이 둘이다** — 폰은 FTS, 태블릿 사이드바는 메모리 필터. 검색 범위를 바꾸면 두 곳 다.
2. FTS 트리거는 `src/entities/note/api/schema.sql`과 `src/entities/note/api/sqlite-note-repo.ts`(`NOTE_SCHEMA_SQL`) 양쪽에.
3. 본문 검색을 실제로 켠다면: 트리거 + `src/entities/note/api/sqlite-note-repo.ts`(트리거만으로는 `body_json`을 못 푼다) + 기존 노트 재색인 + placeholder 문구 + RULE-SEARCH-001·[ADR-0007](decisions/ADR-0007-fts-scope.md) + [`drift.md`](drift.md) A8/D2/E3까지 전부.

**함정**
- placeholder는 "본문"을 검색한다고 안내하지만 안 된다(D2).
- ⚠️ **태블릿은 다르게 동작한다**(B8) — 부분 문자열 매칭, 미리 불러온 200건만, 그리고 **제목 없는 노트는 본문 앞 40자가 검색된다**.
- 접두 `*`는 마지막 토큰에만 붙는다 — `주일 설교`에서 `주일`은 정확히 일치해야 한다.
- 같은 절이라도 삽입 경로에 따라 저장된 문자열이 달라 검색 결과가 갈린다(B4).
- 200건 상한에는 증거도 의도 기록도 없다.
- 본문 미색인이 의도인지 누락인지 모른다(E3).

---

## 5. 마크다운 내보내기·가져오기

**먼저 읽는다** — POL-PORT-001 · POL-LICENSE-001 · RULE-MD-003 · RULE-MD-006 · RULE-MD-004 · RULE-NOTE-002 · [CONTRACT-MD-NOTE](contracts/CONTRACT-MD-NOTE.md) · [ADR-0003](decisions/ADR-0003-sqlite-markdown-hybrid.md) · [ADR-0009](decisions/ADR-0009-bible-source.md)

**코드** `src/entities/note/api/markdown-{serialize,parse}.ts` · `src/features/note/export/model/export-note.ts` · `src/features/note/import/model/{import-note,import-decision,use-note-import}.ts`
**테스트** `src/entities/note/api/__tests__/{serialize,roundtrip,rich-blocks}.test.ts` · `src/features/note/import/model/__tests__/import-decision.test.ts` (6/8)

**같은 변경에서 함께 고친다**
1. `markdown-serialize.ts`와 `markdown-parse.ts`는 **거울 쌍**이다 — `(KRV)` 리터럴 ↔ `VERSE_HEADER` 정규식, `- [x]` ↔ TODO 정규식, `#` ↔ HEADING 정규식. 한쪽 토큰을 바꾸면 반대쪽도.
2. `src/features/note/import/model/import-note.ts`의 `repo.create` **그리고** `repo.update` — 둘 다. 하나만 고치면 신규 삽입과 덮어쓰기 중 한쪽만 새 필드를 반영한다.
3. 내보내기 페이로드는 `useNoteDraft().snapshot()`이 만든다. 폰·태블릿 `handleExport`는 그것을 `repo.findById` 결과에 덮어씌우는 두 줄이다.
4. **비대칭 주의** — `markdown-serialize.ts`의 `blockToMarkdown`은 exhaustive switch라 새 블록 타입에서 컴파일 에러가 나지만, `markdown-parse.ts`의 `parseBody`는 정규식 나열이라 **복원 코드를 빠뜨려도 컴파일러가 안 잡는다.**

**함정**
- ⚠️ **덮어쓰기가 없는 필드를 지운다**(B16) — `parse.ts`가 `null`을 돌려주고 `repo.update`에서 `null`은 "비움"이다.
- ⚠️ **가져온 노트가 작성 시각을 잃는다**(B17) — 목록 맨 위로 올라온다.
- `roundtrip.test.ts`는 이름과 달리 `note-repo.ts`를 지나지 않는다(C6). 위 둘이 잡히지 않는 이유다.
- `import-note.ts`·`export-note.ts`에는 테스트가 아예 없다(C8).
- `(KRV)`는 잘못된 이름이지만 파서의 판별자라 못 바꾼다(B5). 파서는 이 헤더를 번들 판본(`LEGACY_CITATION_EDITION_ID`)으로 읽는다 — 마크다운은 `editionId`를 싣지 않는다.
- `markdownToNote`는 참조 해석기를 **주입받는다**(`{ resolveRef: parseRef }`). 노트 엔티티가 성경 엔티티를 import하지 못하기 때문이다.
- `schemaVersion`은 쓰기만 하고 읽지 않는다.

---

## 6. 성경 리더

같은 `BibleReader`가 홈(읽기 전용)·에디터 모달·태블릿 패널 세 진입점에 재사용된다.

**먼저 읽는다** — POL-SCRIPTURE-002 · RULE-BIBLE-001 · RULE-BIBLE-002 · RULE-BIBLE-003 · RULE-BIBLE-006 · RULE-UI-001 · [CONTRACT-BIBLE-JSON](contracts/CONTRACT-BIBLE-JSON.md) · [ADR-0011](decisions/ADR-0011-bible-entrypoints.md)

**코드** `src/widgets/scripture-browser/**` · `src/pages/notes/ui/{BiblePanel,BibleLookupPanel}.tsx` · `src/pages/bible-reader/ui/BibleReaderPage.tsx`
**테스트** `src/entities/scripture/api/__tests__/books-meta.test.ts` · `src/widgets/scripture-browser/lib/__tests__/{browser-search,level-from-ref}.test.ts` (4/7)

**같은 변경에서 함께 고친다**
1. 책 이름은 `src/entities/scripture/api/books-meta.ts`(삽입용)와 `src/entities/scripture/model/book-map.ts`(표시용) 두 표에서 온다 — 어긋나면 **넣은 참조와 보이는 참조가 달라진다**(B13).
2. 삽입 로직은 `useNoteDraft().insertRef` 하나다. 세 진입점(홈 리더·에디터 시트·태블릿 패널)은 콜백을 넘길 뿐이다.
3. `lastBibleRef`의 `"{BookCode} {chapter}"` 포맷에 세 곳이 의존한다 — 만드는 `src/widgets/scripture-browser/model/useBiblePosition.ts`, 쪼개는 `src/widgets/scripture-browser/lib/browser-search.ts`, 그 결과를 쓰는 `src/widgets/scripture-browser/lib/level-from-ref.ts`. 그리고 [CONTRACT-SETTINGS-FILE](contracts/CONTRACT-SETTINGS-FILE.md)의 표. `src/features/settings/change/model/settings-validator.ts`는 **포맷을 검사하지 않는다** — 문자열이기만 하면 통과시키므로, 포맷을 깨도 저장·복원 단계에서는 아무 경고가 없다.
4. 900px는 `src/shared/lib/useResponsiveLayout.ts`의 `TABLET_BREAKPOINT` 한 곳이다.

**함정**
- 절까지 입력해도 **장까지만** 이동한다(A19). 삽입 토스트도 없다(A20).
- 리더 컴포넌트들은 `useTheme`을 안 쓰고 색을 하드코딩한다 — **다크 변형에서 이 화면들만 밝다**(B9).
- "최근" 칩은 하드코딩 상수다(D5).
- `BibleLookupPanel`은 문서에 없던 **네 번째** `citedRefs` 표기 경로다(B4).
- RULE-BIBLE-006에는 자동 증거가 없다 — 붙어 있던 테스트가 실제로 그 코드를 지나지 않았다(C7).

---

## 7. UI·테마·레이아웃·접근성

**먼저 읽는다** — POL-A11Y-001 · RULE-SET-003 · RULE-UI-001 · RULE-SET-002 · RULE-UI-002 · [CONTRACT-SETTINGS-FILE](contracts/CONTRACT-SETTINGS-FILE.md) · [ADR-0010](decisions/ADR-0010-variation-theming.md) · [ADR-0004](decisions/ADR-0004-settings-file.md)

**코드** `src/shared/ui/{ThemeProvider,AppHeader,HeaderControls,SwipeToDelete,ActionBannerHost}.tsx` · `src/features/settings/change/model/{settings-store,settings-validator,settings-persist,useSettingsPersistence}.ts` · `src/shared/lib/{feedback,useResponsiveLayout}.ts` · `src/pages/settings/ui/SettingsPage.tsx` · `src/pages/notes/ui/**`
**테스트** `src/features/settings/change/model/__tests__/{settings-validator,settings-store}.test.ts` · `src/shared/lib/__tests__/feedback.test.ts` (4/6, RULE-UI는 **0/6**)

**같은 변경에서 함께 고친다**
1. ⚠️ **`fontScale`에 값을 더한다면 세 곳 전부** — `src/features/settings/change/model/settings-store.ts`의 `Settings` 유니온 → 같은 폴더 `settings-validator.ts`의 `ALLOWED_FONT` → `src/pages/settings/ui/SettingsPage.tsx`의 `FONT_OPTIONS`(사용자가 실제로 고르는 목록). `settings-store.ts`의 기본값 `1.2`는 그대로 둔다 — 형제 필드들과 같은 3단 구조다(B15). validator를 빠뜨리면 사용자가 그 값을 고른 순간 **다음 실행에서 `settings.json` 전체가 버려지고 기본값으로 리셋된다.**
2. `variation`·`blockStyle`·`fontFamily`·`accentChoice`도 같은 3중 구조다 — 다만 이 넷의 **타입은 `src/shared/ui/ThemeProvider.tsx`가 정본**이고 `Settings`가 가져다 쓴다. `accentChoice`의 hex 6개는 세 파일에 리터럴로 박혀 있다(B15).
3. 테마는 `ThemeProvider settings={…}` prop으로 받는다. 설정 필드가 테마에 영향을 주면 `ThemeSettings` 타입에도 넣는다.
4. [CONTRACT-SETTINGS-FILE](contracts/CONTRACT-SETTINGS-FILE.md)의 스키마 표와 `rules/settings-theme.md`도 같은 커밋에서.

**함정**
- **색은 `variation`만으로 결정된다.** `themePreference`는 아무 영향이 없고 설정 화면에도 없다. OS 다크모드를 따라가지 않는다.
- 새 설정 필드는 **개별 폴백** 쪽으로. 전체 거부는 `fontScale`·`themePreference`뿐이다.
- 태블릿에는 메타 헤더 → 본문 포커스 핸드오프가 없다(B7).
- 팔레트에 구 필드와 신 토큰이 공존한다(B9).
- **이 영역은 자동 증거가 전혀 없다**(C3). 그래서 RULE-UI-*는 전부 `SHOULD`다.

---

## 7-1. 디자인 시스템·Figma

**먼저 읽는다** — [ADR-0023](decisions/ADR-0023-figma-design-system-structure.md) · [ADR-0010](decisions/ADR-0010-variation-theming.md) · [rules/layout-a11y.md](rules/layout-a11y.md)(RULE-UI-004·005) · [drift.md](drift.md) B27~B30 · E19 · E21 · E22

**코드** `docs/design-system/figma-plugin/*` (플러그인) · `apps/ch-life/src/shared/ui/ThemeProvider.tsx` (팔레트 원본)

**토큰의 정본은 Figma다**([E19](drift.md)). 코드에서 뽑아 부트스트랩했지만 이후로는 Figma가 앞선다 — `CLAUDE.md`의 "구현 코드가 최종 판정 기준"에 대한 **명시적 예외**이고, 절차는 아직 확정되지 않았다([E21](drift.md)).

**컴포넌트를 더하기 전에 층위와 등급을 정한다.** 층위(Atom/Molecule/Organism)는 보드를 나누고, 등급(`code`/`proposed`/`planned`)은 이름 접두사가 된다. 판정 규칙은 [ADR-0023](decisions/ADR-0023-figma-design-system-structure.md)에 있다 — 매번 다시 논쟁하지 않는다.

**이름을 바꾸거나 합칠 때는 순서가 있다.** ⑴ RN에 실제 공유 컴포넌트를 뽑고 ⑵ 호출부를 전부 바꾸고 ⑶ 그 다음에 Figma를 정리한다. Figma를 먼저 정리하면 배치된 인스턴스가 끊긴다.

**고치고 나면** `node docs/design-system/figma-plugin/build.mjs` → `node docs/design-system/figma-plugin/stub-test.mjs`. 스텁이 페이지 한도·보드 범위·컴포넌트 id 안정성·사양 자기모순을 대조한다.

---

## 8. 릴리스·개발 하네스

**먼저 읽는다** — POL-RELEASE-001 · [POL-RELEASE-002](policy/POL-RELEASE.md) · [POL-RELEASE-003](policy/POL-RELEASE.md) · [rules/release.md](rules/release.md)(RULE-OTA-001~010) · [CONTRACT-RELEASE](contracts/CONTRACT-RELEASE.md) · [ADR-0013](decisions/ADR-0013-release-path.md) · [ADR-0016](decisions/ADR-0016-cold-launch-apply.md) · [ADR-0014](decisions/ADR-0014-worktree-workflow.md) · [ADR-0022](decisions/ADR-0022-store-update-notice.md)

**번들을 발행하기 전에는 [rules/release.md](rules/release.md)를 먼저 본다.** 오프라인이 기본인 앱에 OTA를 얹었기 때문에, 다른 앱에서는 안전한 변경이 여기서는 되돌릴 수 없는 변경이 된다.

**코드** `app.config.ts` · `eas.json` · `.npmrc` · `hot-updater.config.ts` · `src/app/_layout.tsx` · `scripts/deploy-ota.mjs` · `src/features/app-update/notice/model/{compare-version,latest-store-version,store-link}.ts` · `src/features/app-update/notice/ui/StoreUpdateDialog.tsx` · `src/shared/config/version.ts` · `website/app-version.json` · `.github/workflows/{ci,eas-update,eas-build,pages}.yml`
**스킬** `.claude/skills/eas-release/SKILL.md`(릴리스), `.claude/skills/start-feature/SKILL.md`(새 작업)
**테스트** `src/features/app-update/notice/model/__tests__/{compare-version,latest-store-version}.test.ts` — 이 영역의 **유일한** 자동 증거다. CI는 `typecheck`/`lint`/`test:ci`만 돌고 `eas.json`이나 `app.config.ts`는 열어 보지 않는다.

**같은 변경에서 함께 고친다**
1. `eas.json`은 [CONTRACT-RELEASE](contracts/CONTRACT-RELEASE.md)의 `implemented_by`에 올라 있다 — 동작을 바꾸면 같은 커밋에서 계약도.
2. **고정 식별자 표는 손으로 옮겨 적은 사본이다.** EAS project UUID는 `app.config.ts`에 두 번, 계약 표에 세 번째로 있다. `bundleIdentifier`·`scheme`·채널 이름도 같다.
3. **버전이 사는 자리가 셋이다** — `app.config.ts`의 `version`(스토어), `src/shared/config/version.ts`의 `OTA_RELEASE`(번들 순번, 스토어 버전이 오르면 0으로), `website/app-version.json`(앱이 읽는 최신 스토어 버전). 앞의 둘은 릴리스 PR에서, 셋째는 **심사 통과 뒤 `main`으로 따로** 올린다([`RULE-OTA-010`](rules/release.md)). 어긋나면 조용히 틀린다.
4. `version`을 올리는 것과 새 빌드를 내는 것은 한 세트다.
5. `eas.json`에 프로필을 더하면 두 워크플로의 `options` 드롭다운도.

**함정**
- ⚠️ OTA는 `updateStrategy: "appVersion"` — **`version`만 올리고 OTA를 쏘면 아무에게도 안 닿는다.**
- `.npmrc`의 `node-linker=hoisted`가 없으면 번들이 깨진다. **CI는 이걸 못 잡는다.**
- `appVersionSource: "remote"` ↔ 동적 `app.config.ts` ↔ `autoIncrement` 3자 결합. 깨지면 EAS 서버 단계에서야 실패한다(커밋 `769fe51`).
- **`hot-updater`가 이제 정본이다**(`30b6a60`, PR #14). `expo-updates`는 제거됐다. ⚠️ **스토어의 1.0.1은 `expo-updates` 바이너리라 OTA가 닿지 않는다** — 1.0.1 사용자에게 뭔가 보내려면 새 스토어 빌드뿐이다. OTA 워크플로는 시크릿/변수 7개를 `test -n`으로 검사하므로 하나만 없어도 잡이 실패한다.
- ⚠️ **번들은 한 칸만 되돌아가고 스키마는 되돌아가지 않는다.** 컬럼 삭제·개명, 새 `BlockNode` 타입은 OTA로 내보내면 안 된다([RULE-OTA-008](rules/release.md), [RULE-OTA-009](rules/release.md)).
- ⚠️ **오프라인 기기는 중간 번들을 전부 건너뛴다.** 번들이 순서대로 적용된다는 전제로 마이그레이션이나 데이터 이관을 설계하면 그 기기에서 깨진다([RULE-OTA-004](rules/release.md)).
- 서버에서 번들을 내려도(`bundle disable`) 오프라인 기기에는 닿지 않고, 닿아도 적용은 다음 콜드 런치다. **롤백 소요 시간에 하한이 없다**([ADR-0016](decisions/ADR-0016-cold-launch-apply.md)).
- ⚠️ **`app-version.json`을 버전 bump와 같은 PR에 넣으면 안 된다.** 심사 중인 버전을 스토어에 있는 것처럼 안내하게 된다. `pages.yml`은 `main` 푸시의 `website/**` 변경에만 돈다.
- 워크트리는 `.worktrees` 아래에 두라고 문서에 적혀 있으나 실제 위치가 다를 수 있다 — 시작 전에 `git worktree list`로 확인한다.

---

## 여기 없는 작업이라면

폴더 인덱스로 간다 — [`policy/`](policy/index.md) · [`rules/`](rules/index.md) · [`contracts/`](contracts/index.md) · [`decisions/`](decisions/index.md).

그리고 **이 문서에 항목을 하나 더한다.** 다음 사람이 같은 탐색을 반복하지 않도록.
