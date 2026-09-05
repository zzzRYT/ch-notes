# POL-SCRIPTURE — 말씀을 손으로 옮겨 적지 않는다

## POL-SCRIPTURE-001 · 설교 중 구절 자동 인용

```yaml
id: POL-SCRIPTURE-001
statement: 노트를 쓰다가 성경 참조를 입력하면, 앱을 벗어나지 않고 인터넷도 없이 본문이 인용 블록으로 들어와야 한다.
confidence: 기록됨
source:
  - DESIGN.md "What Makes This Cool" 1번 (설교 중 속도감)
  - docs/plans/2026-05-17-ch-life-v1-spec.md 0장
```

이 앱의 존재 이유다. 설교를 들으며 "골 3:20"을 적었을 때, 다른 성경 앱으로 이탈하거나 본문을 손으로 베끼는 순간 설교의 호흡이 끊긴다. 그래서 인용은 **한 번의 키 입력(space)** 으로 끝나야 하고, 네트워크가 없는 예배실·지하에서도 동일하게 동작해야 한다.

보장 범위: 한국어 정식·축약 및 영어 책 이름 66권 전체, 단절과 절 범위. 존재하지 않는 참조는 **아무 일도 일어나지 않는다** — 경고나 빨간 표시로 사용자를 멈춰 세우지 않는다.

하위 규칙: [`RULE-REF-*`](../rules/scripture-ref.md), [`RULE-EDIT-001..007`](../rules/editor-insert.md)

## POL-SCRIPTURE-002 · 성경 읽기

```yaml
id: POL-SCRIPTURE-002
statement: 노트를 쓰지 않을 때도 성경 자체를 책→장→절로 찾아 읽을 수 있어야 하며, 읽던 자리에서 이어 읽을 수 있어야 한다.
confidence: 기록됨
source:
  - docs/plans/2026-06-07-bible-reader-default-design.md "배경 / 목표"
  - docs/plans/2026-06-07-bible-reader-entrypoints-design.md
```

성경은 노트의 부속물이 아니라 독립적으로 읽는 대상이다. 홈에서 연 성경은 **읽기 전용 전체화면**이고, 에디터에서 연 성경은 **인용을 넣는 도구**다. 이 둘을 의도적으로 분리했다([`ADR-0011`](../decisions/ADR-0011-bible-entrypoints.md)).

읽던 위치(책·장)는 세 진입점이 하나를 공유한다. 절 단위 스크롤 위치는 기억하지 않는다.

하위 규칙: [`RULE-BIBLE-*`](../rules/bible-reader.md)
