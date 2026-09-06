# 어긋난 것들 (drift ledger)

이 문서는 **정본(구현)과 다른 모든 것의 목록**이다. 계획 문서와의 차이, 구현 내부의 모순, 테스트가 실제로 검증하지 않는 것, 공개 문서와의 충돌, 그리고 이유를 알 수 없어 사용자 확인이 필요한 항목을 모았다.

여기 있는 항목은 대부분 결함이 아니다. 대부분은 **기록되지 않은 채 내려진 결정**이다. 이 문서의 목적은 그것들을 눈에 보이게 만드는 것이다.

---

## A. 계획 문서 ↔ 구현

`DESIGN.md`(2026-05-10)와 `docs/plans/2026-05-17-ch-life-v1-spec.md`는 역사 기록이다. 아래 항목에서 **구현이 정본이다.**

| # | 계획 | 구현 | 기록 |
|---|---|---|---|
| A1 | 리치 에디터 `@10play/tentap-editor`(WebView) | 네이티브 블록 에디터 | [`ADR-0001`](decisions/ADR-0001-native-block-editor.md) |
| A2 | `Tab`으로 확정, `Esc`로 취소 | space/개행으로 확정, 취소 없음 | [`ADR-0002`](decisions/ADR-0002-space-trigger.md) |
| A3 | 커서 옆 인라인 칩 | 화면 하단 고정 힌트 칩, 탭 불가 | [`RULE-EDIT-005`](rules/editor-insert.md) |
| A4 | 자동완성 삽입 후 **원본 참조 텍스트 유지** | 원본 텍스트 제거 | [`RULE-EDIT-002`](rules/editor-insert.md) — 근거 미기록 |
| A5 | 인용 블록 3상태(Loading/Loaded/Error) | 항상 loaded, 나머지는 도달 불가 | [`RULE-EDIT-007`](rules/editor-insert.md) |
| A6 | 설정은 MMKV | `settings.json` 파일 | [`ADR-0004`](decisions/ADR-0004-settings-file.md) |
| A7 | 목록 정렬 `updatedAt DESC` | `created_at DESC` | [`ADR-0008`](decisions/ADR-0008-created-at-ordering.md) |
| A8 | FTS에 `body_text` 색인 | 빈 문자열로 색인 → 본문 검색 불가 | [`ADR-0007`](decisions/ADR-0007-fts-scope.md) |
| A9 | FTS `content='notes'` 외부 콘텐츠 테이블 | 독립 테이블 + 트리거 3개 | [`CONTRACT-DB-NOTES`](contracts/CONTRACT-DB-NOTES.md) |
| A10 | 개역한글 1961, 공공도메인 | Open Bible 한국어판, CC BY-SA 4.0 | [`ADR-0009`](decisions/ADR-0009-bible-source.md) |
| A11 | ref 파서는 `bible-passage-reference-parser` + 한국어 어댑터 | 의존성 없는 자체 별칭 표 | [`RULE-REF-002`](rules/scripture-ref.md) — 근거 미기록 |
| A12 | `id`는 ULID | 36진수 타임스탬프+난수 20자 | [`RULE-NOTE-003`](rules/note-persistence.md) |
| A13 | `Verse.translation` 필드로 번역본 확장 대비 | 필드 없음 | [`CONTRACT-DOMAIN-NOTE`](contracts/CONTRACT-DOMAIN-NOTE.md) |
| A14 | 테마 = 시스템/라이트/다크 | 4가지 변형, OS 다크모드 미추종 | [`ADR-0010`](decisions/ADR-0010-variation-theming.md) |
| A15 | 외장 키보드 단축키 5개 (`DESIGN.md` 성공 기준) | 없음 | [`ADR-0015`](decisions/ADR-0015-no-keyboard-shortcuts.md) |
| A16 | import 시 `schemaVersion` 불일치 거부 | 값을 쓰기만 하고 읽지 않음 | [`RULE-MD-007`](rules/share-markdown.md) |
| A17 | 전체 백업 zip export/import | 없음 | [`RULE-MD-008`](rules/share-markdown.md) |
| A18 | 시스템 공유로 `.md` 열기(iOS `LSItemContentTypes` / Android intent-filter) | 없음 — 파일 선택 가져오기만 | [`RULE-MD-008`](rules/share-markdown.md) |
| A19 | 성경 검색 `골 3:20` 입력 시 20절로 스크롤+강조 | 장까지만 이동 | [`RULE-BIBLE-002`](rules/bible-reader.md) |
| A20 | 절 삽입 시 토스트 "추가됨" | 없음 | [`RULE-BIBLE-007`](rules/bible-reader.md) |
| A21 | 브라우저 삽입은 **커서 위치**에 | 본문 맨 끝에 추가 | [`RULE-BIBLE-006`](rules/bible-reader.md) |
| A22 | import 충돌 모달에 "모두 적용" 체크박스 | 없음(파일 한 개씩) | [`RULE-MD-006`](rules/share-markdown.md) |
| A23 | 노트 카드에 인용 ref 칩 최대 3개 | 설교자·생명양식 표시로 대체 | [`RULE-NOTE-008`](rules/note-persistence.md) |
| A24 | 첫 실행 시 성경 데이터를 SQLite/MMKV로 이관 | JSON을 메모리에 상주 | [`CONTRACT-BIBLE-JSON`](contracts/CONTRACT-BIBLE-JSON.md) |

## B. 구현 내부의 모순·중복

의도된 설계가 아니라, 고치지 않으면 언젠가 조용히 깨지는 지점이다.

### B1. 스키마 DDL이 두 곳에 있고 이미 다르다
`apps/ch-life/src/db/index.ts`의 인라인 스키마에만 `DROP INDEX IF EXISTS idx_notes_updated_at`가 있고 `schema.sql`에는 없다. 프로덕션은 인라인을, 테스트는 파일을 쓴다. → [`ADR-0006`](decisions/ADR-0006-duplicated-schema.md)

### B2. 900px 분기 상수가 두 곳에 복제
`apps/ch-life/app/index.tsx`의 `TABLET_BREAKPOINT = 900`과 `apps/ch-life/src/browser/useResponsiveLayout.ts`의 `width >= 900`. 한쪽만 바꾸면 목록은 태블릿인데 성경은 시트로 뜬다. → [`RULE-UI-001`](rules/layout-a11y.md)

### B3. `makeId()`가 두 곳에 복제
`apps/ch-life/src/db/note-repo.ts`와 `apps/ch-life/src/markdown/parse.ts`. 한쪽만 바꾸면 가져오기로 만든 노트와 앱에서 만든 노트의 id 형식이 갈린다. → [`RULE-NOTE-003`](rules/note-persistence.md)

### B4. `citedRefs` 표기가 경로마다 다르다
자동완성은 사용자가 친 그대로(`창1:1`), 브라우저 삽입은 정식 이름(`창세기 1:1`), 가져오기는 파일에 있던 값. 화면에는 모두 정식 이름으로 보이지만 **검색 결과가 달라진다.** → [`RULE-SEARCH-005`](rules/search.md)

### B5. `(KRV)` 표식이 데이터를 잘못 이름 붙인다
마크다운 인용 머리줄의 `(KRV)`는 개역한글을 쓰려던 시절의 잔재다. 실제 데이터는 Open Bible 한국어판. 그러나 이 문자열이 파서의 판별자라 바꾸면 기존 파일을 못 읽는다. → [`RULE-MD-003`](rules/share-markdown.md)

### B6. 도달할 수 없는 코드
- `QuoteBlock`의 `loading` / `error` 분기 — 생성하는 경로가 없다.
- `InsertMode`의 `"newNote"` — 쓰는 화면이 없다([`ADR-0011`](decisions/ADR-0011-bible-entrypoints.md) 이후).
- `app-store`의 `pendingInsertRef` / `requestInsertRef` — 넣는 쪽이 사라졌다.
- `settings.lastOpenedNoteId` — 읽는 곳이 없다.
- `settings.themePreference` — 색에 영향을 주지 않는다([`RULE-SET-003`](rules/settings-theme.md)).
- `repo.delete` — UI에서 호출되지 않는다([`RULE-NOTE-007`](rules/note-persistence.md)).

### B7. 태블릿에는 메타 헤더 → 본문 포커스 핸드오프가 없다
`TabletWorkspace`는 `SermonMetaHeader`에 `onSubmitLast`를 넘기지 않는다. 폰에서는 되고 태블릿에서는 안 되는 동작이다. → [`RULE-UI-002`](rules/layout-a11y.md)

### B8. 태블릿 검색과 폰 검색이 다른 구현
폰은 `repo.searchNotes`(FTS)를, 태블릿 사이드바는 메모리 목록 필터링을 쓴다. 차이가 세 가지다.

| | 폰 | 태블릿 사이드바 |
|---|---|---|
| 매칭 | FTS5 접두(토큰 경계) | `includes()` 부분 문자열 |
| 대상 | 전체 `notes_fts` | `listRecent({limit:200})`로 **미리 불러온 200건만** |
| 본문 | 안 걸림 | 제목 없는 노트는 `noteTitleOrFallback`이 본문 앞 40자로 대체 → **본문 일부가 걸린다** |

세 번째가 특히 문제다 — [`RULE-SEARCH-001`](rules/search.md)의 "본문 검색은 동작하지 않는다"가 태블릿에서는 그대로 참이 아니다.

### B9. 테마 토큰이 두 세대 공존
`ThemeProvider`의 팔레트에 구 필드(`bg/surface/text/subtle/line`)와 신 토큰(`ink/paper/rule/ink2..4`)이 함께 있다. 성경 리더 계열 컴포넌트(`BibleReader`/`VerseList`/`BibleBrowser`)는 아직 **테마를 쓰지 않고 하드코딩된 색**(`#f4f4f4`, `#222`)을 쓴다 → 다크 변형에서 이 화면들만 밝다.

### B10. 자동완성 문법이 `parseRef` 문법과 어긋난다
`useAutocomplete`의 트리거 패턴은 영어 책 토큰을 `[A-Za-z]{2,20}`으로 잡아 **숫자로 시작하는 책 이름을 표현하지 못한다.** `parseRef`는 `[A-Za-z][A-Za-z\s]{0,20}`이라 공백을 허용하지만 역시 선행 숫자는 못 받는다. 결과:

| 입력 | 트리거가 잘라내는 것 | 삽입되는 구절 |
|---|---|---|
| `1 John 1:1 ` | `John 1:1` | **요한복음** 1:1 (틀림) |
| `2 John 1:1 ` | `John 1:1` | **요한복음** 1:1 (틀림) |
| `1 Peter 1:1 ` | `Peter 1:1` | 없음 (조용히 무시) |

**틀린 구절을 조용히 삽입한다**는 점에서 단순 미지원보다 나쁘다. 한국어 표기(`요일 1:1`)는 정상. → [`RULE-EDIT-001`](rules/editor-insert.md)

### B11. `parseRef`가 숫자로 시작하는 영어 책 이름을 못 받는다
`ref-parser.ts`의 책 토큰은 `[A-Za-z][A-Za-z\s]{0,20}` — **첫 글자가 숫자면 매치 자체가 실패**한다. 별칭 표에는 있지만 파서에 도달하지 못하는 책이 **17권**이다: `1Sa 2Sa 1Ki 2Ki 1Ch 2Ch 1Co 2Co 1Th 2Th 1Ti 2Ti 1Pe 2Pe 1Jn 2Jn 3Jn`. `resolveBookCode`는 정상 매핑하므로 `book-map.test.ts`는 통과하고, `ref-parser.test.ts`에는 이 케이스가 없다. B10은 이 결함의 특수한 결과다. → [`RULE-REF-002`](rules/scripture-ref.md)

### B12. 책 토큰 정규식이 세 곳에 복제되어 서로 다르다
| 파일 | 영문 책 토큰 |
|---|---|
| `parser/ref-parser.ts` | `[A-Za-z][A-Za-z\s]{0,20}` |
| `editor/useAutocomplete.ts` | `[A-Za-z]{2,20}` (공백 불가, 2자 이상) |
| `browser/browser-search.ts` | `[A-Za-z][A-Za-z\s]{0,20}` |

셋을 묶는 공유 상수도, 일치를 검증하는 테스트도 없다. 이미 어긋나 있고(B10) 성경 브라우저 검색창도 같은 17권 한계를 갖는다.

### B13. 66권 한국어 정식명이 두 표에 따로 있다
`parser/book-map.ts`의 `ALIAS_TABLE[].aliases[0]`(= `bookDisplayName`)과 `browser/books-meta.ts`의 `BOOKS_META[].nameKo`. 지금은 66권 전부 일치하지만 교차 검증 테스트가 없다. 어긋나면 **삽입되는 참조 문자열**(`nameKo` 사용)과 **화면에 보이는 참조**(`bookDisplayName` 사용)가 갈린다.

### B14. 인용 삽입 로직이 네 곳에 손으로 복제되어 있다
`{type:'quote', ref, verses, status:'loaded'}` 리터럴을 만드는 곳이 공유 팩토리 없이 네 군데다 — `editor/NoteEditor.tsx`(자동완성), `app/note/[id].tsx`(폰 브라우저 삽입), `workspace/TabletWorkspace.tsx`(태블릿, 폰 코드와 사실상 동일), `markdown/parse.ts`(가져오기). [`RULE-EDIT-007`](rules/editor-insert.md)의 "status는 항상 loaded"는 이 네 곳이 계속 리터럴을 유지해야만 성립하고 타입이 강제하지 않는다.

`handleExport`(fresh 조회 → 화면 state 덮어쓰기 → `citedRefs` 재계산)도 `app/note/[id].tsx`와 `TabletWorkspace.tsx`에 같은 방식으로 복제되어 있다.

### B15. 설정 enum 값이 세 파일에 중복
`variation`·`blockStyle`·`fontFamily`·`accentChoice` 모두 `domain/types.ts` 유니온 → `state/settings-validator.ts`의 `ALLOWED_*` → `app/settings.tsx`의 옵션 배열 순으로 값이 반복된다. `accentChoice`의 hex 6개는 세 파일에 각각 리터럴로 박혀 있다. `fontScale`은 **전체 거부** 필드라([`RULE-SET-002`](rules/settings-theme.md)) 유니온에만 값을 더하고 validator를 빠뜨리면 사용자의 `settings.json` 전체가 버려지고 기본값으로 리셋된다.

### B16. 가져오기 "덮어쓰기"가 없는 필드를 지운다
`markdown/parse.ts`의 `toStringOrNull`/`toDateString`은 frontmatter에 키가 없을 때 `undefined`가 아니라 **`null`**을 반환하고, `share/import-note.ts`는 그대로 `repo.update` 패치에 넣는다. `repo.update`에서 `null`은 "비움"이다([`RULE-NOTE-002`](rules/note-persistence.md)). `preacher:`가 없는 외부 `.md`로 덮어쓰면 **기존 설교자 값이 사라진다.** 자동 테스트 없음.

### B17. 가져온 노트가 작성 시각을 잃는다
`repo.create`의 입력 타입에 `createdAt`/`updatedAt`이 없고 두 컬럼 모두 `Date.now()`로 채운다. 가져온 노트는 "가져오기를 실행한 시각"을 갖게 되고, 목록이 `created_at` 내림차순이라 오래된 설교 노트가 맨 위로 올라온다. → [`RULE-MD-004`](rules/share-markdown.md)

### B18. 루트 워크스페이스가 앱 설치를 가로챈다
`feat/editor-core-pkg`가 루트에 `pnpm-workspace.yaml`(`packages: ['packages/*']`)을 들여왔다. 브랜치 주석은 "apps/ch-life는 Phase 4까지 독립 프로젝트로 남는다"고 적었지만 **pnpm v10.15는 그렇게 동작하지 않는다** — `apps/ch-life`에서 `pnpm install`을 돌려도 상위로 올라가 루트 워크스페이스를 설치한다(`Scope: all 2 workspace projects`). 앱 의존성이 설치되지 않아 CI 전체가 깨진다.

`.npmrc`에 `ignore-workspace=true`를 넣어도 **무시된다**(직접 확인). CLI 플래그만 유효해서 세 워크플로(`ci.yml`·`eas-update.yml`·`eas-build.yml`)에 `--ignore-workspace`를 붙여 막았다. Phase 4에서 앱이 정식 멤버가 되면 이 플래그를 걷어내고 Metro monorepo 설정(watchFolders + nodeModulesPaths)을 함께 넣어야 한다.

### B19. OTA는 한 번도 성공한 적이 없다
`hot-updater` 전환 뒤 `main`에 들어간 머지마다 OTA 워크플로가 돌았고 **전부 같은 지점에서 실패했다**(`33952417840`, `33954929255`).

```
◆  ✅ Bundle Signing Complete
◇  📦 Uploading to Storage (iOS • r2Storage)
■  Credential access key has length 53, should be 32
■  Failed to upload bundle to storage
```

번들 생성·Hermes 컴파일·서명까지는 전부 통과하고 **R2 업로드에서만** 죽는다. R2 액세스 키 ID는 32자 hex인데 `HOT_UPDATER_CLOUDFLARE_R2_ACCESS_KEY_ID` 시크릿에 53자짜리 값이 들어 있다 — 다른 자격증명(API 토큰 등)을 이 슬롯에 넣었을 가능성이 크다.

워크플로의 `test -n` 가드가 값의 **존재**만 보고 형식은 보지 않아 이 실수를 잡지 못했다. **가드는 형식 검사로 바꿨다**([`ADR-0021`](decisions/ADR-0021-release-strategy.md)) — 이제 같은 실수는 번들을 만들기 전에 걸린다. 다만 **시크릿 값 자체는 아직 고쳐지지 않았다.** 시크릿을 고치기 전까지 OTA 경로는 서류상으로만 존재한다 — [`CONTRACT-RELEASE`](contracts/CONTRACT-RELEASE.md)의 "두 경로" 중 자동 경로는 **실제로는 닫혀 있다.**

### B20. 알 수 없는 블록 타입은 조용히 사라지거나 앱을 깨뜨린다
`BlockNode`는 닫힌 유니온이지만, 그 값을 읽는 네 경로 중 **모르는 `type`을 다룰 준비가 된 곳이 하나도 없다.**

| 경로 | 모르는 타입을 만나면 |
|---|---|
| `src/editor/NoteEditor.tsx` | `quote`가 아니면 전부 `ParagraphInput`으로 보낸다 |
| `src/editor/ParagraphInput.tsx` | `initialText.length`를 읽는다 — `text`가 없으면 크래시 |
| `src/list/group-notes.ts` (`notePreview`) | `stripInlineMarks(block.text)` — `text`가 없으면 크래시 |
| `src/markdown/serialize.ts` (`blockToMarkdown`) | `switch`에 `default`가 없다. `undefined`를 돌려주고 `join`이 삼킨다 — **내보내기에서 소리 없이 사라진다** |

`rowToNote`의 `JSON.parse(body_json)`에도 검증이 없어 무엇이든 그대로 통과한다.

지금은 새 타입을 쓰는 코드가 없으니 **현재 버그는 아니다.** 문제는 OTA다 — 번들을 되돌리면 이전 번들이 새 번들이 쓴 데이터를 읽게 되고, 그 순간 이 표가 현실이 된다([`RULE-OTA-009`](rules/release.md)). 렌더러·직렬화에 폴백을 넣기 전까지 블록 타입 추가는 OTA로 내보낼 수 없는 변경이다.

## C. 테스트(오라클)의 신뢰도 문제

테스트가 통과한다는 것이 규칙이 지켜진다는 뜻이 아닌 지점이다.

### C1. 테스트가 프로덕션 DDL을 검증하지 않는다
DB 테스트는 `schema.sql`을 읽는데 프로덕션은 `db/index.ts`의 인라인 문자열을 실행한다(B1). **오라클과 실물이 다른 파일이다.**

### C2. 이름과 검증 내용이 다른 테스트
`apps/ch-life/src/db/__tests__/note-repo-search.test.ts`의 `"최신 updated_at 우선"`은 노트를 만들기만 하고 수정하지 않으므로 실제로는 **`created_at` 정렬을 검증한다.** 이름을 믿고 "updated_at 정렬이 보장된다"고 읽으면 틀린다.

### C3. UI 계층에 자동 증거가 없다
RN 컴포넌트 테스트 라이브러리가 설치되어 있지 않다. 에디터 상호작용(포커스 이동, backspace 병합, 힌트 칩, 시트 애니메이션, 반응형 분기)은 전부 수동 확인이다. 이 위키의 UI 규칙이 `SHOULD`인 이유다.

### C4. 어댑터 차이는 검증되지 않는다
테스트는 `better-sqlite3`, 프로덕션은 `expo-sqlite`. 트랜잭션·동시성·타입 강제의 차이에서 오는 문제는 테스트가 잡지 못한다.

### C5. 뮤테이션 검증이 없다
테스트가 실제로 결함을 잡는지 표본으로 확인한 적이 없다. 통과하는 테스트 수는 오라클 품질의 증거가 아니다.

### C6. `roundtrip.test.ts`는 DB를 거치지 않는다
이름은 "DB → MD → DB가 본질 데이터를 보존한다"인데 실제로는 `noteToMarkdown` ↔ `markdownToNote`만 부르고 `note-repo.ts`를 한 번도 지나지 않는다. B16·B17의 손실이 이 테스트를 그냥 통과하는 이유다.

### C7. 이름만 증거인 `verified_by`
[`RULE-BIBLE-006`](rules/bible-reader.md)은 `format-ref.test.ts`를 자동 증거로 달고 `MUST`였다. 그러나 `VerseList.tsx`는 `formatRef`를 import하지 않고 문자열을 직접 조립하므로 그 테스트는 해당 코드를 지나지 않는다. **`check.mjs`는 `test:` 줄의 존재와 조각 문자열만 확인할 뿐, 그 테스트가 정말 그 statement를 검증하는지는 모른다.** 증거를 떼고 `SHOULD`로 낮췄다. 같은 패턴이 다른 블록에도 있을 수 있다 — 2단계 대조에서 사람이 봐야 하는 지점이다.

### C8. import/export 경로에 테스트가 없다
`share/import-note.ts`(`pickAndImport`)와 `share/export-note.ts`에는 테스트가 없다. `import-decision.test.ts`는 순수 함수 `resolveImportConflict`만 검증한다. 파일 → 노트 → `repo.create/update`로 이어지는 실제 경로는 자동 증거가 전혀 없다.

## D. 공개 문서 ↔ 구현이 어긋난 곳

**사용자에게 이미 노출된 문구**라서 우선순위가 높다.

### D1. ~~개인정보처리방침이 없는 기능을 약속한다~~ (해소, 1.0.1)
`docs/legal/privacy-policy.md` 8장이 약속한 "앱 내에서 노트를 직접 수정·**삭제**"는 **1.0.1에서 실제로 구현됐다** — 목록 스와이프·에디터·태블릿 세 경로 + 되돌리기(`01a0125`, `640a62c`, `196de89`). [`RULE-NOTE-007`](rules/note-persistence.md)이 정반대로 뒤집혔다. 공개 문서 쪽은 손댈 것이 없다.

### D2. 검색창이 되지 않는 검색을 안내한다
placeholder: `검색 — 제목, 본문, 인용`. **본문 검색은 동작하지 않는다**([`RULE-SEARCH-001`](rules/search.md)).

### D3. 플랫폼 표기가 문서마다 다르다
`README.md`와 `CLAUDE.md`는 "웹 + 모바일"이라 하고, `DESIGN.md`·v1 spec은 "웹은 V1/V2 범위 밖"이라 한다. `package.json`에 `web` 스크립트가 있고 `app.config.ts`에 웹 favicon 설정이 있으나, 웹 지원 여부를 확인한 기록은 없다. → E절 질문

### D4. 스토어 설명이 아직 없는 기능을 말한다
`docs/store/store-listing.md`: "설교 노트, 성경, 찬송, 묵상, 일정을 하나의 앱에서". **찬송·묵상·일정은 구현되어 있지 않다.** 5-pillar는 비전이고 현재 앱은 설교 노트 + 성경이다.

### D5. "최근"이라고 적힌 칩은 최근이 아니다
`BibleLookupPanel`의 `RECENT_REFS`는 `요 3:16` `시 23:1-4` `마 5:3-12` `롬 8:28` `빌 4:13` `엡 2:8-10` **하드코딩 상수**다. 화면에는 `최근`이라는 제목으로 붙어 있어, 사용자가 자기 이력이라고 읽게 된다. 실제 최근 조회 기록은 저장되지 않는다. 문구를 `자주 찾는 구절`로 바꾸거나 실제 이력을 남기거나 둘 중 하나다.

## E. 확인 필요 (확정하려면 사용자의 답이 있어야 하는 것)

이유를 지어내지 않고 질문으로 남긴 항목이다. 답이 나오면 해당 ADR의 `confidence`를 `기록됨`으로 올린다.

**이유만 미기록인 경우(E11·E12)는 다르다.** 해당 ADR은 *결정 자체*가 문서에 남아 있어 이미 `기록됨`이고, 비어 있는 것은 "왜"뿐이다. 답이 나오면 `confidence`가 아니라 그 ADR의 **이유 절**을 채운다.

| # | 질문 | 관련 |
|---|---|---|
| E1 | 성경 데이터를 개역한글에서 Open Bible(CC BY-SA)로 바꾼 이유는? Week 0 라이선스 검증에서 무엇이 나왔나? | [`ADR-0009`](decisions/ADR-0009-bible-source.md) |
| E2 | 목록 정렬을 `updated_at`에서 `created_at`으로 바꾼 이유는? | [`ADR-0008`](decisions/ADR-0008-created-at-ordering.md) |
| E3 | 본문 FTS 색인을 비운 것은 의도적 보류인가, 빠뜨린 배선인가? | [`ADR-0007`](decisions/ADR-0007-fts-scope.md) |
| E4 | 설정 저장을 MMKV에서 파일로 바꾼 이유는? 네이티브 의존성 회피가 맞나? | [`ADR-0004`](decisions/ADR-0004-settings-file.md) |
| E5 | 자동완성 삽입 후 원본 참조 텍스트를 지우기로 한 이유는? (계획은 유지였다) | A4 |
| ~~E6~~ | ~~노트 삭제 기능을 넣지 않은 것은 의도인가?~~ **해소** — 1.0.1에 삭제+되돌리기가 들어갔다. | D1, [`RULE-NOTE-007`](rules/note-persistence.md) |
| E7 | 웹은 지원 대상인가? 문서마다 다르게 적혀 있다. | D3 |
| E8 | 스키마 DDL 이중 기록을 정리할 것인가, 규율로 유지할 것인가? | [`ADR-0006`](decisions/ADR-0006-duplicated-schema.md) |
| E9 | 외부 ref 파서 대신 자체 별칭 표를 쓴 이유는? | A11 |
| ~~E10~~ | ~~`hot-updater` 전환은 계속 진행할 것인가?~~ **해소** — `30b6a60`(PR #14)로 `main`에 병합됐고 `expo-updates`는 제거됐다. | [`CONTRACT-RELEASE`](contracts/CONTRACT-RELEASE.md) |
| E11 | 마이그레이션에 버전 테이블을 두지 않은 이유는? 단일 기기라 프레임워크가 과하다는 판단이 맞나? | [`ADR-0005`](decisions/ADR-0005-idempotent-migration.md) |
| E12 | 확정 키를 `Tab`에서 space로 바꾼 이유는? 소프트 키보드에 Tab이 없어서가 맞나? | [`ADR-0002`](decisions/ADR-0002-space-trigger.md) |
| E13 | **스토어의 1.0.1은 `expo-updates` 바이너리인데 `main`은 hot-updater다 — 1.0.1 설치본은 OTA를 받지 못한다.** 의도된 상태인가? 새 스토어 빌드 계획은? 그리고 `expo-updates`를 버린 이유는 무엇인가? | [`CONTRACT-RELEASE`](contracts/CONTRACT-RELEASE.md), [`ADR-0013`](decisions/ADR-0013-release-path.md) |
| E14 | 구절 삽입 **성공**에 배너를 띄우기로 한 것은 POL-A11Y-001의 "조용함"을 의도적으로 완화한 것인가? 삭제 배너는 undo 때문에 불가피하지만 삽입은 아니다. | [`POL-A11Y-001`](policy/POL-ACCESSIBILITY.md), G1 |
| E15 | `feat/editor-core-pkg`(Phase 1 스캐폴드)를 `main`에 둘 것인가, Phase 4까지 브랜치에 둘 것인가? | `docs/editor-core/extraction-plan.md` |
| E16 | **OTA 지원 대상 버전을 몇 개까지 유지하는가?** `updateStrategy: "appVersion"`이라 번들은 앱 버전마다 따로 발행된다. **지금 `scripts/deploy-ota.mjs`는 `--target-app-version`을 막고 `app.config.ts`의 `version` 하나로 고정해 발행한다** — 코드는 이미 "현재 스토어 버전만"으로 답하고 있다. 이것을 정책으로 확정할 것인가, 아니면 1.0.2를 낸 뒤에도 1.0.1용 번들을 계속 자를 것인가? | [`RULE-OTA-004`](rules/release.md), E13 |
| E17 | **R2의 지난 번들을 언제 지우는가?** 기기는 언제나 자기 버전의 최신 번들 하나만 요청하므로([`RULE-OTA-004`](rules/release.md)) **밀려난 번들을 지워도 오래 오프라인이던 기기가 곤란해지지 않는다.** 남는 것은 비용과 감사 추적 문제뿐이다 — 무료 한도(R2 10GB-month) 안에서는 "지우지 않는다"도 성립한다. 보존 기간을 정할 것인가? (지울 때는 R2를 직접 건드리지 말고 `hot-updater bundle delete`를 쓴다 — D1 행만 남고 객체가 없으면 그 URL을 받은 기기가 깨진다.) | [`RULE-OTA-005`](rules/release.md), `docs/store/ota-deploy.md` |
| E18 | **되돌릴 수 없는 변경은 어느 경로로 내보내는가?** 컬럼 삭제·개명, 새 `BlockNode` 타입은 OTA 롤백으로 구제되지 않는다(B20). ⑴ 폴백을 먼저 한 번들 내보내고 다음 번들에서 쓰기, ⑵ 스토어 빌드로만 내보내기 — 어느 쪽을 기본으로 삼을 것인가? | [`RULE-OTA-008`](rules/release.md), [`RULE-OTA-009`](rules/release.md) |

## G. 아직 정본화되지 않은 구현

**이 위키는 `769fe51`(2026-06-13) 시점 코드에서 추출했다.** 그 뒤 `main`은 `30b6a60`까지 20개 넘는 커밋을 받았고, 아래 영역은 **정본에 블록이 하나도 없다.** 코드를 읽고 쓴 것이 아니라 존재만 확인한 상태다 — 이 영역을 건드릴 때 위키를 믿으면 안 된다.

| 영역 | 코드 | 상태 |
|---|---|---|
| G1. 피드백/배너 시스템 | `src/feedback/ActionBannerHost.tsx`, `src/state/app-store.ts`의 `Feedback`(`tone: info \| error`) | 블록 없음. POL-A11Y-001의 "조용함"과 충돌(E14) |
| G2. 삭제 상호작용 | `src/list/SwipeToDelete.tsx`, `src/list/swipe-geometry.ts`, `src/list/NoteCard.tsx` | [`RULE-NOTE-007`](rules/note-persistence.md)이 저장소 계층만 덮는다. 스와이프 제스처·임계값은 미정본 |
| G3. 되돌리기 경쟁 조건 | `src/notes/note-actions.ts`, `docs/solutions/logic-errors/undo-completion-must-carry-captured-note-identity.md` | 실제로 고친 버그가 있고 해결 문서까지 있는데 `RULE`이 없다 |
| G4. 이메일 문의 | `src/support/contact-draft.ts`, `src/support/use-contact-support.ts`, `app/settings.tsx` | 블록 없음. `POL-PRIVACY-001`(기기 밖으로 안 나간다)과의 관계 미검토 |
| G5. 삽입 결과 보고 | `src/editor/insert-verse.ts` | 블록 없음. `RULE-EDIT-*`의 삽입 규칙과 겹친다 |
| G6. 자동저장 변경 | `src/editor/useAutoSave.ts` (+78줄) | [`RULE-EDIT-011`~`013`](rules/editor-insert.md)이 여전히 맞는지 대조하지 않았다 |

각 영역에 자동 증거는 이미 있다(`note-actions.test.ts` 8건, `contact-draft.test.ts`, `insert-verse.test.ts`, `swipe-geometry.test.ts`). **정본만 없다.** 커버리지 숫자(`RULE` 60건)를 앱 전체의 커버리지로 읽으면 안 되는 이유다.

## F. 이 위키 자체의 다음 단계

지금은 문서와 검사 스크립트까지만 있다. 연구 문서가 말하는 "정책 → 실행 증거" 고리를 닫으려면 다음이 남아 있다.

1. **`node wiki/check.mjs`를 CI에 추가** — 지금은 사람이 직접 돌려야 한다. ⚠️ **검사기는 실행 위치에 따라 결과가 달라진다** — `by-task.md`의 백틱 경로 검사가 `.worktrees/`처럼 gitignore된 디렉터리를 실재 경로로 요구해서, `main` 체크아웃에서는 통과하고 새 clone이나 워크트리에서는 실패했다(2026-09-05에 해당 토큰만 고쳤다). CI에 붙이기 전에 **깨끗한 clone에서 한 번 돌려 본다.** `.github/workflows/ci.yml`의 job은 `working-directory: apps/ch-life`이므로 이 스텝만 `working-directory: .`로 되돌려야 하고, `pnpm install`은 필요 없다(순수 Node). 추가하는 커밋에서 이 항목과 [`README.md`](README.md) 5절의 "CI 연결과 PR 템플릿은 아직 하지 않았다" 문구도 같이 지운다.
2. **PR 템플릿** — 바뀌는 `POL/RULE/CONTRACT` ID, 새 예시, 자동 증거, 수동 QA 결과를 적게 한다.
3. **UI 자동 증거** — `@testing-library/react-native`를 넣으면 `SHOULD` 규칙 상당수가 `MUST`로 올라간다.
4. **회귀 fixture** — 실제로 내보낸 `.md` 파일을 테스트 자산으로 고정한다. 관측 계층이 없는 이 앱에서 유일하게 "현실"을 담은 재현 자산이다.
5. **B절 중복 정리** — 상수·함수 중복(B2·B3)은 각각 몇 줄짜리 수정이다.

가장 먼저 고칠 것은 위키가 아니라 코드 쪽이다. **B10(`1 John 1:1` → 요한복음 삽입)은 틀린 데이터를 조용히 넣는다.** D1·D2·D5는 이미 사용자에게 노출된 문구다.
