# ADR-0007 · 검색 색인은 제목과 인용 참조까지만

```yaml
id: ADR-0007
status: accepted
supersedes: docs/plans/2026-05-17-ch-life-v1-spec.md 5.3 (body_text 색인)
statement: FTS 색인에는 title과 cited_refs만 채우고, body_text 컬럼은 구조만 남긴 채 빈 문자열로 둔다.
confidence: 확인필요
source:
  - apps/ch-life/src/db/schema.sql (notes_ai 트리거가 '' 삽입)
  - apps/ch-life/CLAUDE.md (알려진 제약으로 명시)
  - docs/plans/2026-05-24-sermon-meta-header.md ("범위 밖 (YAGNI): FTS 인덱스에 설교자/생명양식 추가")
```

## 맥락

v1 spec 5.3의 FTS 정의에는 `body_text -- BlockNode[]에서 추출한 plain text`가 있었다. 실제 구현은 컬럼을 만들되 채우지 않는다.

## 결정

본문 평문 추출을 하지 않고, 색인은 제목과 인용 참조로 제한한다.

## 이유

기록되어 있지 않다. 정황: 블록 배열을 평문으로 뽑는 코드와 그것을 저장할 때마다 FTS를 갱신하는 배선이 필요하고, 트리거만으로는 `body_json`을 파싱할 수 없다(애플리케이션 코드가 FTS UPDATE를 직접 해야 한다). 같은 시기의 다른 결정에서 "검색 요구 없음 → YAGNI"라는 판단이 반복된다.

**확인이 필요하다.** 의도적 보류인지, 배선을 빠뜨린 결함인지 코드만으로는 구분되지 않는다.

## 귀결

- 본문에만 있는 단어로는 노트를 찾을 수 없다([`RULE-SEARCH-001`](../rules/search.md)).
- **검색창 placeholder는 "제목, 본문, 인용"이라고 안내한다.** 사용자에게 노출된 문구가 사실이 아니다 — 이 결정의 가장 큰 대가다([`drift.md`](../drift.md) D절).
- `body_text` 컬럼이 비어 있는 채 존재하므로, 나중에 채우기 시작하면 **기존 노트는 재색인이 필요**하다. 그 재색인 경로는 지금 없다.

## 바꾸려면

저장 경로에서 `BlockNode[]` → 평문 변환([`stripInlineMarks`](../rules/editor-insert.md) 활용) 후 `notes_fts` UPDATE, 그리고 기존 노트 전체 재색인 1회. `notePreview`가 이미 비슷한 추출을 하고 있다.
