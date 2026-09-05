# ADR-0019 · main 하나 + 버전별 릴리스 가지

```yaml
id: ADR-0019
status: accepted
statement: 작업 가지는 main에서 나서 main으로 돌아가고, 출시된 버전마다 release/<버전> 가지를 남겨 그 버전의 OTA와 핫픽스를 거기서 낸다. release에서 main으로는 역머지, main에서 release로는 cherry-pick만 한다. 브랜치 접두는 커밋 타입과 같은 단어를 쓴다.
confidence: 기록됨
source:
  - wiki/git.md 4절
  - apps/ch-life/.claude/skills/start-feature/SKILL.md
```

## 맥락

실제 히스토리는 이미 GitHub Flow였다 — `main` 하나에 짧은 작업 가지, PR로 병합. `develop`도 `release`도 없었다. 접두만 갈라져 있었다(`feat/`와 `feature/`가 공존, 거기에 `zzzRYT/CHL-T1` 한 건).

여기에 GitHub Flow만으로는 안 되는 사정이 하나 있다. **이 앱은 배포가 두 층이다.**

- 스토어 바이너리 — 사용자가 언제 올릴지 모른다. 1.0.1을 쓰는 사람이 계속 남는다.
- hot-updater OTA — `--target-app-version`으로 **특정 앱 버전을 겨냥해** 나간다([`CONTRACT-RELEASE`](../contracts/CONTRACT-RELEASE.md)).

즉 여러 버전이 동시에 살아 있고, 각 버전에 보낼 코드가 서로 다르다. `main` 하나만 있으면 1.0.2 사용자에게 보낼 수정이 **이미 1.1.0을 향해 가 있는 코드**에서 만들어진다. 스토어에 올린 것과 다른 코드가 OTA로 나가는 길이다.

## 결정

**`main` + 작업 가지**는 그대로 두고, **출시된 버전마다 `release/<버전>` 가지를 남긴다.** 그 버전에 나가는 OTA와 핫픽스는 전부 그 가지에서 낸다. 출시 커밋에는 `v<버전>` 태그를 붙이고, 릴리스 가지의 변경은 `main`으로 역머지한다.

방향은 비대칭이다 — **`release` → `main`은 머지, `main` → `release`는 cherry-pick만.** 릴리스 가지에 `main`을 머지하면 그 버전에 넣기로 한 적 없는 기능이 다음 OTA에 실린다.

브랜치 접두는 커밋 타입과 같은 단어로 통일한다. `release/`만 예외이며, 그것은 타입이 아니라 구조다.

## 대안

- **GitHub Flow 그대로(릴리스 가지 없음).** 지금까지 해 온 방식이고 가장 단순하다. 스토어 앱이 아니라면 이걸 골랐을 것이다. 구버전 사용자에게 보낼 수정을 만들 자리가 없어서 채택하지 않았다.
- **git-flow(`develop` + `release`).** `main`을 출시본으로만 두는 구조. 1인 저장소에서 `develop`↔`main` 동기화 비용만 남고, 지금의 "`main` 병합 → CI → OTA" 자동 경로와도 충돌한다.
- **태그만 쓰고 가지는 안 남긴다.** 핫픽스가 필요할 때 `git switch -c release/1.0.2 v1.0.2`로 만들면 된다는 안. 실제로 이것이 가지를 잃었을 때의 복구 절차이기도 하다. 그래도 가지를 남기는 쪽을 골랐다 — 룰셋으로 CI 게이트를 걸 대상이 있어야 하고, "지금 유지보수 중인 버전이 무엇인가"가 브랜치 목록에 보이는 편이 낫다.
- **`feature/` 유지.** 기존 기록·스킬과 일치하지만 커밋 타입(`feat`)과 어긋난 채로 남는다. 목록이 하나 더 갈라지느니 옛 표기를 버렸다.

## 귀결

- **`release/**`에 GitHub 룰셋을 걸었다** — 삭제·강제 푸시 금지, PR 필수, CI 통과 필수. 이 게이트가 없으면 릴리스 가지에 직접 푸시한 뒤 수동 OTA 배포를 돌릴 수 있고, 그 경로에는 타입체크·테스트가 없다.
- 병합 시 브랜치 자동 삭제를 켰다. 룰셋의 삭제 금지가 릴리스 가지를 이 자동 삭제에서 지킨다.
- **역머지는 릴리스 가지를 PR head로 쓰면 안 된다.** `main`이 strict라 GitHub이 `main`을 릴리스 가지에 병합하라고 요구하기 때문이다 — 금지한 방향이다. 임시 가지(`chore/backmerge-<버전>`)를 경유한다([`git.md`](../git.md) 4절).
- squash·rebase 머지 버튼을 저장소 설정에서 껐다. 병합 커밋 제목은 PR 제목에서 만들어지므로, PR 제목이 [`ADR-0016`](ADR-0016-commit-convention.md)을 따르면 `git log --first-parent main`이 그대로 변경 이력이 된다.
- 병합된 브랜치는 정리했다 — 원격 9개, 로컬 19개. `main`에 다 들어가 있어 잃은 커밋은 없다.
- [`ADR-0014`](ADR-0014-worktree-workflow.md)의 접두 표기(`feature/`)와 `start-feature` 스킬의 기본값을 이 결정에 맞춰 고쳤다. **핫픽스 작업은 `origin/main`이 아니라 `origin/release/<버전>`에서 분기해야 한다** — 스킬은 항상 `origin/main`을 기준으로 삼으므로 그때는 손으로 만든다.
