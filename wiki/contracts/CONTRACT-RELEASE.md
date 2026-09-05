# CONTRACT-RELEASE — 빌드·배포 경계

```yaml
id: CONTRACT-RELEASE
policy: POL-RELEASE-001
statement: 앱은 Hot Updater(OTA)와 EAS Build 두 경로로만 사용자에게 닿는다. OTA 번들은 앱 버전(updateStrategy appVersion)과 채널에 묶이므로 version을 올리면 기존 설치본에는 전달되지 않는다.
implemented_by:
  - apps/ch-life/app.config.ts
  - apps/ch-life/eas.json
  - .github/workflows/ci.yml
  - .github/workflows/eas-update.yml
  - .github/workflows/eas-build.yml
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
| OTA 런타임 | `@hot-updater/react-native` — `HotUpdater.wrap`, `updateStrategy: "appVersion"` (`app/_layout.tsx`) |
| OTA 서버 | Cloudflare R2 + D1 + Worker. `extra.hotUpdaterBaseUrl` ← `HOT_UPDATER_BASE_URL` |
| appVersionSource | `remote` (동적 `app.config.ts` + `autoIncrement` 조합에 필요) |
| 채널 | development / preview / production — `eas.json`의 `env.HOT_UPDATER_CHANNEL`로 주입 |

## 두 경로

```text
main 머지 → CI(typecheck·lint·test) 성공 → hot-updater deploy --channel preview  [자동]
네이티브 변경·version 변경 → GitHub Actions 수동 실행 → eas build --no-wait        [수동]
```

⚠️ **자동 경로는 2026-09-05 기준 실제로는 닫혀 있다.** R2 자격증명이 잘못돼 있어 OTA가 업로드 단계에서 매번 실패한다([`../drift.md`](../drift.md) B19).

CI가 실패하면 OTA는 발행되지 않는다. OTA는 **CI를 통과한 정확한 커밋**(`workflow_run.head_sha`)을 체크아웃해 배포한다. 빌드는 크레딧 소모 때문에 자동화하지 않는다.

## 함정 세 가지

1. **`updateStrategy: "appVersion"`** — `version`을 올리면 기존 설치본과 번들이 분리된다. 버전을 올리고 OTA만 쏘면 아무에게도 닿지 않는다. 반드시 새 빌드를 낸다.
2. **pnpm `node-linker=hoisted`** — `.npmrc`의 이 설정이 없으면 `babel-preset-expo` 해석이 실패해 번들이 깨진다. 건드리지 않는다.
3. **OTA 워크플로가 요구하는 값이 7개다** — `HOT_UPDATER_PRIVATE_KEY`, `HOT_UPDATER_BASE_URL`, Cloudflare 계정·API 토큰·D1·R2 버킷·R2 키 2종. 워크플로가 `test -n`으로 전부 검사하므로 **하나라도 없으면 OTA 잡이 실패한다.**
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
