# ADR-0010 · 테마는 라이트/다크가 아니라 4가지 변형

```yaml
id: ADR-0010
status: accepted
supersedes: docs/plans/2026-05-17-ch-life-v1-spec.md 6.1 (시스템/라이트/다크)
statement: 화면 색은 minimal·paper·focus·dark 네 가지 변형 중 하나로 결정된다. OS 다크모드를 따라가지 않고, themePreference 필드는 색에 관여하지 않는다.
confidence: 기록됨
source:
  - apps/ch-life/src/theme/ThemeProvider.tsx 주석 ("Claude Design handoff — 설교 노트 앱, 4 variations")
  - apps/ch-life/CLAUDE.md ("isDark = variation === 'dark'")
```

## 맥락

계획은 "시스템 따라가기 + 라이트/다크 강제" 3택이었다. 이후 디자인 핸드오프로 **네 가지 시각 변형**(styles.css)이 들어오면서, 색 체계가 밝기 축이 아니라 성격 축으로 바뀌었다.

| 변형 | 성격 | 강조색 | 인용 기본 모양 |
|---|---|---|---|
| minimal | 깨끗한 화이트 | 파랑 | 카드 |
| paper | 크림 톤 | 갈색 | 인용바 |
| focus (기본) | 여백 중심 | 슬레이트 | 접힘 |
| dark | 긴 설교용 | 호박 | 인용바 |

## 결정

변형 하나가 팔레트·인용 표시 기본값·밀도를 함께 결정한다. 사용자는 강조색과 인용 표시를 따로 덮어쓸 수 있다.

## 귀결

- **OS 다크모드를 따라가지 않는다.** 시스템이 다크여도 `focus`를 골라 뒀으면 밝은 화면이다. `app.config.ts`의 `userInterfaceStyle: "automatic"`은 실질 효과가 없다.
- `themePreference`는 설정 파일의 필수 필드로 남아 있지만 **화면에 노출되지도, 색에 영향을 주지도 않는다**([`RULE-SET-003`](../rules/settings-theme.md)).
- 예배실 조명 대응은 사용자가 dark 변형을 직접 고르는 것으로 충족한다([`POL-A11Y-001`](../policy/POL-ACCESSIBILITY.md)).
- 팔레트에 구 필드(`bg/surface/text/…`)와 신 토큰(`ink/paper/rule/accent…`)이 함께 남아 있다. 정리되지 않은 중간 상태다.
