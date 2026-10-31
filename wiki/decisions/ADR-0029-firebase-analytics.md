# ADR-0029 · 익명 사용 통계(GA4)를 수집한다

```yaml
id: ADR-0029
status: accepted
supersedes: ADR-0012 중 "애널리틱스를 두지 않는다"
statement: 네이티브 빌드에 Firebase Analytics(GA4)를 넣어 익명 사용 통계를 수집한다. 노트·성경 인용 등 사용자 콘텐츠는 보내지 않고, 광고 식별자(IDFA)는 쓰지 않는다. 계정·서버·동기화가 없다는 나머지 ADR-0012는 그대로다.
confidence: 기록됨
source:
  - 사용자 결정 (2026-09-27, "native 올리는김에 GA에 대한 정보를 붙여서")
  - apps/ch-life/app.config.ts (@react-native-firebase/app, @react-native-firebase/analytics 플러그인)
```

## 맥락

[`ADR-0012`](ADR-0012-local-only.md)는 관측 계층이 없다는 것을 감수한 비용으로 남겼다. 네이티브 바이너리를 새로 내는 김에 그 비용을 줄이기로 했다. 네이티브 SDK는 OTA로 넣을 수 없으므로 스토어 빌드와 한 묶음이어야 한다.

왜 지금, 어떤 신호를 보려는 것인지는 기록되지 않았다([`drift.md`](../drift.md) E25).

## 결정

- Firebase 프로젝트 `ssumssum-64dbf`(jinjinstar3@gmail.com), 연결된 GA4 속성 ID `556130222`. iOS·Android 앱 모두 `com.leejaejin.chlife`.
- `@react-native-firebase/app` + `@react-native-firebase/analytics`. 이벤트는 **자동 수집 이벤트**(first_open, session_start, app_update 등)와 **`screen_view` 하나**만 쓴다.
- **`screen_view`는 JS에서 직접 보낸다(2026-10-09, #95).** 네이티브 자동 화면 수집은 Activity/ViewController 하나만 보므로 라우트를 구분하지 못한다. 그래서 iOS `FirebaseAutomaticScreenReportingEnabled=false`, Android `google_analytics_automatic_screen_reporting_enabled=false`(`app.config.ts` 인라인 플러그인)로 끄고, `useScreenTracking`(`src/shared/lib/`)이 expo-router 경로가 바뀔 때만 보낸다. `screen_class`는 라우트 템플릿(`index`·`note/[id]`·`bible`·`settings`·`licenses`), `screen_name`은 `screen-view.ts` 한 곳의 매핑(`notes`·`note_editor`·`bible`·`settings`·`licenses`)이다. 매핑에 없는 라우트는 보내지 않고, 실제 노트 ID·쿼리·콘텐츠는 담지 않는다. 태블릿 `/` 안의 패널·노트 선택은 라우트 이동이 아니므로 조회로 세지 않는다. 웹은 보내지 않는다(`log-screen-view.web.ts`). 네이티브 설정이 바뀌므로 스토어 빌드가 필요하다(OTA 불가).
- iOS는 `withoutAdIdSupport: true` — IDFA를 쓰지 않아 ATT 프롬프트가 없다.
- Android는 `blockedPermissions`로 `com.google.android.gms.permission.AD_ID`를 뺀다. Firebase Analytics가 이 권한을 매니페스트에 병합하는데, Play Console은 "광고 ID 미사용" 선언과 어긋나는 AAB의 업로드를 거부한다(1.0.3 첫 제출에서 실패).
- `GoogleService-Info.plist`·`google-services.json`은 저장소에 두지 않는다. 로컬은 `apps/ch-life/` 아래 파일, EAS는 file 타입 환경변수 `GOOGLE_SERVICE_INFO_PLIST`·`GOOGLE_SERVICES_JSON`(2026-09-27 production·preview·development에 sensitive로 등록).

## 귀결

- POL-PRIVACY-001이 "수집 없음"에서 "콘텐츠는 나가지 않는다, 익명 통계는 나간다"로 바뀐다.
- **스토어 신고를 같이 바꿔야 한다** — App Store "App Privacy", Play "Data safety". 코드만 나가면 신고 내용이 거짓이 된다.
- 오프라인이 우선이라는 [`POL-RELEASE-002`](../policy/POL-RELEASE.md)는 그대로다. SDK는 네트워크가 없으면 쌓아 두었다가 보낸다.
- iOS가 `useFrameworks: "static"` + `forceStaticLinking: [RNFBApp, RNFBAnalytics]` + RNFB `disableSPM`으로 바뀐다. RNFB 기본(SPM·dynamic)은 Expo 54 prebuilt core와 `pod install`에서 충돌한다(`ExpoModulesCore` statically linked). 새 RNFB 모듈을 더하면 `forceStaticLinking`에도 더한다.
