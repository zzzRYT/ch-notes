# CONTRACT-SETTINGS-FILE — settings.json

```yaml
id: CONTRACT-SETTINGS-FILE
policy: POL-A11Y-001
statement: 앱 설정은 문서 디렉터리의 settings.json 하나에 객체 그대로 직렬화된다. fontScale과 themePreference는 필수이며, 나머지 필드는 없거나 잘못돼도 개별 폴백한다.
implemented_by:
  - apps/ch-life/src/state/settings-persist.ts
  - apps/ch-life/src/state/settings-validator.ts
  - apps/ch-life/src/domain/types.ts
verified_by:
  - test: apps/ch-life/src/state/__tests__/settings-validator.test.ts
confidence: 기록됨
source:
  - docs/plans/2026-06-07-bible-reader-default-design.md 5절
```

## 스키마

| 필드 | 허용값 | 없을 때 | 기본값 |
|---|---|---|---|
| `fontScale` | 1.0 / 1.2 / 1.4 / 1.6 | **파일 전체 거부** | 1.2 |
| `themePreference` | system / light / dark | **파일 전체 거부** | system |
| `variation` | minimal / paper / focus / dark | `themePreference==="dark"`면 dark, 아니면 focus | focus |
| `blockStyle` | default / card / quote / collapse | default | default |
| `fontFamily` | sans / serif / mono | sans | sans |
| `accentChoice` | default 또는 지정된 6개 hex | default | default |
| `lastOpenedNoteId` | string 또는 null | null | null |
| `lastBibleRef` | string 또는 null (예: `"Gen 1"`) | null | null |
| `dismissedUpdateVersion` | string 또는 null (예: `"1.0.2"`) | null | null |

## 두 가지 엄격도가 공존하는 이유

`fontScale`·`themePreference`는 초기 구현의 전체 거부 방식이 남은 것이고, 나머지는 이후 회귀를 겪고 나서 도입한 개별 폴백이다([`RULE-SET-002`](../rules/settings-theme.md)). **새 필드는 반드시 개별 폴백 쪽**으로 추가한다. 필수 필드를 늘리면 기존 사용자의 설정 파일이 통째로 버려진다.

`themePreference`는 필수인데 **화면 색에 아무 영향도 주지 않는다.** 설정 UI에 노출되지도 않는다([`RULE-SET-003`](../rules/settings-theme.md)).

`lastOpenedNoteId`는 스키마에 있지만 읽는 곳이 없다 — 마지막 노트 자동 복원은 구현되지 않았다.

`dismissedUpdateVersion`은 스토어 업데이트 안내를 닫은 버전 문자열이다([`RULE-OTA-010`](../rules/release.md), [`ADR-0022`](../decisions/ADR-0022-store-update-notice.md)). 개별 폴백 쪽으로 넣었으므로 값이 빠지거나 깨져도 **설정 파일 전체가 버려지지 않는다** — 안내가 한 번 더 뜰 뿐이다.

## 바꾸려면

`domain/types.ts`의 `Settings` → `settings-validator.ts`의 허용값·폴백 → `app-store.ts`의 `DEFAULT_SETTINGS` → 필요하면 설정 화면. 저장은 스토어 구독이 자동으로 처리하므로 별도 배선이 없다.
