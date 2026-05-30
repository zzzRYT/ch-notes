---
name: eas-release
description: Ship a ch-life release — decide between EAS Update (OTA) and EAS Build, and run it safely. Use when publishing an update, cutting a build, bumping the app version, or touching app.config.ts version/runtimeVersion, eas.json, or the eas-build/eas-update workflows.
---

# 릴리스 / EAS 배포

먼저 **OTA로 충분한가, 새 빌드가 필요한가**를 판단한다. 잘못 고르면 사용자에게 업데이트가
아예 안 닿는다.

## 결정: Update(OTA) vs Build

| 변경 내용 | 경로 |
|-----------|------|
| JS/TS 로직, 스타일, JS 에셋만 | **EAS Update (OTA)** |
| 네이티브 의존성 추가/변경(새 expo 모듈, native lib) | **EAS Build** |
| `app.config.ts`의 `version` 변경 | **EAS Build** (아래 함정) |
| `app.config.ts` plugins/권한/네이티브 설정 변경 | **EAS Build** |

⚠️ **`runtimeVersion.policy = "appVersion"`** (app.config.ts). OTA 업데이트는 **같은
`version`을 가진 설치본에만** 적용된다. `version`을 올리면 새 런타임이 되어 기존 OTA 채널과
분리되므로, 반드시 **새 네이티브 빌드**를 내야 사용자에게 닿는다. "버전 올리고 OTA만 쏘는" 실수 금지.

## EAS Update (OTA)

- **자동**: `main`에 머지되어 **CI(typecheck/lint/test)가 통과하면** `eas-update.yml`이
  `preview` 브랜치로 자동 발행한다(실패한 CI는 OTA 안 나감).
- **수동**: GitHub Actions → "EAS Update (OTA)" → Run workflow → branch `preview`|`production` 선택.
- 채널/브랜치: `eas.json`의 `development`/`preview`/`production`.

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
- [ ] `EXPO_TOKEN` 시크릿이 워크플로에 필요(EAS 인증).

## 참고

- 설정: `app.config.ts`(version, runtimeVersion, updates.url, projectId), `eas.json`(프로필).
- 워크플로: `.github/workflows/eas-build.yml`, `.github/workflows/eas-update.yml`.
