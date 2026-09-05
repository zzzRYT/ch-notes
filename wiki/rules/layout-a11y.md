# RULE-UI — 화면 배치와 접근성

상위 정책: [`POL-A11Y-001`](../policy/POL-ACCESSIBILITY.md)

RN 컴포넌트 테스트 도구가 없으므로 이 계층은 **전부 수동 증거**다. 그래서 대문자 요구(MUST)를 쓰지 않는다 — 증거 없는 강제는 [`README.md` 3절](../README.md)의 규칙 위반이다.

---

## RULE-UI-001 · 900px가 폰과 태블릿을 가른다

```yaml
id: RULE-UI-001
policy: POL-A11Y-001
requirement: SHOULD
statement: 화면 너비 900px 이상이면 3-pane 태블릿 작업공간을, 미만이면 폰 목록·에디터 흐름을 쓴다. 같은 기준으로 성경이 사이드바가 되거나 하단 시트가 된다.
implemented_by:
  - apps/ch-life/app/index.tsx (TABLET_BREAKPOINT)
  - apps/ch-life/src/browser/useResponsiveLayout.ts
verified_by:
  - manual: 태블릿 가로/세로 회전 시 레이아웃 전환
confidence: 기록됨
source:
  - apps/ch-life/CLAUDE.md ("900px가 phone/tablet 분기")
```

**상수가 두 곳에 복제되어 있다** — `app/index.tsx`의 `TABLET_BREAKPOINT`와 `useResponsiveLayout`의 `width >= 900`. 한쪽만 바꾸면 목록은 태블릿인데 성경은 시트로 뜨는 상태가 만들어진다([`drift.md`](../drift.md) B절).

## RULE-UI-002 · 태블릿은 접을 수 있는 3-pane

```yaml
id: RULE-UI-002
policy: POL-A11Y-001
requirement: SHOULD
statement: 태블릿 화면은 노트 목록(280px) / 에디터(가변) / 성경 패널(340px) 세 칸이며, 양쪽 패널은 접어서 얇은 레일로 만들 수 있다.
implemented_by:
  - apps/ch-life/src/workspace/TabletWorkspace.tsx
  - apps/ch-life/src/workspace/PanelRail.tsx
  - apps/ch-life/src/workspace/BiblePanel.tsx
verified_by:
  - manual: 좌우 패널 접기·펼치기
confidence: 기록됨
source:
  - docs/plans/2026-06-07-bible-reader-default-design.md 2절
```

우측 패널은 **성경 / 인용** 두 탭이고 기본은 성경이다. "인용" 탭은 현재 노트의 인용 목록을 보여주며 탭 라벨에 개수 배지가 붙는다.

태블릿에는 폰과 다른 점이 두 가지 있다. 노트를 목록에서 고르면 라우팅 없이 가운데 칸이 바뀌고, 메타 헤더에서 Return을 눌러도 본문으로 포커스가 넘어가지 않는다(`onSubmitLast`를 연결하지 않았다 — [`drift.md`](../drift.md) B절).

## RULE-UI-003 · 폰 성경은 70% 높이 시트, 딤은 화면 전체

```yaml
id: RULE-UI-003
policy: POL-A11Y-001
requirement: SHOULD
statement: 폰에서 에디터의 성경은 화면 높이 70% 하단 시트로 열린다. 어두워지는 배경은 시트와 분리된 레이어로 화면 전체에 균일하게 페이드한다(진입 240ms / 종료 190ms).
implemented_by:
  - apps/ch-life/src/browser/BibleBrowser.tsx
verified_by:
  - manual: 시트 열기·닫기 시 배경이 함께 밀려 올라오지 않는다
confidence: 기록됨
source:
  - 커밋 709691e "fix: 성경 모달 딤 배경을 화면 전체 균일 페이드로 분리"
```

딤과 시트를 하나의 애니메이션 값(0→1)에서 각각 opacity와 translateY로 파생시킨다. 한 덩어리로 슬라이드시키면 배경까지 함께 밀려 올라가는 결함이 있었고, 그것을 고친 결과가 현재 구조다.

닫는 동안에도 모달이 마운트되어 있어야 애니메이션이 보이므로, 별도의 `rendered` 상태로 언마운트를 지연시킨다.

## RULE-UI-004 · 손가락으로 누를 수 있는 크기

```yaml
id: RULE-UI-004
policy: POL-A11Y-001
requirement: SHOULD
statement: 모든 조작 요소는 44~48px 이상의 터치 영역을 갖고, 한국어 accessibilityLabel과 적절한 accessibilityRole을 가진다.
implemented_by:
  - apps/ch-life/src/chrome/HeaderControls.tsx
  - apps/ch-life/app/settings.tsx
  - apps/ch-life/src/browser/VerseList.tsx
  - apps/ch-life/src/list/NoteCard.tsx
verified_by:
  - manual: VoiceOver/TalkBack로 주요 화면 순회
confidence: 기록됨
source:
  - docs/plans/2026-05-17-ch-life-v1-spec.md 6.2
```

작은 아이콘에는 `hitSlop`으로 실제 터치 영역을 넓힌다. 노트 카드는 시각·제목·설교자·생명양식을 한 문장으로 합쳐 읽어 준다.

절 옆 `＋` 버튼은 32px로 이 기준보다 작고 `hitSlop={8}`로 보완한다 — 기준선상의 예외다.

## RULE-UI-005 · 색만으로 의미를 전달하지 않는다

```yaml
id: RULE-UI-005
policy: POL-A11Y-001
requirement: SHOULD
statement: 인용 블록은 색 막대나 배경만이 아니라 참조 라벨을 항상 함께 표시한다. 선택 상태도 색과 함께 체크 표시나 accessibilityState로 전달한다.
implemented_by:
  - apps/ch-life/src/editor/QuoteBlock.tsx
  - apps/ch-life/app/settings.tsx
verified_by:
  - manual: 흑백 모드에서 인용 블록과 선택 상태를 구분할 수 있다
confidence: 기록됨
source:
  - docs/plans/2026-05-17-ch-life-v1-spec.md 6.2
```

세 가지 인용 표시 변형 모두 참조 라벨을 머리글로 갖는다. 설정 화면의 변형 선택은 테두리 색 + `✓` 문자 + `accessibilityState.selected` 세 가지로 중복 전달한다.

## RULE-UI-006 · 헤더는 앱이 직접 그린다

```yaml
id: RULE-UI-006
policy: POL-A11Y-001
requirement: SHOULD
statement: 네이티브 스택 헤더는 앱 전체에서 숨기고, 화면마다 공통 AppHeader 컴포넌트로 직접 그린다.
implemented_by:
  - apps/ch-life/app/_layout.tsx
  - apps/ch-life/src/chrome/AppHeader.tsx
verified_by:
  - manual: 모든 화면의 헤더 모양·글자 크기가 동일하다
confidence: 코드추론
```

글꼴 배율과 변형 팔레트를 헤더에도 적용하려면 네이티브 헤더로는 부족하다. 대신 iOS 기본 스와이프 뒤로가기 같은 플랫폼 관습은 직접 유지해야 한다.
