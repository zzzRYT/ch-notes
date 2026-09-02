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

버그 수정, 기능 제안, 문서 개선 모두 환영합니다. 작업 내용과 논의 과정을 추적할 수 있도록 가능하면 이슈를 먼저 만들고, 하나의 PR에는 하나의 목적만 담아 주세요.

### 이슈 만들기

[GitHub Issues](https://github.com/zzzRYT/ch-notes/issues)에서 기존 이슈를 먼저 검색한 뒤 새 이슈를 작성합니다.

버그 이슈에는 다음 내용을 포함해 주세요.

- 문제가 발생한 플랫폼과 실행 환경(iOS, Android, Web)
- 재현 순서
- 기대한 동작과 실제 동작
- 오류 메시지, 로그 또는 화면 캡처(가능한 경우)

기능 제안에는 해결하려는 문제, 필요한 이유, 기대하는 사용 흐름을 적어 주세요. 구현 방법이 정해지지 않았더라도 사용자 관점의 문제와 결과가 분명하면 충분합니다.

### 브랜치에서 작업하기

저장소에 직접 푸시할 권한이 없다면 먼저 GitHub에서 저장소를 Fork한 뒤, 온보딩 가이드의 `git clone` URL을 자신의 Fork URL로 바꿔 내려받습니다. 이어서 원본 저장소를 `upstream`으로 등록합니다.

```bash
git remote add upstream https://github.com/zzzRYT/ch-notes.git
```

기본 브랜치인 `main`을 최신 상태로 만든 뒤 작업 브랜치를 생성합니다. Fork에서 작업하는 외부 기여자는 `upstream/main`을, 저장소에 직접 푸시할 수 있는 구성원은 `origin/main`을 기준으로 사용합니다.

```bash
git switch main
git pull --ff-only upstream main  # 직접 기여자는 upstream 대신 origin 사용
git switch -c feat/간단한-작업명
```

브랜치 이름은 작업 성격을 알아볼 수 있게 작성합니다.

- 기능: `feat/note-search`
- 버그 수정: `fix/editor-crash`
- 문서: `docs/contribution-guide`
- 기타 유지보수: `chore/dependency-update`

커밋은 서로 관련된 변경끼리 나누고, `feat:`, `fix:`, `docs:`, `chore:`처럼 변경 목적이 드러나는 메시지를 권장합니다.

### 변경 사항 검증하기

PR을 올리기 전에 `apps/ch-life`에서 아래 검사를 실행해 주세요.

```bash
pnpm typecheck
pnpm lint
pnpm test:ci
```

문서만 변경했다면 테스트 실행은 생략할 수 있지만, 링크·명령어·Markdown 형식이 실제 저장소와 일치하는지 직접 확인해 주세요. UI 변경은 영향을 받는 플랫폼에서 직접 실행하고, 작은 화면과 큰 화면을 함께 확인하는 것을 권장합니다.

### Pull Request 올리기

작업 브랜치를 자신의 `origin`에 올린 뒤 원본 저장소의 `main`을 대상으로 PR을 생성합니다.

```bash
git push -u origin feat/간단한-작업명
```

PR 설명에는 다음 내용을 포함해 주세요.

- 무엇을, 왜 변경했는지
- 관련 이슈 번호(`Closes #123` 등)
- 실행한 검증 명령과 결과
- UI 변경 전후의 화면 캡처 또는 영상(해당하는 경우)
- 리뷰어가 특별히 확인해야 할 사항

PR을 올린 뒤에는 CI 결과와 리뷰 의견을 확인하고, 수정 사항은 같은 브랜치에 추가로 푸시합니다. 리뷰가 끝나기 전에는 불필요한 대규모 리팩터링이나 관련 없는 파일 변경을 섞지 않습니다.

### 현재 보안 및 설정 범위

현재 프로젝트에는 별도 백엔드, 서버 자격 증명, 개발용 `.env`가 없어 추가 보안 설정 절차는 없습니다. 다만 개인 토큰, 서명 키, 로컬 기기 정보처럼 개인이 사용하는 민감 정보는 저장소에 커밋하지 마세요. 향후 외부 서비스나 환경 변수가 도입되면 이 문서에 설정 및 보안 절차를 함께 추가합니다.

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
