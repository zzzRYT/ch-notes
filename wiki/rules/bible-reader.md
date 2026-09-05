# RULE-BIBLE — 성경 리더와 인용 삽입 진입점

상위 정책: [`POL-SCRIPTURE-002`](../policy/POL-SCRIPTURE.md), [`POL-SCRIPTURE-001`](../policy/POL-SCRIPTURE.md)(RULE-BIBLE-006)

리더는 **하나의 컴포넌트(`BibleReader`)가 세 진입점에 재사용**되는 구조다. 진입점이 다르면 삽입 동작만 달라지고 탐색·검색·위치 기억은 동일하다.

```text
BibleReader ─┬─ app/bible.tsx           (홈 → 전체화면, insertMode="none")
             ├─ BibleBrowser            (에디터 → 모달/사이드바, "currentNote")
             └─ BiblePanel "성경" 탭     (태블릿 우측 패널, "currentNote")
```

---

## RULE-BIBLE-001 · 3단 탐색

```yaml
id: RULE-BIBLE-001
policy: POL-SCRIPTURE-002
requirement: SHOULD
statement: 성경은 책 목록 → 장 그리드 → 절 목록 3단으로 탐색한다. 책 목록은 구약/신약 세그먼트로 나뉘고, 리더 안의 "뒤로"는 한 단계씩 거슬러 올라간다.
implemented_by:
  - apps/ch-life/src/browser/BibleReader.tsx
  - apps/ch-life/src/browser/ChapterGrid.tsx
  - apps/ch-life/src/browser/VerseList.tsx
verified_by:
  - test: apps/ch-life/src/browser/__tests__/books-meta.test.ts#구약 39권 / 신약 27권
  - manual: 책 → 장 → 절 → 뒤로 이동
confidence: 기록됨
source:
  - docs/plans/2026-05-17-ch-life-v1-spec.md 4.2
```

구약 39권·신약 27권의 순서와 한국어 이름은 `books-meta.ts`가 정본이며, 장·절 수는 `bible.json`에서 계산한다(하드코딩하지 않는다).

리더 안의 "← 뒤로"와 화면 헤더의 "←"는 다른 것이다. 앞은 탐색 단계, 뒤는 화면 이탈이다.

## RULE-BIBLE-002 · 검색 입력 해석

```yaml
id: RULE-BIBLE-002
policy: POL-SCRIPTURE-002
requirement: MUST
statement: 성경 검색창은 "골"(책) / "골 3"(장) / "골 3:20"(절) 세 가지를 구분해 해당 단계로 바로 이동한다. 영어 책 이름도 같게 동작한다.
implemented_by:
  - apps/ch-life/src/browser/browser-search.ts
  - apps/ch-life/src/browser/level-from-ref.ts
verified_by:
  - test: apps/ch-life/src/browser/__tests__/browser-search.test.ts
  - test: apps/ch-life/src/browser/__tests__/level-from-ref.test.ts
confidence: 코드추론
```

본문 자동완성의 참조 문법([`RULE-REF-001`](scripture-ref.md))과 **다른 문법**이다. 이쪽은 장·절이 선택적이고 범위를 받지 않는다. 책 이름 해석만 `book-map`을 공유한다.

절까지 입력해도 이동 단위는 장이다 — 절 목록으로 가지만 해당 절로 스크롤하거나 강조하지는 않는다(v1 spec 4.4의 계획분 미구현).

## RULE-BIBLE-003 · 읽던 위치는 책·장까지 전역 하나

```yaml
id: RULE-BIBLE-003
policy: POL-SCRIPTURE-002
requirement: MUST
statement: 마지막으로 본 책과 장을 settings.lastBibleRef에 "Gen 1" 형태로 저장하고, 다음에 리더를 열면 그 장부터 시작한다. 절 스크롤 위치는 저장하지 않는다.
implemented_by:
  - apps/ch-life/src/browser/useBiblePosition.ts
  - apps/ch-life/src/state/settings-validator.ts
verified_by:
  - test: apps/ch-life/src/browser/__tests__/level-from-ref.test.ts
  - test: apps/ch-life/src/state/__tests__/settings-validator.test.ts#lastBibleRef
confidence: 기록됨
source:
  - docs/plans/2026-06-07-bible-reader-default-design.md 5절
```

위치는 **전역 하나**다. 홈 전체화면, 에디터 모달, 태블릿 패널이 같은 값을 공유한다. 저장 실패나 값 손상 시에는 책 목록부터 시작한다.

이 필드는 `settings.json` 파싱에서 **관대하게** 처리한다 — 값이 없거나 타입이 틀려도 파일 전체를 버리지 않고 `null`로 떨어진다. 구버전 설정 파일이 통째로 날아가는 회귀를 막기 위한 명시적 설계다([`RULE-SET-002`](settings-theme.md)).

## RULE-BIBLE-004 · 진입점마다 삽입 동작이 다르다

```yaml
id: RULE-BIBLE-004
policy: POL-SCRIPTURE-002
requirement: SHOULD
statement: 홈에서 연 성경은 읽기 전용이라 삽입 버튼을 렌더하지 않는다. 에디터 모달과 태블릿 패널에서만 절 옆 ＋ 버튼으로 현재 노트에 인용을 넣는다.
implemented_by:
  - apps/ch-life/app/bible.tsx (insertMode="none")
  - apps/ch-life/src/browser/VerseList.tsx (InsertMode)
  - apps/ch-life/src/workspace/BiblePanel.tsx
verified_by:
  - manual: 홈 → 성경에는 ＋ 없음 / 에디터 → 성경 모달에는 ＋ 있음
confidence: 기록됨
source:
  - docs/plans/2026-06-07-bible-reader-entrypoints-design.md
```

이 배치는 **선행 설계를 의도적으로 뒤집은 것**이다. 원래는 홈에서 절을 담으면 새 노트를 만들어 넣는 흐름이었으나, 홈 성경을 순수 읽기로 정리했다([`ADR-0011`](../decisions/ADR-0011-bible-entrypoints.md)). 덕분에 "성경만 읽었는데 빈 노트가 생기는" 부작용도 사라졌다.

`newNote` 모드는 타입에 남아 있지만 현재 어떤 화면도 쓰지 않는다(버튼 라벨만 달라지는 사문).

## RULE-BIBLE-005 · 장 이동은 실제 장 수 안에서만

```yaml
id: RULE-BIBLE-005
policy: POL-SCRIPTURE-002
requirement: MUST
statement: 이전/다음 장 버튼은 1장과 마지막 장에서 비활성화된다. 장 수는 bible.json에서 계산한다.
implemented_by:
  - apps/ch-life/src/browser/books-meta.ts (chapterCount)
  - apps/ch-life/src/browser/VerseList.tsx
verified_by:
  - test: apps/ch-life/src/browser/__tests__/books-meta.test.ts
confidence: 코드추론
```

책 경계를 넘어 다음 책으로 이어지지는 않는다(요한복음 21장 다음은 사도행전이 아니라 막다른 곳).

데이터에 없는 장으로 들어가면 빈 목록 대신 `{책} {장}장 본문이 아직 없습니다`를 보여준다.

## RULE-BIBLE-006 · 브라우저 삽입은 정식 한국어 표기의 단절

```yaml
id: RULE-BIBLE-006
policy: POL-SCRIPTURE-001
requirement: SHOULD
statement: 절 옆 ＋로 넣는 인용의 참조 문자열은 "{정식한국어책명} {장}:{절}" 이며 언제나 한 절이다. 범위 인용은 이 경로로 만들 수 없다.
implemented_by:
  - apps/ch-life/src/browser/VerseList.tsx
verified_by:
  - manual: 성경 리더에서 ＋로 한 절을 넣고 저장된 인용 참조 문자열을 확인
confidence: 코드추론
```

⚠️ **자동 증거가 없다.** 전에는 `format-ref.test.ts`를 증거로 달아 두었으나, `VerseList.tsx`는 `formatRef`를 **import하지 않고** `${nameKo} ${chapter}:${item.num}`으로 직접 문자열을 만든다. 그 테스트는 이 코드를 한 줄도 지나지 않는다. 이름만 그럴듯한 증거였으므로 떼고 `SHOULD`로 낮췄다 → [`drift.md` C7](../drift.md).

이 경로로 만든 참조는 본문 자동완성이 만든 참조와 표기가 다르며, 그 차이가 검색 결과에 그대로 드러난다([`RULE-SEARCH-005`](search.md)).

삽입 위치는 커서 자리가 아니라 **본문 맨 끝**이다(인용 + 빈 문단을 덧붙인다). v1 spec 4.3의 "현재 커서 위치 삽입"은 구현되지 않았다.

## RULE-BIBLE-007 · 삽입해도 리더는 닫히지 않는다

```yaml
id: RULE-BIBLE-007
policy: POL-SCRIPTURE-002
requirement: SHOULD
statement: 절을 노트에 담아도 시트·사이드바·패널은 열린 상태를 유지해 연속으로 여러 절을 담을 수 있다.
implemented_by:
  - apps/ch-life/src/browser/BibleBrowser.tsx
  - apps/ch-life/src/workspace/BiblePanel.tsx
verified_by:
  - manual: 절 두 개를 연속으로 담아도 시트가 유지된다
confidence: 기록됨
source:
  - docs/plans/2026-05-17-ch-life-v1-spec.md 4.3
```

토스트로 "추가됨"을 알리는 계획(v1 spec 4.3)은 구현되지 않았다. 삽입 피드백은 **노트 본문이 실제로 늘어나는 것** 뿐이며, 모달이 노트를 가리고 있는 폰에서는 담긴 것이 보이지 않는다.
