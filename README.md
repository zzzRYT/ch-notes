# 씀씀 (ch-life)

> 쉽게 쓰는 설교 노트 — 한국 교회 통합 앱 (설교 노트 + 성경 + 찬송 + 묵상 + 일정)

예배와 설교 시간에 **누구나 쉽게 노트를 적을 수 있도록** 만든 앱입니다. 설교를 들으며 바로 기록하고, "요한복음 3장 16절"처럼 입력하면 성경 본문이 **인터넷 없이** 자동으로 인용 블록으로 삽입됩니다. 어르신도 부담 없이 쓸 수 있는 큰 글씨 UX를 지향합니다.

- **런처 표시명:** 씀씀
- **스토어명:** 씀씀: 쉽게 쓰는 설교 노트
- **플랫폼:** iOS · Android · Web (Expo)
- **데이터:** 전부 기기 로컬 저장(SQLite). 외부 전송 없음.

| 링크 | URL |
|------|-----|
| 고객 지원 | [`docs/store/support.md`](docs/store/support.md) |
| 개인정보처리방침 | https://zzzryt.github.io/ch-notes/privacy-policy.html |
| 스토어 등록 정보 | [`docs/store/store-listing.md`](docs/store/store-listing.md) |

---

## 기술 스택

- **Expo SDK 54** / React Native 0.81 / React 19
- **expo-router** (typed routes) — 파일 기반 라우팅
- **expo-sqlite** — 로컬 영속화 (테스트는 Node용 `better-sqlite3` 어댑터)
- **zustand** — 상태 관리 + 설정 영속화
- **expo-updates (EAS Update)** — OTA 배포
- 패키지 매니저: **pnpm** (`.npmrc`의 `node-linker=hoisted` 필수)

---

## 저장소 구조

```text
ch-life/
├── apps/ch-life/        # Expo 앱 본체
│   ├── app/             # expo-router 라우트 (index, note/[id], bible, settings, ...)
│   └── src/             # feature/domain별 모듈
├── docs/
│   ├── store/           # 스토어 등록 정보 · 지원 페이지 · 자동제출 가이드
│   ├── legal/           # 개인정보처리방침
│   └── plans/           # 기획 문서
├── website/             # GitHub Pages (개인정보처리방침 호스팅)
├── DESIGN.md            # 디자인 시스템 문서
└── .github/workflows/   # CI · EAS Build · EAS Update · Pages
```

### 앱 내부 모듈 (`apps/ch-life/src/`)

| 폴더 | 역할 |
|------|------|
| `parser/` | 성경 구절 파싱·포맷·룩업 |
| `editor/` | 노트 에디터 — 자동완성·자동저장, 설교 메타 헤더, 구절 자동삽입 |
| `browser/` | 성경 뷰어 (책/장/절) |
| `db/` | SQLite repo + 멱등 마이그레이션 |
| `markdown/` | 공유 포맷 — frontmatter / parse / serialize |
| `share/` | 노트 import/export, import 충돌 결정 |
| `workspace/` | 태블릿 3-pane 레이아웃 |
| `list/` | 노트 카드·그룹핑 |
| `state/` | zustand 스토어 + 설정 영속화 |
| `theme/`, `chrome/` | 테마 / 앱 헤더 |

---

## 시작하기

```bash
cd apps/ch-life
pnpm install
pnpm start        # Expo 개발 서버
```

| 작업 | 명령 |
|------|------|
| 실행 | `pnpm start` / `pnpm android` / `pnpm ios` / `pnpm web` |
| 타입체크 | `pnpm typecheck` (`tsc --noEmit`) |
| 린트 | `pnpm lint` (`eslint .`) |
| 테스트 | `pnpm test` (`TZ=Asia/Seoul jest`) / CI: `pnpm test:ci` |

> **Expo는 자주 바뀝니다.** 코드 작성 전 v54 버전드 문서 확인: https://docs.expo.dev/versions/v54.0.0/

---

## 핵심 데이터 모델 & 주의점

- `Note.body = BlockNode[]` → `body_json` TEXT로 저장.
- repo `update` = **read-then-merge**: `null`은 필드 비움, `undefined`는 기존값 유지.
- ⚠️ **스키마가 두 곳에 중복**: `db/index.ts` 인라인 스키마 + `db/schema.sql` — 동시 수정 필수.
- 마이그레이션은 **버전 추적 없는 멱등** — `migrate.ts`가 `PRAGMA table_info`로 누락 컬럼만 ALTER.
- FTS 검색은 **title + cited_refs만** 대상 (본문 검색 미지원).
- `isDark = variation === "dark"` (`themePreference` 아님).
- **900px**가 phone/tablet 분기 (`PhoneNotesList` vs `TabletWorkspace`).

---

## 배포

- **JS/에셋만 변경** → EAS Update(OTA).
- **네이티브 의존성 / `version` 변경** → EAS Build.
- ⚠️ `runtimeVersion: appVersion` — `app.config.ts`의 `version`을 올리면 OTA가 구버전 설치본에 안 닿으므로 **새 네이티브 빌드 필요**.

자세한 절차는 `apps/ch-life/.claude/skills/eas-release` 및 [`docs/store/android-auto-submit.md`](docs/store/android-auto-submit.md) 참고.

---

## 라이선스 / 저작권

- 성경 본문 데이터(`assets/bible.json`)는 **Open Bible 한국어판**, **CC BY-SA 4.0**.
  재배포되는 본문은 동일하게 CC BY-SA 라이선스를 유지합니다.
- 씀씀은 **개인정보를 수집·전송하지 않습니다.** 모든 데이터는 기기 로컬에만 저장됩니다.

## 문의

jinjinstar3@gmail.com
