# ADR-0022 · 스토어 새 버전은 앱이 직접 안내한다

```yaml
id: ADR-0022
status: accepted
statement: 스토어의 최신 버전은 GitHub Pages로 이미 발행 중인 website/app-version.json에 플랫폼별로 적고, 앱은 콜드 런치 뒤 한 번 읽어 설치본보다 높을 때만 닫을 수 있는 다이어로그를 띄운다. 강제 업데이트는 두지 않고, 같은 버전은 한 번만 안내한다.
confidence: 기록됨
source:
  - apps/ch-life/src/update/latest-store-version.ts
  - apps/ch-life/src/update/StoreUpdateDialog.tsx
  - website/app-version.json
  - .github/workflows/pages.yml
```

## 맥락

OTA로 닿지 않는 변경이 실재한다. 네이티브 의존성·`app.config.ts`·`version` 변경은
번들에 실을 수 없고([`POL-RELEASE-001`](../policy/POL-RELEASE.md)), 되돌릴 수 없는 스키마 변경과
새 블록 타입도 마찬가지다([`RULE-OTA-008`](../rules/release.md)·[`RULE-OTA-009`](../rules/release.md)).
그리고 지금 스토어의 1.0.1은 `expo-updates` 바이너리라 hot-updater OTA가 **영원히 닿지 않는다**
([`CONTRACT-RELEASE`](../contracts/CONTRACT-RELEASE.md)).

즉 "새 스토어 빌드를 받아라"는 말을 **앱이 직접 해야 하는** 상황이 이미 있는데, 그 수단이 하나도 없었다.

**hot-updater는 이 값을 모른다.** 클라이언트가 주는 것은 `getAppVersion()`(설치된 네이티브 버전)뿐이고,
서버 질의는 `(platform, appVersion, channel, minBundleId, bundleId)`로 **그 appVersion에 맞는 번들 하나**를
돌려준다([`RULE-OTA-004`](../rules/release.md)). "스토어의 최신 버전"이라는 개념 자체가 없다.

## 결정

**버전 소스는 `website/app-version.json`이다.** 이미 GitHub Pages로 발행 중인 `website/`에 파일 하나를
더한다(`https://zzzryt.github.io/ch-notes/app-version.json`). 인프라가 늘지 않고, 저장소의 파일이라
릴리스 절차가 git 위에서 끝나며, 값이 PR 리뷰를 거친다.

**플랫폼별로 나눠 적는다** — `{"ios": …, "android": …}`. 심사 지연 때문에 두 스토어의 버전은 며칠씩
어긋난다. 아직 올라가지도 않은 스토어로 사람을 보내는 것은 [`POL-A11Y-001`](../policy/POL-ACCESSIBILITY.md)에
정면으로 반한다.

**비교는 순수 함수로 한다** — `compareAppVersion`. 자리별 숫자 비교이고(`1.0.10 > 1.0.9`),
형식이 어긋나면 `null`을 돌려 **안내하지 않는다.** 잘못된 값 때문에 없는 업데이트를 안내하는 쪽이 더 나쁘다.

**강제 업데이트는 두지 않는다.** 닫을 수 없는 다이어로그는 [`POL-RELEASE-002`](../policy/POL-RELEASE.md)
("설치한 그대로도 완전한 앱이다")와 정면으로 부딪힌다. 최소 지원 버전이 실제로 필요해지는 날
그때 별도 ADR로 남긴다 — `app-version.json`에 `minSupported` 같은 필드를 미리 넣어 두지도 않았다.

**같은 버전은 한 번만 안내한다.** **두 버튼이 다 안내를 끝낸다** — "나중에"도 "스토어로 이동"도
그 버전 문자열을 `settings.json`의 `dismissedUpdateVersion`에 남긴다. 스토어를 못 여는 기기에서
매번 다시 띄우면 어르신에게는 그것이 고장으로 보인다. 다음 버전이 나오면 다시 뜬다.

**확인은 콜드 런치마다 한 번**이고 첫 렌더 뒤에 시작한다. 포그라운드 복귀마다 다시 묻지 않는다 —
예배 중 성경 앱을 봤다 돌아온 것과 다 쓰고 나갔다 온 것을 구별할 수 없다([`ADR-0016`](ADR-0016-cold-launch-apply.md)).

**쓰는 중에는 띄우지 않는다.** 폰은 경로(`/note/*`)로, 태블릿은 한 화면에 편집 창이 늘 있으므로
키보드가 올라와 있는지로 가른다.

## 대안

- **hot-updater Worker에 엔드포인트를 추가한다.** `extra.hotUpdaterBaseUrl`을 그대로 써서 주소가 하나로
  줄어든다. 채택하지 않았다 — **Worker 소스가 이 저장소에 없다.** hot-updater CLI가 배포하는 것이라
  버전 관리도 PR 리뷰도 이 저장소 밖에서 일어난다. 인프라가 안 는다는 이점보다 정본이 갈라지는 손해가 크다.
- **스토어 API를 직접 읽는다.** iTunes Lookup은 iOS만 되고 Play는 공식 API가 없다. 절반만 되는 방법이다.
- **R2 정적 JSON.** Pages와 성격이 같은데 자격증명과 배포 경로가 하나 더 는다. `website/`는 이미
  `pages.yml`이 자동으로 발행한다.
- **배너로 안내한다**([`ActionBannerHost`](../../apps/ch-life/src/feedback/ActionBannerHost.tsx)).
  `feedback.expiresAt`으로 **스스로 사라진다.** 나중에 눌러야 할 안내에는 맞지 않는다.
  만료 없는 항목까지 담도록 feedback 스토어를 넓히는 대신, 성격이 다른 표면(모달)을 따로 뒀다.

## 귀결

- **손으로 옮겨 적는 자리가 하나 더 늘었다.** `app.config.ts`의 `version`, `src/version.ts`의
  `OTA_RELEASE`, `website/app-version.json` — 이제 셋이다. 어긋나면 조용히 틀린다.
- **`app-version.json`은 스토어 심사가 끝난 뒤에 올린다.** 버전 bump PR에 같이 넣으면 심사 중인
  버전을 스토어에 없는데도 안내하게 된다. 별도 PR을 `main`에 낸다 — `pages.yml`은 `main` 푸시에만 돈다.
- **이 다이어로그가 오늘의 1.0.1 문제를 풀지는 못한다.** 1.0.1에는 이 코드가 없다. 효력은 이 기능이
  들어간 **다음 스토어 빌드부터** 시작된다.
- 이 영역에 **처음으로 자동 증거가 생겼다** — 버전 비교와 응답 파싱은 순수 함수라 유닛 테스트가 붙는다
  ([`../drift.md`](../drift.md) C3의 예외). 네트워크·다이어로그·스토어 이동은 여전히 수동이다.
- `settings.json`에 필드가 하나 늘었고 **개별 폴백 쪽**이다([`CONTRACT-SETTINGS-FILE`](../contracts/CONTRACT-SETTINGS-FILE.md)).
  필수로 넣었다면 기존 사용자의 설정 파일이 통째로 버려졌을 것이다.
