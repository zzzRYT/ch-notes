# CONTRACT-MD-NOTE — 노트 공유 파일 형식

```yaml
id: CONTRACT-MD-NOTE
policy: POL-PORT-001
statement: 노트 하나는 YAML frontmatter + 표준 Markdown 본문을 가진 .md 파일 하나로 표현된다. 이 형식은 앱 밖으로 나가므로 하위 호환을 깨면 이미 내보낸 파일을 다시 읽을 수 없다.
implemented_by:
  - apps/ch-life/src/markdown/serialize.ts
  - apps/ch-life/src/markdown/parse.ts
verified_by:
  - test: apps/ch-life/src/markdown/__tests__/roundtrip.test.ts
  - test: apps/ch-life/src/markdown/__tests__/serialize.test.ts
  - test: apps/ch-life/src/markdown/__tests__/rich-blocks.test.ts
confidence: 기록됨
source:
  - docs/plans/2026-05-17-ch-life-v1-spec.md 5.8
```

## 형식

```markdown
---
id: 01HXXXXXXXXXXXXXXXX
title: 주일설교
createdAt: 2026-05-17T09:30:00.000Z
updatedAt: 2026-05-17T11:45:00.000Z
citedRefs:
  - 골 3:20
schemaVersion: 1
sermonDate: '2026-05-17'
preacher: 홍길동 목사
location: 본당
scripture: 요 3:16
---

오늘 본문은

> **골 3:20** (KRV)
> 자녀들아 모든 일에 부모에게 순종하라

이어지는 메모
```

파일명: `YYYY-MM-DD-{제목슬러그 또는 id뒷8자}.md` (날짜는 `updatedAt` 기준)

## 고정된 토큰 (바꾸면 호환성이 깨진다)

| 토큰 | 뜻 |
|---|---|
| `> **{ref}** (KRV)` | blockquote 첫 줄이 이 패턴이면 **성경 인용**, 아니면 사용자 인용 |
| `- [x]` / `- [ ]` | 할 일 블록의 체크 상태 |
| `#` ~ `###` | heading level 1~3 (4 이상은 3으로 절삭) |
| `**` / `_` / `++` | 굵게 / 기울임 / 밑줄 |

`(KRV)`는 데이터 출처가 Open Bible로 바뀐 뒤에도 남은 표기다. **지금의 본문은 개역한글이 아니다.** 그럼에도 이 문자열이 파서의 판별자이므로 바꿀 수 없다([`RULE-MD-003`](../rules/share-markdown.md)).

## 블록 ↔ 마크다운 대응

| BlockNode | 마크다운 |
|---|---|
| `paragraph` | 그대로 (줄바꿈 보존, 빈 줄은 블록 경계) |
| `heading` | `#` × level + 공백 |
| `bullet` | `- ` |
| `todo` | `- [x] ` / `- [ ] ` |
| `blockquote` | 모든 줄에 `> ` |
| `quote` | `> **{ref}** (KRV)` + 절마다 `> {본문}` |

블록 사이 구분자는 빈 줄 하나(`\n\n`)다.

## 계약이 보장하지 않는 것

- **절 번호**: 인용 안의 절 번호는 저장하지 않고, 다시 읽을 때 시작 절부터 1씩 증가한다고 가정한다. 다른 앱에서 인용 줄을 지우거나 순서를 바꾸면 절 번호가 어긋난다.
- **`schemaVersion` 검사**: 쓰기만 하고 읽지 않는다([`RULE-MD-007`](../rules/share-markdown.md)).
- **인용 본문의 정확성**: 파일을 손으로 고쳐 성경 본문을 바꿔도 앱은 검증하지 않고 그대로 받는다.

## 라이선스

내보낸 파일에는 CC BY-SA 4.0인 성경 본문이 포함된다. 이 파일을 재배포하면 그 조건이 함께 따라간다([`POL-LICENSE-001`](../policy/POL-LICENSE.md)).

## 바꾸려면

새 필드는 frontmatter에 **선택적으로** 추가한다(없어도 파싱되어야 한다). 본문 문법을 바꾸는 변경은 하위 호환이 없으므로 `schemaVersion`을 올리고 **읽는 쪽에 분기를 먼저** 넣어야 한다 — 지금은 그 분기가 존재하지 않는다.
