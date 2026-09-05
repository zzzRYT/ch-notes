---
name: eas-release
description: Ship a ch-life release — decide between Hot Updater OTA and EAS Build, and run it safely. Use when publishing an update, cutting a build, bumping the app version, or touching app.config.ts, eas.json, or the build/update workflows.
---

# 릴리스 / Hot Updater·EAS 배포

정본은 `wiki/contracts/CONTRACT-RELEASE.md`(+ `POL-RELEASE-001`, `ADR-0013`)다.

⚠️ **스토어의 1.0.1은 `expo-updates`로 빌드된 바이너리인데 main은 `hot-updater`로 갈아탔다**
(`30b6a60`, PR #14). hot-updater 클라이언트는 네이티브 모듈이라 OTA로 배달할 수 없다 —
**1.0.1 설치본에는 어떤 OTA도 닿지 않는다.** 그 사용자들에게 고침을 보내려면 새 스토어 빌드뿐이다.
OTA 잡은 시크릿·변수 7개를 `test -n`으로 검사하므로 하나만 없어도 실패한다.

먼저 **OTA로 충분한가, 새 빌드가 필요한가**를 판단한다. 잘못 고르면 사용자에게 업데이트가
아예 안 닿는다.

## 결정: Update(OTA) vs Build

| 변경 내용 | 경로 |
|-----------|------|
| JS/TS 로직, 스타일, JS 에셋만 | **Hot Updater (OTA)** |
| 네이티브 의존성 추가/변경(새 expo 모듈, native lib) | **EAS Build** |
| `app.config.ts`의 `version` 변경 | **EAS Build** |
| `app.config.ts` plugins/권한/네이티브 설정 변경 | **EAS Build** |

⚠️ Hot Updater의 `updateStrategy: "appVersion"`은 OTA를 **지정한 앱 버전 설치본에만**
보낸다. 버전을 올렸거나 네이티브 계약을 바꿨으면 반드시 새 네이티브 빌드를 먼저 낸다.

## Hot Updater (OTA)

- **자동**: `main` CI가 통과하면 `eas-update.yml`이 Hot Updater `preview` 채널로 발행한다.
- **수동 production**: GitHub Actions → "Hot Updater (OTA)" → `production` 선택.
- 로컬: `pnpm exec hot-updater deploy --channel production --target-app-version <version>`.
- `--force-update`는 사용하지 않는다. 현재 세션은 재시작하지 않는다.

## EAS Build

- **수동만**: GitHub Actions → "EAS Build" → Run workflow → profile(`preview`/`production`/
  `development`) + platform(`all`/`ios`/`android`) 선택. 크레딧 절약 위해 `--no-wait`로
  큐에 넣고 빌드 URL만 반환한다.
- `production` 프로필은 `autoIncrement: true`(빌드번호 자동 증가).

## 배포 전 점검

- [ ] `pnpm typecheck && pnpm lint && pnpm test:ci` 로컬 통과 (CI와 동일).
- [ ] 네이티브 변경이면 OTA 아님 → Build 경로 확인.
- [ ] `version` 올렸으면 → Build 필수, OTA로 끝내지 말 것.
- [ ] pnpm은 `.npmrc`의 `node-linker=hoisted` 필수 — 없으면 `babel-preset-expo` 해석 실패로
      `expo export`/`eas update` 번들이 깨진다. (이미 설정됨, 건드리지 말 것.)
- [ ] `pnpm exec hot-updater doctor --json --server-base-url "$HOT_UPDATER_BASE_URL"` 통과.
- [ ] Hot Updater 기준선 스토어 빌드가 대상 기기에 설치됨.
- [ ] Cloudflare·서명 secret과 공개 Worker URL이 EAS/GitHub에 등록됨.

## 참고

- 설정: `app.config.ts`, `hot-updater.config.ts`, `eas.json`.
- 워크플로: `.github/workflows/eas-build.yml`, `.github/workflows/eas-update.yml`.
- 전체 절차: `docs/store/ota-deploy.md`.
