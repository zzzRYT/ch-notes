# RULE-MAP — 말씀 지도

상위 정책: [`POL-NOTE-003`](../policy/POL-NOTE.md)

말씀 지도는 저장된 노트의 `scripture`·`citedRefs`를 **앱에 넣어 둔 검토된 사건 범위**에 연결해, 시대별 장소와 관련 노트를 보여 주는 기능이다. 연결은 노트에 저장하지 않고 열 때마다 파생한다 — DB 컬럼·마이그레이션이 없다. 자유 글 분석, GPS, 외부 지도 타일은 없다.

⚠️ **지금은 데이터·연결 로직까지만 있다.** 화면·라우트·진입점·지도 위젯은 아직 앱에 없어 사용자에게 보이지 않는다. 그쪽 규칙은 화면을 들여오는 변경에서 이 파일에 더한다. 그 규칙의 번호 `002`·`003`·`005`~`007`은 그때를 위해 비워 둔다 — 다른 규칙으로 재사용하지 않는다.

---

## RULE-MAP-001 · 연결은 검토된 사건 범위와 겹치는 절로만 만든다

```yaml
id: RULE-MAP-001
policy: POL-NOTE-003
requirement: MUST
statement: 노트의 설교 본문과 인용 참조는 파싱되고 번들 본문 조회에 성공한 것만 사건 범위와 대조한다. 같은 책·장에서 절 구간이 겹치는 사건에만 연결하고, 장 전체나 책 분류로 장소를 퍼뜨리지 않는다. 역방향 범위·없는 절·자유 문장·연결표에 없는 본문은 조용히 건너뛰며 표식을 만들지 않는다. 한 노트의 여러 참조가 같은 사건에 닿으면 (노트, 장소) 한 쌍으로 합친다.
implemented_by:
  - apps/ch-life/src/features/scripture/map/model/match-notes.ts
  - apps/ch-life/src/features/scripture/map/model/validate-data.ts
verified_by:
  - test: apps/ch-life/src/features/scripture/map/model/__tests__/match-notes.test.ts
confidence: 코드추론
source:
  - GitHub 이슈 #100 (타입·매칭), 부모 이슈 #98
```

시대는 **성경 사건의 시대**이지 작성일이나 책의 저작 시기가 아니다. 신약 책이 구약 사건을 회상해도 사건 범위가 시대를 정한다. 장소는 시대별로 독립 항목이라 같은 지역이라도 시대가 다르면 다른 `Place`다.
