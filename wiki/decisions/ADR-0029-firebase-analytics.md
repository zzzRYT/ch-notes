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
  - https://github.com/zzzRYT/ch-notes/issues/95 (페이지별 도달 사용자 수와 조회 수)
```

## 맥락

[`ADR-0012`](ADR-0012-local-only.md)는 관측 계층이 없다는 것을 감수한 비용으로 남겼다. 네이티브 바이너리를 새로 내는 김에 그 비용을 줄이기로 했다. 네이티브 SDK는 OTA로 넣을 수 없으므로 스토어 빌드와 한 묶음이어야 한다.

#95에서 화면별 도달 사용자 수와 조회 수를 확인할 목적을 정했다. 설치·세션 등 자동 이벤트에 라우트별 화면 조회를 더한다([`drift.md`](../drift.md) E25 해소).

## 결정

- Firebase 프로젝트 `ssumssum-64dbf`(jinjinstar3@gmail.com), 연결된 GA4 속성 ID `556130222`. iOS·Android 앱 모두 `com.leejaejin.chlife`.
- `@react-native-firebase/app` + `@react-native-firebase/analytics`. 자동 이벤트(first_open, session_start, app_update 등)에 더해 루트 레이아웃의 `useScreenTracking`이 **`screen_view`를 직접 전송**한다. 버튼·기능별 이벤트는 추가하지 않는다.
- `firebase.json`의 `google_analytics_automatic_screen_reporting_enabled: false`로 iOS·Android의 네이티브 자동 화면 조회를 끈다. 다른 자동 이벤트는 유지한다. 이 설정은 네이티브 빌드에 반영되므로 **OTA만으로 배포하지 않는다**([`CONTRACT-RELEASE`](../contracts/CONTRACT-RELEASE.md)).
- iOS는 `withoutAdIdSupport: true` — IDFA를 쓰지 않아 ATT 프롬프트가 없다.
- Android는 `blockedPermissions`로 `com.google.android.gms.permission.AD_ID`를 뺀다. Firebase Analytics가 이 권한을 매니페스트에 병합하는데, Play Console은 "광고 ID 미사용" 선언과 어긋나는 AAB의 업로드를 거부한다(1.0.3 첫 제출에서 실패).
- `GoogleService-Info.plist`·`google-services.json`은 저장소에 두지 않는다. 로컬은 `apps/ch-life/` 아래 파일, EAS는 file 타입 환경변수 `GOOGLE_SERVICE_INFO_PLIST`·`GOOGLE_SERVICES_JSON`(2026-09-27 production·preview·development에 sensitive로 등록).

## 화면 조회 계약

| 라우트 파일 | screen_class | screen_name |
|---|---|---|
| `index.tsx` | `index` | `notes` |
| `note/[id].tsx` | `note/[id]` | `note_editor` |
| `bible.tsx` | `bible` | `bible` |
| `settings.tsx` | `settings` | `settings` |
| `licenses.tsx` | `licenses` | `licenses` |

`src/shared/analytics/useScreenTracking.ts`의 고정 목록이 두 플랫폼의 유일한 매핑이다. Expo Router의 활성 라우트 이름은 동적 파일 템플릿을 유지하므로, 노트 ID를 화면 클래스로 전송하지 않는다. 활성 화면은 내비게이션 참조의 `getCurrentRoute()`로 가져오고 `ready`·`state` 이벤트를 구독한다. 라우트 키와 편집 화면의 노트 ID는 기기 내부에서 진입 중복 판정에만 쓴다. 실제 ID·제목·본문·검색어·쿼리 파라미터는 이벤트에 포함하지 않는다. 알 수 없는 라우트와 웹은 전송하지 않는다.

최초 진입·직접 경로 진입·뒤로 가기·재방문마다 조회를 기록한다. 동일 경로의 새 스택 진입도 새 조회이고, 같은 진입의 재렌더·테마·화면 크기·쿼리 변경은 조회가 아니다. 태블릿 `/`의 패널 전환과 노트 선택은 라우트 이동이 아니므로 `index`의 별도 조회를 만들지 않는다. SDK 실패는 화면 표시를 막지 않으며, 사용자 데이터를 포함하지 않는 콘솔 경고만 남긴다.

자동 검증은 `src/shared/analytics/__tests__/useScreenTracking.test.tsx`와 `navigation-screen-tracking.test.tsx`다. 후자는 실제 React Navigation 컨테이너의 내부 루트·중첩 스택·상태 이벤트를 사용한다. Expo Router 6의 `useRootNavigationState()`는 내부 루트 상태를 반환하므로 그 첫 라우트를 화면으로 취급하지 않는다. 네이티브 빌드의 실제 Firebase 수신은 별도 수동 검증 대상이다.

### 네이티브·GA 검증

새 iOS·Android 빌드에서 Firebase DebugView를 켜고 처음 실행·직접 진입·앞으로 이동·뒤로 이동·재방문을 확인한다. 목적지별 `screen_view`가 한 번씩 발생하고 `firebase_screen`·`firebase_screen_class`가 위 표와 일치해야 한다. 테마·회전·태블릿 패널 전환·쿼리 변경은 추가 조회를 만들지 않아야 한다. 다른 노트는 같은 `note/[id]`로 집계되고 실제 ID·콘텐츠가 없어야 한다.

- iOS: Xcode 실행 인수 `-FIRDebugEnabled`로 활성화하고, 확인 후 `-FIRDebugDisabled`로 끈다.
- Android: `adb shell setprop debug.firebase.analytics.app com.leejaejin.chlife`로 켜고, 확인 후 `.none.`으로 끈다.
- GA의 **페이지 및 화면** 보고서에서 `화면 클래스`를 기준으로 `활성 사용자`(도달 사용자 수)와 `조회수`(반복 방문 포함)를 비교한다. DebugView의 개발 이벤트는 일반 보고서 검증 데이터로 쓰지 않는다. 새 규칙은 적용 후 수집 데이터부터 유효하며 과거 통계를 소급 변경하지 않는다.

참고: [Expo SDK 54 Router](https://docs.expo.dev/versions/v54.0.0/sdk/router/), [RNFirebase 화면 추적](https://rnfirebase.io/analytics/screen-tracking), [자동 화면 수집 설정](https://rnfirebase.io/analytics/usage#disable-screenview-tracking), [Firebase DebugView](https://firebase.google.com/docs/analytics/debugview).

## 귀결

- POL-PRIVACY-001이 "수집 없음"에서 "콘텐츠는 나가지 않는다, 익명 통계는 나간다"로 바뀐다.
- **스토어 신고를 같이 바꿔야 한다** — App Store "App Privacy", Play "Data safety". 코드만 나가면 신고 내용이 거짓이 된다.
- 오프라인이 우선이라는 [`POL-RELEASE-002`](../policy/POL-RELEASE.md)는 그대로다. SDK는 네트워크가 없으면 쌓아 두었다가 보낸다.
- iOS가 `useFrameworks: "static"` + `forceStaticLinking: [RNFBApp, RNFBAnalytics]` + RNFB `disableSPM`으로 바뀐다. RNFB 기본(SPM·dynamic)은 Expo 54 prebuilt core와 `pod install`에서 충돌한다(`ExpoModulesCore` statically linked). 새 RNFB 모듈을 더하면 `forceStaticLinking`에도 더한다.
