# 컴포넌트 로드맵 — shadcn·TDS 참조와 화면 감사 (2026-09-06)

기존 조사는 [`2026-09-06-token-and-component-survey.md`](2026-09-06-token-and-component-survey.md).
파일 구조 결정은 [`ADR-0017`](../../wiki/decisions/ADR-0017-figma-design-system-structure.md).

## 0. 다섯 줄 요약

1. **가장 큰 결함은 새 컴포넌트가 없는 것이 아니라 `⚠️ 제안` 표시가 배선되어 있지 않았던 것이다.** `isProposal`은 주석 두 줄에만 있었고 코드가 읽는 키가 아니었다 — 근거 없는 변형 **13개**가 그 사각지대에서 조용히 쌓였다(새로 들어온 둘까지 지금은 15개).
2. **컴포넌트를 지웠다 다시 만들고 있었다.** 실행할 때마다 노드 id가 바뀌어 배치된 인스턴스가 끊긴다. Figma가 정본인 이상 치명적이라 **이름으로 찾아 내용만 갈아 끼우는** 방식으로 바꿨다(18/18 유지, 스텁이 대조).
3. **후보 8건 중 7건이 반박을 통과했다** — `AppNavBar` · `ActionBanner` · `AlertDialog` · `Checkbox`, 그리고 기존 3종의 개선. 이 중 **`ActionBanner`와 `Checkbox`는 이번에 Figma 파일에 실제로 들어갔고**, 그와 동시에 등급 접두사 체계가 처음으로 실행됐다(§2).
4. **`ListRow` 통합은 기각됐다.** 네 화면의 행이 같은 물건이 아니다 — `VerseList`의 행은 애초에 `Pressable`이 아니다.
5. **참조는 패턴만 빌린다.** TDS는 지적재산이 Toss에 있고 Apps in Toss 안에서만 쓸 수 있어 **값·색·에셋을 옮기지 않았다.**

## 1. 참조를 어떻게 썼나

| | 쓴 것 | 쓰지 않은 것 |
|---|---|---|
| **TDS** (11종) | 해부 구조와 패턴의 이름 — "ListRow란 무엇인가", "BottomCTA가 푸는 문제" | 수치·색·에셋 일체. IP가 Toss에 있고 사용이 Apps in Toss로 제한된다 |
| **shadcn/ui** (64종) | 컴포넌트가 다루는 상태의 목록, 이름 관례 | 웹/Tailwind 구현. hover 전제 컴포넌트는 애초에 후보가 아니다 |

세 관문을 순서대로 통과한 것만 남겼다.

1. **ch-life의 어느 화면이 이걸 필요로 하는가** — 화면을 대지 못하면 탈락. 카탈로그 수입이 아니라 걸러내기다.
2. **React Native로 만들 수 있는가** — hover·우클릭에 기대면 탈락.
3. **어르신 UX와 RULE-UI-004·005를 지킬 수 있는가.**

## 2. 통과한 것

### 새로 만들 것

| 이름 | 층위 | 등급 | 상태 | 화면 | 왜 |
|---|---|---|---|---|---|
| `ActionBanner` | Molecule | proposed | **이번에 들어감** | `app/_layout.tsx:57`(전역) · `src/browser/BibleBrowser.tsx:99`(passive) | 삭제 실행취소·구절 삽입 안내. `drift.md` G1이 "정본화 안 된 구현"으로 이미 지목 |
| `Checkbox` | Atom | planned | **이번에 들어감** | `todo` 블록 — 타입·마크다운 계약엔 있으나 화면에 없다 | B28의 시각적 절반. 만들지 않으면 할 일 목록이 계속 문단으로 보인다 |
| `AppNavBar` | Organism | proposed | 다음 회차 | 화면 5개가 `src/chrome/AppHeader.tsx` 하나를 렌더 | `RULE-UI-006`("헤더는 앱이 직접 그린다")이 이미 정본화한 구조인데 Figma에 없다 |
| `AlertDialog` | Organism | planned | 다음 회차 | `use-note-import.ts:11-27`(3버튼 destructive) 외 4곳 | 지금은 전부 네이티브 `Alert.alert`라 **앱의 `fontScale`·테마 4종 밖에 있다** |

**이번에 둘만 넣은 이유는 등급 체계가 실행된 적이 없었기 때문이다.** `Proposed/`·`Planned/` 접두사, 승격 시 이름만 바뀌는 경로, `planned`→`reference` 요구 — 전부 코드로만 존재하고 어떤 사양도 `status`를 갖고 있지 않아 **한 번도 실행되지 않은 분기**였다. `ActionBanner`(proposed)와 `Checkbox`(planned)가 각 경로를 하나씩 통과시킨다. 스텁이 이제 `Proposed/ActionBanner` → `ActionBanner` → 다시 `Proposed/ActionBanner` 를 왕복시키며 **id가 유지되는지** 잰다 — `ADR-0017`이 "승격해도 인스턴스가 끊기지 않는다"고 단언하면서 재는 것이 없던 자리다.

`AppNavBar`는 하위 부품 4개(뒤로·제목·행동·구분선)를 먼저 정해야 하고 `AlertDialog`는 기존 세트 둘(`ModalSheet`·`ModalFooterTextButton`)을 합성하는 구조라, 둘 다 이번 회차에 끼워 넣기에는 실제 작업이다. §6에 다음 회차로 적어 둔다.

`ActionBanner`는 이미 출시돼 두 화면에서 쓰인다 — 등급 정의상 `code`에 가깝다. `proposed`로 둔 이유가 둘이다. ⑴ 코드에서 배너는 `ActionBannerHost` 안의 인라인 JSX라 **재사용 가능한 컴포넌트로 추출돼 있지 않다.** ⑵ [`E14`](../../wiki/drift.md)(구절 삽입 성공에 배너를 띄우는 것이 `POL-A11Y-001`의 '조용함'을 의도적으로 완화한 것인가)가 미해결이다. 값은 전부 실측이다 — `minHeight 48` · `radius 12` · `padding 16·8·10` · `gap 12`(`ActionBannerHost.tsx:86-111`), 실행 취소 버튼 `minHeight 40` + `hitSlop 8` = 실효 56px로 `RULE-UI-004` 충족. ⚠️ 메시지·버튼 글자가 둘 다 `scaled()`를 거치지 않고(B27) 자동 소멸 시간도 고정이라, **글자를 키운 사용자에게 읽을 시간이 더 주어지지 않는다.**

`Checkbox`는 상자를 아이콘이 아니라 글자(`[ ]` / `[x]`)로 그렸다. `icons.js`에는 앱이 실제로 `import`하는 9개만 있고 `Square`·`CheckSquare`는 없다 — **없는 벡터를 지어내는 대신 마크다운 계약이 고정한 토큰(`CONTRACT-MD-NOTE.md:51`)을 그대로 보여 준다.** 체크 표시가 색이 아니라 글리프로 바뀌므로 `RULE-UI-005`(색만으로 뜻을 전하지 않는다)를 처음부터 지킨다.

### 기존 것 개선

| 대상 | 무엇이 틀렸나 | 근거 |
|---|---|---|
| `ModalFooterTextButton` | `base.minHeight: 44`인데 자기 `a11y` 프로즈는 "41~43px, 미달"이라고 말한다 — **사양이 스스로와 모순**이었다 | `components.js` · `DatePickerModal.tsx:204` |
| `IconButtonSquare` | `Selected`는 `dateBtn`의 **평상시 모습**을 잘못 이름 붙인 것. 실제로 있는 `40+Destructive`는 없고 근거 없는 `44+Destructive`만 있었다 | `SermonMetaHeader.tsx:162-181` · `TabletWorkspace.tsx:359-366` |
| `NavRow` | `Error` 변형에 근거가 없다 — `settings.tsx:272-306`의 세 행은 전부 정적이다 | 위와 같음 |

`ModalFooterTextButton`은 `minHeight`를 걷어내 **실측 그대로 41px에 그려지게** 했다. 사양이 44라고 말하면 미달인 버튼을 고쳐야 한다는 사실 자체가 보이지 않는다 — `CalendarDayCell`에서 이미 내린 것과 같은 판단이다. `HeaderTextButton`(`HeaderControls.tsx:81-105`)이 같은 물건인데 `scaled()`도 `hitSlop`도 있어 더 낫다. 셋을 합칠 때는 **이쪽이 정본**이다.

### 근거 없는 변형 15개 — 이제 표시된다

`SectionLabel/Error` · `NavRow/Error` · `IconButtonSquare/40 Selected` · `IconButtonSquare/44 Destructive` · `CountBadge/Error` · `ModalFooterTextButton/Error` · `FieldLabel/Active` · `InlineErrorBanner/Retrying` · `TextInputField/Focus`×3 · `CalendarDayCell/Pressed` · `CalendarDayCell/Disabled` · `ActionBanner/Error+Undo` · `Checkbox/Disabled`

각각 `proposed: true`와 **왜 근거가 없는지**를 달았다. Figma에서는 섹션 캡션과 변형별 description에 뜬다.
컴포넌트 안에 배지를 넣지 않은 이유는 그러면 **인스턴스마다 배지가 따라붙기** 때문이다.

⚠️ 이 15개는 이번 조사가 짚은 것이고 **전수 감사는 아니다.** 변형 71개 전부에 대해 코드 근거를 대조하는 일이 남아 있다.

## 3. 기각한 것

**`ListRow` 통합 — 기각.** 네 화면(`NoteCard` · `NoteListSidebar` · `BibleReader` BookRow · `VerseList`)을 하나로 묶자는 제안이었으나, `VerseList.tsx:84-107`의 행은 `Pressable`이 아니라 `View`다 — `onPress`도 행 단위 `accessibilityRole`도 없다. "정적 본문 + 인라인 액션 버튼"이라 나머지 셋과 계약이 다르다. 세 개짜리 통합은 다음 라운드에 다시 볼 수 있다.

**`VerseList` 비활성 상태의 `accessibilityState` 누락 — 사실이 아니다.** 검증자가 "opacity만으로 비활성을 표시해 `RULE-UI-005` 소지"라고 보고했으나, React Native의 `Pressable`이 `disabled`를 `accessibilityState`에 **자동 병합한다**(`Pressable.js:228-229`). 스크린리더에 정상 전달된다. `drift.md`에 넣지 않았다.

**화면 근거가 없어 뺀 것** — `Tooltip`·`Popover`·`HoverCard`·`ContextMenu`·`DropdownMenu`(hover/long-press 전제) · `Kbd`([`ADR-0015`](../../wiki/decisions/ADR-0015-no-keyboard-shortcuts.md)가 단축키 자체를 안 쓰기로 함) · `Table`·`Avatar`·`Carousel`·`Switch`·`Slider`(대응 화면·데이터 없음) · `BottomCTA`(`position:absolute` + `bottom:0` 조합이 코드에 없다) · `Badge`(`CountBadge`가 덮고, `Note`에 상태·분류 필드가 없다) · `Skeleton`·`Spinner`(유일한 후보인 `QuoteBlock` loading은 `RULE-EDIT-007`상 도달하지 않는 죽은 경로).

## 4. 순서 — Figma가 먼저 나가면 안 된다

버튼 4종(`PrimaryPillButton`·`ModalFooterTextButton`·`IconButtonSquare`·`FabButton`) 통합은 매력적이지만, **Figma 이름을 먼저 합치면 배치된 인스턴스가 끊긴다.**

1. RN에 실제 공유 컴포넌트를 뽑는다 — 지금 이 넷은 각 파일에 흩어진 `Pressable`+`StyleSheet` 리터럴 9곳 이상이다.
2. 호출부를 전부 그 컴포넌트로 바꾼다.
3. **그 다음에** Figma 컴포넌트를 합치고 구버전을 뗀다.

같은 이유로 `ModalSheet` 개명(실제로는 중앙 정렬 다이얼로그다)도 코드가 먼저다.

## 5. 그림자 UI 계층 — 뽑을 때 같이 고쳐야 한다

`src/browser/{BibleBrowser,BibleReader,ChapterGrid,VerseList}.tsx`와 `src/list/SwipeToDelete.tsx`는 `useTheme`·`scaled`를 **아예 쓰지 않는다**([`drift.md`](../../wiki/drift.md) B9). 여기서 컴포넌트를 뽑을 때 하드코딩 hex를 그대로 Figma에 옮기면 **다크 변형에서만 밝게 뜨는 문제가 사양에 박제된다.** 추출과 동시에 토큰·`scaled()`로 바꾸는 작업을 함께 잡아야 한다.

## 6. 남은 것

**다음 회차에 만들 것 (이번에 뺀 둘)**

- `AppNavBar` — Organism. 하위 부품 4개(뒤로 버튼 · 제목 · 행동 슬롯 · 구분선)를 먼저 Atom으로 확정해야 한다. `HeaderControls.tsx`의 `HeaderTextButton`이 `ModalFooterTextButton`과 같은 물건이라 §2의 통합 결정과 순서를 맞춰야 한다.
- `AlertDialog` — Organism. 기존 `ModalSheet` + `ModalFooterTextButton` 인스턴스를 합성하는 구조라 `CalendarMonth`와 같은 절차적 조립이 필요하다. 지금은 전부 네이티브 `Alert.alert`이므로 만드는 순간 **RN 쪽 교체 작업이 딸려 온다**(§4의 순서 규칙 적용 대상).

**그 밖에**

- 변형 71개 전수 근거 감사 (이번엔 15개만)
- 세 개짜리 `ListRow` 통합 재검토 (`VerseList` 제외)
- `sources` 커버리지 공백 — 예: `TextInputField`가 `BibleReader.tsx:117-129`의 네 번째 검색창을 담고 있지 않다
- 코드↔Figma 동기화를 무엇으로 잡을지([`E21`](../../wiki/drift.md))
