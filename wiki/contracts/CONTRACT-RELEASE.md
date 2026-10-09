# CONTRACT-RELEASE — 빌드·배포 경계

```yaml
id: CONTRACT-RELEASE
policy: POL-RELEASE-001
statement: 앱은 Hot Updater(OTA)와 EAS Build 두 경로로만 사용자에게 닿는다. OTA 번들은 앱 버전(updateStrategy appVersion)과 채널에 묶이므로 version을 올리면 기존 설치본에는 전달되지 않는다.
implemented_by:
  - apps/ch-life/app.config.ts
  - apps/ch-life/src/shared/config/version.ts
  - apps/ch-life/eas.json
  - .github/workflows/ci.yml
  - .github/workflows/eas-update.yml
  - .github/workflows/eas-build.yml
  - .github/workflows/pages.yml
  - apps/ch-life/scripts/sync-store-versions.mjs
verified_by:
  - ci: .github/workflows/ci.yml
confidence: 기록됨
source:
  - apps/ch-life/.claude/skills/eas-release/SKILL.md
  - .github/workflows/eas-update.yml 주석
```

## 고정된 식별자

| 항목 | 값 |
|---|---|
| 런처 표시명 / 스토어명 | 씀씀 / 씀씀: 쉽게 쓰는 설교 노트 |
| iOS bundle / Android package | `com.leejaejin.chlife` |
| EAS project | `813691d9-f5ff-48d6-93c7-47432b44b2ce` |
| scheme | `chlife` |
| OTA 런타임 | `@hot-updater/react-native` — `HotUpdater.wrap`, `updateStrategy: "appVersion"` (`src/app/_layout.tsx`) |
| OTA 발행 번호 | `src/shared/config/version.ts`의 `OTA_RELEASE` — 설정 화면에 `1.0.2+3`으로 표시. **`version`에는 넣지 않는다** |
| OTA 서버 | Cloudflare R2 + D1 + Worker. `extra.hotUpdaterBaseUrl` ← `HOT_UPDATER_BASE_URL` |
| 스토어 최신 버전 | `website/app-version.json` → `https://zzzryt.github.io/ch-notes/app-version.json`. 플랫폼별 `{"ios","android"}` ([`RULE-OTA-010`](../rules/release.md)) |
| 스토어 페이지 | iOS `https://apps.apple.com/app/id6772700147` · Android `market://details?id=com.leejaejin.chlife` |
| appVersionSource | `remote` (동적 `app.config.ts` + `autoIncrement` 조합에 필요) |
| 채널 | development / preview / production — `eas.json`의 `env.HOT_UPDATER_CHANNEL`로 주입 |
| iOS 스토어 제출 | EAS Submit — ASC App ID `6772700147`, Apple Team `43ZASDF2J7`, API 키 `credentials/AuthKey_58F737893F.p8` |
| Android 스토어 제출 | EAS Submit — Play `alpha` 트랙, `releaseStatus: completed`, 서비스 계정 키 `credentials/play-service-account.json` |

## 두 경로

```text
아무 가지(보통 dev) → agent 요청 → GitHub Actions → CI 재실행 → deploy --channel preview [요청형]
release/<버전> → agent 요청 → GitHub Actions → CI 재실행 → deploy --channel production   [요청형]
네이티브 변경·version 변경 → GitHub Actions 수동 실행 → eas build --no-wait → 완료 build ID → eas submit --id <ID> [agent 2단계]
main website 변경 / 6시간 주기 → pages.yml → 공개 스토어 버전 동기화 → GitHub Pages [자동]
```

**마지막 줄이 앱 안의 업데이트 안내를 켠다**([`RULE-OTA-010`](../rules/release.md)). 버전은 공개 App Store Lookup 결과와 Google Play 공개 목록에서 읽는다. 두 스토어의 공개 시점이 다르므로 플랫폼별로 독립 갱신한다. 한쪽 조회에 실패하면 해당 플랫폼의 이전 값을 유지하고 Pages를 배포한 뒤 워크플로를 실패 처리해 확인할 수 있게 한다.

`production` 채널은 **`release/**` 가지에서만** 발행된다 — 워크플로가 `github.ref`를 검사해 거부한다([`../decisions/ADR-0021`](../decisions/ADR-0021-release-strategy.md)).

**2026-10-09에 1.0.3+1과 1.0.4+1의 production OTA 발행을 확인했다.** 이전 R2 자격증명 오류는 해소 상태다([`../drift.md`](../drift.md) B19). 실제 기기 적용은 발행 결과와 별도로 확인한다.

빌드 산출물이 스토어까지 가는 마지막 구간은 **EAS CLI의 EAS Submit**이다. agent는 완료된 특정 build ID를 지정해 제출한다(`--latest` 금지). 제출 실행 환경에는 `EXPO_TOKEN`과 `apps/ch-life/credentials/`의 submit 자격증명이 필요하다(절차: `docs/store/ios-auto-submit.md` · `docs/store/android-auto-submit.md`). iOS 업로드 후 App Store Connect 심사 제출은 사람이 한다. Android는 `alpha` 트랙에 업로드되며 공개 출시 승격은 별도다.

`main`·`dev` 병합은 OTA를 발행하지 않는다([`../decisions/ADR-0028`](../decisions/ADR-0028-dev-branch.md)). 사용자가 요청하면 agent가 기존 발행 워크플로를 실행한다. 발행 워크플로는 `ci.yml`을 `workflow_call`로 불러 **같은 커밋으로 CI를 먼저 돌리고**, 실패하면 발행하지 않는다. Native 빌드도 수동으로 시작하고, 완료 후 agent가 별도 EAS CLI 제출을 수행한다.

## 함정 넷

1. **`updateStrategy: "appVersion"`** — `version`을 올리면 기존 설치본과 번들이 분리된다. 버전을 올리고 OTA만 쏘면 아무에게도 닿지 않는다. 반드시 새 빌드를 낸다.
2. **pnpm `node-linker=hoisted`** — `.npmrc`의 이 설정이 없으면 `babel-preset-expo` 해석이 실패해 번들이 깨진다. 건드리지 않는다.
3. **OTA 워크플로가 요구하는 값이 7개다** — `HOT_UPDATER_PRIVATE_KEY`, `HOT_UPDATER_BASE_URL`, Cloudflare 계정·API 토큰·D1·R2 버킷·R2 키 2종. 워크플로는 **존재가 아니라 형식**을 검사한다(계정 ID·R2 access key id는 32자리 hex, secret은 64자리 hex, D1은 UUID). 모양이 틀리면 번들을 만들기 전에 멈춘다. 형식이 맞는 **틀린 값**은 여전히 업로드 단계에서 죽는다.
4. **루트 `pnpm-workspace.yaml`이 앱 설치를 가로챈다** — 워크스페이스는 `packages/*`만 멤버로 두는데도 pnpm v10은 상위로 올라가 워크스페이스를 대신 설치한다(`Scope: all 2 workspace projects`). 그러면 앱 의존성이 설치되지 않아 typecheck·lint·test가 전부 깨진다. 세 워크플로 모두 **`--ignore-workspace`**로 막아 두었다. `.npmrc`의 `ignore-workspace=true`는 **먹지 않는다** — 반드시 CLI 플래그여야 한다.
5. **`EAS_BUILD_PROFILE`이 있으면 `HOT_UPDATER_BASE_URL` 없이는 빌드가 `throw`한다**(`app.config.ts`). 설정 실수가 런타임이 아니라 빌드 시점에 터진다.

## 공개 산출물

- 개인정보처리방침은 `website/`만 GitHub Pages로 발행한다. **`docs/`(계획 문서)는 의도적으로 발행하지 않는다**(`pages.yml` 주석).
- 스토어 제출 자격증명은 `apps/ch-life/credentials/`를 참조하며 저장소에 커밋하지 않는다.

## 1.0.1 설치본은 이 경로로 닿지 않는다

스토어에 나간 **1.0.1은 `expo-updates`로 빌드된 바이너리**다(`version` 범프 `9af70d5`가 hot-updater 병합 `30b6a60`보다 앞선다). 지금 `main`에는 `expo-updates`도 `updates.url`도 없다. hot-updater 클라이언트는 **네이티브 모듈이라 OTA로 배달할 수 없다.**

→ **1.0.1 설치본은 어떤 OTA도 받지 못한다.** 그 사용자들에게 무언가를 고쳐 보내려면 hot-updater가 들어간 새 스토어 빌드(1.0.2+)를 내는 수밖에 없다. 이 상태가 의도된 것인지는 확인되지 않았다([`../drift.md`](../drift.md) E13).

## 정본이 아닌 것

이 문서의 표는 손으로 옮겨 적은 사본이다. 값의 정본은 `app.config.ts`·`eas.json`·`.github/workflows/**`다.
