# POL-NOTE — 설교를 듣는 동안 방해받지 않고 적는다

## POL-NOTE-001 · 즉시 쓰고, 저장을 신경 쓰지 않는다

```yaml
id: POL-NOTE-001
statement: 새 노트는 한 번의 탭으로 즉시 열려 바로 입력 가능해야 하고, 저장은 사용자가 의식하지 않아도 자동으로 이루어져야 한다.
confidence: 기록됨
source:
  - docs/plans/2026-05-17-ch-life-v1-spec.md 2.3, 3.5
  - DESIGN.md "Constraints" (어른 친화 UX)
```

새 노트 버튼을 누르면 제목 모달 같은 중간 단계 없이 곧장 에디터로 들어간다. 저장 버튼은 없고, 저장 성공을 알리는 UI도 없다 — 어르신 대상 앱에서 성공 알림은 노이즈다. **실패했을 때만** 상단 배너로 알린다.

노트는 버튼을 누른 시점에 DB에 만들어진다. 아무것도 안 쓰고 나가면 빈 노트가 남지만, 정리하지 않는다(기록된 결정: `docs/plans/2026-06-07-bible-reader-default-design.md` "엣지 케이스").

하위 규칙: [`RULE-EDIT-004`](../rules/editor-insert.md), [`RULE-EDIT-008`](../rules/editor-insert.md), [`RULE-NOTE-001..007`](../rules/note-persistence.md)
하위 계약: [`CONTRACT-DB-NOTES`](../contracts/CONTRACT-DB-NOTES.md), [`CONTRACT-DOMAIN-NOTE`](../contracts/CONTRACT-DOMAIN-NOTE.md), [`CONTRACT-NOTE-REPO`](../contracts/CONTRACT-NOTE-REPO.md)

## POL-NOTE-002 · 설교의 맥락을 함께 남긴다

```yaml
id: POL-NOTE-002
statement: 노트 상단에 설교 제목·날짜·설교자·장소·생명양식(대표 본문)을 항상 보이는 형태로 기록할 수 있어야 한다.
confidence: 기록됨
source:
  - docs/plans/2026-05-24-sermon-meta-header.md (Goal / 데이터 모델 결정)
```

본문만 남은 노트는 나중에 무슨 설교였는지 복원되지 않는다. 다섯 항목은 **접히지 않고 항상 보이는 라벨 헤더**로 두고, 키보드 Return으로 다섯 칸을 지나 본문까지 한 번에 내려갈 수 있게 한다.

"생명양식"은 그 설교의 대표 본문이며, 본문 중에 인용한 구절들(`citedRefs`)과는 별개 개념이다.

하위 규칙: [`RULE-EDIT-011..013`](../rules/editor-insert.md)

## POL-NOTE-003 · 지난 노트를 다시 찾는다

```yaml
id: POL-NOTE-003
statement: 노트는 날짜별로 묶여 최신순으로 보이고, 제목과 인용한 구절로 찾을 수 있어야 한다.
confidence: 코드추론
source:
  - apps/ch-life/src/list/group-notes.ts
  - apps/ch-life/src/db/note-repo.ts (searchNotes)
```

목록은 작성일 기준으로 그룹핑되고 최신 날짜가 위에 온다. 검색은 **제목과 인용된 참조만** 대상으로 한다 — 본문 검색은 현재 동작하지 않으며, 이는 알려진 제약이다([`RULE-SEARCH-001`](../rules/search.md), [`ADR-0007`](../decisions/ADR-0007-fts-scope.md)).

하위 규칙: [`RULE-SEARCH-*`](../rules/search.md), [`RULE-NOTE-004`, `RULE-NOTE-008`](../rules/note-persistence.md)
