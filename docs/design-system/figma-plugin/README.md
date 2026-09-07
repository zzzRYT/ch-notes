# 씀씀 (ch-life) 디자인 토큰 Figma 플러그인

`apps/ch-life/src/theme/ThemeProvider.tsx`의 값을 Figma 파일에 반영하는 로컬 플러그인이다.
**Figma MCP를 전혀 쓰지 않는다** — Starter 플랜의 MCP 호출 한도(월 20회)를 우회하기 위한 경로다.

## 쓰는 법

1. Figma 데스크톱 앱을 연다 (브라우저에서는 로컬 플러그인을 불러올 수 없다).
2. 대상 파일을 연다 — [씀씀 (ch-life) — Design System](https://www.figma.com/design/B0XJR0LWclRVWYN3DZ8lJD)
3. 메뉴 → **Plugins → Development → Import plugin from manifest…**
4. 이 폴더의 `manifest.json`을 고른다.
5. **Plugins → Development → 씀씀 (ch-life) Design Tokens** 실행.
6. **전체 실행 (①~⑥)** 을 누른다.

한 번 등록하면 다음부터는 5~6번만 반복하면 된다.

## 무엇이 만들어지나

| | 내용 | 개수 |
|---|---|---|
| ① 수치 토큰 | `Primitives` 컬렉션 — 간격·모서리·테두리·타이포·아이콘·터치·모션·레이아웃 | 63 |
| ② 색 토큰 | `Color` 컬렉션 — 4테마 × 16 의미 토큰 | 64 |
| ③ 텍스트 스타일 | 타입 스케일 6단계 | 6 |
| ④ 토큰 보드 | `토큰` — 4테마 스와치 · 타입 스케일 ×1.0/×1.6 · 터치 영역 기준 | 보드 1개 |
| ⑤ 공통 컴포넌트 | `공통 컴포넌트` — Atoms / Molecules / Organisms 세 층위 | 18개 · 변형 71개 |
| ⑥ 아이콘 시트 | `아이콘` — lucide 벡터(실제 패키지 도형) + 유니코드 글리프 | 벡터 9 · 글리프 23 |

④⑤⑥ 은 **페이지 하나**(`🎨 씀씀 Design System`) 안의 보드 3개다. free 플랜은 파일당 페이지가
3개까지라 페이지를 나눠 쓸 여유가 없다. 예전 버전이 만든 `🎨 Tokens`·`🧩 Components`·`🔣 Icons`
페이지는 첫 실행 때 한 페이지로 합쳐지고, 내용이 이 플러그인이 만든 것뿐이면 지워진다.
직접 그린 게 섞여 있으면 지우지 않고 알리기만 한다.

**전부 멱등하다.** 같은 이름이 있으면 새로 만들지 않고 값만 갱신한다. 몇 번을 돌려도 중복이 생기지 않는다.

| | 다시 실행하면 |
|---|---|
| ① 수치 · ② 색 · ③ 텍스트 스타일 | 이름으로 찾아 **값만** 갱신 |
| ④ 토큰 보드 · ⑥ 아이콘 보드 | 그 보드만 지우고 다시 그린다 (문서라 id 가 중요하지 않다) |
| ⑤ 컴포넌트 | **지우지 않는다.** 이름으로 찾아 내용만 갈아 끼운다 |

⑤가 다른 이유가 있다. 컴포넌트를 지웠다 다시 만들면 노드 id 가 바뀌고, 그 컴포넌트를 화면 시안에
끌어다 놓은 **인스턴스가 전부 끊긴다.** Figma 를 정본으로 쓰는 이상 이건 치명적이라
변형 단위로 맞춘다 — 있는 변형은 내용만 갈고, 새 변형은 붙이고, 사양에서 사라진 변형만 뗀다.
`stub-test.mjs` 가 두 번 실행해 컴포넌트 id 가 전부 같은지 대조한다.

## 두 축 — 층위와 등급

결정 근거는 [`ADR-0017`](../../../wiki/decisions/ADR-0017-figma-design-system-structure.md).

**층위(`level`)가 보드를 나눈다.** "이건 Molecule인가 Organism인가"를 매번 다시 논쟁하지 않도록
판정을 기계화했다 — 위에서부터 물어 **처음 걸리는 곳**이 그 층위다.

| | 묻는 것 |
|---|---|
| `organism` | 화면의 한 구역을 차지하는가 — 다른 컴포넌트의 인스턴스를 품거나 내용이 슬롯인가? |
| `molecule` | 서로 역할이 다른 요소가 둘 이상 묶여 한 기능을 이루는가? |
| `atom` | 나머지. 더 쪼개면 의미가 없다 |

**등급(`status`)은 근거의 세기다.** 보드를 나누지 않고 **이름 접두사**로 붙는다.

| 등급 | Figma 이름 | 뜻 | 사양이 반드시 가져야 하는 것 | 지금 있는 것 |
|---|---|---|---|---|
| `code` | 접두사 없음 | 앱에 이미 있다. `sources` 의 `file:line` 이 정본이다 | `sources` | 16개 |
| `proposed` | `Proposed/` | 화면에 패턴은 있는데 재사용 컴포넌트로 추출돼 있지 않다 | `sources` (참조는 없어도 된다 — 자체 코드가 근거다) | `ActionBanner` |
| `planned` | `Planned/` | 코드에 아직 없다. 참조는 패턴만 빌리고 값은 여기서 정한다 | `reference` (코드에 없으니 이것이 유일한 근거다) | `Checkbox` |

접두사는 Figma 에셋 패널에서 폴더처럼 묶이고, 등급이 바뀌면 이름만 바뀔 뿐 **id 는 유지된다** —
승격해도 인스턴스가 끊기지 않는다. 위치로 상태를 나타내면 상태가 바뀔 때 위치가 흔들리므로 그렇게 하지 않았다.
`stub-test.mjs` 가 `Proposed/ActionBanner` → `ActionBanner` → 다시 `Proposed/` 로 왕복시키며 id 를 대조한다.

**승격하는 법:** `components.js` 에서 그 사양의 `status` 를 `"code"` 로 바꾸고 플러그인 ⑤를 다시 누르면 된다.
Figma 에서 이름을 손으로 고치지 않는다 — 다음 실행이 사양 쪽 이름으로 되돌린다.

**변형 하나하나에도 근거를 붙인다.** `variant.proposed = true` 와 `why`. 컴포넌트는 코드에서 뽑았는데
변형 중 일부만 추정인 경우가 실제로 많다 — 지금 15개가 그렇다. Figma 에서는 섹션 캡션과
변형별 description 에 뜬다. 컴포넌트 안에 배지를 넣지 않은 이유는 **인스턴스마다 따라붙기** 때문이다.

## 이름을 바꾸거나 합칠 때

⑴ RN 에 실제 공유 컴포넌트를 뽑고 → ⑵ 호출부를 전부 바꾸고 → ⑶ **그 다음에** Figma 를 정리한다.
Figma 를 먼저 정리하면 배치된 인스턴스가 끊긴다.

## 설계 근거

- **왜 페이지가 하나인가** — free 플랜은 파일당 페이지가 3개까지다. 기본 `Page 1`을 빼면 2개뿐이라
  Tokens·Components·Icons 를 페이지로 나누면 한도를 넘는다. 한 페이지 안 가로 오토레이아웃에
  보드 3개를 나란히 둔다(x 좌표를 손으로 계산하면 보드 폭이 바뀔 때마다 겹친다).
- **왜 모드가 아니라 이름으로 테마를 가르나** — free 플랜은 컬렉션당 모드가 1개다
  (`addMode` → `Error: in addMode: Limited to 1 modes only`, 실측 확인).
  그래서 `variation` 4종을 `minimal/ink`·`paper/ink`처럼 이름으로 가른다.
- **왜 Code Syntax에 ANDROID 슬롯을 쓰나** — WEB 슬롯은 Figma가 `var()` 래퍼를 씌워 RN 표현과 맞지 않는다.
  RN에는 전용 슬롯이 없어 ANDROID를 관례로 재활용한다. 각 변수의 description에도 같은 내용을 적어 둔다.
- **왜 `surface`·`text`·`line`·`quoteBar`가 없나** — 4개 팔레트 전부에서 `paper`·`ink`·`rule`·`ink4`와
  바이트 단위로 동일하다. 신 토큰으로 통일했다(결정 #7).
- **왜 크기에 `fontScale`이 곱해져 있지 않나** — Figma에는 base 값만 둔다.
  `Math.round(base × fontScale)` 곱셈은 앱의 `scaled()`가 한다(결정 #5).

전체 조사와 결정 근거는 [`../2026-09-06-token-and-component-survey.md`](../2026-09-06-token-and-component-survey.md).

## 파일 구성

| 파일 | 역할 |
|---|---|
| `manifest.json` | 플러그인 정의 |
| `code.js` | **자동 생성** — 직접 고치지 말 것 |
| `ui.html` | 플러그인 패널 |
| `tokens.colors.js` | **자동 생성** — `ThemeProvider.tsx`에서 추출한 색 64개 |
| `primitives.js` | 수치 토큰 정의 (손으로 관리) |
| `components.js` | 공통 컴포넌트 사양 — 코드에서 추출·검증한 값 |
| `component-builder.js` | ⑤ 컴포넌트 · `CalendarMonth` · ⑥ 아이콘 시트 생성 로직 |
| `extract-icons.mjs` | 설치된 `lucide-react-native` 에서 아이콘 도형 추출 → `icons.js` |
| `icons.inventory.js` | 아이콘 전수 인벤토리(의미·크기·불일치) |
| `main.js` | 플러그인 로직 (손으로 관리) |
| `build.mjs` | `code.js` 재생성 |
| `stub-test.mjs` | Figma Plugin API 스텁으로 `code.js`를 돌려 보는 검사 |

`primitives.js`나 `main.js`를 고쳤으면 **반드시** 다시 빌드한다:

```sh
node build.mjs && node --check code.js
```

`ThemeProvider.tsx`의 팔레트가 바뀌었으면 `tokens.colors.js`부터 다시 뽑는다:

```sh
python3 extract-colors.py     # 색 토큰 64개
node extract-icons.mjs        # lucide 아이콘 도형
node build.mjs
node docs/design-system/figma-plugin/stub-test.mjs   # 저장소 루트에서
```

`stub-test.mjs`는 Figma에 붙이기 전에 `code.js`를 스텁 위에서 실제로 돌린다 — 폰트 로드 순서,
색 범위(0–1), 레이아웃 enum, 변수 바인딩, **오토레이아웃 축**, **페이지 지연 로딩**(`dynamic-page`),
페이지 한도(3개), 보드 범위 삭제, 멱등성을 본다. 새 파일과 예전 파일 두 픽스처로 돌리고 문제가 있으면 종료 코드 1이다.

`extract-icons.mjs`는 앱 소스에서 lucide import 목록을 **직접 읽는다** — 손으로 적지 않는다.
(하드코딩했다가 작은따옴표 import 의 `Share` 를 놓친 적이 있다.)

## 알려진 제약

- 서체는 Figma 표현용 **Inter**다. 앱에는 폰트 파일도 `expo-font` 로딩도 없고,
  `fontStackFor()`가 RN이 받지 않는 CSS 콤마 스택을 반환한다(`wiki/drift.md` B24).
  이걸 고치기 전에는 Figma의 서체와 앱의 실제 렌더링이 일치하지 않는다.
- `border/hairline = 0.5`는 근사치다. 코드는 `StyleSheet.hairlineWidth`이고 실제 값은 기기 픽셀 밀도가 정한다.
- `text/line-height/title`·`display`는 **코드에 근거가 없는 제안값**이다(`확인필요`).
- ⑤의 컴포넌트 상태 중 **눌림·비활성·오류·포커스는 대부분 코드에 없는 제안**이다.
  저장소의 기존 선례에서 도출했다 — 눌림 `opacity 0.6`(`SermonMetaHeader.tsx:172`, 저장소 유일),
  비활성 `opacity 0.3`(`SermonMetaHeader.tsx:249`·`VerseList.tsx:127`),
  오류(`QuoteBlock.tsx:124`·`TabletWorkspace.tsx:399`). **포커스는 선례가 전혀 없는 순수 제안**이다.
  각 컴포넌트 description에 출처와 접근성 판정을 적어 두었다.
