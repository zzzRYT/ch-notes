# POL-PRIVACY — 내 데이터는 내 기기에서 나가지 않는다

## POL-PRIVACY-001 · 로컬 전용, 콘텐츠는 나가지 않는다

```yaml
id: POL-PRIVACY-001
requirement: MUST NOT
statement: 앱은 사용자 콘텐츠(노트·인용·설정)와 식별 정보를 외부로 전송하지 않는다. 계정도 서버도 없다. 예외는 Firebase Analytics의 익명 자동 수집 통계와 고정 라우트 이름의 화면 조회뿐이다(ADR-0029).
confidence: 기록됨
waiver: 화면 조회의 고정 전송 값은 테스트로 확인하지만 모든 SDK·통신 경로의 콘텐츠 미전송을 자동 검사만으로 보장할 수 없다. 릴리스 전 의존성·통신 경로 수동 점검으로 대신한다.
source:
  - docs/legal/privacy-policy.md 1~6장
  - docs/store/store-listing.md (Data Safety · App Privacy, 1.0.3 갱신)
  - DESIGN.md "Constraints" (로컬 저장 V1)
  - wiki/decisions/ADR-0029-firebase-analytics.md
```

모든 노트·설정은 기기 내부(SQLite + `settings.json`)에만 저장된다. 네트워크 통신은 **OTA 업데이트 확인·스토어 최신 버전 조회**와 **Firebase Analytics 통계**다. Analytics는 자동 이벤트와 앱에서 직접 보내는 `screen_view`를 수집하며, 화면 조회에는 고정된 `screen_name`·`screen_class`만 포함한다. 실제 노트 ID·제목·본문·검색어·쿼리·설정을 보내지 않는다. 네이티브 자동 화면 조회는 꺼 중복을 방지하고, 광고 식별자(IDFA)는 쓰지 않는다([`ADR-0029`](../decisions/ADR-0029-firebase-analytics.md)).

이 정책은 스토어 심사에 제출된 공개 약속이다. App Store "App Privacy"·Play "Data safety" 신고는 1.0.3 제출과 함께(2026-09-27) "수집 없음"에서 분석 목적 익명 수집(대략적 위치·기기 ID·앱 상호작용, 연결·추적·공유 없음)으로 바꿨다(`docs/store/store-listing.md`). 코드와 신고가 어긋나면 안 된다. 어떤 기능도 이 정책을 넘어설 수 없다.

### 이 정책의 귀결 — 관측 계층이 얕다

설치·세션·업데이트와 화면별 도달 사용자 수·조회 수는 확인할 수 있지만, **기능 단위 trace·metric으로 회귀를 잡는 경로는 여전히 없다.** 화면별 통계만으로 편집·저장 같은 기능 규칙을 검증할 수는 없고, 증거는 자동 테스트와 수동 QA와 사용자가 내보낸 `.md` 파일이다([`README.md` 4절](../README.md)). 이것은 감수하기로 한 비용이다([`ADR-0012`](../decisions/ADR-0012-local-only.md)).

### 기기 밖으로 나가는 유일한 경로

사용자가 직접 "공유"를 눌러 `.md` 파일을 내보낼 때뿐이다. 이때도 앱은 파일을 만들어 OS 공유 시트에 넘길 뿐, 목적지를 알지 못한다.

하위 규칙: [`RULE-NOTE-001`](../rules/note-persistence.md), [`CONTRACT-RELEASE`](../contracts/CONTRACT-RELEASE.md)
