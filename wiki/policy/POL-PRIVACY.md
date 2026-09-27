# POL-PRIVACY — 내 데이터는 내 기기에서 나가지 않는다

## POL-PRIVACY-001 · 로컬 전용, 콘텐츠는 나가지 않는다

```yaml
id: POL-PRIVACY-001
requirement: MUST NOT
statement: 앱은 사용자 콘텐츠(노트·인용·설정)와 식별 정보를 외부로 전송하지 않는다. 계정도 서버도 없다. 예외는 Firebase Analytics의 익명 자동 수집 통계뿐이다(ADR-0029).
confidence: 기록됨
waiver: 네트워크 코드의 부재로 성립하는 정책이라 자동 검증 수단이 없다. 릴리스 전 의존성·통신 경로 수동 점검으로 대신한다.
source:
  - docs/legal/privacy-policy.md 1~6장
  - docs/store/store-listing.md (Data Safety - No data collected)
  - DESIGN.md "Constraints" (로컬 저장 V1)
  - wiki/decisions/ADR-0029-firebase-analytics.md
```

모든 노트·설정은 기기 내부(SQLite + `settings.json`)에만 저장된다. 네트워크 통신은 **OTA 업데이트 확인**과 **Firebase Analytics 자동 수집 이벤트** 두 가지다. 앱 코드는 Analytics에 이벤트를 직접 보내지 않으며, 광고 식별자(IDFA)는 쓰지 않는다([`ADR-0029`](../decisions/ADR-0029-firebase-analytics.md)).

이 정책은 스토어 심사에 제출된 공개 약속이다. ⚠️ Analytics를 넣으며 App Store "App Privacy"·Play "Data safety" 신고를 "수집 없음"에서 바꿔야 한다 — 코드와 신고가 어긋나면 안 된다. 어떤 기능도 이 정책을 넘어설 수 없다.

### 이 정책의 귀결 — 관측 계층이 얕다

자동 수집 통계(설치·세션·업데이트)만 있으므로 **기능 단위 trace·metric으로 회귀를 잡는 경로는 여전히 없다.** 어떤 규칙도 `observed_by`에 metric을 적을 수 없고, 증거는 자동 테스트와 수동 QA와 사용자가 내보낸 `.md` 파일뿐이다([`README.md` 4절](../README.md)). 이것은 감수하기로 한 비용이다([`ADR-0012`](../decisions/ADR-0012-local-only.md)).

### 기기 밖으로 나가는 유일한 경로

사용자가 직접 "공유"를 눌러 `.md` 파일을 내보낼 때뿐이다. 이때도 앱은 파일을 만들어 OS 공유 시트에 넘길 뿐, 목적지를 알지 못한다.

하위 규칙: [`RULE-NOTE-001`](../rules/note-persistence.md), [`CONTRACT-RELEASE`](../contracts/CONTRACT-RELEASE.md)
