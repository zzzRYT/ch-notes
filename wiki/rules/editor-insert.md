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
  - apps/ch-life/src/features/scripture/insert/model/autocomplete.ts
  - apps/ch-life/src/widgets/note-editor/ui/ParagraphInput.tsx
verified_by:
  - test: apps/ch-life/src/features/scripture/insert/model/__tests__/autocomplete.test.ts#detectTriggeredRef
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
  - apps/ch-life/src/features/scripture/insert/model/autocomplete.ts (splitAtRef)
  - apps/ch-life/src/features/scripture/insert/model/split-paragraph.ts (splitParagraphWithQuote)
  - apps/ch-life/src/widgets/note-editor/ui/NoteEditor.tsx (handleTrigger)
verified_by:
  - test: apps/ch-life/src/features/scripture/insert/model/__tests__/autocomplete.test.ts#splitAtRef
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
  - apps/ch-life/src/widgets/note-editor/ui/NoteEditor.tsx (focusOnMountIdx)
  - apps/ch-life/src/widgets/note-editor/ui/ParagraphInput.tsx (focusOnMount)
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
  - apps/ch-life/src/widgets/note-editor/ui/NoteEditor.tsx (handleBackspaceAtStart)
  - apps/ch-life/src/widgets/note-editor/ui/ParagraphInput.tsx (handleKeyPress)
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
  - apps/ch-life/src/widgets/note-editor/ui/NoteEditor.tsx (liveHint)
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
statement: 인용 블록의 본문은 사용자가 수정할 수 없다. 표시 형태(카드/인용바/접힘)만 설정에 따라 달라진다. 참조를 다른 구절로 바꾸는 것은 본문 수정이 아니다 — RULE-EDIT-014의 시트가 인용 블록을 통째로 다시 만든다.
implemented_by:
  - apps/ch-life/src/widgets/note-editor/ui/QuoteBlock.tsx
verified_by:
  - manual: 인용 블록을 탭해도 커서가 들어가지 않는다
confidence: 코드추론
```

인용 본문은 성경 데이터의 사본이므로 노트 안에서 변형되지 않는다. 글자 단위로 고칠 수 있는 곳은 없고, 할 수 있는 일은 **참조를 바꿔 새 사본으로 교체하는 것**뿐이다([`RULE-EDIT-014`](#rule-edit-014--인용을-눌러-참조를-바꾼다)). 세 가지 표시 변형 중 `collapse`의 머리줄은 접기/펴기이며, 접힘 상태는 저장되지 않는다.

## RULE-EDIT-007 · 인용 상태는 항상 loaded

```yaml
id: RULE-EDIT-007
policy: POL-SCRIPTURE-001
requirement: MUST
statement: 저장되는 인용 블록의 status는 언제나 "loaded"다. "loading"과 "error"는 타입에는 있으나 어떤 코드 경로에서도 생성되지 않는다. 인용 블록은 makeQuoteBlock으로만 만들고, 예외는 마크다운 파서 하나다.
implemented_by:
  - apps/ch-life/src/entities/note/model/citation.ts (makeQuoteBlock)
  - apps/ch-life/src/features/scripture/insert/model/split-paragraph.ts
  - apps/ch-life/src/features/scripture/insert/model/insert-verse.ts
  - apps/ch-life/src/entities/note/api/markdown-parse.ts
verified_by:
  - test: apps/ch-life/src/entities/note/model/__tests__/types.test.ts
  - test: apps/ch-life/src/features/scripture/insert/model/__tests__/insert-verse.test.ts
confidence: 코드추론
```

본문 조회가 **삽입보다 먼저** 일어나고 실패하면 삽입 자체를 취소하므로, 비어 있거나 실패한 인용이 노트에 들어갈 수 없다. 조회가 메모리 접근이라 로딩 시간이 없다는 사실이 이 단순화를 가능하게 했다.

결과적으로 v1 spec 3.2의 3상태 인용 블록(Loading/Loaded/Error)은 **렌더러에만 남고 도달 불가능한 코드**가 되었다. `QuoteBlock`의 `loading`/`error` 분기는 지금 죽은 코드다([`drift.md`](../drift.md)).

## RULE-EDIT-008 · 자동저장은 두 단계 디바운스

```yaml
id: RULE-EDIT-008
policy: POL-NOTE-001
requirement: SHOULD
statement: 문단 텍스트는 입력이 멈춘 뒤 800ms에 블록 배열로 반영되고, 노트 전체는 그로부터 500ms 뒤 DB에 저장된다. 성공은 알리지 않고 실패만 상단 배너로 알린다. 에디터 상단의 키보드 아이콘은 키보드만 닫으며 저장을 실행하지 않는다.
implemented_by:
  - apps/ch-life/src/widgets/note-editor/ui/ParagraphInput.tsx (COMMIT_DEBOUNCE_MS = 800)
  - apps/ch-life/src/features/note/autosave/model/useAutoSave.ts (delayMs = 500)
  - apps/ch-life/src/widgets/note-editor/model/useNoteDraft.ts (폰·태블릿 공통 배선)
  - apps/ch-life/src/pages/note-editor/ui/NoteEditorPage.tsx (접근성 이름 "키보드 닫기", Keyboard.dismiss만 호출)
verified_by:
  - test: apps/ch-life/src/features/note/autosave/model/__tests__/useAutoSave-payload.test.ts
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
  - apps/ch-life/src/entities/note/model/cited-refs.ts
  - apps/ch-life/src/features/note/autosave/model/useAutoSave.ts (buildSavePayload)
verified_by:
  - test: apps/ch-life/src/entities/note/model/__tests__/cited-refs.test.ts
  - test: apps/ch-life/src/features/note/autosave/model/__tests__/useAutoSave-payload.test.ts
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
  - apps/ch-life/src/entities/note/model/types.ts (InlineMark)
  - apps/ch-life/src/entities/note/lib/inline-marks.ts
verified_by:
  - test: apps/ch-life/src/entities/note/lib/__tests__/inline-marks.test.ts
confidence: 기록됨
source:
  - apps/ch-life/src/entities/note/model/types.ts 주석 (스팬 모델을 피한 이유)
```

모든 텍스트 블록이 `text: string` 하나만 갖게 되어, 마크다운 내보내기·검색용 평문 추출·목록 미리보기·인용 참조 추출이 **구분자만 벗기면** 되는 구조가 된다(코드 주석에 명시된 근거).

대가: 사용자가 본문에 문자 그대로 `**`를 쓰면 강조로 해석된다. 이스케이프 수단은 없다.

입력은 키보드 위 서식 툴바로 한다([`RULE-EDIT-015`](#rule-edit-015--서식-툴바는-선택-영역을-구분자로-감싼다)). 편집 중에도 구분자는 **숨기지 않고** 보여준다 — 화면의 문자열과 저장 문자열이 글자 단위로 같아서 선택 위치를 변환할 필요가 없다([`ADR-0026`](../decisions/ADR-0026-visible-inline-delimiters.md)). 기울임(`_…_`)은 저장·내보내기·가져오기는 되지만 **화면에 기울어져 보이지 않는다**(한글 글꼴에 기울임 자형이 없고, 번들 글꼴이 없어 라틴 글자도 iOS에서 기울지 않았다). 짝이 없는 구분자(`snake_case`의 `_`)는 강조로 해석하지 않는다(`tokenizeInlineMarks`).

## RULE-EDIT-011 · 메타 헤더 이동 순서

```yaml
id: RULE-EDIT-011
policy: POL-NOTE-002
requirement: MUST
statement: 설교 메타 필드는 제목 → 날짜 → 설교자 → 장소 → 생명양식 순으로 Return 키로 이동하고, 마지막 필드에서 Return을 누르면 본문 첫 문단으로 포커스가 넘어간다.
implemented_by:
  - apps/ch-life/src/widgets/note-editor/lib/field-nav.ts
  - apps/ch-life/src/widgets/note-editor/ui/SermonMetaHeader.tsx
verified_by:
  - test: apps/ch-life/src/widgets/note-editor/lib/__tests__/field-nav.test.ts
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
  - apps/ch-life/src/widgets/note-editor/lib/calendar.ts (parseFlexibleDate)
  - apps/ch-life/src/widgets/note-editor/ui/SermonMetaHeader.tsx (commitDate)
verified_by:
  - test: apps/ch-life/src/widgets/note-editor/lib/__tests__/calendar.test.ts#parseFlexibleDate
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
  - apps/ch-life/src/features/scripture/insert/model/scripture-field.ts
  - apps/ch-life/src/widgets/note-editor/ui/SermonMetaHeader.tsx
  - apps/ch-life/src/widgets/note-editor/ui/ScripturePreviewModal.tsx
verified_by:
  - test: apps/ch-life/src/features/scripture/insert/model/__tests__/scripture-field.test.ts
confidence: 기록됨
source:
  - docs/plans/2026-05-24-sermon-meta-header.md Task 5, Task 7
```

검증은 참조 형식이 아니라 **본문이 실제로 조회되는지**로 한다. 실패해도 막지 않는다 — `요한계시록 전체`처럼 자유 형식으로 적는 경우를 허용하기 위해서다. 체크 표시는 "확인됨"이지 "올바름"이 아니다.

생명양식은 본문 중 인용(`citedRefs`)과 별개의 필드이며, 검색 색인에 들어가지 않는다(계획 문서에서 YAGNI로 명시적 제외).

## RULE-EDIT-014 · 인용을 눌러 참조를 바꾼다

```yaml
id: RULE-EDIT-014
policy: POL-SCRIPTURE-001
requirement: SHOULD
statement: 편집기의 인용 블록을 누르면 "인용 고치기" 시트가 열린다. 참조를 다시 입력하면 본문 미리보기가 바로 바뀌고, 조회되며 지금과 다른 구절일 때만 [바꾸기]가 켜진다. 바꾸면 그 자리의 인용이 makeQuoteBlock으로 다시 만들어지고 일반 본문 변경과 같은 자동저장 경로로 저장된다.
implemented_by:
  - apps/ch-life/src/features/scripture/insert/model/replace-quote.ts
  - apps/ch-life/src/widgets/note-editor/ui/QuoteEditModal.tsx
  - apps/ch-life/src/widgets/note-editor/ui/RichNoteEditor.tsx
  - apps/ch-life/src/widgets/note-editor/lib/verse-bridge.ts (카드 탭 → RN, 교체 → 웹)
  - apps/ch-life/src/widgets/note-editor/ui/QuoteBlock.tsx (네이티브 에디터 — 앱에 연결되지 않음, drift B32)
  - apps/ch-life/src/widgets/note-editor/ui/NoteEditor.tsx (같음)
verified_by:
  - test: apps/ch-life/src/features/scripture/insert/model/__tests__/replace-quote.test.ts#replaceQuoteRef
  - manual: 인용을 눌러 참조를 바꾸고 앱을 종료했다 다시 열면 바뀐 구절이 남아 있다 (iOS 시뮬레이터 13 mini collapse 변형 요 3:16 → 요 3:16~17, iPad Pro 13 quote 변형 수 17:11 → 17:11~12 — 3분할 목록의 인용 표시까지 갱신, 2026-09-26)
  - manual: WebView 에디터에서 인용 카드를 눌러 히 11:16 → 11:16-17로 바꾸면 카드가 바뀌고 DB의 body_json·cited_refs에 반영된다 (iOS 시뮬레이터 iPhone 15 Pro, 2026-09-27)
confidence: 기록됨
```

2026-09-26 Spirit Notes 역기획(E3)에서 도입했다. 오타 난 참조나 범위를 고치려면 전에는 인용을 backspace로 지우고([`RULE-EDIT-004`](#rule-edit-004--인용-블록-앞-backspace는-인용을-지우고-문단을-합친다)) 다시 쳐야 했다. 어르신에게는 이 두 단계가 곧 "못 고친다"이므로 고치는 길을 하나 둔다.

- **WebView 에디터(현재 앱).** 카드 전체가 누르는 곳이다. 웹은 누른 노드의 위치와 현재 JSON만 RN에 보내고, 판정·조회·`makeQuoteBlock`은 RN이 한다([`RULE-EDIT-001`](#rule-edit-001--확정-트리거는-space-또는-개행)의 삽입과 같은 분담). 웹은 그 자리가 아직 같은 인용일 때만 바꾼다 — 시트가 열린 사이 문서가 바뀌었으면 버린다. 표시 변형(카드/인용바/접힘)은 WebView에 아직 없다.
- **누르는 곳(네이티브 에디터).** 카드·인용바 변형은 블록 전체, `collapse` 변형은 **펼친 본문**이다. `collapse`의 머리줄은 원래 접기/펴기였으므로 그 동작을 빼앗지 않는다. 접힌 상태에서 고치려면 먼저 편다.
- **입력.** 휠 피커가 아니라 본문에서 치는 것과 같은 참조 문법의 텍스트 칸이다(`요 3:16-18`). 새 문법을 가르치지 않는다.
- **같은 구절 판정.** 표시 이름(`formatRef`) 기준이다 — `요3:16`을 `요한복음 3:16`으로 바꾸는 것은 변경이 아니다.
- **저장.** 교체된 본문은 `onChangeBody`로 올라가 [`RULE-EDIT-008`](#rule-edit-008--자동저장은-두-단계-디바운스)의 자동저장을 그대로 탄다. `citedRefs`는 저장할 때 본문에서 다시 뽑히므로([`RULE-EDIT-009`](#rule-edit-009--citedrefs는-저장할-때-본문에서-재계산한다)) 따로 고치지 않는다. 역기획한 앱은 카드 편집이 텍스트 저장 경로를 타지 않아 앱을 끄면 사라졌다 — 그 실수를 피하려고 별도 저장 경로를 만들지 않았다.
- 인용 **삭제** 버튼은 없다. 지우는 길은 여전히 RULE-EDIT-004 하나다.
- 판본(`editionId`)은 번들 판본으로 새로 찍힌다. 판본을 고르는 UI는 없다.

## RULE-EDIT-015 · 서식 툴바는 선택 영역을 구분자로 감싼다

```yaml
id: RULE-EDIT-015
policy: POL-NOTE-001
requirement: MUST
statement: 본문 문단에 포커스가 있으면 키보드 위에 굵게·밑줄·글머리 목록 버튼이 뜬다(기울임 버튼은 없다). 강조 버튼은 선택 영역을 해당 구분자로 감싸고, 이미 감싸져 있으면 벗긴다. 선택이 없으면 빈 구분자 쌍을 넣어 캐럿을 그 안에 두고, 켜진 강조의 닫는 구분자 바로 앞이면 캐럿을 그 뒤로 옮긴다(강조 끄기). 캐럿 위치에서 켜져 있는 강조는 버튼이 켜진 모양으로 보인다.
implemented_by:
  - apps/ch-life/src/entities/note/lib/inline-marks.ts (toggleInlineMark, marksAt, tokenizeInlineMarks)
  - apps/ch-life/src/widgets/note-editor/ui/NoteEditor.tsx (FormatToolbar)
  - apps/ch-life/src/widgets/note-editor/ui/ParagraphInput.tsx (applyMark, renderInlineRuns)
verified_by:
  - test: apps/ch-life/src/entities/note/lib/__tests__/inline-marks.test.ts#toggleInlineMark
  - manual: 단어를 선택하고 굵게 → 굵게 보이고 다시 누르면 풀린다. 선택 없이 굵게 → 입력 → 굵게 → 입력하면 앞은 굵게, 뒤는 보통 (iOS 시뮬레이터 13 mini, 2026-09-26)
confidence: 기록됨
source:
  - docs/reverse-planning/spirit-notes.md §9 E1
```

Spirit Notes 역기획(§6)에서 가져온 동작이다. 다만 "켜 두고 타이핑"(typing attribute)은 흉내 내지 않는다 — 선택 없이 누르면 `**|**`처럼 빈 쌍이 들어가 그 안에 치는 방식이다. 구분자가 보이므로 사용자가 무엇이 일어났는지 볼 수 있다.

**기울임 버튼을 뺀 이유.** 시뮬레이터에서 `_…_` 구간이 한글·라틴 모두 기울지 않았다. 앱은 글꼴을 번들하지 않아(`font-body`는 CSS 스택 문자열) iOS가 시스템 글꼴로 대체하고, 한글 시스템 글꼴에는 기울임 자형이 없다. 눌러도 변화가 없는 버튼은 어르신 사용자에게 고장으로 보인다.

툴바는 `react-native-keyboard-controller`의 `KeyboardStickyView`다(이미 쓰는 의존성, OTA 가능). 버튼은 44pt 이상이다.

## RULE-EDIT-016 · 글머리 목록은 한 줄 한 블록이다

```yaml
id: RULE-EDIT-016
policy: POL-NOTE-001
requirement: MUST
statement: 목록 버튼은 캐럿이 있는 줄 하나만 글머리(bullet) 블록으로 떼어 내고, 글머리에서 다시 누르면 문단으로 되돌린다. 글머리에서 Return은 다음 글머리를 만들고, 빈 글머리에서 Return은 목록을 끝내 그 자리를 빈 문단으로 바꾼다. 글머리 맨 앞 backspace는 글머리를 문단으로 바꾼다. 글머리 안에서 참조가 확정되면 앞부분은 글머리로 남고 뒷부분은 문단이 된다.
implemented_by:
  - apps/ch-life/src/widgets/note-editor/lib/list-blocks.ts
  - apps/ch-life/src/widgets/note-editor/ui/NoteEditor.tsx (applyListEdit, handleNewline, handleBackspaceAtStart)
  - apps/ch-life/src/features/scripture/insert/model/split-paragraph.ts
verified_by:
  - test: apps/ch-life/src/widgets/note-editor/lib/__tests__/list-blocks.test.ts#toggleBullet
  - test: apps/ch-life/src/widgets/note-editor/lib/__tests__/list-blocks.test.ts#splitBulletLines
  - test: apps/ch-life/src/features/scripture/insert/model/__tests__/split-paragraph.test.ts
  - manual: 목록 전환·Return·빈 항목 Return·맨 앞 backspace, 앱 재실행 후 유지 (iOS 시뮬레이터 13 mini·iPad Pro 13, 2026-09-26)
confidence: 기록됨
source:
  - docs/reverse-planning/spirit-notes.md §9 E2
```

문단 블록은 여러 줄을 담지만 글머리는 한 줄이다 — 마크다운 `- 텍스트`가 한 줄이기 때문이다([`CONTRACT-MD-NOTE`](../contracts/CONTRACT-MD-NOTE.md)). 그래서 글머리 입력칸은 개행을 받으면 스스로 늘어나지 않고 본문을 줄 단위 블록으로 쪼갠다(여러 줄 붙여넣기도 같다).

블록 수가 바뀌는 편집(목록, 인용 삽입)은 에디터의 **세대 번호를 올려 입력칸을 모두 다시 마운트한다.** 입력칸은 인덱스로 키가 잡혀 있고 포커스 중에는 바깥 텍스트를 무시하므로, 그대로 두면 쪼개진 문단이 옛 글자를 계속 보여 준다. 인용 삽입도 같은 이유로 세대를 올린다 — 전에는 아래에 블록이 더 있으면 `idx + 2` 자리 입력칸이 이미 마운트되어 있어 캐럿이 인용 아래로 가지 않았다([`RULE-EDIT-003`](#rule-edit-003--삽입-후-캐럿은-인용-다음-문단), 시뮬레이터에서 재현·수정 확인).

목록 버튼은 에디터가 들고 있는 활성 입력칸의 글자(`ActiveInputState.text`)로 줄을 나눈다. 이 값은 선택 이벤트에서도 갱신되므로 **렌더 상태가 아니라 `textRef`에서 읽어야 한다** — 선택 이벤트는 그 키 입력의 리렌더보다 먼저 와서, 상태로 채우면 한 글자 늦는다. iPad 시뮬레이터에서 한글을 치자마자 목록을 누르면 마지막 음절이 사라지는 것으로 재현·수정했다.

⚠️ 다시 마운트하는 순간(목록 편집·인용 삽입) 입력칸이 포커스를 잃었다가 다음 프레임에 되찾는다. 그 사이의 키 입력은 사라질 수 있고(시뮬레이터에서 키를 몰아 보낼 때 재현), 실기기에서 소프트웨어 키보드가 잠깐 내려갔다 올라오는지는 **확인이 필요하다.**

번호 목록·들여쓰기·체크리스트는 만들지 않았다.
