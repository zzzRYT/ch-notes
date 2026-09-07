# 디자인 시스템 조사 — Figma 토큰과 공통 UI 컴포넌트

> 대상: [이슈 #22](https://github.com/zzzRYT/ch-life/issues/22) **1단계 조사**
> 일자: 2026-09-06 · 브랜치: `zzzRYT/docs-design-system-issue`
> Figma 파일: [씀씀 (ch-life) — Design System](https://www.figma.com/design/B0XJR0LWclRVWYN3DZ8lJD) (`MA6-main` 팀, free)
> 범위: 코드 조사 + Figma 실행 가능성 실측(§11-3). 컴포넌트·토큰 생성은 아직 시작하지 않았다.

조사 대상은 `apps/ch-life/{app,src}`의 `.tsx` 27개 파일(5,498줄)과 `wiki/`의 관련 정본
(POL-A11Y-001, RULE-UI-001~006, RULE-SET-001~006, CONTRACT-SETTINGS-FILE, ADR-0010, ADR-0015)이다.
모든 수치는 grep 전수 집계이며 file:line 근거를 붙였다. 근거가 없는 판단은 `확인필요`로 표시했다.

---

## 0. 다섯 줄 요약

1. **토큰 자체는 이미 코드 안에 있다.** `ThemeProvider.tsx`의 4개 팔레트가 사실상의 토큰 정본이고, 그중
   `surface`·`text`·`line`·`quoteBar` 4개 레거시 필드는 4개 팔레트 전부에서 `paper`·`ink`·`rule`·`ink4`와
   **바이트 단위로 동일**하다 — 순수 개명으로 지울 수 있다.
2. **토큰이 닿지 않는 구멍이 크다.** `useTheme` 미사용 5파일, `scaled()` 미적용 fontSize 70/98건,
   `fontFamily` 실제 적용 4/98건. 설정 화면 자신도 글자 크기 설정을 따르지 않는다.
3. **`fontFamily` 축은 지금 구조로는 원천 무효다.** RN의 `fontFamily`는 CSS 폰트 스택 콤마 문법을 받지 않는데
   `fontStackFor()`는 `"Pretendard, -apple-system, ..."`을 반환한다. 폰트 파일을 로드해도 안 고쳐진다.
4. **공통 컴포넌트 후보는 10개**가 적대적 검증을 통과했다(15개 중 5개 기각). 6상태 중 **`눌림` 피드백은
   저장소 전체에서 단 1곳**(`SermonMetaHeader.tsx:167`)에만 있고, `비활성`은 두 가지 상반된 방식이 공존한다.
5. **Figma 쪽 최대 제약은 요금제다.** 개인 팀 "이재진의 팀"은 Starter라 **4테마를 Variables 모드로 표현할 수
   없다**(Variables 기능 자체의 가부는 `확인필요` — §6-1). Variables REST API는 Enterprise 전용이라
   어느 팀에서도 자동 동기화 파이프라인은 불가능하다.

---

## 1. 현행 색상 토큰 — 두 세대의 실제 관계

`ThemeProvider.tsx`의 `ThemeColors`는 20개 필드다. `wiki/drift.md` B9는 "구·신 토큰 공존"이라고만
적었으나, 실제 관계는 셋으로 갈린다.

### 1-1. 완전 중복 — 개명만 하면 되는 4개

4개 팔레트 **전부**에서 값이 동일하다(스크립트 대조 완료).

| 레거시 필드 | 신 토큰 | minimal | paper | focus | dark |
|---|---|:-:|:-:|:-:|:-:|
| `surface` | `paper` | 동일 | 동일 | 동일 | 동일 |
| `text` | `ink` | 동일 | 동일 | 동일 | 동일 |
| `line` | `rule` | 동일 | 동일 | 동일 | 동일 |
| `quoteBar` | `ink4` | 동일 | 동일 | 동일 | 동일 |

→ 토큰 체계에서 **삭제 대상**. 소비처 치환만 하면 되고 시각 변화가 없다.

### 1-2. 값이 실제로 다른 것 — 살려야 하는 의미 토큰

| 필드 | 관계 | 실제 값 |
|---|---|---|
| `bg` vs `paper` | focus만 동일(`#ffffff`), 나머지 3개는 다르다 | 캔버스(`#fafaf7`/`#f7f3ec`/`#ffffff`/`#0e0d0c`) vs 카드 표면 |
| `subtle` vs `ink2` | **4개 전부 다르다** (0.55/0.6 · 0.6/0.68 · 0.5/0.55 · 0.6/0.66) | `subtle`이 미세하게 더 연하다 |
| `chipText` vs `ink2` | minimal·focus는 동일, paper·dark는 다르다 | 규칙성 없음 — 의도인지 표류인지 `확인필요` |
| `chipBg` | 대응 신 토큰 없음 | ink 알파 0.05~0.06 |
| `accentText` | 대응 신 토큰 없음 | accent 위 대비색 |

### 1-3. 오류 색 — dark만 규칙이 다르다

| | minimal | paper | focus | dark |
|---|---|---|---|---|
| `errBar` | `#c8342a` | `#9a3823` | `#c8342a` | `#ff6b6b` |
| `errText` | `#c8342a` | `#9a3823` | `#c8342a` | **`#ff8b80`** ← 유일하게 `errBar`와 다르다 |
| `errBg` | `#fde2e1`(solid) | `rgba(154,56,35,0.12)`(**알파**) | `#fde2e1`(solid) | `#3a1716`(solid) |

paper만 알파, dark만 bar/text 분리. **오류 표면이 "solid 색"인지 "ink 위 알파"인지 의미 규칙을 먼저 정해야**
Figma에 넣을 수 있다.

### 1-4. `accentSoft` 파생 규칙이 두 개다

변형 내장값은 8/9/8/**14**%인데, 사용자가 강조색을 직접 고르면 `softenAccent()`가 **항상 8%**를 쓴다
(`ThemeProvider.tsx:171-179`). dark에서 강조색을 고르면 기본값보다 눈에 띄게 옅어진다.

---

## 2. 타이포그래피 census

`fontSize` 98건(`scaled()` 28 / 고정 70), `fontWeight` 58건, `lineHeight` 10건, `letterSpacing` 13건.

### 2-1. 크기 분포 — 상위 6개 값이 84%를 차지한다

| base(px) | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 20 | 22 | 24 | 28 | 30 |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| 건수 | 3 | 12 | 11 | **16** | **15** | **14** | **11** | 3 | 6 | 2 | 2 | 1 | 1 | 1 |

`{13,14,15,11,16,12}` 6개 값이 82/98건. **6단계 역할 스케일로 수렴 가능**하다.

### 2-2. 제안 타입 스케일

| 역할 | base | ×1.2(기본) | ×1.6(최대) | lineHeight 비율 | 현재 매핑 |
|---|--:|--:|--:|--:|---|
| `display` | 30 | 36 | 48 | 1.2 | 홈 화면 제목 |
| `title` | 20 | 24 | 32 | 1.3 | 그룹 헤더·패널 제목 |
| `bodyLarge` | 17 | 20 | 27 | 1.6 | 노트 카드 제목·본문 에디터 |
| `body` | 15 | 18 | 24 | 1.6 | 인용 본문·설정 라벨 |
| `label` | 13 | 16 | 21 | 1.4 | 메타·칩·부제 |
| `caption` | 11 | 13 | 18 | 1.4 | 배지·eyebrow |

`bodyLarge`·`body`의 `lineHeight` 1.6은 현행 코드값(`ParagraphInput` 1.625, `QuoteBlock` 1.6)을 승계한 것이다.
**`display` 1.2 · `title` 1.3 · `label`/`caption` 1.4는 근거 없는 제안값이다**(`확인필요`) — census 결과
이 네 단계에 해당하는 자리에는 `lineHeight` 지정이 아예 없어 승계할 현행 값이 존재하지 않는다.
**아이콘 글리프 fontSize 16건은 이 스케일에서 제외**한다 — 별도 `icon.size` 축이다(§4).

### 2-3. 굵기·자간

- `fontWeight` 6종 중 `"600"`이 40/58건(69%). **`400`/`600`/`700` 3단계로 95% 이상 커버**된다.
  `300`(1건)·`500`(7건)·`800`(2건)은 예외 검토 대상.
- `letterSpacing` 13건 전부 손으로 적은 리터럴. **같은 eyebrow 라벨인데 3곳은 `0.6`, `NoteListSidebar`만
  `0.4`** — 공유 토큰이 없어 이미 표류했다(`NoteListSidebar.tsx:274`).

### 2-4. ⚠️ `fontFamily` 축은 지금 구조로 작동할 수 없다

- RN 공식 문서: `fontFamily only accepts a single font name rather than a fallback list.`
- `fontStackFor()`는 `"Pretendard, -apple-system, system-ui, sans-serif"`를 반환한다
  (`ThemeProvider.tsx:158-167`) → RN은 이를 **존재하지 않는 폰트 하나**로 취급해 조용히 시스템 폰트로 대체한다.
- 폰트 파일(`.ttf`/`.otf`)이 저장소에 0개이고 `useFonts`/`Font.loadAsync` 호출도 0건이다.
  (`expo-font` 패키지 자체는 `expo@54`의 의존성으로 존재한다.)
- 게다가 `fontStack`이 실제로 `style`에 꽂히는 곳은 **98곳 중 4곳**뿐이다
  (`ParagraphInput:192`, `QuoteBlock:108`, `SermonMetaHeader:106`, `DatePickerModal:63`).
- 웹(react-native-web)에서는 CSS 문법이 그대로 동작해 제네릭 `serif`/`monospace` 차이는 난다 — **네이티브와
  웹의 동작이 갈린다.**

→ **결론: sans/serif/mono 3종 서체 토큰은 정의하기 전에 코드 수정이 선행되어야 한다.**

---

## 3. 간격·모서리 census

### 3-1. spacing — 208건, 21개 값. 사실상 **2px 그리드**다

| 값 | 12 | 8 | 6 | 16 | 10 | 2 | 4 | 24 | 14 | 20 | 22 | 그 외 |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| 건수 | 50 | 42 | 18 | 17 | 14 | 12 | 11 | 8 | 7 | 6 | 5 | 18 |

4의 배수가 아닌 65건(31%) 중 **48건은 정확히 "4의 배수 ±2"**(`6,10,14,18,22,30`)에 걸쳐 있다.
4px 그리드로 강제하면 `gap:6`(18건)이 ±33% 바뀐다.

→ **선택 사항: 4px 그리드(48건 시각 변경) vs 2px 그리드(현행 무변경).**

### 3-2. borderRadius — 40건

`999`(pill, 12건)와 `28`(FAB `56/2` 파생값)을 제외하면 실질 후보는 `{3,4,6,8,10,12,16}` 7개.
그중 `{3,6,10}` 11건이 4의 배수가 아니다.

→ Figma에는 `radius.full`(999)과 **`radius = size/2` 계산 규칙**을 크기 스케일과 분리해 정의해야 한다.

### 3-3. borderWidth — 스케일이 아니다

`StyleSheet.hairlineWidth` 17건이 압도적. 리터럴 `1`이 5곳(하드코딩 이유 `확인필요`), `1.5`·`2`는 각 1곳.

### 3-4. opacity·shadow·animation — 표본이 2~5개, "스케일"이라 부를 근거가 없다

그림자는 앱 전체에서 FAB(`index.tsx:370-374`)와 액션배너(`ActionBannerHost.tsx:97-101`) **단 2곳**이고
값이 서로 겹치지 않는다. 이 축들은 "기존 값에서 스케일 추출"이 아니라 **"규칙을 새로 제정"하는 작업**이다.

### 3-5. 같은 계약인데 값이 갈린 것

| 의미 | 값 | 위치 |
|---|---|---|
| 중앙 오버레이 최대 폭 | 360 / 420 / 560 | `DatePickerModal:164` / `ScripturePreviewModal:73` / `ActionBannerHost:88` |
| 스크롤 하단 여백 | 40 / 80 / 120 | 사이드바 계열 / 설정·라이선스·에디터 / 홈 |
| 70% 시트 높이 | `height:"70%"` vs `maxHeight:"70%"` | `BibleBrowser` / `ScripturePreviewModal` |

의도된 차등인지 단순 중복인지는 커밋 이력만으로 판정 불가(`확인필요`).

### 3-6. 레이아웃 계약 (토큰이 아니라 상수)

`900`(폰/태블릿 분기, **2곳 복제** — B2) · `280`(좌 패널) · `340`(우 패널) · `38`(접힌 레일) ·
`84`(스와이프 액션 폭) · `70%`(폰 성경 시트) · `240ms`/`190ms`(시트 진입/종료).

---

## 4. 아이콘 크기·터치 영역

### 4-1. 아이콘 체계가 두 개로 갈라져 있다

- **텍스트 글리프**(`fontSize`): 7종. 같은 글리프가 다른 크기다 — `✕` 12 vs 20, `‹/›` 14 vs 24, `›` 16 vs 18.
- **벡터 아이콘**(lucide `size`): 5종. 가장 널리 쓰이는 값은 `21`
  (`HeaderControls.tsx:43` 정의 하나가 렌더 7곳에 전파) — **4의 배수가 아니다.**

### 4-2. ⚠️ RULE-UI-004(44~48px) 미기록 위반이 다수다

위키는 예외를 **하나**(`VerseList` ＋ 32px+hitSlop 8)만 기록한다. 그 기록은 정확하지만, 아래는 전부 미기록이다.

| 요소 | 크기 | hitSlop | 유효 폭 | file:line |
|---|--:|--:|--:|---|
| `QuoteBlock` collapse 토글 | 36 | 없음 | 36 | `QuoteBlock.tsx:226-233` |
| `PanelRail` 접힌 레일 | 38 | 없음 | 38 | `PanelRail.tsx:47-54` |
| `TabletWorkspace` 노트 삭제 | 40×40 | 없음 | 40 | `TabletWorkspace.tsx:502-508` |
| `BibleLookupPanel` 검색어 지우기 | 22 | 6 | 34 | `BibleLookupPanel.tsx:263-269` |
| `BibleLookupPanel` 책 추천 칩 | 세로 ~26 | 없음 | ~26 | `BibleLookupPanel.tsx:277-286` |
| `BibleLookupPanel` 최근 참조 칩 | 세로 ~26 | 없음 | ~26 | `BibleLookupPanel.tsx:322-328` |
| `DatePickerModal` 날짜 셀 | 화면폭÷7 | 없음 | 360dp에서 ~40 | `DatePickerModal.tsx:190-196` |

collapse 토글은 **`focus`(기본 변형)의 기본 블록 스타일**이라 사실상 기본 경험에 들어 있다.

**추가 함정 — hitSlop 산수만으로는 안전을 보장할 수 없다.** 인접 버튼의 hitSlop이 서로 잠식한다:

| 위치 | 명목 | gap | 배타적 폭 |
|---|---|--:|--:|
| `app/index.tsx` 헤더 아이콘 4개 (안쪽 2개) | 40+hitSlop 8 | 2 | **최대 42** |
| `NoteListSidebar` 헤더 아이콘 4개 (전부) | 28+hitSlop 10 | 4 | **32~40** |

### 4-3. RULE-UI-005(색만으로 의미 전달 금지) 실패 2건

- `NoteListSidebar` 선택된 노트 행 — `accentSoft`(8~14% 알파) 배경 + `accessibilityState`만.
  규칙 문장은 통과하나 **규칙 자신의 `verified_by`("흑백 모드에서 구분")를 통과하지 못한다**.
  제목 굵기도 선택 여부와 무관하게 항상 `600`이다(`NoteListSidebar.tsx:171-178,284`).
- `DatePickerModal` 선택 날짜 셀 — 시각 신호는 충분하나 **`accessibilityState`가 아예 없다**
  (`DatePickerModal.tsx:93-113`). 위와 정반대 방향의 결함.

### 4-4. 제안 터치 크기 스케일

| 티어 | box | radius | hitSlop | glyph | 비고 |
|---|--:|--:|--:|--:|---|
| `compact` | 28 | 6 | 8 | 16 | ⚠️ 현행값이나 44px 미달 — 잠식까지 감안하면 폐기 후보 |
| `regular` | 40 | 8 | 8 | 20 | 현행 헤더 아이콘 |
| `large` | 44 | 8 | 10 | 22 | **RULE-UI-004 기준선** |

`22px` 지우기 버튼은 이 표에 넣지 말고 별도로 두거나 `xs` 티어로 승격할지 결정이 필요하다.

---

## 5. 설정 5축의 실제 반영도

모든 축은 `ThemeProvider`가 유일한 소비 경로다(우회 구독 0건 확인).

| 축 | 판정 | 근거 |
|---|---|---|
| `accentChoice` | **완전** | `accent` 20곳+, `accentSoft` 5곳. 3파일 hex 6개가 문자 단위로 일치 |
| `blockStyle` | **완전** (범위는 좁다) | `QuoteBlock.tsx:18`의 switch 하나 → Card/Quote/Collapse |
| `variation` | **부분** | 팔레트·blockStyle 기본값·density를 파생. 단 **5개 파일이 `useTheme` 미사용** |
| `fontScale` | **부분** | `scaled()` 28건 vs 고정 70건. **설정 화면 자신이 8/8 고정** |
| `fontFamily` | **사실상 이름뿐** | 소비처 4곳 존재하나 §2-4의 RN 제약으로 무효 |

**`variation` 미반영 5파일**: `browser/{BibleBrowser,BibleReader,ChapterGrid,VerseList}.tsx`,
`list/SwipeToDelete.tsx` → **dark 변형에서도 성경 읽기 화면은 항상 밝다.** 색뿐 아니라 **글자 크기도**
적용되지 않는다(`VerseList.tsx:140` 성경 본문이 항상 16px 고정) — B9가 색상만 언급한 것보다 넓은 표류다.

**부가 발견**
- `theme.isDark`는 계산만 되고 **어디서도 읽히지 않는다**(`ThemeProvider.tsx:211`). 다크 렌더링은 순전히
  DARK 팔레트 값으로만 이뤄진다. → Figma에 "다크 모드" boolean 축을 만들면 대응할 코드가 없다.
- `density`는 `NoteCard.tsx` 한 곳에서만 소비되며 `focus`에서만 `compact`다. 별도 토큰 실익이 낮다.
- `allowFontScaling`/`maxFontSizeMultiplier`가 코드 전체에 0건 → **OS 큰글씨 설정이 앱 `fontScale` 위에
  다시 곱해질 것으로 보인다**(`코드추론`, 기기 확인 필요). 어르신 사용자층에서 특히 중요하다.

---

## 6. Figma 실행 방식 — 제약과 선택지

### 6-1. ⚠️ 계정 제약이 설계를 먼저 제한한다

| 사실 | 출처 |
|---|---|
| "이재진의 팀" = **Starter / View seat** → **모드를 쓸 수 없다** | `whoami` + Figma Help Center: *"…plans can create and use **modes** for variables"* 목록에 Starter가 없다. ⚠️ 이 문장은 **모드**의 가부만 말한다 — Variables 기능 자체를 쓸 수 있는지는 `확인필요`. seat가 `View`라 편집 권한 자체도 별도 확인 필요 |
| "Goondori Inc" = **Professional / Full seat** | `whoami`. ⚠️ 모드 개수 상한은 **출처가 엇갈린다** — 조사 시점의 pricing 표는 `10 modes`, 재확인 시에는 `Unlimited modes (via extended collections)`로 읽혔다. **결정 전 Figma 화면에서 직접 확인할 것** |
| **Variables REST API는 Enterprise 전용** | Figma 공식 포럼 (다수 스레드 일치) |
| Figma 네이티브 변수는 **변수 간 산술 연산 미지원** | 웹 조사 — 서드파티 `Variables Plus`(2026-03) 이전에는 공식 기능 없음 |

→ **자동 동기화 파이프라인은 이 계정으로 불가능하다.** 프로그램적 쓰기 경로는 이 세션의
`use_figma`(Plugin API 실행) 하나뿐이며, `figma-generate-library` 스킬은 이를 Phase 0~4의
**20~100회 순차 호출**(병렬 금지)로 강제한다.

> 요금제는 자주 바뀐다 — 위 표는 웹 조사 결과이므로 최종 결정 전 Figma 화면에서 재확인할 것(`확인필요`).

### 6-2. Starter 우회 3안

| | 방법 | 대가 |
|---|---|---|
| A | 파일을 **Goondori Inc**(Pro)에 만든다 | 권한은 이미 있음. "개인 프로젝트를 회사 팀에 둔다"는 조직적 판단 필요 |
| B | Variables 대신 **Styles**를 쓴다 | 모든 플랜 사용 가능하나 모드 전환이 없어 `minimal/ink`, `paper/ink` 식으로 **4배 개수**를 수동 적용 |
| C | **Tokens Studio** 플러그인의 자체 JSON 토큰 세트 | 플러그인 무료 티어로 4테마 관리 가능해 보이나, Figma Variables로의 내보내기가 상위 플랜을 요구할 수 있음(`확인필요`) |

### 6-3. `fontScale`을 모드로 둘 것인가

| | 방식 | 장 | 단 |
|---|---|---|---|
| A | 두 번째 컬렉션에 4개 모드, 값 수기 입력 | Figma에서 1.6배 모습을 즉시 프리뷰 | `Math.round(base*scale)` 공식을 **사람이 4벌 동기화** — B12/B14와 같은 종류의 위험 |
| B | Figma엔 base만, 곱셈은 앱 코드 전용 | 단일 진실원, 코드 공식과 100% 일치 | 캔버스에서 큰 글씨 검토 불가 → **이슈의 완료 기준("대표 화면에서 큰 글씨 표현을 검토")과 충돌** |

### 6-4. 이름 규칙 3안

| | 규칙 | 평가 |
|---|---|---|
| A | 슬래시 경로 `color/ink/primary` | Figma UI 자동 폴더 그룹핑. RN `colors.ink` 매핑은 수작업 |
| B | 케밥 플랫 `color-ink-primary` | CSS 변수와 1:1이나 **이 저장소엔 웹 CSS가 없어** 이점이 약하다 |
| C | A + Figma **Code Syntax** 필드에 `colors.ink` 병기 | Dev Mode에서 바로 확인 가능. 단 플랫폼 슬롯이 WEB/ANDROID/iOS 3개뿐이라 RN용 슬롯을 관례로 재활용(`확인필요`) |

### 6-5. 정본 위치 3안 — 1인 유지비 관점

| | 안 | 평가 |
|---|---|---|
| a | **Figma가 정본**, 앱이 수신 | `CLAUDE.md`의 "구현 코드 — 최종 판정 기준"과 정면 충돌. REST API도 막혀 있어 **사람이 손으로 옮겨야 한다 → 유지비 최대** |
| b | **코드(ThemeProvider)가 정본**, Figma는 반영본 | 저장소 규범의 연장. "Figma가 코드와 어긋난 지점"을 `drift.md`처럼 다루면 된다. 앱은 항상 로컬 값으로 동작 → **유지비 최소** |
| c | **중립 JSON이 정본** (+ style-dictionary) | 규범과 충돌하진 않으나 제3의 정본 계층을 `CLAUDE.md`에 추가하고 양방향 스크립트 2개를 유지해야 한다. 게다가 `PALETTES` 객체가 **이미 "코드 안의 JSON"** 역할을 겸한다 |

---

## 7. 공통 UI 컴포넌트 후보

15개 후보를 도출해 각각 독립 에이전트가 **반증**을 시도했다(호출부 재확인 + props 폭발 검사).
기준: 2곳 이상 실제 반복 + 묶어도 조건 분기가 과도하지 않을 것.

### 7-1. 검증 통과 10개

| # | 이름 | 반복 위치 | 우선순위 |
|---|---|---|---|
| 1 | **SelectableChip** | `settings.tsx` `renderChip`(3섹션) + `accentChip` — 4개 호출처 | ★ 2단계 즉시 대상 |
| 2 | **SectionLabel** | `settings.tsx` 7 + `licenses.tsx` 1 + `BibleLookupPanel` 3 = 11곳 | ★ 2단계 |
| 3 | **NavRow** | `settings.tsx` 3행 (출처·개인정보·문의) | ★ 2단계 |
| 4 | **IconButtonSquare** | 7파일 9개 정의 | 3단계 |
| 5 | **CountBadge** | `BiblePanel`·`BibleLookupPanel`·`index.tsx` | 3단계 |
| 6 | **ModalSheet** (중앙 오버레이) | `DatePickerModal`·`ScripturePreviewModal` | 3단계 |
| 7 | **ModalFooterTextButton** | 위 두 모달의 `오늘`/`닫기` | 3단계 |
| 8 | **InlineErrorBanner** | `note/[id].tsx:224-226` ↔ `TabletWorkspace.tsx:397-399` (바이트 동일) | 3단계 |
| 9 | **EmptyState** | 7곳 (메시지 전용 5 + CTA 포함 2) | 3단계 |
| 10 | **PrimaryPillButton** | `index.tsx:355-361` ↔ `TabletWorkspace.tsx:518-523` | 3단계 |

### 7-2. 검증에서 드러난 상태 결핍 (이슈가 요구한 6상태 기준)

| 상태 | 현황 |
|---|---|
| 기본 | 전부 구현 |
| **눌림** | ⚠️ **저장소 전체에서 단 1곳**(`SermonMetaHeader.tsx:167`, `({pressed}) => opacity 0.6`). 나머지 Pressable은 전부 정적 style — 관행은 이미 있는데 확산되지 않았다 |
| 선택 | `accessibilityState.selected`는 대체로 있으나 시각 신호가 §4-3처럼 갈린다 |
| **비활성** | ⚠️ 두 방식 공존 — `SermonMetaHeader.tsx:249`는 `opacity 0.3`, `TabletWorkspace.tsx:359-367`은 **시각 변화 전혀 없음**. 둘 다 `accessibilityState.disabled` 없음 |
| **오류** | `InlineErrorBanner`(2곳) + `QuoteBlock`(`errText`/`errBar`) + `ActionBannerHost`(토스트) — **3가지 관용구가 이미 공존** |
| 포커스 | RN 네이티브에선 대체로 성립하지 않으나, **`Pressable`의 `({focused})`는 존재**한다. 적용 범위는 §8의 웹 지원 여부에 달렸다 |

**구체적 결함 하나**: `PrimaryPillButton`의 두 호출부 모두 `createNote`가 `async`인데 진행 중 `disabled`
처리가 없다 — **연타 시 노트가 중복 생성될 수 있다**(`index.tsx:119-127`, `TabletWorkspace.tsx:235-244`).

### 7-3. 기각 5개 — 왜 묶지 않는가

| 후보 | 기각 사유 |
|---|---|
| `SearchInputField` | 4번째 등장 위치를 찾아보니 역할·상호작용이 서로 다르다 |
| `ActionChip` | `BibleLookupPanel` **한 파일 안**의 지역 중복. 저장소 전체 전수 조사에서 동일 패턴 0건 |
| `LabeledFieldRow` | `SermonMetaHeader`에만 존재. 재사용처로 지목한 설정 화면에는 **텍스트 입력 라벨 행이 하나도 없다** |
| `VerseRow` | `QuoteBlock`이 이미 3곳에서 재사용되는 정식 공용 컴포넌트다 |
| `QuoteHeaderLabel` | 한 파일 안에서 이미 로컬 함수로 통합 완료 — 더 손댈 중복이 없다 |

### 7-4. 화면 고유로 남길 것 11개

FAB(`index.tsx`) · `VerseList` insertBtn(채워진 원형, 유일하게 44px 충족) · `DatePickerModal` 날짜 셀
(정사각 그리드 + 접근성 계약 충돌) · `TabBtn`(밑줄 탭) / `SegmentBtn`(필박스) — **둘 다 "2지선다"지만 시각
관용이 달라 강제 통합 시 정체성을 잃는다** · `NoteCard` 행(가로 배치) vs `NoteListSidebar` 항목(세로 배치) —
**값이 아니라 구조가 다르다** · `QuoteBlock` 3변형 · `ActionBannerHost` 토스트 ·
`settings.tsx` swatchDot — **사용자가 고를 실제 hex를 보여주는 데이터라 리터럴이 맞는 유일한 예외** ·
`SermonMetaHeader` dateBtn — 유일한 `pressed` 구현 사례이므로 **흡수하지 말고 확산의 근거로 쓴다** ·
`QuoteBlock` CollapseVariant 토글(재사용 회피 사례).

---

## 8. 토큰화 전 vs 후

### 8-1. 토큰화 **전에** 결정·수정해야 하는 것 (안 하면 결함이 토큰으로 굳는다)

| 항목 | 왜 지금인가 |
|---|---|
| `fontStackFor()` 콤마 문자열 | 그대로 넣으면 **RN에서 항상 무효인 값이 정본**이 된다 |
| B9 신·구 팔레트 | 매핑표 없이 양쪽을 토큰화하면 두 세대 공존이 **영구화**된다 |
| `AccentChoice` 6개 hex | 6개 중 4개가 variation 기본 accent와 **우연히 같다**. accent를 리튠하며 리터럴만 바꾸면 그 값을 저장한 사용자의 `accentChoice`가 `readEnum` 개별 폴백(RULE-SET-002)에 걸려 **다음 실행에 조용히 `default`로 리셋**된다 |
| `errBg` 세대 불일치 | 오류 표면이 solid인지 알파인지 의미 규칙을 먼저 정해야 한다 |
| spacing 2px vs 4px 그리드 | 지금 값을 그대로 토큰화하면 "그리드 없음"이 굳는다 |
| 터치 크기 28/36/40 | `size` 토큰으로 넣으면 **RULE-UI-004 위반이 토큰 차원에서 정당화**된다 |
| `letterSpacing` 0.6 vs 0.4, `CountBadge` paddingH 7 vs 8 | 토큰화 자체가 정규화 행위다. 안 정하면 다음 사람이 또 census한다 |
| ~~웹 지원 여부~~ **해소** — 웹도 실사용 대상(§11-1) | `focus`/`hover`를 컴포넌트 API에 포함하고, 900px 외 3번째 breakpoint를 검토한다. §2-4의 네이티브/웹 서체 갈림은 계약으로 다룬다 |

### 8-2. 토큰화 **후에** 해도 되는 것 (마이그레이션)

`useTheme` 미사용 5파일 편입 · `scaled()` 미적용 70건 확산 · `pressed` 피드백 확산 ·
`DatePickerModal` 선택셀 `accessibilityState` 추가 · `NoteListSidebar` 선택행 비색 신호 추가 ·
`isDark` 죽은 출력값 정리 · `PrimaryPillButton` 연타 방지.

---

## 9. wiki 반영 제안 (이 문서에서는 수정하지 않았다)

`CLAUDE.md` 절차 3단계에 따라 아래는 `wiki/drift.md`와 `wiki/rules/layout-a11y.md`에 반영되어야 한다.

| ID(초안) | 내용 |
|---|---|
| **B21** | RULE-UI-004의 44px 미만 터치 타깃이 기록보다 많다 — §4-2 표의 7건 |
| **B22** | 좁은 간격의 아이콘 버튼 열은 hitSlop이 서로 잠식해 명목 크기를 달성하지 못한다 — §4-2 |
| **B23** | RULE-UI-005를 문장은 지키나 취지는 못 지키는 선택 표시 2건 — §4-3 |
| **B24** | `fontFamily`는 폰트 미로딩과 **별개로** RN 자체 제약으로 이미 무효다 — §2-4 |
| **B25** | `theme.isDark`는 계산만 되고 소비처가 0건인 죽은 출력값이다 — §5 |
| **B9 확장** | 레거시 필드 사용 18파일 / 신 토큰 17파일 / 양쪽 동시 15파일. **색뿐 아니라 글자 크기까지** 미적용 |
| **RULE-SET-005 확장** | "일부 고정 크기 요소"의 실제 범위 = 성경 리더 + **설정 화면 자신** + 태블릿 3-pane 크롬 + 배너 + 라이선스 화면 |
| **신규 계약** | `AccentChoice` 6-hex는 스타일 리터럴이 아니라 **사용자 데이터이자 스키마**다 — 리튠 시 마이그레이션 필수 |

RULE-UI-001~003, 006과 RULE-SET-001~004, 006, CONTRACT-SETTINGS-FILE, ADR-0010, ADR-0015는
**코드와 정확히 일치**했다 — 새 drift 없음.

---

## 10. 조사의 한계

- **Figma에는 아무것도 만들지 않았다.** 이슈 1단계 체크리스트 8개 중 "플러그인으로 실제 구성"과
  "대표 화면 구성 + 이슈에 링크 연결"은 미착수다. 완료 기준("대표 화면에서 4종 테마와 큰 글씨를 검토")은
  §6의 결정 이후에만 충족할 수 있다.
- **"정의한다/확정한다"를 요구한 항목(2·3·4·7)은 선택지 제시에 그쳤다** — 사용자 결정 사항이기 때문(§11).
- **기기 미검증**: `fontFamily`의 실제 렌더링, OS 큰글씨 곱셈 결과, `DatePickerModal` 셀의 실측 폭은
  시뮬레이터/실기기 확인이 필요하다.
- **웹 조사 의존**: Figma 요금제·API 제약(§6-1)은 공식 문서 기반이나 이 세션에서 화면으로 재확인하지 않았다.
- `app/note/[id].tsx`는 하위 컴포넌트를 통해 간접적으로만 다뤘다 — 화면 자체의 삭제 확인 흐름 등은 미조사.

---

## 11. 사용자 결정 사항

> 이 절은 **무엇이 확정됐고 무엇을 실측했는지**를 남긴다. **앞으로 무엇을 더 만들 것인가**는 여기가 아니라 [`2026-09-06-component-roadmap.md`](2026-09-06-component-roadmap.md)에 있고, **Figma 파일을 어떤 구조로 유지할 것인가**는 [`ADR-0017`](../../wiki/decisions/ADR-0017-figma-design-system-structure.md)에 있다. 셋을 한 문서에 섞으면 조사 기록과 계획이 함께 낡는다.

### 11-1. 확정된 것 (2026-09-06)

| # | 질문 | 답 | 파급 |
|---|---|---|---|
| 1 | Figma 워크스페이스 | **`jinjinstar3@gmail.com` 계정** (MCP 재인증 완료) | 팀 6개 전부 **free(`starter`)**. 플러그인 생성만 사용 → §11-2 |
| 2 | 토큰 정본 위치 | **코드에서 생성하되, 이후 Figma가 정본** | `CLAUDE.md`의 "구현 코드가 최종 판정 기준"에 대한 명시적 예외가 필요하다 → `drift.md` **E21** |
| 3 | 웹 지원 여부 | **예 — 웹도 실사용 대상** | `focus`/`hover`가 설계 대상이 된다. §2-4의 네이티브/웹 갈림은 결함이 아니라 **다뤄야 할 계약**이다. `drift.md` **E7·D3 해소** |

**2번의 무게** — Figma를 정본으로 삼으면 Variables REST API가 Enterprise 전용이라(§6-1) Figma→코드 반영이
**항상 수동**이다. 어긋남을 무엇으로 잡을지(팔레트 스냅샷 테스트? `drift.md` 항목?)를 정하지 않으면
이 저장소가 이미 가진 "손으로 옮겨 적은 값이 조용히 갈리는" 패턴(B2·B12·B14·B15)이 하나 더 늘어난다.

**3번의 무게** — 웹이 대상이면 §7-2에서 "RN에선 성립하지 않는다"로 정리한 `focus` 상태가 되살아난다.
`Pressable`의 `({focused})`와 `({hovered})`를 컴포넌트 API에 넣어야 하고, 900px 외 3번째 breakpoint를
검토해야 한다.

### 11-2. 워크스페이스 — 해소(2026-09-06)

Figma MCP를 **`jinjinstar3@gmail.com`으로 재인증**했다(`whoami` 확인). 팀 6개가 있고 **전부 `starter` 티어**다.

| 팀 | seat |
|---|---|
| `MA6-main` · `WRJJ` · `7term-todo-list` · `Team-NestCat` | **Full** — 파일 생성·편집 가능 |
| `Team-NestCat`(두 번째) · `이름없음's Starter team` | View — 편집 불가 |

**따라서 §6-1의 제약이 그대로 적용된다** — 이 계정에는 Professional 이상 팀이 없다. 사용자 방침도 같다:
**"free 플랜이므로 플러그인을 활용한 생성만 쓴다"**(2026-09-06).

이것이 §6의 선택지를 좁힌다.

| §6 항목 | free + 플러그인 전용에서의 귀결 |
|---|---|
| 6-1 Variables 모드 | 상위 플랜 기능 — **`variation` 4종을 모드로 표현하는 안은 후보에서 빠질 가능성이 높다**(실측 필요, 아래) |
| 6-2 우회 3안 | (A) Pro 팀 사용은 **불가**. (B) Styles 또는 (C) 플러그인 자체 토큰 세트가 남는다 |
| 6-3 `fontScale` 모드화 | 모드를 못 쓰면 **B안(Figma엔 base만, 곱셈은 앱)으로 자동 확정**된다 |
| Variables REST API | Enterprise 전용 — 애초에 해당 없음. 쓰기 경로는 `use_figma`(Plugin API) 하나뿐 |

### 11-3. 실측 — free 플랜에서 Plugin API로 되는 것과 안 되는 것

파일 `B0XJR0LWclRVWYN3DZ8lJD`(팀 `MA6-main`)에서 **직접 실행해 확인했다.** 프로브 흔적은 모두 제거했다.

| 시도 | 결과 |
|---|---|
| `figma.variables.createVariableCollection()` | ✅ **된다** (기본 모드 `Mode 1` 하나로 생성) |
| `createVariable` + `setValueForMode` | ✅ 된다 |
| `collection.addMode("paper")` | ❌ **`Error: in addMode: Limited to 1 modes only`** |
| `figma.createPaintStyle()` | ✅ 된다 |
| `figma.variables.setBoundVariableForPaint()` | ✅ 된다 — 변수를 노드 fill에 바인딩할 수 있다 |

**제약 ②·③** — 모드 1개 말고도 두 가지가 더 있다.

| 제약 | 값 | 근거 |
|---|---|---|
| 컬렉션당 모드 | **1개** | 위 실측 (`addMode` 실패) |
| MCP 도구 호출 | **월 20회** | §11-6 |
| 파일당 페이지 | **3개** | 사용자 확인(2026-09-06) |

페이지 3개 제약 때문에 `🎨 Tokens`·`🧩 Components`·`🔣 Icons` 로 나누던 구조를 **한 페이지**
(`🎨 씀씀 Design System`) 안의 보드 3개로 합쳤다. 기본 `Page 1`까지 세면 4개라 한도를 넘기 때문이다.
플러그인은 예전 페이지를 발견하면 이름을 바꿔 재사용하고, 남은 것들은 **내용이 플러그인이 만든 것뿐일 때만**
지운다 — 사용자가 직접 그린 게 섞여 있으면 알리기만 한다.

**⚠️ 6-1의 서술을 정정한다.** 조사 단계에서 웹 문서를 근거로 "Starter는 Variables 자체를 못 쓴다"고 적었으나
**틀렸다.** Variables는 정상 동작하고, 바인딩까지 된다. 실제 제약은 **컬렉션당 모드가 1개로 고정**되는 것뿐이다.
Figma Help Center 문장(*"…plans can create and use **modes** for variables"*)은 모드의 가부만 말한 것이었고,
그것을 Variables 전체의 가부로 읽은 것이 오독이었다.

### 11-4. 그래서 확정되는 토큰 구조

모드가 1개뿐이므로 **`variation` 4종을 한 컬렉션의 모드로 표현하는 안은 불가능하다.** 남는 구조는 셋이다.

| | 구조 | 평가 |
|---|---|---|
| A | 컬렉션 4개(`Theme/minimal`…), 각 1모드 | 의미 토큰이 4벌로 복제되고, 테마 전환이 **재바인딩**이라 캔버스에서 4종 비교가 어렵다 |
| B | 전부 Paint Style 4벌 | 모든 플랜에서 되고 `/` 그룹핑도 되지만, 간격·반경·타이포까지 스타일로 표현할 수 없다 |
| **C** | **테마 무관 값은 Variables(1모드), 색만 Paint Style 4벌** | **채택** — 아래 |

**C를 택하는 이유**: 간격·모서리·타이포·아이콘 크기·터치 크기는 `variation`에 따라 **변하지 않는다**(§1~§4에서
확인). 이 축들은 1모드 컬렉션에 정확히 들어맞는다. 실제로 테마마다 갈리는 것은 **색뿐**이고, 색은 Paint Style
4벌(`minimal/…`·`paper/…`·`focus/…`·`dark/…`)로 표현하면 캔버스에서 4종을 나란히 놓고 비교할 수 있다 —
이슈의 완료 기준("대표 화면에서 4종 테마를 검토할 수 있다")을 모드 없이 충족하는 경로다.

**따라서 결정 #5(`fontScale`을 Figma 모드로)는 자동으로 B안으로 확정된다** — 모드를 쓸 수 없으므로
Figma에는 base 값만 두고 `Math.round(base × scale)` 곱셈은 앱 코드(`scaled()`)에 남긴다. 큰 글씨 검토는
모드 전환이 아니라 **대표 화면을 배율별로 따로 그려** 확인한다.

### 11-6. ⚠️ 두 번째 제약 — Figma MCP 호출 한도(월 20회)

모드 제한과 **별개**의, 더 강한 제약을 실행 중에 만났다. `use_figma` 호출이 다음에서 거부됐다:

```
You've reached the Figma MCP tool call limit on the Starter plan.
```

공식 문서(`file://figma/docs/rate-limits-access.md`) 기준:

| 플랜 | 한도 |
|---|---|
| **Starter** | **월 20회** — seat와 무관(View·Collab·Dev·Full 모두 동일) |
| Professional (Full/Dev seat) | 일 200회 · 분 10회 |
| Organization | 일 200회 · 분 15회 |
| Enterprise | 일 600회 · 분 20회 |

면제 도구는 `create_new_file`·`whoami`·`add_code_connect_map` 셋뿐이고 **`use_figma`는 카운트된다.**

**이것이 §11-4의 실행 계획을 무효화한다.** `figma-generate-library` 스킬의 표준 워크플로는 Phase 0~4에 걸쳐
`use_figma`를 **20~100회 이상** 순차 호출하도록 강제한다(병렬 금지). 월 20회로는 컴포넌트 라이브러리를 만들 수 없다.

**대응 — MCP를 아예 쓰지 않는 로컬 Figma 플러그인**: [`figma-plugin/`](figma-plugin/)에 만들어 두었다.
사용자가 Figma 데스크톱에서 직접 실행하므로 **MCP 호출 0회**이고 횟수 제한이 없다.

| 파일 | 역할 |
|---|---|
| `manifest.json` · `ui.html` | 플러그인 정의와 패널 |
| `extract-colors.py` | `ThemeProvider.tsx` → 색 토큰 64개 추출. **손으로 옮겨 적지 않는다** |
| `primitives.js` | 수치 토큰 63개 (census 실측값) |
| `main.js` | 생성 로직 — 전부 멱등 |
| `code.js` | 위 셋을 이어 붙인 자동 생성 파일 (`node build.mjs`) |

**만드는 것**: `Primitives` 63개 · `Color` 64개(4테마 × 16) · 텍스트 스타일 6개 ·
`🎨 Tokens` 문서 페이지(4테마 스와치 · 타입 스케일 ×1.0/×1.6 · 터치 영역 기준선) ·
`🧩 Components` 페이지(공통 컴포넌트 10개 · 변형 36개).

### 11-7. 컴포넌트 정밀 사양 — 값 485개를 대조해 33건 교정

§7에서 검증한 10개를 **Figma에 재현 가능한 사양**으로 옮기기 위해 컴포넌트별로 값을 추출하고,
각각을 독립 에이전트가 소스와 대조했다. 10개 전부 `CORRECTED` — `CLEAN`은 하나도 없었다.

| | 대조한 숫자 | 잡힌 오류 |
|---|--:|--:|
| 합계 | 485 | **33** |

**빌드를 깨뜨렸을 오류 2종**(나머지는 인용 줄번호 오차):

| 컴포넌트 | 오류 | 교정 |
|---|---|---|
| EmptyState | 토큰명을 `space/2/24`·`space/2/16`으로 표기 — 실제 토큰은 `space/24`·`space/16`. 6회 이상 반복 | 변수 바인딩이 전부 실패했을 것 |
| NavRow | `strokeToken: "border/hairline"` — `strokeToken`은 **색 토큰**이어야 한다 | `focus/rule`(색) + `strokeWeight 0.5` 분리 |

**검증**: 확장한 Figma 스텁으로 Node에서 실행 — 컴포넌트 10개·변형 36개 생성,
변수 바인딩 196건(padding 96 · radius 56 · minHeight 17 · itemSpacing 6 · fontSize 21),
auto-layout enum 위반 0건, 변형 prop 이름 불일치 0건, 재실행 시 멱등.

**상태 구현 현황** — 이슈가 요구한 6상태 중 코드에 실재하는 것은 `기본`과 일부 `선택`뿐이다.
`눌림`·`비활성`·`오류`·`포커스`는 저장소 선례에서 도출한 **제안**이며, 특히 `포커스`는
선례가 전혀 없는 순수 제안이다(웹이 실사용 대상으로 확정되어 제외하지 않았다).

### 11-8. 2차 조사 — 남은 공통 요소 6종

§7-4가 FAB·날짜 셀·`QuoteBlock`을 "화면 고유"로, §7-3이 `SearchInputField`·`LabeledFieldRow`를
"기각"으로 분류했다. 그 판단 기준은 **"공유 React 컴포넌트로 뽑을 가치가 있나"**였다.
**Figma 디자인 시스템 카탈로그**는 기준이 다르다 — 한 곳에서만 쓰여도 들어가야 한다.
사용자 요청으로 이 기준을 적용해 6종을 추가 조사했다.

| 요소 | 대조 숫자 | 오류 | 판정 |
|---|--:|--:|---|
| TextInputField | 110 | 5 | CORRECTED |
| CalendarDayCell | 46 | 2 → **7** | CORRECTED (아래 3차 참조) |
| FieldLabel | 34 | 2 | CORRECTED |
| FabButton | 34 | 3 | **UNBUILDABLE** |
| QuoteBlock | 96 | 2 | CORRECTED |
| **합계** | **320** | **14** | |

**`FabButton`의 UNBUILDABLE은 값이 틀려서가 아니다.** 검증자가 실제 빌더(`component-builder.js`)를
열어 보고 "이 사양의 JSON 형태로는 빌더에 바로 넣을 수 없다"고 판정한 것이다 — 2차 워크플로의
스키마(평평한 `paddingTokenTop`, 문자열 `propsJson`)가 빌더 형태(중첩 `paddingTokens{t,r,b,l}`)와
달랐기 때문이며, 5종 전부에 해당한다. 빌더 형태로 옮기며 해소했다.

**빌드를 깨뜨렸을 오류 하나** — `CalendarDayCell`의 변형 4개가 `opacity: 0`을 갖고 있었다.
사양에서는 "오버라이드 없음"을 뜻하는 자리값이었지만, 빌더는 `opacity` 키가 있으면 그대로 적용하므로
**날짜 셀 4개 상태가 전부 투명해졌을 것**이다. 해당 키를 넣지 않는 것으로 교정했다.

### 11-8-1. 3차 — 달력 전체를 컴포넌트로

사용자 요청으로 날짜 셀 하나가 아니라 **달력 자체**를 컴포넌트로 만들었다(`CalendarMonth`).
평평한 `base`/`texts`/`variants` 사양으로는 헤더 + 요일 행 + 6주 격자 + '오늘' 버튼을 표현할 수 없어
`component-builder.js`에 전용 조립 함수를 뒀다. 날짜 칸 42개는 그림이 아니라
**`CalendarDayCell` 인스턴스**이고 `setProperties({State})`로 상태를 준다.

이 과정에서 `CalendarDayCell`을 다시 대조해 **5건을 더 고쳤다** — §11-8에서 "2건"이라고 적은 것은
이제 맞지 않는다. 합쳐서 7건이다.

| # | 잘못된 것 | 실제 코드 |
|---|---|---|
| 1 | `Today` 변형에 `fontWeight` 없음 | `selected \|\| isToday ? "700" : "400"` — 오늘도 700이다 (`:123`) |
| 2 | "오늘·선택됨 동시 성립 규칙이 코드에 없다" | 있다. `isToday && !selected` — 선택됨이 이기고 오늘 테두리는 지워진다 (`:107-121`) |
| 3 | `OtherMonth` 변형(흐린 날짜 숫자) | 그런 상태가 없다. 패딩 칸은 `null`이고 숫자 자체가 없다 (`calendar.ts:45,49`) |
| 4 | 한 겹 프레임(36×36 원) | 두 겹이다 — 바깥 `Pressable`(padding 2)이 터치 영역, 안쪽 원이 시각 요소 (`:190-203`) |
| 5 | `Pressed`·`Disabled`를 실재 상태로 표기 | `style={styles.cell}` 정적이다. pressed 콜백도 비활성 경로도 없다 — **제안**으로 내렸다 |

**11개 에이전트가 놓친 것을 4-렌즈 반박이 잡았다.** 시트 폭을 `360 고정`으로 잡았는데
실제로는 `width:"100%"` + `maxWidth:360`이고 backdrop이 `padding 24`라
**실제 폭 = min(화면폭 − 48, 360)**이다. 화면 360dp에서는 312이고 내용 폭 280, 칸이 정확히 40px다.
화면이 408dp 이상이어야 360에 닿는다(칸 46.86).
`CalendarDayCell`은 40으로 그려 놓고 `CalendarMonth`는 46.86으로 그리고 있었다 — 같은 파일 안에서 어긋났다.
**360dp 기준(312/280/40)으로 통일했다.** RULE-UI-004(44px)에 걸리는 쪽이 그쪽이라 눈에 보여야 한다.

빈 칸도 구조가 다르다. 다른 상태는 `Pressable` + `cellInner` 두 겹인데 빈 칸은 `<View style={cell}/>`
하나뿐이라 **안쪽 원 노드도, `onPress`·`accessibilityRole`·`accessibilityLabel`도 없다**(`:89`).
`noInner` 오버라이드로 안쪽 프레임을 아예 만들지 않게 했다.

**스텁 검사를 늘리다 축 버그를 찾았다.** `applyContainer`가 `fixedWidth`를 `primaryAxisSizingMode`에
걸고 있었는데, `primaryAxisSizingMode`는 `layoutMode`에 따라 뜻이 뒤집힌다 — **`VERTICAL` 프레임에서
primary는 높이다.** 그래서 세로 컴포넌트에 폭을 주면 폭은 hug로 돌아가고 **높이가 기본값 100에 굳었다.**

걸린 것: `ModalSheet`(360·420) · `InlineErrorBanner`(360) · `QuoteBlock`(320) ·
`CalendarDayCell`(바깥 40 · 안쪽 36) — `CalendarMonth`의 날짜 칸 42개가 전부 이걸 물려받는다.
아이콘 시트의 셀(160)도 같은 이유로 깨져 있었다. `layoutSizingHorizontal`/`Vertical`로 축을
이름으로 지정해 한 곳에서 고쳤다.

**스텁이 이걸 못 잡고 있었다.** 노드에 레이아웃 모델이 없어 enum 값만 검사했기 때문에
컴포넌트 15개가 "통과"로 나왔다. `resize()`를 부른 노드마다 가로 축이 실제로 고정됐는지 대조하도록
검사를 붙였고, 붙이자마자 56건이 터졌다. 페이지 한도(3개)·보드 범위 삭제·⑤ 단독 실행도 같이 본다.

**실제 실행에서 한 건이 더 나왔다** — `❌ in get_children: Cannot access property children on a page
that has not been explicitly loaded.` manifest 의 `documentAccess: "dynamic-page"` 때문에
**열려 있지 않은 페이지의 `children` 은 `await page.loadAsync()` 없이 읽을 수 없다.**
예전 페이지를 훑어 지울지 판단하는 `isOurLeftover()`가 정확히 그 짓을 하고 있었다.
스텁의 페이지가 항상 로드된 상태였던 게 원인이라, 스텁에도 지연 로딩을 넣었다 —
`loadAsync()` 호출을 빼면 같은 문구로 실패한다(역검사 확인).

⚠️ 달력에서 **요일 12 · `‹ ›` 24 · '오늘' 14는 `scaled()`를 거치지 않는다.** 달 제목(17)과
날짜 숫자(15)만 커진다. 앱 전체로는 `fontSize` 98건 중 28건만 `scaled()`를 거친다 —
`wiki/drift.md` B27·E22로 남겼다. 이걸 강제하는 `RULE`은 없다(전수 확인).

### 11-9. 아이콘 인벤토리 — 32종, 그중 30종이 불일치

lucide 벡터 **9종**과 유니코드 글리프 **23종**. 벡터 도형은 설치된 `lucide-react-native@1.16.0`
패키지에서 직접 추출한다(`extract-icons.mjs`) — 기억으로 path를 적지 않는다.

**구조적 문제**: 같은 의미가 벡터와 글리프 두 체계로 갈려 있다.

| 의미 | 벡터 | 글리프 |
|---|---|---|
| 공유 | `Share` 21px (폰) | `↑` 15px (태블릿) |
| 검색 | `Search` 21px (액션 버튼) | `⌕` 13·14px (입력창 장식) |
| 성경/본문 | `BookOpen` 21px | `📖` 18px (컬러 이모지) |
| 뒤로/이전·다음 | `ChevronLeft` 24px | `←`·`‹›` 14·15·24px |

'펼치기/접기' 하나에 **네 가지 기호 체계**(`‹›` · `≡` · `◧`/`✦` · `▾▸`)가 쓰인다.

⚠️ **코드 버그도 하나 나왔다** — `TabletWorkspace`에서 `leftOpen===false`일 때
`≡`(크럼 15px)와 `PanelRail`의 `≡`(16px)가 **같은 동작에 대해 동시에 렌더**된다.
오른쪽도 `◧`(15px)와 `✦`(16px)로 같은 중복이 있다. 디자인이 아니라 코드 문제다.

**검증**: Figma Plugin API를 스텁으로 만들어 Node에서 실행했다 — 변수 127개 생성, scope·타입·색 범위(0~1)·
폰트 로드 순서 위반 0건, 두 번째 실행에서 **신규 0 / 갱신 127**로 멱등성 확인.

> ⚠️ `figma.createAutoLayout()`·`node.query()`·`node.set()`·`node.screenshot()`은 **MCP(`use_figma`) 런타임의
> 편의 함수이지 실제 Plugin API가 아니다.** 초안에서 이것을 쓴 탓에 진짜 플러그인에서는 던졌을 코드였고,
> 스텁 실행 전에 공식 API(`createFrame` + `layoutMode`)로 교체했다.

**현재 Figma 파일 상태**: `Primitives` 컬렉션 26개(space 15 · radius 8 · border 3)까지 MCP로 생성됨.
플러그인은 멱등이므로 이 26개를 갱신하고 나머지 101개를 추가한다.

### 11-10. 남은 결정

| # | 질문 | 선택지 |
|---|---|---|
| ~~4~~ | ~~spacing 그리드~~ | **확정: 2px 그리드 — 현행 값 유지, 시각 변경 0건** |
| ~~5~~ | ~~`fontScale`을 Figma 모드로~~ | **확정(제약에 의해): base만 Figma, 곱셈은 앱** — §11-4 |
| ~~6~~ | ~~이름 규칙~~ | **확정: 슬래시 경로 + Code Syntax 병행** (`color/ink/primary` + `colors.ink`) |
| 7 | B9 정본 세대 | (A) 신 토큰(`paper/ink/rule`)으로 통일 / (B) 레거시 유지 |
| 8 | `TabBtn` vs `SegmentBtn` | (A) 하나로 통일 / (B) 둘 다 정본(용도 구분) |
| 9 | `fontFamily` 축을 살릴 것인가 걷어낼 것인가 (`drift.md` **E20**) | 웹이 대상이 된 이상 "웹에서만 동작"이 의도된 동작인지부터 정해야 한다 |

---

### 부록: 조사 방법

31개 에이전트 워크플로 — 9개 영역 파일 전수 조사 + 5개 횡단 census(설정 5축 / 수치 / 타이포 / 위키 대조 /
Figma 실행 방식) → 공통 컴포넌트 클러스터링 → **후보별 적대적 반증**(15개 중 5개 기각) → 완결성 비평.
검증 단계는 "확신이 없으면 기각" 기준으로 운영했다.
