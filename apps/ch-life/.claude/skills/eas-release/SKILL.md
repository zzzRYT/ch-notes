---
name: eas-release
description: Ship a ch-life release — decide between Hot Updater OTA and EAS Build, and run it safely. Use when publishing an update, cutting a build, bumping the app version, or touching app.config.ts, eas.json, or the build/update workflows.
---

# 릴리스 / Hot Updater·EAS 배포

정본은 `wiki/git.md` 5절과 `wiki/contracts/CONTRACT-RELEASE.md`(+ `POL-RELEASE-001`, `ADR-0013`, `ADR-0021`)다.
**절차(가지·PR·태그)는 `wiki/git.md` 5절이 정본이고, 여기는 OTA/Build 판단과 점검 목록이다.**

⚠️ **스토어의 1.0.1은 `expo-updates`로 빌드된 바이너리인데 main은 `hot-updater`로 갈아탔다**
(`30b6a60`, PR #14). hot-updater 클라이언트는 네이티브 모듈이라 OTA로 배달할 수 없다 —
**1.0.1 설치본에는 어떤 OTA도 닿지 않는다.** 그 사용자들에게 고침을 보내려면 새 스토어 빌드뿐이다.
OTA 잡은 시크릿·변수 7개의 **형식까지** 검사한다 — 모양이 틀리면 번들을 만들기 전에 멈춘다.
⚠️ 자동 OTA는 2026-09-05 기준 R2 자격증명 오류로 **한 번도 성공한 적이 없다**(`wiki/drift.md` B19).

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

- **자동 발행은 없다.** `main`·`dev` 병합은 아무것도 발행하지 않는다(`ADR-0028`).
- **수동 preview**: GitHub Actions → "Hot Updater (OTA)" → 가지 선택(보통 `dev`) → `preview`. 발행 전에 같은 커밋으로 CI가 다시 돈다.
- **agent production**: 사용자가 배포를 요청하면 변경을 OTA/네이티브로 분류하고 안전성 점검 후 GitHub Actions의 "Hot Updater (OTA)"를 `production`으로 실행한다. **`release/<버전>` 가지에서만** 된다 — 다른 ref면 워크플로가 거부한다. 발행 직전 워크플로가 같은 커밋으로 CI를 다시 실행한다.
- agent는 워크플로 실행 후 결과를 기다리고, 성공한 run과 배포 SHA를 사용자에게 보고한다. 실패하면 같은 번들을 로컬 CLI로 우회 발행하지 않는다.
- **발행 전 `src/shared/config/version.ts`의 `OTA_RELEASE`를 +1** 하고, 그 변경도 릴리스 가지로 PR을 열어 CI를 통과시킨 뒤 병합한다. 발행 후 `v<버전>+<번호>` 태그를 붙인다.
- 발행에 성공하면 해당 릴리스 커밋을 임시 `chore/backmerge-<버전>` PR로 `main`에 역머지한다. 이 PR이 병합되어야 OTA가 끝난다.
- 직접 로컬 `hot-updater deploy`는 쓰지 않는다. CI를 거치지 않으므로 agent는 발행 워크플로를 실행하고 완료까지 확인한다.
- `--force-update`는 사용하지 않는다. 현재 세션은 재시작하지 않는다.

## EAS Build

- **2단계 배포**: GitHub Actions → "EAS Build" → Run workflow → `production` + 대상 platform을
  선택한다. 워크플로는 `--no-wait`로 큐에 넣고 build URL만 반환한다. build가 완료되면
  agent가 해당 commit·앱 버전·platform의 성공 build ID를 조회한다:
  `eas build:list --platform all --build-profile production --git-commit-hash <SHA> --status finished --json`.
  각 플랫폼의 ID를 지정해 따로 제출한다:
  `eas submit --platform ios --id <IOS_BUILD_ID> --profile production --non-interactive --wait`
  `eas submit --platform android --id <ANDROID_BUILD_ID> --profile production --non-interactive --wait`.
- `--latest`는 다른 build를 잘못 선택할 수 있으므로 쓰지 않는다. 저장소의 submit 자격증명은
  `apps/ch-life/credentials/` 파일 경로로 설정되어 있으므로 EAS CLI 실행 환경에 해당 파일과
  `EXPO_TOKEN`이 있어야 한다. 키 내용은 로그·대화에 출력하지 않는다.
- 제출은 스토어 업로드 단계다. iOS는 App Store Connect에서 심사 제출을 사람이 진행한다.
  Android는 현재 `alpha` 트랙에 업로드되며 공개 출시 승격은 별도다.
- `production` 프로필은 `autoIncrement: true`(빌드번호 자동 증가).
- 스토어 공개와 태그 뒤, 릴리스 커밋을 임시 `chore/backmerge-<버전>` PR로 `main`에 역머지한다. 이 PR이 병합되어야 릴리스가 끝난다.

## 스토어 업데이트 안내

기존 설치본에 "스토어에서 업데이트하세요"를 띄우는 스위치는 `website/app-version.json`이다
(`RULE-OTA-010`, `ADR-0022`). `pages.yml`이 공개 App Store와 Google Play 목록을 읽어 배포 산출물에
버전을 넣고, 6시간마다 다시 확인한다. 각 플랫폼이 실제로 공개된 시점부터 안내가 켜진다.

Play Store 페이지 구조가 바뀌거나 조회가 실패하면 해당 플랫폼의 이전 버전을 유지하고 Pages를 배포한 뒤 워크플로를 실패 처리한다. 다른 플랫폼 조회가 성공하면 해당 버전은 반영된다.

## 배포 전 점검

- [ ] `pnpm typecheck && pnpm lint && pnpm test:ci` 로컬 통과 (CI와 동일).
- [ ] 발행할 커밋이 **릴리스 가지에 PR로 병합되어 CI를 통과한** 커밋인가.
- [ ] 릴리스 가지의 버전 bump·핫픽스·`OTA_RELEASE`를 임시 역머지 PR로 `main`에 반영했는가 (`wiki/git.md` 5절). 이것까지가 배포 완료 조건이다.
- [ ] OTA면 `OTA_RELEASE` 를 올렸는가. 새 스토어 버전이면 `0`으로 되돌렸는가.
- [ ] Pages 배포 로그에서 스토어 버전 동기화가 성공했는가 (실패 시 이전 JSON이 유지됨).
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
