# ADR-0003 · 내부는 SQLite, 외부는 노트별 마크다운

```yaml
id: ADR-0003
status: accepted
statement: 노트의 정본 저장은 SQLite(+FTS5)로 하고, 외부와 주고받는 형식은 노트 하나당 Markdown 파일 하나로 한다.
confidence: 기록됨
source:
  - docs/plans/2026-05-17-ch-life-v1-spec.md 5.1 "결정 배경"
```

## 맥락

두 가지 요구가 충돌했다. 빠른 검색·정렬·인덱싱은 DB가 유리하고, "노트 하나를 개별로 내보내고 가져오기 편함"은 파일 기반(Obsidian/iA Writer) 특성이다.

계획 문서에 조사 결과가 남아 있다 — Apple Notes(Core Data)·Google Keep(Room)·Samsung Notes는 **모두 밑바닥이 SQLite이고 샌드박스로 격리**되어 있다. 사용자가 원한 이식성은 그들의 저장 엔진이 아니라 파일 기반 앱의 특성이었다.

## 결정

둘 다 취한다. 내부는 `expo-sqlite`, 외부 노출은 노트별 `.md`.

## 귀결

- 검색·정렬은 DB가 처리하고, 백업·공유는 사람이 읽을 수 있는 파일로 나간다.
- **변환 계층이 새 산출물로 생겼다** — 직렬화/역직렬화와 그 왕복 테스트([`CONTRACT-MD-NOTE`](../contracts/CONTRACT-MD-NOTE.md)).
- 마크다운은 블록 모델보다 표현력이 낮아 손실이 생긴다(절 번호, 문단 내 빈 줄 등 — [`RULE-MD-004`](../rules/share-markdown.md)).
- 파일은 정본이 아니라 **사본**이다. 파일을 고쳐도 앱이 자동으로 따라가지 않고, 가져오기를 해야 반영된다.
- 계획에 있던 전체 zip 백업과 시스템 "다른 앱에서 열기"는 아직 없다. 그래서 이 결정의 절반(외부 이식성)은 미완이다([`RULE-MD-008`](../rules/share-markdown.md)).
