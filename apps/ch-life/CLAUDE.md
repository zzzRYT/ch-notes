# ch-life

한국 교회 통합 앱 (설교 노트 + 성경 + 찬송 + 묵상 + 일정). **Expo SDK 54 / React Native /
expo-router / expo-sqlite / zustand**, 웹 + 모바일. 어르신 친화 UX.

> **Expo는 자주 바뀐다.** 코드 작성 전 v54 버전드 문서를 확인할 것:
> https://docs.expo.dev/versions/v54.0.0/

## 명령어

| 작업 | 명령 |
|------|------|
| 타입체크 | `pnpm typecheck` (`tsc --noEmit`) |
| 린트 | `pnpm lint` (`eslint .`) |
| 테스트 | `pnpm test` (`TZ=Asia/Seoul jest`) / CI: `pnpm test:ci` |
| 실행 | `pnpm start` / `pnpm android` / `pnpm ios` |

- 패키지 매니저는 **pnpm**. `.npmrc`의 `node-linker=hoisted` 필수(번들 해석).
- 테스트는 노드용 **better-sqlite3**로, 프로덕션은 **expo-sqlite**로 동작(어댑터 이원화).

## 아키텍처 지도 (feature/domain별, 테스트는 각 폴더 `__tests__/`)

| 폴더 | 역할 |
|------|------|
| `parser/` | 성경 구절 파싱·포맷·룩업 (`ref-parser`, `book-map`, `verse-lookup`) |
| `editor/` | 노트 에디터 — 자동완성·자동저장, 설교 메타 헤더, 구절 자동삽입 |
| `browser/` | 성경 뷰어 (책/장/절) |
| `db/` | SQLite repo + 멱등 마이그레이션 (`note-repo`, `migrate`, `schema.sql`) |
| `markdown/` | 공유 포맷 — frontmatter / parse / serialize |
| `share/` | 노트 import/export, import 충돌 결정 |
| `workspace/` | 태블릿 3-pane 레이아웃 |
| `list/` | 노트 카드·그룹핑 |
| `state/` | zustand 스토어 + 설정 영속화 |
| `theme/`, `chrome/` | 테마 / 앱 헤더 |

## 핵심 데이터 모델 & 함정

- `Note.body = BlockNode[]` → `body_json` TEXT로 저장.
- repo `update` = **read-then-merge**: `null`은 필드 비움, `undefined`는 기존값 유지.
- ⚠️ **스키마가 두 곳에 중복**: `db/index.ts`의 인라인 스키마 + `db/schema.sql`. 동시 수정 필수.
- 마이그레이션은 **버전 추적 없는 멱등** — `migrate.ts`의 `ADDED_NOTE_COLUMNS`에서
  `PRAGMA table_info`로 누락 컬럼만 ALTER.
- FTS 검색은 **title + cited_refs만**. `body_text`는 빈 문자열로 색인됨 → **본문 검색 안 됨**.
- `isDark = variation === "dark"` (`themePreference` 아님).
- **900px**가 phone/tablet 분기(`PhoneNotesList` vs `TabletWorkspace`).
- `assets`의 `bible.json` = Open Bible 한국어판, **CC BY-SA 4.0**. 재배포 텍스트는 BY-SA 유지.

## 배포

- JS/에셋만 변경 → **Hot Updater(OTA)**. 네이티브 의존성/`version` 변경 → **EAS Build**.
- ⚠️ `updateStrategy: appVersion` — 대상 앱 버전을 명시해 OTA를 발행한다. 버전이나 네이티브
  계약을 바꾸면 **새 네이티브 빌드 필요**. 자세한 절차는 `.claude/skills/eas-release`.

## 워크트리

기능 브랜치는 `.worktrees/`에서 작업한다. 검증은 **활성 워크트리 안에서** 수행할 것
(main 체크아웃의 node_modules는 깨져 있을 수 있음).
