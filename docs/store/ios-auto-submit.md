# iOS 자동제출 설정 (EAS Submit + App Store Connect)

`eas.json`의 `submit.production.ios`에 App Store Connect API 키 기반 자동제출이 설정되어 있습니다.

## 설정 요약 (`eas.json`)

```json
"submit": {
  "production": {
    "ios": {
      "ascAppId": "6772700147",
      "appleTeamId": "43ZASDF2J7",
      "ascApiKeyPath": "./credentials/AuthKey_58F737893F.p8",
      "ascApiKeyId": "58F737893F",
      "ascApiKeyIssuerId": "f1eec000-ce31-47c1-95f9-73e2590725c3"
    }
  }
}
```

- **ascAppId**: App Store Connect → 앱 → 앱 정보(App Information) → "Apple ID"
- **appleTeamId**: developer.apple.com/account → Membership details → Team ID (10자리)
- **ascApiKeyPath / ascApiKeyId / ascApiKeyIssuerId**: App Store Connect → 사용자 및 접근 → 통합(Integrations) → App Store Connect API에서 발급한 키
  - `.p8` 파일은 `apps/ch-life/credentials/`에 저장 (경로는 **gitignore 처리됨** — 절대 커밋 금지)

---

## 사전 조건: App Store Connect 앱 레코드는 수동 생성 필요

Apple은 Google Play와 달리 EAS가 앱 레코드를 자동 생성하지 못합니다. 아래 순서를 따릅니다.

1. App Store Connect → **+ 새로운 앱** → 번들 ID `com.leejaejin.chlife` 선택, 이름/SKU/기본 언어 입력 *(완료)*
2. 앱 정보 · 스크린샷 · 개인정보 처리 항목 입력 *(`docs/store/store-listing.md` 참고, 완료)*
3. App Store Connect API 키 발급 *(완료)*
4. `eas.json` 설정 *(완료 — 이 문서 상단)*

---

## 제출 실행

이미 완성된 production 빌드가 있다면 새로 빌드하지 않고 바로 제출할 수 있습니다.

```bash
# 최신 production 빌드를 App Store Connect(TestFlight)로 업로드
eas submit --platform ios --latest
```

- 업로드 후 App Store Connect의 **TestFlight** 탭에서 빌드 처리 상태(보통 수 분~수십 분) 확인
- TestFlight 처리가 끝나면 **앱 심사 정보(App Review Information)** 입력 후 App Store Connect 콘솔에서 **"심사를 위해 제출(Submit for Review)"** 버튼을 직접 눌러야 합니다. `eas submit`은 업로드까지만 수행하며 심사 제출은 자동화하지 않습니다.
- 새 버전을 낼 때는 `eas build --platform ios --profile production` → `eas submit --platform ios --latest` 순서 반복.

---

## 보안 주의

- `AuthKey_*.p8`은 **App Store Connect 업로드 권한을 가진 비밀키**입니다.
- 절대 git에 커밋하거나 공유하지 마세요 (`credentials/`는 이미 `.gitignore` 처리됨).
- 유출 시 App Store Connect → 사용자 및 접근 → 통합에서 즉시 키 폐기(Revoke) 후 재발급.
