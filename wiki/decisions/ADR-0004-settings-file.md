# ADR-0004 · 설정 저장소는 MMKV가 아니라 settings.json

```yaml
id: ADR-0004
status: accepted
supersedes: DESIGN.md 데이터 모델 (Settings를 MMKV에 저장)
statement: 앱 설정은 react-native-mmkv가 아니라 expo-file-system으로 쓰는 JSON 파일 한 개에 저장한다.
confidence: 확인필요
source:
  - apps/ch-life/src/state/settings-persist.ts
  - docs/plans/2026-05-17-ch-life-v1-spec.md 5.2 (저장 위치 표 — settings.json)
```

## 맥락

`DESIGN.md`는 설정을 MMKV에 두기로 했으나, v1 spec 5.2 시점에는 이미 `documentDirectory/settings.json`으로 적혀 있다.

## 결정

파일 한 개에 설정 객체를 통째로 직렬화한다.

## 이유

**기록되어 있지 않다.** 코드에서 읽히는 정황은 두 가지다.

- MMKV는 네이티브 모듈이라 의존성과 빌드 부담이 늘어난다. 설정은 앱 시작 시 한 번 읽고 변경 시 한 번 쓰는 정도라 파일 IO로 충분하다.
- 노트 DB도 같은 문서 디렉터리에 있어, 사용자가 파일 앱에서 함께 꺼낼 수 있다.

둘 다 **추정이며 확인이 필요하다**([`drift.md`](../drift.md) E절).

## 귀결

- 네이티브 의존성이 하나 줄었다. OTA로 설정 로직을 고칠 수 있다.
- 쓰기가 비동기이고 원자적이지 않다. 저장 도중 앱이 죽으면 파일이 깨질 수 있고, 그때는 조용히 기본값으로 시작한다([`RULE-SET-001`](../rules/settings-theme.md)).
- 파싱 정책(필수/관대)을 직접 구현해야 한다 — 그 결과가 [`RULE-SET-002`](../rules/settings-theme.md)의 두 가지 엄격도다.
