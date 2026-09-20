# Supporting documents

이 디렉터리는 계획 기록, 스토어 운영 문서, 법률 문서, 디자인 자료를 보관한다. 현재 앱 동작의 정본은 `../wiki/`, 최종 판정 기준은 `../apps/ch-life/`의 구현이다.

## 문서별 역할

- `plans/**`와 `superpowers/{plans,specs}/**`는 역사 기록이다. 사용자가 명시적으로 요청하지 않으면 수정하거나 현재 요구사항으로 사용하지 않는다.
- `store/**`는 운영 안내다. 릴리스 절차와 충돌하면 [`../wiki/git.md`](../wiki/git.md)와 release `POL`/`RULE`/`CONTRACT`를 우선하고 이 문서를 맞춘다.
- `design-system/**` 변경은 관련 ADR과 Figma 정본 여부를 먼저 확인한다.
- 현재 동작을 바꾸는 결정은 이 디렉터리에만 적지 말고 관련 wiki 문서에도 반영한다.

## 검증

- 문서 링크와 예시 명령을 확인하고 `git diff --check`를 실행한다.
- wiki도 함께 바뀌면 저장소 루트에서 `node wiki/check.mjs`를 실행한다.
