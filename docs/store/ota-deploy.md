# OTA 배포 운영 절차

씀씀의 JavaScript와 번들 자산을 EAS Update로 배포하고, 문제가 생겼을 때 안전한 버전으로 되돌리는 절차다.

> 현재 상태: 운영 절차만 확정했다. production 발행·실기기 적용·롤백 왕복은 아직 실행하지 않았다. 아래의 `<...>` 값과 실측 기록은 실제 리허설에서 채운다.

## 현재 배관

- Expo SDK: 54
- 업데이트 런타임: `expo-updates`
- 프로젝트: `@zzzryt/ch-note`
- production 채널: `production`
- 런타임 정책: `runtimeVersion: { policy: "appVersion" }`
- 현재 앱 버전과 대상 런타임: `1.0.0`
- 최초 발행 거처: `/Users/leejaejin/coding/toy-project/ch-life/.worktrees/post-launch-ops`
- 최초 발행 Git 브랜치: `zzzRYT/post-launch-ops`

`eas.json`의 production 빌드는 `production` 채널을 바이너리에 넣는다. 채널은 설치된 바이너리가 어느 업데이트 흐름을 조회할지 정하고, EAS Update 브랜치는 시간순 업데이트 묶음을 보관한다. 이 프로젝트는 단순 운영을 위해 `--channel production`으로 발행하며, EAS가 production 채널에 연결된 브랜치에 업데이트를 추가하게 한다.

빌드와 업데이트는 플랫폼과 runtime version이 모두 같을 때만 호환된다. `appVersion` 정책에서는 스토어 표시 버전 `1.0.0`이 runtime version `1.0.0`이 된다. iOS build number와 Android versionCode는 runtime version에 포함되지 않는다.

## 발행 전 점검

production 발행은 반드시 위 작업 거처의 배포할 커밋에서 실행한다. 작업 트리가 더럽거나 다른 기능이 섞였으면 발행하지 않는다.

```bash
cd /Users/leejaejin/coding/toy-project/ch-life/.worktrees/post-launch-ops/apps/ch-life

git status --short
git log -1 --oneline
eas whoami
```

`eas whoami`는 프로젝트 owner에 접근할 수 있는 `zzzryt` 계정이어야 한다. 2026-09-02 점검 당시 로컬 로그인은 다른 계정이어서 조회 권한이 없었다. 다음 단계 전에 명시적으로 다시 로그인한다.

```bash
eas logout
eas login
```

스토어에 올라간 production 바이너리가 실제로 `channel: production`, `runtimeVersion: 1.0.0`인지 확인한다.

```bash
eas build:list --platform all --status finished --limit 10
eas build:view <IOS_BUILD_ID>
eas build:view <ANDROID_BUILD_ID>
eas channel:view production
```

다음 조건이 하나라도 맞지 않으면 발행을 중단한다.

- 스토어 설치본을 만든 build profile이 `production`이 아니다.
- 바이너리의 channel이 `production`이 아니다.
- 바이너리와 업데이트의 runtime version이 다르다.
- 배포 커밋에 네이티브 변경이 섞였다.
- 로컬 계정이 프로젝트를 조회할 수 없다.

코드 게이트도 먼저 통과시킨다.

```bash
pnpm test:ci
pnpm typecheck
pnpm lint
```

## production 발행

현재 커밋의 JavaScript 번들과 자산을 production 채널에 발행한다.

```bash
eas update --channel production --message "<사용자에게 보이는 변경 요약>"
```

명령 결과에서 update group ID, runtime version, platform별 update ID와 dashboard URL을 배포 기록에 남긴다. 발행 직후 서버 상태도 다시 확인한다.

```bash
eas update:view <UPDATE_GROUP_ID>
eas update:list --all --runtime-version 1.0.0
eas channel:view production
```

### 실기기 적용 확인

Expo SDK 54의 기본값은 시작할 때 항상 업데이트를 확인하고(`checkAutomatically: ALWAYS`), 시작 화면에서 기다리지 않는 것(`fallbackToCacheTimeout: 0`)이다. 따라서 보통 첫 실행에서 백그라운드로 내려받고, 앱을 완전히 종료한 다음 다시 실행할 때 적용된다. 강제 재시작이나 전체 화면 안내를 앱 코드에서 호출하지 않는다.

스토어에서 설치한 앱으로 다음을 기록한다.

1. 앱을 완전히 종료한다.
2. 첫 번째 실행에서 변경 전/후 중 무엇이 보이는지 기록한다.
3. 앱을 다시 완전히 종료한다.
4. 두 번째 실행에서 변경이 적용됐는지 기록한다.
5. iOS와 Android 각각 필요한 실행 횟수와 확인 시각을 기록한다.
6. `Updates.updateId`, `Updates.channel`, `Updates.runtimeVersion` 진단값으로 `embedded`가 아닌 production 업데이트인지 확인한다.

실측 전에는 “두 번째 실행에 반드시 적용된다”고 완료 판정하지 않는다. 네트워크와 OS 종료 방식에 따라 다운로드 시점이 달라질 수 있다.

## 롤백

롤백도 새 업데이트를 발행하는 동작이다. 이미 잘못된 업데이트를 실행한 사용자는 다음 호환 업데이트를 다운로드하고 다시 시작할 때까지 그 버전을 실행할 수 있다. 로컬 DB나 파일 형식을 이전 버전과 호환되지 않게 바꾼 업데이트는 코드만 되돌려도 안전하지 않을 수 있으므로, 먼저 같은 사용자 상태를 가진 release/staging 빌드에서 검증한다.

### 첫 OTA를 임베디드 번들로 되돌리기

production의 첫 OTA 전 상태는 스토어 바이너리에 포함된 embedded update다.

```bash
eas update:roll-back-to-embedded \
  --channel production \
  --runtime-version 1.0.0 \
  --message "rollback: <문제가 된 update group ID>를 embedded로 복구"
```

발행 결과의 새 rollback group ID를 기록하고, 실기기에서 같은 재실행 절차를 밟아 OTA 기능이 사라지고 embedded 상태가 실행되는지 확인한다.

### 이후 OTA를 이전 정상 그룹으로 되돌리기

정상 동작이 확인된 update group을 production에 재발행한다. 소스 코드를 다시 번들링하는 대신 검증했던 동일 아티팩트를 사용한다.

```bash
eas update:republish \
  --group <KNOWN_GOOD_UPDATE_GROUP_ID> \
  --destination-channel production \
  --message "rollback: <문제가 된 update group ID>에서 정상 그룹으로 복구"
```

대화형 통합 명령 `eas update:rollback`으로도 이전 그룹 또는 embedded update를 선택할 수 있다. 사고 대응 문서에는 자동화하기 쉬운 명시적 명령을 우선 남긴다.

### 롤백 뒤 수정본 재발행

수정본의 전체 게이트를 다시 통과시킨 뒤 새 update로 발행한다.

```bash
eas update --channel production --message "fix: <수정 내용>"
```

새 update group ID와 실기기 복구 확인 결과를 기록한다. 롤백 그룹을 삭제하지 않는다. 어떤 버전이 언제 사용자에게 제공됐는지 추적할 수 있어야 한다.

## OTA로 배포할 수 없는 변경

다음 변경은 네이티브 바이너리와의 계약을 바꾸므로 새 스토어 빌드가 필요하다.

- 네이티브 모듈이나 네이티브 의존성 추가·제거·버전 변경
- config plugin 추가·제거·설정 변경
- Expo SDK 또는 React Native 업그레이드
- `app.config.ts`에서 네이티브 프로젝트로 반영되는 값 변경
- 앱 아이콘, adaptive icon, splash, 앱 이름, scheme 변경
- 카메라·사진·추적 등의 권한 및 `Info.plist`/AndroidManifest 선언 변경
- bundle identifier, Android package, new architecture, JS engine 변경
- iOS Podfile, Xcode 프로젝트, Android Gradle 설정 변경

일반적인 TypeScript/JavaScript 로직, React 컴포넌트, 스타일, 번들에 포함되는 이미지·폰트는 기존 네이티브 런타임과 호환되는 한 OTA 대상이다. 새 라이브러리가 순수 JS처럼 보여도 네이티브 코드나 config plugin을 포함하는지 반드시 확인한다.

네이티브 계약이 바뀌면 `version`을 올리고 새 production 빌드를 만든다. 이 프로젝트의 `appVersion` 정책은 새 버전을 새 runtime version으로 만들어, 예를 들어 `1.1.0`용 JavaScript가 `1.0.0` 바이너리에 전달되지 않게 한다. build number/versionCode만 올리는 것으로는 runtime version이 분리되지 않는다.

## 배포 기록 템플릿

```text
배포 시각:
작업 거처 / Git commit:
EAS 계정:
채널 / runtime version:
iOS build ID / Android build ID:
update group ID:
platform update IDs:
변경 내용:
첫 실행 결과:
두 번째 실행 결과:
iOS 적용 확인:
Android 적용 확인:
rollback group ID:
rollback 실기기 확인:
재발행 group ID:
재발행 실기기 확인:
잔여 위험:
```

## 근거 문서

- [Expo SDK 54 `expo-updates`](https://docs.expo.dev/versions/v54.0.0/sdk/updates/)
- [EAS Update 배포](https://docs.expo.dev/eas-update/deployment/)
- [EAS Update 롤백](https://docs.expo.dev/eas-update/rollbacks/)
- [EAS CLI 명령 레퍼런스](https://docs.expo.dev/eas/cli/)
