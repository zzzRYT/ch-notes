# POL-PRIVACY — 내 데이터는 내 기기에서 나가지 않는다

## POL-PRIVACY-001 · 로컬 전용, 수집 없음

```yaml
id: POL-PRIVACY-001
requirement: MUST NOT
statement: 앱은 사용자 콘텐츠·식별 정보·사용 기록을 외부로 전송하지 않는다. 계정도 서버도 애널리틱스도 없다.
confidence: 기록됨
waiver: 네트워크 코드의 부재로 성립하는 정책이라 자동 검증 수단이 없다. 릴리스 전 의존성·통신 경로 수동 점검으로 대신한다.
source:
  - docs/legal/privacy-policy.md 1~6장
  - docs/store/store-listing.md (Data Safety - No data collected)
  - DESIGN.md "Constraints" (로컬 저장 V1)
```

모든 노트·설정은 기기 내부(SQLite + `settings.json`)에만 저장된다. 네트워크 통신은 **EAS Update(OTA) 업데이트 확인 한 가지뿐**이며, 이 통신에 개인 식별 정보는 실리지 않는다.

이 정책은 스토어 심사에 제출된 공개 약속이다(App Store "Data Not Collected", Play "No data collected"). 어떤 기능도 이 정책을 넘어설 수 없다.

### 이 정책의 귀결 — 관측 계층이 없다

애널리틱스가 없으므로 **운영 trace·metric으로 회귀를 잡는 경로가 존재하지 않는다.** 어떤 규칙도 `observed_by`에 metric을 적을 수 없고, 증거는 자동 테스트와 수동 QA와 사용자가 내보낸 `.md` 파일뿐이다([`README.md` 4절](../README.md)). 이것은 감수하기로 한 비용이다([`ADR-0012`](../decisions/ADR-0012-local-only.md)).

### 기기 밖으로 나가는 유일한 경로

사용자가 직접 "공유"를 눌러 `.md` 파일을 내보낼 때뿐이다. 이때도 앱은 파일을 만들어 OS 공유 시트에 넘길 뿐, 목적지를 알지 못한다.

하위 규칙: [`RULE-NOTE-001`](../rules/note-persistence.md), [`CONTRACT-RELEASE`](../contracts/CONTRACT-RELEASE.md)
