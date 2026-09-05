# RULE-EDIT — 에디터, 인용 삽입, 자동저장

상위 정책: [`POL-SCRIPTURE-001`](../policy/POL-SCRIPTURE.md), [`POL-NOTE-001`](../policy/POL-NOTE.md), [`POL-NOTE-002`](../policy/POL-NOTE.md), [`POL-NOTE-003`](../policy/POL-NOTE.md)(RULE-EDIT-009), [`POL-PORT-001`](../policy/POL-PORTABILITY.md)(RULE-EDIT-010)

에디터는 WebView 리치 에디터가 아니라 **블록 배열을 직접 그리는 네이티브 RN 에디터**다([`ADR-0001`](../decisions/ADR-0001-native-block-editor.md)). 문단은 각각 하나의 `TextInput`이고, 성경 인용은 편집 불가능한 카드다.

```text
body: BlockNode[]
  ├ { paragraph }  → <ParagraphInput/>   (편집 가능)
  ├ { quote }      → <QuoteBlock/>       (읽기 전용)
  └ …
```

RN 컴포넌트 테스트 라이브러리가 설치되어 있지 않으므로, 이 계층의 **순수 함수는 자동 검증되고 상호작용은 수동 확인**이다.

---

## RULE-EDIT-001 · 확정 트리거는 space 또는 개행

```yaml
id: RULE-EDIT-001
policy: POL-SCRIPTURE-001
requirement: MUST
statement: 유효한 참조 바로 뒤에 공백이나 개행이 입력되면 인용 블록으로 확정한다. 문단 끝뿐 아니라 문단 중간에서도 동작한다.
implemented_by:
  - apps/ch-life/src/editor/useAutocomplete.ts
  - apps/ch-life/src/editor/ParagraphInput.tsx
verified_by:
  - test: apps/ch-life/src/editor/__tests__/useAutocomplete.test.ts#detectTriggeredRef
confidence: 기록됨
source:
  - DESIGN.md "자동완성 UX 디테일" 구현 갱신(2026-05-31)
```

계획 단계의 확정 키는 `Tab`이었으나 **space로 바뀌었다**([`ADR-0002`](../decisions/ADR-0002-space-trigger.md) — 바꾼 이유는 기록되어 있지 않다).

⚠️ **자동완성이 인식하는 문법은 `parseRef`보다 좁고, 한 지점에서 어긋난다.** 트리거 패턴의 영어 책 토큰은 `[A-Za-z]{2,20}`이라 **숫자로 시작하는 책 이름을 담지 못한다.** `1 John 1:1 `을 치면 패턴이 뒤에서부터 `John 1:1`만 잘라내고, 그 문자열은 요한복음으로 정상 해석되므로 **요한일서가 아니라 요한복음 1:1이 삽입된다.** `2 John`·`3 John`도 같다. `1 Peter`·`1 Kings`처럼 축약이 겹치지 않는 책은 조용히 트리거되지 않는다. 한국어 표기(`요일 1:1`)는 영향이 없다. → [`drift.md` B10](../drift.md)

판정은 필드 끝을 보는 것이 아니라 **이전 값과 다음 값의 차이 구간**을 훑는다. 덕분에 `안녕하세요 창 1:3 누구세요`의 가운데 참조도, 붙여넣기도 동일하게 처리된다.

개행에는 추가 처리가 있다. Enter를 누르면 아래 줄의 개행과 붙어 같은 문자열이 두 가지 순서로 만들어질 수 있어(`…3\n[\n]누구` vs `…3[\n]\n누구`), 단순 접두 비교로는 참조가 `\n`으로 끝나 매칭이 깨진다. 그래서 **같은 문자가 연속된 구간의 맨 앞**까지 되짚어 트리거 위치를 잡는다(코드 주석에 상세 기록).

범위 인용의 구분자는 여기서만 **공백 없이 붙여 써야** 한다(`1:1-3`). 트리거가 space이므로 `1:1 - 3`은 `- 3`을 치기 전에 이미 단절 `1:1`로 확정되기 때문이다.

## RULE-EDIT-002 · 삽입은 문단을 3분할한다

```yaml
id: RULE-EDIT-002
policy: POL-SCRIPTURE-001
requirement: MUST
statement: 인용 확정 시 원래 문단은 [참조 앞 텍스트] / [인용 블록] / [참조 뒤 텍스트] 세 블록으로 나뉜다. 참조 문자열과 트리거 공백은 사라진다.
implemented_by:
  - apps/ch-life/src/editor/useAutocomplete.ts (splitAtRef)
  - apps/ch-life/src/editor/NoteEditor.tsx (splitParagraphWithQuote)
verified_by:
  - test: apps/ch-life/src/editor/__tests__/useAutocomplete.test.ts#splitAtRef
confidence: 코드추론
```

`오늘 본문은 골 3:20 입니다` + space → `오늘 본문은` / 인용(골 3:20) / `입니다`.

**원본 참조 텍스트는 남지 않는다.** v1 spec 3.3은 "자동완성으로 삽입 시 원본 텍스트 유지"였으나 구현은 제거하는 쪽이다([`drift.md`](../drift.md)). 인용 블록 머리글이 이미 참조를 정식 이름으로 보여주므로 중복이라는 판단으로 읽힌다 — 다만 이 전환의 근거는 기록되어 있지 않다.

앞 텍스트의 꼬리 공백은 잘라내고, 뒤 텍스트는 그대로 보존한다. 본문 조회에 실패하면 분할 자체를 하지 않는다(`splitParagraphWithQuote`가 `null` 반환).

## RULE-EDIT-003 · 삽입 후 캐럿은 인용 다음 문단

```yaml
id: RULE-EDIT-003
policy: POL-SCRIPTURE-001
requirement: SHOULD
statement: 인용 블록이 삽입되면 캐럿은 그 아래 새 문단으로 이동해, 사용자가 손을 떼지 않고 계속 쓸 수 있어야 한다.
implemented_by:
  - apps/ch-life/src/editor/NoteEditor.tsx (focusOnMountIdx)
  - apps/ch-life/src/editor/ParagraphInput.tsx (focusOnMount)
verified_by:
  - manual: 문단 중간에서 "창 1:1 " 입력 → 인용 삽입 후 그 아래 칸에 커서가 있다
confidence: 기록됨
source:
  - docs/plans/2026-05-17-ch-life-v1-spec.md 3.4 (비동기 입력 흐름 — 입력 흐름이 끊기면 안 됨)
```

포커스 대상은 삽입된 인용의 다음 인덱스(`idx + 2`)이며, **한 번만** 발동하고 즉시 해제된다. 그렇게 하지 않으면 이후 backspace 병합 등으로 같은 인덱스에 다른 문단이 마운트될 때 포커스를 가로챌 수 있다(코드 주석).

## RULE-EDIT-004 · 인용 블록 앞 backspace는 인용을 지우고 문단을 합친다

```yaml
id: RULE-EDIT-004
policy: POL-NOTE-001
requirement: SHOULD
statement: 인용 블록 바로 아래 문단의 맨 앞에서 backspace를 누르면 인용 블록이 삭제되고, 위·아래 문단이 하나로 합쳐진다.
implemented_by:
  - apps/ch-life/src/editor/NoteEditor.tsx (handleBackspaceAtStart)
  - apps/ch-life/src/editor/ParagraphInput.tsx (handleKeyPress)
verified_by:
  - manual: 인용 아래 문단 첫 칸에서 backspace → 인용이 사라지고 위 문단 끝에 이어붙는다
confidence: 코드추론
```

인용 블록 자체는 포커스를 받을 수 없으므로, 지우는 유일한 경로가 이 동작이다. 위쪽이 문단이면 세 블록을 하나로 합치고, 위쪽이 없거나 문단이 아니면 인용만 제거한다.

**인용을 지우는 다른 UI는 없다.** v1 spec 3.2의 "Error 상태 휴지통 버튼"은 구현되지 않았다.

## RULE-EDIT-005 · 힌트 칩은 유효할 때만 뜬다

```yaml
id: RULE-EDIT-005
policy: POL-SCRIPTURE-001
requirement: SHOULD
statement: 커서 바로 앞이 본문 조회에 성공하는 참조일 때만 화면 하단에 떠 있는 힌트 칩(참조 + space 안내)을 보여준다.
implemented_by:
  - apps/ch-life/src/editor/NoteEditor.tsx (liveHint)
verified_by:
  - manual: "창 1:1" 입력 중 하단 칩 표시, "창 99:99"에서는 미표시
confidence: 기록됨
source:
  - DESIGN.md "자동완성 UX 디테일" (떠 있는 힌트 칩 — 당초의 인라인 회색 미리보기 대신)
```

계획 단계의 "커서 옆 인라인 칩"(v1 spec 3.1) 대신 **화면 하단 고정 칩**이다. RN `TextInput`에는 인라인 데코레이션을 얹을 수단이 없다는 것이 실질적 이유로 읽힌다.

칩은 안내일 뿐 조작 대상이 아니다(`pointerEvents="none"`) — 탭해서 확정할 수 없다. v1 spec의 "칩 직접 탭 → 확정"은 미구현이다.

## RULE-EDIT-006 · 인용 블록은 편집할 수 없다

```yaml
id: RULE-EDIT-006
policy: POL-SCRIPTURE-001
requirement: SHOULD NOT
statement: 인용 블록의 본문은 사용자가 수정할 수 없다. 표시 형태(카드/인용바/접힘)만 설정에 따라 달라진다.
implemented_by:
  - apps/ch-life/src/editor/QuoteBlock.tsx
verified_by:
  - manual: 인용 블록을 탭해도 커서가 들어가지 않는다
confidence: 코드추론
```

인용 본문은 성경 데이터의 사본이므로 노트 안에서 변형되지 않는다. 세 가지 표시 변형 중 `collapse`만 상호작용(접기/펴기)을 가지며, 접힘 상태는 저장되지 않는다.

## RULE-EDIT-007 · 인용 상태는 항상 loaded

```yaml
id: RULE-EDIT-007
policy: POL-SCRIPTURE-001
requirement: MUST
statement: 저장되는 인용 블록의 status는 언제나 "loaded"다. "loading"과 "error"는 타입에는 있으나 어떤 코드 경로에서도 생성되지 않는다.
implemented_by:
  - apps/ch-life/src/editor/NoteEditor.tsx
  - apps/ch-life/app/note/[id].tsx
  - apps/ch-life/src/workspace/TabletWorkspace.tsx
  - apps/ch-life/src/markdown/parse.ts
verified_by:
  - test: apps/ch-life/src/domain/__tests__/types.test.ts
confidence: 코드추론
```

본문 조회가 **삽입보다 먼저** 일어나고 실패하면 삽입 자체를 취소하므로, 비어 있거나 실패한 인용이 노트에 들어갈 수 없다. 조회가 메모리 접근이라 로딩 시간이 없다는 사실이 이 단순화를 가능하게 했다.

결과적으로 v1 spec 3.2의 3상태 인용 블록(Loading/Loaded/Error)은 **렌더러에만 남고 도달 불가능한 코드**가 되었다. `QuoteBlock`의 `loading`/`error` 분기는 지금 죽은 코드다([`drift.md`](../drift.md)).

## RULE-EDIT-008 · 자동저장은 두 단계 디바운스

```yaml
id: RULE-EDIT-008
policy: POL-NOTE-001
requirement: SHOULD
statement: 문단 텍스트는 입력이 멈춘 뒤 800ms에 블록 배열로 반영되고, 노트 전체는 그로부터 500ms 뒤 DB에 저장된다. 성공은 알리지 않고 실패만 상단 배너로 알린다.
implemented_by:
  - apps/ch-life/src/editor/ParagraphInput.tsx (COMMIT_DEBOUNCE_MS = 800)
  - apps/ch-life/src/editor/useAutoSave.ts (delayMs = 500)
verified_by:
  - test: apps/ch-life/src/editor/__tests__/useAutoSave-payload.test.ts
  - manual: 입력 중단 후 약 1.3초 뒤 저장, 앱 재시작 시 보존
confidence: 코드추론
```

문단마다 `TextInput`이 별개이므로, 매 키 입력마다 상위 상태를 갱신하면 형제 블록이 전부 리렌더된다. 그래서 문단 안에서는 로컬 상태로 타이핑하고 **멈춘 뒤에만** 위로 올린다(코드 주석: `ParagraphInput`은 memo, 콜백은 `bodyRef`로 안정화).

최악의 경우 입력 후 저장까지 **약 1.3초**가 비어 있다. 이 사이에 앱이 강제 종료되면 마지막 문단 입력이 사라질 수 있다. 다만 포커스를 잃을 때(`onBlur`)와 backspace 병합 시에는 디바운스를 취소하고 즉시 반영하므로, 화면을 벗어나는 정상 경로에서는 손실이 없다.

v1 spec 3.5의 "500ms 후 전체 덮어쓰기"와 달리, 실제로는 **해당 노트 row만** UPDATE 한다.

## RULE-EDIT-009 · citedRefs는 저장할 때 본문에서 재계산한다

```yaml
id: RULE-EDIT-009
policy: POL-NOTE-003
requirement: MUST
statement: 노트의 citedRefs는 사용자가 관리하는 값이 아니라, 저장 시점에 body의 quote 블록에서 등장 순서대로 중복 없이 추출한 결과다.
implemented_by:
  - apps/ch-life/src/editor/cited-refs.ts
  - apps/ch-life/src/editor/useAutoSave.ts (buildSavePayload)
verified_by:
  - test: apps/ch-life/src/editor/__tests__/cited-refs.test.ts
  - test: apps/ch-life/src/editor/__tests__/useAutoSave-payload.test.ts
confidence: 코드추론
```

인용을 지우면 `citedRefs`에서도 자동으로 빠진다. 이 배열은 검색 색인의 입력이자([`RULE-SEARCH-001`](search.md)) 태블릿 "인용" 탭의 데이터 소스다.

저장되는 문자열은 **사용자가 입력한 그대로**이며 정규화되지 않는다. 자동완성으로 넣으면 `창1:1`, 성경 브라우저로 넣으면 `창세기 1:1`이 되어 같은 절이 다른 문자열로 남는다([`RULE-SEARCH-005`](search.md)).

## RULE-EDIT-010 · 인라인 강조는 텍스트 안에 산다

```yaml
id: RULE-EDIT-010
policy: POL-PORT-001
requirement: MUST
statement: 굵게·기울임·밑줄은 별도 스팬 모델이 아니라 블록 텍스트 안의 경량 마크다운(**굵게**, _기울임_, ++밑줄++)으로 저장한다.
implemented_by:
  - apps/ch-life/src/domain/types.ts (InlineMark)
  - apps/ch-life/src/editor/inlineMarks.ts
verified_by:
  - test: apps/ch-life/src/editor/__tests__/inlineMarks.test.ts
confidence: 기록됨
source:
  - apps/ch-life/src/domain/types.ts 주석 (스팬 모델을 피한 이유)
```

모든 텍스트 블록이 `text: string` 하나만 갖게 되어, 마크다운 내보내기·검색용 평문 추출·목록 미리보기·인용 참조 추출이 **구분자만 벗기면** 되는 구조가 된다(코드 주석에 명시된 근거).

대가: 사용자가 본문에 문자 그대로 `**`를 쓰면 강조로 해석된다. 이스케이프 수단은 없다.

현재 **강조를 입력하는 UI는 없다.** 서식 툴바가 없으므로 이 표기는 가져온 마크다운 파일에서만 들어온다.

## RULE-EDIT-011 · 메타 헤더 이동 순서

```yaml
id: RULE-EDIT-011
policy: POL-NOTE-002
requirement: MUST
statement: 설교 메타 필드는 제목 → 날짜 → 설교자 → 장소 → 생명양식 순으로 Return 키로 이동하고, 마지막 필드에서 Return을 누르면 본문 첫 문단으로 포커스가 넘어간다.
implemented_by:
  - apps/ch-life/src/editor/field-nav.ts
  - apps/ch-life/src/editor/SermonMetaHeader.tsx
verified_by:
  - test: apps/ch-life/src/editor/__tests__/field-nav.test.ts
confidence: 기록됨
source:
  - docs/plans/2026-05-24-sermon-meta-header.md Task 8, Task 10
```

외장 키보드나 소프트 키보드의 "다음" 키만으로 헤더 다섯 칸을 지나 본문까지 갈 수 있어야 한다는 요구다. 본문 진입 대상은 `body`에서 **첫 번째 문단 블록**이며, 문단이 하나도 없으면(`-1`) 아무 일도 하지 않는다.

메타 헤더는 스크롤 콘텐츠 상단에 놓여 본문과 함께 스크롤되어 올라간다 — 고정 헤더가 아니다.

## RULE-EDIT-012 · 날짜는 관대하게 받고 엄격하게 저장한다

```yaml
id: RULE-EDIT-012
policy: POL-NOTE-002
requirement: MUST
statement: 날짜 입력은 구분자(. - / 공백)를 섞어 쓸 수 있고 연도를 생략하면 올해로 채운다. 저장 형식은 언제나 YYYY-MM-DD 문자열이며, 해석 불가한 입력은 저장하지 않고 직전 값으로 되돌린다.
implemented_by:
  - apps/ch-life/src/editor/calendar.ts (parseFlexibleDate)
  - apps/ch-life/src/editor/SermonMetaHeader.tsx (commitDate)
verified_by:
  - test: apps/ch-life/src/editor/__tests__/calendar.test.ts#parseFlexibleDate
  - manual: 해석 불가 입력 후 포커스 이동 시 직전 값 복원
confidence: 기록됨
source:
  - docs/plans/2026-05-24-sermon-meta-header.md Task 4, Task 8
```

`2026.5.30`, `2026-05-30`, `20260530`, `5/30`, `26.5.30` 모두 `2026-05-30`이 된다. 존재하지 않는 날짜(`2026-02-30`)는 실제 `Date`로 되돌려 검증하므로 통과하지 못한다.

날짜를 **타임스탬프가 아니라 달력 문자열로** 저장하는 이유는 타임존 이동 시 날짜가 하루 밀리는 것을 막기 위해서다(계획 문서에 "타임존 안전한 달력 문자열"로 명시).

달력 모달로 고른 값은 타이핑 중인 값을 이긴다. 그렇지 않으면 이후 blur가 낡은 입력으로 선택을 덮어쓴다(코드 주석).

## RULE-EDIT-013 · 생명양식은 실제 본문이 있을 때만 확인 표시

```yaml
id: RULE-EDIT-013
policy: POL-NOTE-002
requirement: MUST
statement: 생명양식 필드는 입력값으로 본문 조회가 성공할 때만 체크 표시를 보여주고 본문 미리보기 버튼을 활성화한다. 실패해도 입력 자체는 그대로 저장된다.
implemented_by:
  - apps/ch-life/src/editor/scripture-field.ts
  - apps/ch-life/src/editor/SermonMetaHeader.tsx
  - apps/ch-life/src/editor/ScripturePreviewModal.tsx
verified_by:
  - test: apps/ch-life/src/editor/__tests__/scripture-field.test.ts
confidence: 기록됨
source:
  - docs/plans/2026-05-24-sermon-meta-header.md Task 5, Task 7
```

검증은 참조 형식이 아니라 **본문이 실제로 조회되는지**로 한다. 실패해도 막지 않는다 — `요한계시록 전체`처럼 자유 형식으로 적는 경우를 허용하기 위해서다. 체크 표시는 "확인됨"이지 "올바름"이 아니다.

생명양식은 본문 중 인용(`citedRefs`)과 별개의 필드이며, 검색 색인에 들어가지 않는다(계획 문서에서 YAGNI로 명시적 제외).
