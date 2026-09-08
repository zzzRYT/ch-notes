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
| **정본 위키** | [`wiki/README.md`](wiki/README.md) |
| **작업 절차 (정본 먼저)** | [`wiki/workflow.md`](wiki/workflow.md) |
| **작업별 진입점** | [`wiki/by-task.md`](wiki/by-task.md) |

---

## 기술 스택

- **Expo SDK 54** / React Native 0.81 / React 19
- **expo-router** (typed routes) — 파일 기반 라우팅
- **expo-sqlite** — 로컬 영속화 (테스트는 Node용 `better-sqlite3` 어댑터)
- **zustand** — 상태 관리 + 설정 영속화
- **Hot Updater + Cloudflare** — 셀프 호스팅 OTA 배포
- 패키지 매니저: **pnpm** (`.npmrc`의 `node-linker=hoisted` 필수)

---

## 저장소 구조

```text
ch-life/
├── apps/ch-life/        # Expo 앱 본체
│   ├── app/             # expo-router 라우트 (index, note/[id], bible, settings, ...)
│   └── src/             # feature/domain별 모듈
├── wiki/                # 정본 위키 — 정책·규칙·계약·결정 (POL/RULE/CONTRACT/ADR)
│   ├── workflow.md      #   작업 절차 — 코드를 열기 전에 정본을 확인한다
│   └── by-task.md       #   작업 유형·코드 경로별 진입점
├── wiki/                # 정본(canon) — POL · RULE · CONTRACT · ADR, git 운용 규칙
├── docs/
│   ├── store/           # 스토어 등록 정보 · 지원 페이지 · 자동제출 가이드
│   ├── legal/           # 개인정보처리방침
│   └── plans/           # 기획 문서 (역사 기록)
├── website/             # GitHub Pages (개인정보처리방침 호스팅)
├── DESIGN.md            # 디자인 시스템 문서
└── .github/workflows/   # CI · EAS Build · Hot Updater · Pages
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

## 온보딩 가이드

### 1. 개발 환경 준비

로컬 개발에는 Node.js와 pnpm이 필요합니다. iOS 또는 Android에서 실행하려면 각 플랫폼의 시뮬레이터나 실제 기기도 준비해 주세요. 웹으로 먼저 확인하는 경우에는 별도 시뮬레이터가 필요하지 않습니다.

이 저장소는 현재 별도 백엔드 서버를 운영하지 않으며, 개발을 위한 `.env` 파일이나 환경 변수도 요구하지 않습니다. 앱 데이터는 기기의 SQLite에 저장되므로 별도의 데이터베이스 계정이나 초기화 작업도 없습니다.

### 2. 저장소 내려받기 및 의존성 설치

```bash
git clone https://github.com/zzzRYT/ch-notes.git
cd ch-notes
cd apps/ch-life
pnpm install
```

의존성은 반드시 `apps/ch-life`에서 설치해 주세요. 이 디렉터리의 `.npmrc`에 설정된 `node-linker=hoisted`는 Expo 번들링에 필요한 설정이므로 변경하지 않습니다.

### 3. 앱 실행

```bash
pnpm start
```

Expo 개발 화면에서 실행할 플랫폼을 선택하거나 아래 명령을 직접 사용할 수 있습니다.

| 작업 | 명령 |
|------|------|
| 실행 | `pnpm start` / `pnpm android` / `pnpm ios` / `pnpm web` |
| 타입체크 | `pnpm typecheck` (`tsc --noEmit`) |
| 린트 | `pnpm lint` (`eslint .`) |
| 테스트 | `pnpm test` (`TZ=Asia/Seoul jest`) / CI: `pnpm test:ci` |

> **Expo는 자주 바뀝니다.** 코드 작성 전 v54 버전드 문서 확인: https://docs.expo.dev/versions/v54.0.0/

### 4. 첫 작업 전 확인

- 앱 코드는 `apps/ch-life` 아래에 있으며, 기능별 위치는 위의 [저장소 구조](#저장소-구조)를 참고합니다.
- 새 기능이나 버그 수정에는 가능한 한 관련 테스트를 함께 추가하거나 수정합니다.
- 데이터베이스 스키마를 바꿀 때는 `db/index.ts`의 인라인 스키마와 `db/schema.sql`을 함께 수정합니다.
- 패키지를 추가하거나 명령을 실행할 때는 npm이나 yarn 대신 pnpm을 사용합니다.

---

## 기여 가이드

작업 방식의 정본은 **[`wiki/git.md`](wiki/git.md)** 다 — 커밋 메시지 형식, 브랜치 이름, PR 게이트, 이슈·라벨, 릴리스와 OTA 절차가 이유와 함께 거기 있다. 아래는 처음 한 번 훑을 요약이다.

**작업 순서**

1. 코드를 열기 전에 [`wiki/workflow.md`](wiki/workflow.md)로 정본을 확인한다. 이미 결정된 것과 충돌하면 거기서 멈춘다.
2. `main`에서 작업 가지를 딴다. 접두는 커밋 타입과 같은 단어다 — `feat/note-search`, `fix/editor-crash`, `docs/git-rules`.
3. 커밋은 `🐛 fix(notes): 복원 경쟁 상황에서 최신 undo 유지`처럼 쓴다. 이모지는 타입이 정하고, 제목은 한국어 명사형이다.
4. `apps/ch-life`에서 `pnpm typecheck` · `pnpm lint` · `pnpm test:ci`, 위키를 건드렸으면 `node wiki/check.mjs`.
5. `main`으로 PR을 연다. 직접 푸시는 막혀 있고, CI가 통과해야 병합된다. 템플릿의 세 칸(무엇을·왜 / 검증 / 위키)을 채운다.

**이슈** — 버그·기능 제안은 [GitHub Issues](https://github.com/zzzRYT/ch-notes/issues)에 템플릿으로 연다. 라벨은 `type:`·`area:` 두 축이고, 값은 커밋 타입·scope와 같은 단어를 쓴다.

**외부 기여자** — 저장소에 푸시 권한이 없으면 Fork한 뒤 원본을 `upstream`으로 등록하고, `upstream/main`을 기준으로 가지를 딴다.

```bash
git remote add upstream https://github.com/zzzRYT/ch-notes.git
git switch main && git pull --ff-only upstream main
git switch -c feat/작업명
```

**보안** — 지금은 백엔드도 개발용 `.env`도 없어 별도 설정 절차가 없다. 개인 토큰·서명 키·기기 정보는 커밋하지 않는다. 배포 자격증명은 GitHub Secrets에만 둔다.

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

- **JS/에셋만 변경** → Hot Updater(OTA).
- **네이티브 의존성 / `version` 변경** → EAS Build.
- ⚠️ `updateStrategy: appVersion` — 대상 버전을 명시해 배포하며, 버전이나 네이티브 계약을 바꾸면 **새 네이티브 빌드 필요**.

- 버전은 네 자리로 읽는다 — `1.0.2+3`의 앞 세 자리는 스토어 빌드, `+3`은 그 버전에 낸 OTA 순번(`src/version.ts`).
- `production` 채널 OTA는 `release/<버전>` 가지에서 수동 실행으로만 나간다.
- ⚠️ **자동 OTA는 현재 실패한다** — R2 자격증명이 잘못돼 있다(`wiki/drift.md` B19). 스토어의 1.0.1 설치본은 hot-updater가 없어 어떤 OTA도 받지 못한다.

절차와 이유는 [`wiki/git.md`](wiki/git.md) 5절. 그 밖에 `apps/ch-life/.claude/skills/eas-release`, [`docs/store/ota-deploy.md`](docs/store/ota-deploy.md), [`docs/store/android-auto-submit.md`](docs/store/android-auto-submit.md).

---

## 라이선스 / 저작권

- 성경 본문 데이터(`assets/bible.json`)는 **Open Bible 한국어판**, **CC BY-SA 4.0**.
  재배포되는 본문은 동일하게 CC BY-SA 라이선스를 유지합니다.
- 씀씀은 **개인정보를 수집·전송하지 않습니다.** 모든 데이터는 기기 로컬에만 저장됩니다.

## 문의

jinjinstar3@gmail.com
