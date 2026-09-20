# ch-life

한국 교회 통합 앱 (설교 노트 + 성경 + 찬송 + 묵상 + 일정). **Expo SDK 54 / React Native /
expo-router / expo-sqlite / zustand**, 웹 + 모바일. 어르신 친화 UX.

> **Expo는 자주 바뀐다.** 코드 작성 전 v54 버전드 문서를 확인할 것:
> https://docs.expo.dev/versions/v54.0.0/

## 정본 위키 — 코드를 열기 전에

절차는 저장소 루트 `CLAUDE.md`의 "무슨 일을 하든 정본을 먼저 본다"에 있다(두 파일은 함께 로드된다).
전문은 `wiki/workflow.md`, 작업별 진입점은 `wiki/by-task.md`.

**이 앱에서 특히:** 테스트는 이름이 아니라 본문을 본다 — 이름과 검증 내용이 다른 테스트가
실재한다(`wiki/drift.md` C절). `DESIGN.md`·`docs/plans/**`는 역사 기록이며 합격 기준이 아니다.

## 명령어

| 작업 | 명령 |
|------|------|
| 타입체크 | `pnpm typecheck` (`tsc --noEmit`) |
| 린트 | `pnpm lint` (`eslint .`) |
| 테스트 | `pnpm test` (`TZ=Asia/Seoul jest`) / CI: `pnpm test:ci` |
| 실행 | `pnpm start` / `pnpm android` / `pnpm ios` |

- 패키지 매니저는 **pnpm**. `.npmrc`의 `node-linker=hoisted` 필수(번들 해석).
- 테스트는 노드용 **better-sqlite3**로, 프로덕션은 **expo-sqlite**로 동작(어댑터 이원화).

## 아키텍처 지도 (FSD — `src/` 아래, 테스트는 각 세그먼트의 `__tests__/`)

| 레이어 | 역할 |
|------|------|
| `app/` | Expo Router 라우트 + `_layout.tsx`(Composition Root — 저장소·마이그레이션·테마·업데이트 안내 조립) |
| `pages/` | 라우트 단위 화면 — `notes`(폰 목록 + 태블릿 3-pane), `note-editor`, `bible-reader`, `settings`, `licenses` |
| `widgets/` | 둘 이상의 화면이 쓰는 큰 UI — `note-editor`(편집기 + `useNoteDraft`), `scripture-browser`(성경 리더·시트) |
| `features/` | 사용자 의도 — `note/{create,search,autosave,delete,import,export}`, `scripture/insert`, `settings/change`, `support/contact`, `app-update/notice` |
| `entities/` | 도메인 — `note`(타입·저장소 인터페이스·SQLite/마크다운 어댑터), `scripture`(참조 파싱·책 표·번들 본문) |
| `shared/` | 도메인 없는 기반 — `ui`(테마·헤더·배너), `lib`(sqlite 연결·피드백 스토어·900px), `config`(OTA 번호) |

의존은 `app → pages → widgets → features → entities → shared` 한 방향이고, Slice 밖에서는 `index.ts`만 import한다. **`pnpm lint`가 이를 강제한다**(`eslint.config.js`). 노트 엔티티와 성경 엔티티는 서로 import하지 않는다 — 둘을 잇는 코드는 `features/scripture/insert`·`widgets/note-editor`에 있다.

## 핵심 데이터 모델 & 함정

- `Note.body = BlockNode[]` → `body_json` TEXT로 저장.
- repo `update` = **read-then-merge**: `null`은 필드 비움, `undefined`는 기존값 유지.
- ⚠️ **스키마가 두 곳에 중복**: `entities/note/api/sqlite-note-repo.ts`의 `NOTE_SCHEMA_SQL` + 같은 폴더 `schema.sql`. 동시 수정 필수.
- 마이그레이션은 **버전 추적 없는 멱등** — `migrate.ts`의 `ADDED_NOTE_COLUMNS`에서
  `PRAGMA table_info`로 누락 컬럼만 ALTER.
- FTS 검색은 **title + cited_refs만**. `body_text`는 빈 문자열로 색인됨 → **본문 검색 안 됨**.
- `isDark = variation === "dark"` (`themePreference` 아님).
- **900px**가 phone/tablet 분기(`PhoneNotesList` vs `TabletWorkspace`) — `shared/lib`의 `TABLET_BREAKPOINT` 하나.
- 저장소는 `useNoteRepo()`로 꺼내 유스케이스에 **인자로** 넘긴다. 어댑터를 기본 인자로 숨기지 않는다.
- `assets`의 `bible.json` = Open Bible 한국어판, **CC BY-SA 4.0**. 재배포 텍스트는 BY-SA 유지.

## 배포

- JS/에셋만 변경 → **Hot Updater(OTA)**. 네이티브 의존성/`version` 변경 → **EAS Build**.
- ⚠️ `updateStrategy: appVersion` — 대상 앱 버전을 명시해 OTA를 발행한다. 버전이나 네이티브
  계약을 바꾸면 **새 네이티브 빌드 필요**. 자세한 절차는 `.claude/skills/eas-release`.

## 워크트리

기능 브랜치는 `.worktrees/`에서 작업한다. 검증은 **활성 워크트리 안에서** 수행할 것
(main 체크아웃의 node_modules는 깨져 있을 수 있음).
