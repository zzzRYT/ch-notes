# ADR-0025 · 디자인 토큰은 Tailwind(uniwind) 클래스로도 쓴다 — 테마 = 변형, 클래스 이름 = Figma 변수 이름

```yaml
id: ADR-0025
status: accepted
statement: 앱 화면은 className으로 디자인 토큰을 쓸 수 있다. Tailwind 바인딩은 uniwind이고, uniwind 테마 이름은 Variation(minimal/paper/focus/dark) 그대로이며, 색 클래스 이름은 Figma 변수 이름(minimal/ink-2 → text-ink-2)과 같다. 팔레트의 원본은 여전히 ThemeProvider.tsx 하나이고 CSS는 거기서 생성한다.
confidence: 기록됨
source:
  - apps/ch-life/metro.config.js
  - apps/ch-life/src/global.css
  - apps/ch-life/src/theme.colors.css
  - apps/ch-life/src/shared/ui/ThemeProvider.tsx
  - apps/ch-life/src/shared/ui/__tests__/ThemeProvider.test.tsx
  - docs/design-system/figma-plugin/extract-colors.py
```

## 맥락

토큰은 있었지만 쓰는 길이 하나뿐이었다 — `useTheme()`로 `colors.ink2`를 꺼내 `style`에 넣는다. 화면마다 `StyleSheet.create`와 인라인 `scaled()`가 섞이고, 같은 색이 `ink2`·`subtle`·리터럴로 갈린다([`B9`](../drift.md)). Figma에 변수 64개가 올라갔지만([`ADR-0023`](ADR-0023-figma-design-system-structure.md)) 코드에서 그 이름으로 부를 방법이 없었다.

제약이 셋 있다. ⑴ 색은 OS 다크모드가 아니라 **변형 4종**이 정한다([`ADR-0010`](ADR-0010-variation-theming.md)). 라이트/다크 두 모드만 아는 도구는 맞지 않는다. ⑵ 사용자가 `accentChoice`로 강조색을 덮어쓰고 `fontScale`로 글자를 키운다 — 빌드 시점에 굳는 값이면 안 된다. ⑶ 배포는 JS만 바뀌면 OTA다. 네이티브 모듈이 붙으면 스토어 빌드가 필요해진다.

## 결정

**uniwind를 쓴다.** Tailwind v4 CSS를 Metro가 컴파일해 RN 스타일 객체로 만든다. 순수 JS다 — 패키지 폴더에 `ios/`·`android/`가 없고 nitro 모듈도 요구하지 않는다(1.12.0 기준 확인). 따라서 **OTA로 나간다.** 테마를 이름으로 여러 개 등록하고(`extraThemes`) 런타임에 변수를 갱신하는 API(`updateCSSVariables`)가 있어 제약 ⑴⑵를 그대로 만족한다.

**uniwind 테마 이름 = `Variation`.** `metro.config.js`의 `extraThemes: ["minimal", "paper", "focus"]`에 내장 `dark`를 더해 넷이다. 내장 `light`는 쓰지 않지만 uniwind가 모든 테마에 같은 변수를 요구해서 `focus` 값으로 채워 둔다. `ThemeProvider`가 `useLayoutEffect`에서 `Uniwind.setTheme(variation)`을 부른다 — 첫 페인트 전에(커밋 직후) OS 색 구성표를 따르던 초기 상태를 덮어쓰므로 [`ADR-0010`](ADR-0010-variation-theming.md)의 "OS 다크모드 미추종"이 유지된다.

**런타임 값은 변수 갱신으로.** 같은 effect가 `Uniwind.updateCSSVariables(variation, …)`로 `--color-accent`·`--color-accent-soft`(accentChoice 반영값)와 `--text-*` 여섯 개(base × fontScale)를 밀어 넣는다. 그래서 `text-body`는 `scaled(15, fontScale)`과 같은 크기가 되고, `bg-accent`는 사용자가 고른 색이 된다. **className을 쓰는 곳은 이 한 군데만 믿으면 된다.**

**팔레트 원본은 여전히 `ThemeProvider.tsx` 하나다.** `extract-colors.py`가 거기서 `tokens.colors.{json,js}`(Figma 플러그인용)와 `src/theme.colors.css`(uniwind용)를 **같이** 생성한다. CSS를 손으로 고치지 않는다.

**클래스 이름은 Figma 변수 이름을 그대로 쓴다.** Figma `minimal/ink-2` → CSS `--color-ink-2` → 클래스 `text-ink-2`. `bg-bg`·`bg-chip-bg`처럼 어색한 이름이 생기지만 바꾸지 않는다 — 이름이 같다는 것이 Figma↔코드를 잇는 유일한 끈이기 때문이다([`E21`](../drift.md)).

### 쓸 수 있는 클래스

색(4변형 자동 전환 — 어느 변형인지 호출부는 모른다):

| 토큰 | 클래스 예 | 용도 |
|---|---|---|
| `bg` | `bg-bg` | 캔버스 배경 |
| `paper` | `bg-paper` | 카드·시트 표면 |
| `ink` `ink-2` `ink-3` `ink-4` | `text-ink`, `text-ink-2`, `border-ink-4` | 본문 → 보조 → 흐림 → 가장 흐림 |
| `subtle` | `text-subtle` | ⚠️ `ink-2`와 값이 다르다. 통합하지 말 것 |
| `rule` | `border-rule` | 구분선 |
| `accent` `accent-soft` `accent-text` | `bg-accent`, `bg-accent-soft`, `text-accent-text` | 강조. 사용자 `accentChoice` 반영 |
| `chip-bg` `chip-text` | `bg-chip-bg`, `text-chip-text` | 칩 |
| `err-bar` `err-bg` `err-text` | `border-err-bar`, `bg-err-bg`, `text-err-text` | 오류 |

타이포·수치(`primitives.js`와 같은 이름):

| 클래스 | 값 |
|---|---|
| `text-display` `text-title` `text-body-large` `text-body` `text-label` `text-caption` | 30/20/17/15/13/11 × fontScale, 행간 포함 |
| `font-normal` `font-semibold` `font-bold` | 400/600/700 (Tailwind 기본) |
| `tracking-eyebrow` `tracking-title` | 0.6 / -0.3 |
| `rounded-3` … `rounded-16`, `rounded-full` | census 실측 7종 |
| `p-1.5` `gap-2.5` … | Tailwind 기본 4px 단위 + `.5` = 2px 그리드 그대로 |
| `min-h-touch` `size-touch` `size-fab` | 44 / 44 / 56 (RULE-UI-004) |
| `w-pane-left` `w-pane-right` | 280 / 340 (RULE-UI-002) |

## 귀결

- **새 색 토큰은 `ThemeProvider.tsx` 팔레트 4개에 넣고 `extract-colors.py`를 돌린다.** 그러면 Figma 플러그인 토큰과 CSS가 함께 갱신된다. `FIELDS` 목록에도 한 줄 더한다.
- **타입 스케일은 두 곳이다** — `src/global.css`의 `--text-*`(초기값)와 `ThemeProvider.tsx`의 `TEXT_SCALE`(×fontScale 갱신용). 단계를 더하거나 값을 바꾸면 둘 다, 그리고 `primitives.js`의 `text/size/*`도. → [`B31`](../drift.md)
- `useTheme()`와 `style`은 그대로 유효하다. 기존 화면을 옮기는 것은 이 결정의 범위가 아니다. 새 코드나 손대는 화면부터 className을 쓴다.
- `Uniwind.setTheme("dark")`는 `Appearance.setColorScheme("dark")`도 부른다. dark 변형에서는 네이티브 요소(키보드·알림창)도 어두워진다 — 이전에는 OS를 따랐다. 다른 세 변형은 이전과 같이 OS를 따른다.
- `uniwind-types.d.ts`는 Metro가 생성하지만 **커밋한다.** CI의 `tsc`는 Metro 없이 돌기 때문이다.
- Tailwind는 `global.css`가 있는 폴더 아래만 스캔한다. 그래서 CSS가 `src/app/`이 아니라 `src/` 루트에 있다. 옮기면 클래스가 조용히 사라진다.
- `src/features/settings`가 아니라 `shared/ui`에서 uniwind를 부른다 — 테마는 표현 축이고 `ThemeProvider`가 이미 그 결정을 한 곳에 모아 두었기 때문이다(FSD 방향 유지).

## 대안

**NativeWind v4.** 가장 널리 쓰이지만 라이트/다크 두 모드가 전제이고, 변형 4종은 `vars()`로 감싼 View 트리로 흉내 내야 한다. 변형 = 테마 이름이라는 단순한 대응이 사라진다.

**`useTheme()`만 유지.** 의존성 0이지만 "Figma 이름으로 부른다"를 만들지 못한다. 그 요구가 이 결정의 출발점이다.

**CSS를 원본으로 삼고 `ThemeProvider`가 `Uniwind.getCSSVariable`로 읽기.** 원본이 하나가 되어 더 깔끔하다. 다만 `useTheme().colors`를 쓰는 기존 호출부 전부가 uniwind 런타임에 묶이고, 테스트마다 Metro 컴파일 결과가 필요해진다. 호출부가 className으로 대부분 옮겨간 뒤에 다시 본다.
