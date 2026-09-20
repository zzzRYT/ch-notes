# ch-life repository guide

이 파일은 저장소 전체의 이정표다. Codex는 루트부터 현재 작업 디렉터리까지 `AGENTS.md`를 합치고 더 가까운 파일을 우선하므로, 작업 경로에 하위 `AGENTS.md`가 있으면 편집 전에 반드시 읽는다.

## 작업 지도

| 작업 대상 | 먼저 읽을 지침 |
|---|---|
| 앱 코드·설정 (`apps/ch-life/**`) | [`apps/ch-life/AGENTS.md`](apps/ch-life/AGENTS.md) |
| 정책·규칙·계약·ADR (`wiki/**`) | [`wiki/AGENTS.md`](wiki/AGENTS.md) |
| 설계·스토어·계획 문서 (`docs/**`) | [`docs/AGENTS.md`](docs/AGENTS.md) |
| CI·릴리스 (`.github/workflows/**`, `website/app-version.json`) | 앱 지침의 배포 절과 [`wiki/git.md`](wiki/git.md#5-버전과-배포) |

## 저장소 공통 규칙

- `apps/ch-life/`의 현재 구현이 최종 판정 기준이고, `wiki/`는 그 동작과 결정을 설명하는 정본이다. 둘이 다르면 새 작업 전에 위키를 현재 코드에 맞추고 `wiki/drift.md`에 남긴다.
- 동작을 바꾸면 관련 `RULE`/`CONTRACT`를 같은 변경에서 갱신한다. 작업별 진입점은 [`wiki/by-task.md`](wiki/by-task.md)다.
- `DESIGN.md`와 `docs/plans/**`는 역사 기록이다. 사용자가 명시적으로 요청하지 않으면 현재 요구사항으로 취급하거나 수정하지 않는다.
- `main`은 보호 브랜치다. 직접 commit/push하지 말고 작업 브랜치와 PR을 사용한다. 상세 규칙은 [`wiki/git.md`](wiki/git.md)다.
- 비밀값·토큰·서명 키·기기 정보는 커밋하거나 출력하지 않는다.

## 검증

- 루트 공통 검증에 더해, 바뀐 영역의 가장 가까운 `AGENTS.md`에 적힌 검증을 실행한다.
- `wiki/**`가 바뀌면 저장소 루트에서 `node wiki/check.mjs`를 실행한다.
- 문서만 바뀌었다면 앱 전체 테스트는 생략하고 링크·명령·`git diff --check`를 확인한다.
