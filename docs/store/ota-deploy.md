# Hot Updater OTA 배포 운영 절차

씀씀의 JavaScript와 번들 자산을 Hot Updater + Cloudflare로 배포하고,
문제가 생겼을 때 정상 번들로 복구하는 절차다.

> 2026-09-05 상태: 앱·서명·CI 설정, Cloudflare 리소스 생성, EAS/GitHub
> secret 등록과 네이티브 prebuild 검증을 완료했다. 새 스토어 빌드와 실기기
> OTA·롤백 왕복은 아직 실행 전이다.

## 배포 모델

- 앱 런타임: `@hot-updater/react-native` 0.36.8
- 빌드 플러그인: `@hot-updater/expo` 0.36.8
- 저장소/DB/API: Cloudflare R2 + D1 + Worker
- 호환성: `appVersion`
- 기본 네이티브 채널: `production`
- 현재 새 기준선 버전: `1.0.1`
- 번들 서명: RSA-4096, private key는 Git과 앱 번들에서 제외
- 적용 정책: 일반 업데이트와 서버 롤백 모두 현재 세션을 재시작하지 않고
  다음 cold launch에 적용 (`reloadOnForceUpdate: false`)

Hot Updater는 `expo-updates`와 함께 쓸 수 없다. 이 저장소는 기존
`updates.url`, `runtimeVersion`, EAS Update 채널 설정과 `expo-updates`
의존성을 제거했다. Hot Updater 네이티브 모듈과 public key가 들어간 새 스토어
빌드가 설치되기 전에는 Hot Updater OTA를 받을 수 없다.

## 자동화와 사람 작업 경계

| 단계 | 자동화 | 사용자가 직접 할 일 |
| --- | --- | --- |
| 앱 전환 | 패키지·config plugin·root wrapper·서명 설정·CI | 없음 |
| Cloudflare | `hot-updater init`가 R2·D1·Worker 생성과 migration 수행 | Cloudflare에서 최소 권한 token 2개 생성 후 로컬 prompt에 입력 |
| 키 | 로컬 RSA key 생성, public key를 prebuild 때 자동 주입 | private key를 비밀 저장소에 등록하고 원본을 안전하게 백업 |
| 네이티브 출시 | GitHub Action/EAS가 iOS·Android 빌드 큐잉 | `zzzryt` EAS 인증, 스토어 약관·심사·출시 승인 |
| OTA | CI 성공 뒤 preview 자동 발행, production 수동 발행 | production 실행 승인과 iOS·Android 실기기 확인 |
| 롤백 | CLI가 문제 bundle을 비활성화 | 어떤 bundle을 되돌릴지 승인하고 실기기 복구 확인 |

Cloudflare/EAS/GitHub 비밀값을 이 문서, 이슈, 채팅, shell history에 붙이지
않는다. 로컬의 `.env.hotupdater` 또는 각 서비스의 secret 입력창에만 넣는다.

## 1. Cloudflare 최초 구성 — 사용자 입력 필요

Cloudflare 대시보드에서 다음 두 자격증명을 만든다.

1. D1 API token: 대상 계정의 **D1 Edit** 권한.
2. R2 API token: `ch-notes-bucket` 대상 **Object Read & Write** 권한. 생성
   결과의 **Access Key ID(32자)**와 **Secret Access Key(64자)**를 사용한다.
   함께 표시되는 53자짜리 API token 값 자체를 Access Key ID에 넣지 않는다.

그 다음 이 디렉터리에서 초기화를 실행한다.

```bash
cd apps/ch-life
pnpm exec hot-updater init --provider cloudflare --build expo
```

현재 production 리소스는 Worker `hot-updater`, D1 database `ch-notes`, R2
bucket `ch-notes-bucket`이다. R2 bucket은 private다. CLI의 password prompt에
token과 access key를 넣고, 재실행용 `.env.hotupdater` 저장에 동의한다. 이 파일은
Git에서 제외되어 있다.

성공 후 출력된 공개 endpoint를 `.env.hotupdater`에 추가한다.

```dotenv
HOT_UPDATER_BASE_URL=https://hot-updater.jinjinstar3.workers.dev/api/check-update
```

환경을 재현하거나 migration을 다시 맞출 때는 저장된 값을 사용한다.

```bash
pnpm exec hot-updater init \
  --provider cloudflare \
  --build expo \
  --from-env-file .env.hotupdater
```

## 2. 서명 키 보관 — 사용자 인증 필요

로컬 키는 `apps/ch-life/keys/`에 있고 Git에서 제외되어 있다. private key를
암호화된 개인 비밀 저장소에 한 번 더 백업한다. 분실하면 기존 public key가 박힌
앱에 서명된 새 bundle을 보낼 수 없다.

EAS의 `zzzryt` 계정으로 전환한 뒤 production 환경에 private key와 Worker URL을
등록한다. 값은 대화나 로그로 전달하지 않는다.

```bash
eas logout
eas login
eas env:create --environment production --name HOT_UPDATER_PRIVATE_KEY \
  --value "$(cat keys/private-key.pem)" --visibility secret
eas env:create --environment production --name HOT_UPDATER_BASE_URL \
  --value "<PUBLIC_WORKER_BASE_URL>" --visibility plain
```

GitHub Actions 자동화를 쓸 때는 다음을 등록한다.

- Repository variable: `HOT_UPDATER_BASE_URL`,
  `HOT_UPDATER_CLOUDFLARE_R2_BUCKET_NAME`
- Repository secret: `HOT_UPDATER_PRIVATE_KEY`,
  `HOT_UPDATER_CLOUDFLARE_ACCOUNT_ID`,
  `HOT_UPDATER_CLOUDFLARE_API_TOKEN`,
  `HOT_UPDATER_CLOUDFLARE_D1_DATABASE_ID`,
  `HOT_UPDATER_CLOUDFLARE_R2_ACCESS_KEY_ID`,
  `HOT_UPDATER_CLOUDFLARE_R2_SECRET_ACCESS_KEY`

## 3. 배포 전 자동 점검

```bash
pnpm test:ci
pnpm typecheck
pnpm lint
pnpm exec hot-updater doctor --json \
  --server-base-url "$HOT_UPDATER_BASE_URL"
```

`doctor`는 패키지 버전, iOS·Android 네이티브 연결, 서명 설정, Worker `/version`
호환성을 검사한다. 하나라도 실패하면 빌드나 OTA를 발행하지 않는다.

다음 변경은 OTA가 아니라 새 스토어 빌드다.

- 네이티브 모듈 또는 config plugin 추가·제거·업데이트
- Expo SDK / React Native 변경
- 권한, 아이콘, splash, scheme, bundle identifier/package 변경
- iOS/Android native project나 Gradle/Pod 설정 변경
- Hot Updater public key 또는 기본 채널 변경

순수 JS/TS 로직, 스타일, Metro bundle에 포함되는 이미지·폰트만 기존
`appVersion` 설치본에 OTA로 보낸다. 네이티브 계약이 바뀌면 앱 버전을 올리고 새
기준선 빌드를 먼저 출시한다.

### 되돌릴 수 있는 번들인가 — 사람이 보는 점검

위 자동 점검은 코드가 도는지만 본다. **되돌릴 수 있는 번들인지는 자동으로 판정되지
않으므로** 발행 전에 diff를 보고 다음 넷을 확인한다. 하나라도 걸리면 OTA가 아니라
새 스토어 빌드다. 근거는 `wiki/rules/release.md`(RULE-OTA-001~009).

| 확인 | 걸리면 왜 문제인가 |
|---|---|
| `src/db/migrate.ts`에 `ALTER TABLE ... ADD COLUMN` 외의 DDL이 들어갔는가 | 번들은 한 칸 되돌아가지만 스키마는 되돌아가지 않는다. 되돌아간 이전 번들이 없는 컬럼을 읽는다 (RULE-OTA-008) |
| `src/domain/types.ts`의 `BlockNode` 유니온에 새 멤버가 생겼는가 | 이전 번들은 모르는 블록에서 크래시하거나 내보내기에서 그것을 조용히 잃는다 (RULE-OTA-009) |
| 임베디드 번들만 가진 기기에서도 이 변경이 필요한 기능이 이미 동작하는가 | OTA를 받지 못하는 설치본이 실재한다. 임베디드 번들 하나로 앱이 완결돼야 한다 (RULE-OTA-001) |
| 앞 번들이 데이터를 옮겨 두는 것을 전제하는가 | 오래 오프라인이던 기기는 중간 번들을 전부 건너뛴다. 순서를 전제한 이관은 그 기기에서 실행되지 않는다 (RULE-OTA-004) |

**이 앱에서 롤백은 안전망이 아니다.** `reloadOnForceUpdate: false`라 적용은 다음 콜드
런치이고, 오프라인 기기는 그 전에 인터넷에 닿아야 한다 — 롤백에 걸리는 시간에 하한이
없다. "문제가 있으면 되돌리면 된다"를 전제로 위험한 번들을 발행하지 않는다.

## 4. Hot Updater 기준선 스토어 빌드

최초 전환은 반드시 iOS와 Android 새 production 빌드가 필요하다.

```bash
eas build --profile production --platform all
```

또는 GitHub Actions의 **EAS Build** workflow를 `production / all`로 실행한다.
완성된 빌드에 대해 다음을 확인한 뒤 각 스토어에 제출한다.

- 앱 버전 `1.0.1`과 새 build number/versionCode
- default channel `production`
- iOS `HotUpdater.bundleURL()` / Android `HotUpdater.getJSBundleFile()`
- 양 플랫폼 public key 포함
- 스토어 심사 통과 후 실제 스토어 설치본으로 확인

현재 공개 스토어 버전은 1.0 계열이고, 2026-09-02에 만든 1.0.1 빌드는 Hot
Updater가 들어가기 전 산출물이다. 그것을 OTA 기준선으로 오인하지 않는다.

## 5. production OTA 발행

스토어에서 Hot Updater 기준선 설치가 끝난 뒤, 깨끗한 배포 커밋에서 실행한다.
`--force-update`는 쓰지 않는다.

```bash
git switch main
git pull --ff-only
cd apps/ch-life
pnpm deploy:ota -- --message "feat: <사용자에게 보이는 변경 요약>"
```

`deploy:ota`는 clean main 여부, Cloudflare·R2 자격증명 형식, private signing
key를 먼저 검사하고 `app.config.ts`의 현재 버전을 target app version으로 자동
사용한다. 다른 브랜치나 dirty worktree에서는 기본적으로 발행하지 않는다.

플랫폼을 생략하면 iOS 성공 후 Android를 순차 발행한다. 한 플랫폼만 다시 보낼
때는 `pnpm deploy:ota -- --platform ios` 또는 `--platform android`를 붙인다.
기본 rollout은 100%다.
첫 실증은 사용자가 한 명이므로 100%로 진행하되 bundle ID 두 개를 기록한다.

GitHub Actions에서는 **Hot Updater (OTA)** workflow의 `production` 채널을
수동 선택한다. main CI 성공 뒤 자동 실행되는 것은 `preview`뿐이다.

## 6. 실기기 적용 확인

일반 bundle은 현재 세션 뒤에서 다운로드되고 다음 cold launch에 적용된다.

1. 스토어에서 받은 1.0.1 앱을 iOS·Android 실기기에 설치한다.
2. 앱을 완전히 종료하고 첫 실행 결과와 시각을 기록한다.
3. 다시 완전히 종료한 뒤 두 번째 실행에서 변경을 확인한다.
4. 설정의 문의 메일 초안에서 bundle ID, channel, app version을 확인한다.
5. 예배 중 사용 흐름이 reload나 전체 화면 UI로 끊기지 않았는지 확인한다.

정확한 적용 횟수는 네트워크와 OS 종료 방식에 따라 달라질 수 있으므로 실측값을
기록한다.

## 7. 롤백

최근 bundle을 확인한다.

```bash
pnpm exec hot-updater bundle list --channel production --json
```

문제 bundle을 비활성화하면 이전 정상 bundle, 없으면 embedded bundle로
되돌아간다.

```bash
pnpm exec hot-updater bundle disable <BAD_BUNDLE_ID> --yes
```

이 앱은 `reloadOnForceUpdate: false`이므로 서버가 롤백을 지시해도 현재 세션은
재시작하지 않는다. 실기기에서 앱을 완전히 종료하고 다시 실행해 정상 bundle을
확인한다. 복구가 끝난 뒤 원인을 수정한 새 bundle ID로 다시 배포한다.

시작 화면까지 도달하지 못하는 bundle은 `HotUpdater.wrap`의 자동 롤백 대상이다.
새 bundle은 첫 정상 렌더 전까지 staging 상태이고, 시작 실패 시 다음 실행에서
직전 정상 bundle 또는 embedded bundle로 복구된다.

## Cloudflare 무료 한도와 장애 경계

2026-09-05 공식 요금표 기준:

- Workers Free: 100,000 requests/day, 10ms CPU/invocation. 초과 시 Error 1027.
- D1 Free: 5,000,000 rows read/day, 100,000 rows written/day, 총 5GB. 일일
  한도 초과 시 쿼리가 UTC 00:00 reset까지 실패한다.
- R2 Standard Free: 10GB-month/month, Class A 1,000,000/month, Class B
  10,000,000/month, egress 무료.

실사용자 한 명이 앱 시작 때 update check를 하고 배포 수가 적은 현재 규모는 이
한도보다 매우 작다. 무료 플랜에서는 자동 과금보다 update check 실패가 주된
위험이다. 앱은 이 오류를 경고 로그로만 남기고 embedded/기존 정상 bundle로 계속
실행한다.

## 배포 기록 템플릿

```text
배포 시각:
작업 거처 / Git commit:
Hot Updater / Worker version:
채널 / target app version:
iOS store build ID / Android store build ID:
iOS bundle ID / Android bundle ID:
첫 실행 결과:
두 번째 실행 결과:
iOS 적용 확인:
Android 적용 확인:
rollback 대상 bundle ID:
rollback 실기기 확인:
잔여 위험:
```

## 근거 문서

- [Hot Updater Cloudflare provider](https://hot-updater.dev/docs/managed/cloudflare)
- [Hot Updater deploy](https://hot-updater.dev/docs/guides/deploy)
- [Hot Updater bundle signing](https://hot-updater.dev/docs/guides/bundle-signing)
- [Hot Updater automatic rollback](https://hot-updater.dev/docs/concepts/automatic-rollback)
- `wiki/policy/POL-RELEASE.md` · `wiki/rules/release.md` · `wiki/decisions/ADR-0016-cold-launch-apply.md` — 이 절차가 따르는 정본
- [Cloudflare Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Cloudflare D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/)
