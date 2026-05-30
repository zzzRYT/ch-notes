# Android 자동제출 설정 (EAS Submit + Google Play)

`eas.json`의 `submit.production.android`에 자동제출이 설정되어 있습니다.
이 문서는 그 설정을 실제로 동작시키기 위한 **Google 서비스 계정 키** 발급/연동 절차입니다.

## 설정 요약 (`eas.json`)

```json
"submit": {
  "production": {
    "android": {
      "serviceAccountKeyPath": "./credentials/play-service-account.json",
      "track": "internal",
      "releaseStatus": "completed",
      "changesNotSentForReview": false
    }
  }
}
```

- **serviceAccountKeyPath**: 서비스 계정 키 위치 (`apps/ch-life/credentials/play-service-account.json`). 이 경로는 **gitignore 처리됨** — 절대 커밋 금지.
- **track**: 업로드될 트랙. 처음엔 `internal`(내부 테스트) 권장. 공개 출시 시 `production`으로 변경.
- **releaseStatus**: `completed`(즉시 트랙 반영) / `draft`(콘솔에서 수동 게시) / `inProgress`(단계적 출시).

---

## 사전 조건: 첫 업로드는 수동

Google Play는 **앱의 첫 AAB는 반드시 콘솔에서 수동 업로드**해야 합니다.
즉 아래 순서를 따릅니다.

1. `eas build --platform android --profile production` 로 AAB 생성
2. Play Console → 앱 생성 → **내부 테스트** 트랙에 AAB 수동 업로드 (앱 등록 확정)
3. 그 이후부터 `eas submit` 자동제출 사용 가능

---

## 1. Google Cloud 서비스 계정 만들기

1. https://console.cloud.google.com → 프로젝트 선택(또는 새로 생성)
2. **API 및 서비스 → 라이브러리** → "Google Play Android Developer API" 검색 → **사용 설정(Enable)**
3. **IAM 및 관리자 → 서비스 계정 → 서비스 계정 만들기**
   - 이름: 예) `eas-play-submit`
   - 역할: 일단 생략 가능 (권한은 Play Console에서 부여)
4. 생성된 서비스 계정 → **키 → 키 추가 → 새 키 만들기 → JSON** → 다운로드
5. 다운로드한 JSON을 아래 위치에 저장:
   ```
   apps/ch-life/credentials/play-service-account.json
   ```
   (디렉터리가 없으면 생성. gitignore되어 있어 커밋되지 않습니다.)

## 2. Play Console에서 권한 부여

1. https://play.google.com/console → **사용자 및 권한**
2. **새 사용자 초대** → 위 서비스 계정 이메일
   (`...@<project>.iam.gserviceaccount.com`) 입력
3. 권한(앱별 또는 계정 수준):
   - **앱 출시 관리(Release apps to testing tracks)**
   - **프로덕션 출시(Release to production)** — 프로덕션 자동제출 시
   - **앱 정보 보기/수정**
4. 초대 완료. (반영까지 수 분 소요될 수 있음)

## 3. 자동제출 실행

```bash
# 최신 production 빌드를 internal 트랙으로 제출
eas submit --platform android --profile production --latest
```

- 처음 실행 시 EAS가 키를 읽어 안전하게 업로드/보관합니다.
- 성공하면 Play Console 내부 테스트 트랙에 반영 → 테스트 후 콘솔에서 **프로덕션으로 승급**.

### 공개 출시로 바꾸려면
`eas.json`의 `track`을 `"production"`으로 변경하거나, 콘솔에서 internal → production 승급.
신중하게 하려면 `releaseStatus`를 `"draft"`로 두고 콘솔에서 최종 게시 버튼을 직접 누르세요.

---

## 보안 주의

- `play-service-account.json`은 **Play Console 업로드 권한을 가진 비밀키**입니다.
- 절대 git에 커밋하거나 공유하지 마세요. (이미 `.gitignore`에 `credentials/`, `*-service-account.json` 추가됨)
- 유출 시 Google Cloud에서 즉시 키 폐기(Revoke) 후 재발급.

---

## (참고) iOS 자동제출

iOS는 `submit.production.ios`에 App Store Connect API Key를 설정하면 동일하게 자동화됩니다.

```json
"ios": {
  "appleId": "<your-apple-id@email>",
  "ascAppId": "<App Store Connect 앱 ID>",
  "appleTeamId": "<10자리 팀 ID>"
}
```

또는 App Store Connect → Users and Access → Integrations → API Key(.p8) 방식 권장.
필요 시 별도 설정해 드릴 수 있습니다.
