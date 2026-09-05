# RULE-SEARCH — 노트 검색

상위 정책: [`POL-NOTE-003`](../policy/POL-NOTE.md)

검색은 SQLite FTS5 가상 테이블 `notes_fts`에 대한 접두 매칭이다. **이 앱에서 사용자 기대와 실제 동작의 간극이 가장 큰 영역**이므로 제약을 명시적으로 규칙화한다.

---

## RULE-SEARCH-001 · 검색 대상은 제목과 인용 참조뿐

```yaml
id: RULE-SEARCH-001
policy: POL-NOTE-003
requirement: MUST
statement: 노트 검색은 title과 cited_refs만 대상으로 한다. body_text 컬럼은 색인 구조상 존재하지만 언제나 빈 문자열이 들어가므로, 본문 검색은 동작하지 않는다.
implemented_by:
  - apps/ch-life/src/db/schema.sql (notes_ai / notes_au 트리거)
  - apps/ch-life/src/db/index.ts (인라인 스키마)
verified_by:
  - test: apps/ch-life/src/db/__tests__/migrations.test.ts#notes 인서트 시 FTS 트리거가 행을 동기화한다
  - test: apps/ch-life/src/db/__tests__/note-repo-search.test.ts
confidence: 기록됨
source:
  - apps/ch-life/CLAUDE.md ("body_text는 빈 문자열로 색인됨 → 본문 검색 안 됨")
```

INSERT 트리거는 `body_text`에 `''`를 넣고, UPDATE 트리거는 `title`과 `cited_refs`만 갱신한다. 본문을 평문으로 뽑아 넣는 경로가 **아예 없다**.

**이 규칙은 FTS 경로(폰)에만 온전히 적용된다.** 태블릿 사이드바는 FTS를 쓰지 않고 메모리 목록을 `noteTitleOrFallback()`으로 필터하는데, 제목이 없는 노트는 이 함수가 **본문 앞 40자**(`notePreview`)로 대체하므로 **제목 없는 노트에 한해 태블릿에서는 본문 일부가 검색된다.** 폰과 태블릿의 검색 결과가 갈리는 지점이다 → [`drift.md` B8](../drift.md).

그런데 검색창 placeholder는 `검색 — 제목, 본문, 인용`이라고 안내한다. 사용자에게 노출된 문구와 실제 동작이 어긋나 있다([`drift.md`](../drift.md) D절). 이 상태는 [`ADR-0007`](../decisions/ADR-0007-fts-scope.md)에 기록되어 있다.

## RULE-SEARCH-002 · 접두 매칭만 지원한다

```yaml
id: RULE-SEARCH-002
policy: POL-NOTE-003
requirement: MUST
statement: 검색어는 FTS 접두 질의(query*)로 변환된다. 토큰의 앞부분과만 일치하며, 단어 중간 일치는 되지 않는다.
implemented_by:
  - apps/ch-life/src/db/note-repo.ts (searchNotes)
verified_by:
  - test: apps/ch-life/src/db/__tests__/note-repo-search.test.ts#제목 prefix 검색
confidence: 코드추론
```

`주일`로 `주일설교`를 찾을 수 있지만, `설교`로는 찾을 수 없다. `unicode61` 토크나이저는 공백·문장부호로만 자르므로, 띄어쓰기가 없는 한국어 어절은 통째로 하나의 토큰이 된다.

띄어쓴 검색어는 토큰별 AND로 동작한다(`주일 설교` → 두 토큰을 모두 가진 노트). 다만 **`*`는 문자열 끝에 한 번만 붙으므로 접두 매칭되는 것은 마지막 토큰뿐이다.** `주일 설교`는 `주일 설교*`로 나가서 `주일`은 정확히 일치해야 하고 `설교`만 접두로 열린다.

## RULE-SEARCH-003 · 따옴표는 제거한다

```yaml
id: RULE-SEARCH-003
policy: POL-NOTE-003
requirement: MUST
statement: 검색어에서 작은따옴표와 큰따옴표를 제거한 뒤 질의한다. 제거 후 남는 것이 없으면 빈 결과를 반환한다.
implemented_by:
  - apps/ch-life/src/db/note-repo.ts (searchNotes)
verified_by:
  - test: apps/ch-life/src/db/__tests__/note-repo-search.test.ts#따옴표는 sanitize되어 SQL 오류 없이 빈 결과
confidence: 코드추론
```

FTS5 질의 문법에서 따옴표는 구문 오류를 일으킨다. 파라미터 바인딩을 쓰고 있어 SQL 인젝션 위험은 없고, 이 처리는 **질의 문법 오류 방지**가 목적이다. 사용자는 따옴표로 정확히 일치 검색을 할 수 없다.

## RULE-SEARCH-004 · 검색은 입력 후 200ms에 실행한다

```yaml
id: RULE-SEARCH-004
policy: POL-NOTE-003
requirement: SHOULD
statement: 검색창 입력이 멈춘 뒤 200ms에 질의하고, 입력이 비면 즉시 전체 목록으로 되돌아간다. 결과가 없으면 "검색 결과 없음"을 보여준다.
implemented_by:
  - apps/ch-life/app/index.tsx
verified_by:
  - manual: 검색어 입력 시 결과 갱신, 지우면 전체 목록 복귀
confidence: 코드추론
```

질의 실패는 삼키고 빈 결과로 처리한다(콘솔 경고만). 태블릿 사이드바의 검색은 별도 구현으로 DB가 아니라 **메모리에 로드된 목록을 필터링**한다.

## RULE-SEARCH-005 · 인용 참조 문자열은 정규화되지 않는다

```yaml
id: RULE-SEARCH-005
policy: POL-NOTE-003
statement: cited_refs에는 인용을 만든 경로에 따라 서로 다른 표기가 저장된다. 따라서 같은 절이라도 검색어 형태에 따라 찾히기도 하고 찾히지 않기도 한다.
implemented_by:
  - apps/ch-life/src/editor/cited-refs.ts
  - apps/ch-life/src/browser/VerseList.tsx
verified_by:
  - test: apps/ch-life/src/db/__tests__/note-repo-search.test.ts#citedRefs 검색
confidence: 코드추론
```

| 인용을 넣은 경로 | 저장되는 문자열 |
|---|---|
| 본문 자동완성 | 사용자가 친 그대로 — `창1:1`, `창 1:1`, `Gen 1:1` |
| 성경 브라우저 `＋` | 정식 한국어명 — `창세기 1:1` |
| 마크다운 가져오기 | 파일에 적혀 있던 값 |

`창세기`로 검색하면 브라우저로 넣은 인용만 걸리고, 손으로 친 `창1:1`은 걸리지 않는다. 표시할 때는 [`RULE-REF-004`](scripture-ref.md)가 모두 정식 이름으로 보여주기 때문에 **화면상으로는 같아 보이는데 검색 결과가 다르다.**

해결하려면 저장 시점에 `formatRef`로 정규화하거나 코드 형태를 함께 색인해야 한다. 지금은 하지 않는다([`drift.md`](../drift.md) B절).

## RULE-SEARCH-006 · 결과는 created_at 내림차순

```yaml
id: RULE-SEARCH-006
policy: POL-NOTE-003
requirement: MUST
statement: 검색 결과는 created_at 내림차순으로 정렬된다.
implemented_by:
  - apps/ch-life/src/db/note-repo.ts (searchNotes)
verified_by:
  - test: apps/ch-life/src/db/__tests__/note-repo-search.test.ts#최신 updated_at 우선
confidence: 코드추론
```

정렬 축은 목록·그룹핑과 같은 `created_at`이다([`ADR-0008`](../decisions/ADR-0008-created-at-ordering.md)).

⚠️ **이 규칙의 증거 테스트는 이름이 틀렸다.** `"최신 updated_at 우선"`은 노트를 만들기만 하고 수정하지 않으므로 실제로는 `created_at` 정렬을 확인한다. 이름을 믿고 "updated_at 정렬이 보장된다"고 읽으면 안 된다([`drift.md` C2](../drift.md)).

## RULE-SEARCH-007 · 결과는 200건에서 잘린다

```yaml
id: RULE-SEARCH-007
policy: POL-NOTE-003
statement: 검색 결과는 최대 200건까지만 반환된다. 그 뒤는 조용히 잘린다.
implemented_by:
  - apps/ch-life/src/db/note-repo.ts (searchNotes — LIMIT 200)
confidence: 코드추론
```

`requirement`를 붙이지 않는다. 이 상한에는 **증거도 의도의 기록도 없다** — 201번째 노트가 잘리는지 확인하는 테스트가 없고, 사용자에게 "더 있음"을 알리는 UI도 없다. 지금 그렇게 동작한다는 서술일 뿐이다.
