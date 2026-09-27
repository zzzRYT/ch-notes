# ADR-0028 · 작업은 dev에 모으고, main에는 나갈 것만 들인다

```yaml
id: ADR-0028
status: accepted
supersedes: ADR-0020 중 "작업 가지는 main에서 나서 main으로 돌아간다", ADR-0013 중 "main CI 성공 시 OTA 자동 발행"
statement: 작업 가지는 dev에서 나서 dev로 돌아가고, main에는 실제로 출시할 내용만 dev→main 머지로 들인다. dev는 직접 푸시를 허용한다. main·dev 병합은 아무것도 발행하지 않으며, preview OTA도 수동 실행으로만 낸다.
confidence: 기록됨
source:
  - 사용자 결정 (2026-09-27)
  - wiki/git.md 4·5절
  - .github/workflows/eas-update.yml
  - .github/workflows/ci.yml
```

## 맥락

[`ADR-0020`](ADR-0020-branch-strategy.md)은 `develop` 가지를 검토하고 채택하지 않았다. 이유는 두 가지였다. 1인 저장소에서는 동기화 비용만 남고, "`main` 병합 → CI → OTA" 자동 경로와 충돌한다는 것이다.

그 뒤로 사정이 바뀌었다. 작업 가지가 로컬에 쌓이기 시작했다(`feat/tentap-editor` 스파이크, `feat/editor-format-toolbar`, `feat/quote-ref-edit`). 그중에는 나갈지 정하지 않은 채 쌓인 것도 있었다(당시의 WebView 에디터 스파이크). `main`이 유일한 통합 가지라면 이 작업들을 합쳐 볼 자리가 `main`뿐이다. 그러면 `main`이 "다음 출시 후보"라는 뜻을 잃는다.

사용자의 요구는 이렇다. **`main`으로 머지해도 출시는 되지 않는다. 다만 앞으로 `main`에 들어가는 커밋은 실제로 반영될 내용만이어야 한다.**

## 결정

- **`dev`를 통합 가지로 둔다.** 작업 가지는 `origin/dev`에서 잘라 `dev`로 돌아간다.
- **`dev` → `main`은 PR 하나로 통째 머지한다.** cherry-pick으로 골라 옮기지 않는다. 따라서 **`dev`에는 나갈 것만 넣는다.** 나갈지 정하지 않은 작업(스파이크·실험)은 작업 가지에 남겨 두고 `dev`에 넣지 않는다.
- **`dev`는 직접 푸시를 허용한다.** 품질 게이트는 `dev` → `main` PR에 건다([`ADR-0018`](ADR-0018-pr-gate.md) 그대로). 삭제만 막는다. 병합 시 자동 삭제가 켜져 있어서, 막지 않으면 `dev` → `main` PR을 병합하는 순간 `dev`가 지워진다.
- **자동 OTA를 없앤다.** `main`·`dev` 병합은 아무것도 발행하지 않는다. `preview`도 `production`과 마찬가지로 수동 실행으로만 낸다. 발행 워크플로는 발행 직전에 같은 커밋으로 CI를 다시 돌린다. 직접 푸시된 `dev` 커밋을 쏘더라도 CI를 통과한 커밋만 나가게 하기 위해서다([`POL-RELEASE-001`](../policy/POL-RELEASE.md)).
- `release/<버전>`은 그대로 `main`에서 자른다. 역머지는 `release` → `main`으로 하고, 이어서 `main` → `dev`로 한다.

> **이유 미기록.** preview까지 수동으로 둔 이유와 `dev` 직접 푸시를 허용한 이유는 사용자가 결정만 했고 적지 않았다([`../drift.md`](../drift.md) E24).

## 대안

- **GitHub Flow 유지(`main`만).** 가장 단순하다. 하지만 미확정 작업이 `main`에 섞이는 문제를 풀지 못한다.
- **`dev`에 실험까지 넣고 `main`에는 cherry-pick.** 유연하다. 대신 `dev`와 `main`의 히스토리가 갈라져 충돌과 중복 커밋을 계속 관리해야 한다. 채택하지 않았다.
- **preview OTA를 `dev` 병합 시 자동 발행.** 실기기 검증 흐름이 가장 짧다. 하지만 사용자가 수동만 원했다.
- **`dev`도 PR + CI 필수.** `main`과 같은 게이트를 한 번 더 거는 방식이다. 사용자가 직접 푸시를 원했다. 대신 CI는 `dev` 푸시마다 돈다. 막지는 않지만 결과는 보인다.

## 귀결

- [`ADR-0020`](ADR-0020-branch-strategy.md)의 릴리스 가지 규칙(`release/**` 룰셋, cherry-pick 방향, 임시 가지 역머지)은 그대로다. 바뀐 것은 작업 가지의 분기점과 돌아가는 곳뿐이다.
- [`ADR-0013`](ADR-0013-release-path.md)의 "CI 성공 시 자동 발행"은 없어졌다. "CI 통과 커밋만 나간다"는 이제 `workflow_run`이 아니라 발행 워크플로 안의 CI 재실행(`workflow_call`)이 보장한다.
- `Closes #N` 이슈는 기본 가지(`main`)에 병합될 때 닫힌다. 따라서 `dev`로 가는 PR에 적은 `Closes`는 **`dev` → `main` 병합 때** 닫힌다.
- `start-feature` 스킬의 분기점이 `origin/dev`로 바뀌었다.
- `release` 역머지를 `main`에 병합한 뒤에는 `main`을 `dev`에 머지하는 의무가 추가로 생긴다. 이를 빠뜨리면 다음 `dev` → `main` PR에서 버전 bump 충돌이 난다.
