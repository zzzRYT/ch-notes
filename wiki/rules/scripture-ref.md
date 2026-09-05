# RULE-REF — 성경 참조 해석과 본문 조회

상위 정책: [`POL-SCRIPTURE-001`](../policy/POL-SCRIPTURE.md)

이 계층은 **문자열 → 구조화된 참조 → 본문**의 순수 변환이다. UI도 DB도 네트워크도 관여하지 않으며, 앱에서 자동 증거가 가장 촘촘한 영역이다.

```text
"골 3:20"  ─parseRef→  {book:"Col", chapter:3, verse:20, end:null}  ─lookupVerses→  Verse[]
                                                                    └formatRef→  "골로새서 3:20"
```

---

## RULE-REF-001 · 참조 문법

```yaml
id: RULE-REF-001
policy: POL-SCRIPTURE-001
requirement: MUST
statement: 참조는 "책 장:절" 또는 "책 장:절-끝절" 형태만 인식한다. 책과 장 사이 공백은 있어도 없어도 되고, 장·절은 각각 1~3자리 숫자다.
implemented_by:
  - apps/ch-life/src/parser/ref-parser.ts
verified_by:
  - test: apps/ch-life/src/parser/__tests__/ref-parser.test.ts
confidence: 코드추론
```

책 토큰은 **한글 1~8자** 또는 **영문 1~21자(공백 포함)** 다. 영문 토큰은 `[A-Za-z]`로 시작해야 하므로 **숫자로 시작하는 영어 책 이름은 이 문법에 들어오지 못한다** — 아래 `RULE-REF-002` 경고 참조. 범위 구분자는 하이픈뿐 아니라 `~`, en-dash, 물결표, 전각 물결표(`- ~ – 〜 ～`)를 모두 받는다 — 한국어 키보드와 CJK 텍스트에서 실제로 섞여 나오는 문자들이기 때문이다(코드 주석에 명시). 붙여넣기를 고려해 구분자 주변 공백도 허용한다.

`parseRef`는 **의미 검증을 하지 않는다.** `end < verse`인 `골 3:20-5`도 파싱 자체는 성공하고, 걸러내는 것은 본문 조회의 몫이다([`RULE-REF-003`](#rule-ref-003--본문-조회는-전량-로컬)).

## RULE-REF-002 · 책 이름 별칭

```yaml
id: RULE-REF-002
policy: POL-SCRIPTURE-001
requirement: MUST
statement: 66권 각각에 대해 한국어 정식명·한국어 축약·영어 정식명·영어 축약을 모두 같은 책 코드로 해석한다.
implemented_by:
  - apps/ch-life/src/parser/book-map.ts
verified_by:
  - test: apps/ch-life/src/parser/__tests__/book-map.test.ts#resolveBookCode — 한국어 정식 66권
  - test: apps/ch-life/src/parser/__tests__/book-map.test.ts#resolveBookCode — 한국어 축약 66권
  - test: apps/ch-life/src/parser/__tests__/book-map.test.ts#resolveBookCode — 영어 정식
  - test: apps/ch-life/src/parser/__tests__/book-map.test.ts#resolveBookCode — 영어 축약
confidence: 기록됨
source:
  - DESIGN.md "자동완성 UX 디테일" (책명 매핑), Success Criteria (66권 × 3형태)
```

`창세기` / `창` / `Genesis` / `Gen` 는 모두 `Gen`이다. 비교 전에 `trim → lowercase → 모든 공백 제거`로 정규화하므로 `1 Samuel`, `1samuel`, `1Sa`가 같게 취급된다.

⚠️ **이 규칙은 `resolveBookCode`에서만 참이고, 파이프라인 전체에서는 아니다.** `parseRef`의 책 토큰 문법(`RULE-REF-001`)이 숫자로 시작하는 문자열을 받지 못하므로, **숫자 접두 영어 이름 17권**(`1Sa 2Sa 1Ki 2Ki 1Ch 2Ch 1Co 2Co 1Th 2Th 1Ti 2Ti 1Pe 2Pe 1Jn 2Jn 3Jn`)은 `parseRef` 단계에서 통째로 실패한다. `book-map.test.ts`는 `resolveBookCode`만 직접 부르므로 이 구멍을 잡지 못하고, `ref-parser.test.ts`에는 해당 케이스가 없다. 한국어 표기는 영향이 없다. → [`drift.md` B11](../drift.md)

각 항목의 **첫 번째 별칭이 정식 한국어 이름**이며, 화면 표시([`RULE-REF-004`](#rule-ref-004--표시용-정식-이름))의 정본이다. 별칭 표에 없는 문자열은 `null` — 추측 매칭이나 오타 교정은 하지 않는다.

계획 문서(`DESIGN.md` P3)는 외부 라이브러리 `bible-passage-reference-parser`에 한국어 어댑터만 붙이는 방식이었으나, 실제 구현은 **의존성 없는 자체 별칭 표**다([`drift.md`](../drift.md)).

## RULE-REF-003 · 본문 조회는 전량 로컬

```yaml
id: RULE-REF-003
policy: POL-SCRIPTURE-001
requirement: MUST
statement: 본문은 번들된 bible.json에서만 조회한다. 범위 중 한 절이라도 없거나 끝 절이 시작 절보다 작으면 부분 결과를 주지 않고 전체를 null로 반환한다.
implemented_by:
  - apps/ch-life/src/parser/verse-lookup.ts
verified_by:
  - test: apps/ch-life/src/parser/__tests__/verse-lookup.test.ts
  - test: apps/ch-life/src/data/__tests__/bible-data.test.ts
confidence: 코드추론
```

조회는 `bible[책][장][절]` 3단 객체 접근이라 O(1)이고 네트워크가 없다. 앱 시작 시 약 5MB의 JSON이 메모리에 상주한다([`CONTRACT-BIBLE-JSON`](../contracts/CONTRACT-BIBLE-JSON.md)).

**전부 아니면 없음(all-or-nothing)** 이 핵심이다. `창 1:30-33`처럼 뒷부분이 존재하지 않는 범위는 앞 세 절만 넣지 않고 통째로 실패한다. 그래야 인용 블록에 잘린 본문이 남지 않는다.

## RULE-REF-004 · 표시용 정식 이름

```yaml
id: RULE-REF-004
policy: POL-SCRIPTURE-001
requirement: MUST
statement: 화면에 보이는 참조 라벨은 축약·영어 입력이라도 정식 한국어 책 이름으로 확장한다. 파싱할 수 없는 문자열은 공백만 정리해 그대로 보여준다.
implemented_by:
  - apps/ch-life/src/parser/format-ref.ts
verified_by:
  - test: apps/ch-life/src/parser/__tests__/format-ref.test.ts
confidence: 코드추론
```

사용자가 `요 3:16`이나 `John 3:16`을 입력해도 인용 블록 머리글은 `요한복음 3:16`이다. 저장되는 원본 문자열은 바꾸지 않고 **표시할 때만** 확장한다 — 그래서 이 함수는 멱등이고, 파싱 실패 시에도 예외 없이 원본을 돌려주어 옛 노트나 외부에서 들어온 자유 형식 참조도 깨지지 않는다.

끝 절이 시작 절과 같으면 범위 표기를 생략한다(`요 3:16-16` → `요한복음 3:16`).

## RULE-REF-005 · 존재하지 않는 참조는 조용히 무시

```yaml
id: RULE-REF-005
policy: POL-SCRIPTURE-001
requirement: MUST NOT
statement: 본문 조회에 실패한 참조는 힌트 칩을 띄우지 않고, 인용 블록도 만들지 않으며, 오류 메시지도 표시하지 않는다.
implemented_by:
  - apps/ch-life/src/editor/useAutocomplete.ts
  - apps/ch-life/src/editor/NoteEditor.tsx
verified_by:
  - test: apps/ch-life/src/editor/__tests__/useAutocomplete.test.ts#데드 ref (존재하지 않는 절)도 null — 칩 안 뜸 정책
confidence: 기록됨
source:
  - DESIGN.md "자동완성 UX 디테일" (데드 ref)
  - docs/plans/2026-05-17-ch-life-v1-spec.md 3.1 (칩 자체가 안 뜸 — 조용한 실패)
```

`골 99:99`를 치면 아무 일도 일어나지 않고, 사용자가 친 글자는 그대로 문단에 남는다. 설교 중에 앱이 사용자를 멈춰 세우지 않는다는 것이 이 규칙의 목적이다.

부작용: 사용자는 왜 인용이 안 들어갔는지 알 수 없다. 오타(`고전 1:1`을 `고전1;1`로)와 실제 부재를 구분해 주지 않는다. 이는 인지하고 받아들인 선택이다.

주의: 이 규칙은 v1 spec 3.2의 "Error 상태 인용 블록(빨간 좌측 바 + 본문을 찾을 수 없습니다)"과 상충한다. 렌더러에는 그 상태가 남아 있지만 **도달할 수 없다**([`RULE-EDIT-007`](editor-insert.md)).
