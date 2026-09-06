# RULE-SET — 설정, 테마, 표시 변형

상위 정책: [`POL-A11Y-001`](../policy/POL-ACCESSIBILITY.md)

설정은 zustand 스토어의 단일 객체이며 파일 하나(`settings.json`)에 통째로 직렬화된다. 형식은 [`CONTRACT-SETTINGS-FILE`](../contracts/CONTRACT-SETTINGS-FILE.md)에 고정되어 있다.

---

## RULE-SET-001 · 설정은 파일 하나, 실패하면 조용히 기본값

```yaml
id: RULE-SET-001
policy: POL-A11Y-001
requirement: MUST
statement: 설정은 문서 디렉터리의 settings.json에 저장한다. 읽기·파싱에 실패하면 예외를 올리지 않고 기본값으로 시작한다.
implemented_by:
  - apps/ch-life/src/state/settings-persist.ts
  - apps/ch-life/src/state/app-store.ts (DEFAULT_SETTINGS)
verified_by:
  - test: apps/ch-life/src/state/__tests__/app-store.test.ts
  - test: apps/ch-life/src/state/__tests__/settings-validator.test.ts
confidence: 코드추론
```

계획 단계의 저장소는 `react-native-mmkv`였으나 파일 한 개로 바뀌었다([`ADR-0004`](../decisions/ADR-0004-settings-file.md)). 설정은 자주 쓰이지 않고 크기가 작아 파일 IO로 충분하다.

기본값은 `fontScale: 1.2`(한 단계 큰 글씨), `variation: "focus"`, `themePreference: "system"` 이다.

## RULE-SET-002 · 필수 필드는 엄격히, 나머지는 관대하게

```yaml
id: RULE-SET-002
policy: POL-A11Y-001
requirement: MUST
statement: fontScale과 themePreference가 허용값이 아니면 설정 파일 전체를 버리고 기본값으로 시작한다. 그 밖의 필드는 값이 틀려도 파일을 버리지 않고 개별 폴백한다.
implemented_by:
  - apps/ch-life/src/state/settings-validator.ts
verified_by:
  - test: apps/ch-life/src/state/__tests__/settings-validator.test.ts
confidence: 기록됨
source:
  - docs/plans/2026-06-07-bible-reader-default-design.md 5절 (관대한 파싱 — 구버전 settings.json이 통째로 날아갈 위험)
```

두 규칙이 한 함수에 공존하는 이유가 기록되어 있다. 초기 방식(전체 거부)을 새 필드에도 적용했더니 **구버전 설정 파일이 통째로 날아가는** 회귀가 생겼고, 이후 추가 필드는 `readEnum` 스타일의 개별 폴백으로 바꿨다.

`variation`이 없을 때만 예외적으로 `themePreference === "dark"`이면 `dark` 변형으로 승격한다 — 변형 개념이 생기기 전 설정 파일을 위한 마이그레이션이다.

새 설정 필드를 추가할 때는 **반드시 관대한 쪽**을 따른다. 필수 필드를 늘리면 기존 사용자의 설정이 초기화된다.

## RULE-SET-003 · 팔레트는 variation이 결정한다

```yaml
id: RULE-SET-003
policy: POL-A11Y-001
requirement: MUST
statement: 화면 색은 variation(minimal/paper/focus/dark) 하나로 결정된다. isDark는 variation === "dark"이며 themePreference나 OS 다크모드와 무관하다.
implemented_by:
  - apps/ch-life/src/theme/ThemeProvider.tsx
verified_by:
  - test: apps/ch-life/src/state/__tests__/settings-validator.test.ts
  - manual: OS 다크모드를 켜도 variation이 focus면 밝은 화면 유지
confidence: 기록됨
source:
  - apps/ch-life/CLAUDE.md ("isDark = variation === 'dark' (themePreference 아님)")
  - apps/ch-life/src/theme/ThemeProvider.tsx 주석 (Claude Design handoff — 4 variations)
```

**`themePreference`는 지금 아무 색에도 영향을 주지 않는다.** 설정 화면에 노출되지도 않는다. 필드가 남아 있는 이유는 설정 파일의 필수 스키마이자 구버전 승격 판단에 쓰이기 때문이다([`RULE-SET-002`](#rule-set-002--필수-필드는-엄격히-나머지는-관대하게)).

그 결과 **OS 다크모드를 따라가는 동작이 없다.** `app.config.ts`의 `userInterfaceStyle: "automatic"`과 v1 spec 6.1의 "테마: 시스템/라이트/다크"는 현재 구현과 어긋난다([`drift.md`](../drift.md) A절, [`ADR-0010`](../decisions/ADR-0010-variation-theming.md)).

## RULE-SET-004 · 인용 표시와 강조색은 변형 기본값 위에 덮어쓴다

```yaml
id: RULE-SET-004
policy: POL-A11Y-001
requirement: SHOULD
statement: blockStyle과 accentChoice가 "default"면 현재 변형의 기본값을 쓰고, 사용자가 고른 값이 있으면 그것이 이긴다.
implemented_by:
  - apps/ch-life/src/theme/ThemeProvider.tsx
  - apps/ch-life/app/settings.tsx
verified_by:
  - manual: 변형을 바꾸면 인용 블록 모양이 함께 바뀌고, 명시 선택 시 유지된다
confidence: 코드추론
```

변형별 인용 기본 모양은 minimal=카드, paper=인용바, focus=접힘, dark=인용바다. 사용자가 강조색을 직접 고르면 옅은 배경색(`accentSoft`)은 그 색의 8% 알파로 자동 파생한다.

## RULE-SET-005 · 글꼴 크기는 4단계 배율

```yaml
id: RULE-SET-005
policy: POL-A11Y-001
requirement: MUST
statement: 글꼴 크기는 1.0 / 1.2 / 1.4 / 1.6 네 값만 허용하며, 화면의 글자 크기는 기준값 × 배율을 반올림해 계산한다.
implemented_by:
  - apps/ch-life/src/theme/ThemeProvider.tsx (scaled)
  - apps/ch-life/src/state/settings-validator.ts
verified_by:
  - test: apps/ch-life/src/state/__tests__/settings-validator.test.ts#허용되지 않는 fontScale 거부
confidence: 코드추론
```

OS 시스템 글자 크기를 따라가지 않고 앱 자체 배율만 쓴다(`DESIGN.md` Open Question 2는 열려 있는 채로 자체 슬라이더 방식이 채택되었다). 배율은 본문·인용·목록·메타 헤더에 적용되지만, 일부 고정 크기 요소(성경 리더 내부 등)에는 적용되지 않는다.

## RULE-SET-006 · 설정 변경은 즉시 저장된다

```yaml
id: RULE-SET-006
policy: POL-A11Y-001
requirement: SHOULD
statement: 설정 객체가 바뀔 때마다 파일에 저장하되, 앱 시작 시 파일을 다 읽기 전에는 저장하지 않는다. 이 배선은 useSettingsPersistence 훅 하나에 모여 있고 루트 레이아웃은 그것을 부르기만 한다.
implemented_by:
  - apps/ch-life/src/state/useSettingsPersistence.ts
  - apps/ch-life/app/_layout.tsx
verified_by:
  - manual: 설정 변경 후 앱 재시작 시 유지
confidence: 코드추론
```

로드 완료 플래그가 서기 전에는 구독이 저장을 건너뛴다. 그렇게 하지 않으면 기본값이 파일을 덮어써 저장된 설정이 사라진다. 저장 실패는 콘솔 경고만 남기고 사용자에게 알리지 않는다.

같은 플래그를 스토어의 `settingsLoaded`로도 내보낸다 — **"아직 안 읽었다"와 "읽었는데 값이 없다"를 화면이 구별해야 하기 때문**이다. 파일을 읽기 전의 기본값을 저장값으로 오인하면 이미 닫은 안내가 깜빡였다 사라진다([`RULE-OTA-010`](release.md)).

⚠️ **부팅 배선은 `app/_layout.tsx`가 아니라 자기 모듈 옆에 둔다.** 레이아웃은 프로바이더·훅 호출·화면 위 호스트 목록만 담는 합성 지점이다. 여기에 이펙트를 직접 쓰기 시작하면 그 파일이 앱의 모든 시작 동작을 아는 자리가 된다 — 이미 위키 블록 열한 개가 `_layout.tsx`를 가리키고 있다.
