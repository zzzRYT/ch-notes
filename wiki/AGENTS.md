# Canonical wiki

이 디렉터리는 현재 앱의 정책(`POL`), 규칙(`RULE`), 계약(`CONTRACT`), 결정(`ADR`)을 설명하는 정본이다. 구현과 다르면 구현이 최종 판정 기준이다.

## 작업 순서

1. [`by-task.md`](by-task.md)에서 작업 유형이나 코드 경로의 관련 ID를 찾는다.
2. `statement`, `implemented_by`, `verified_by`를 실제 코드와 테스트 본문에 대조한다.
3. 어긋나면 위키를 현재 코드에 맞추고 [`drift.md`](drift.md)에 차이를 기록한다.
4. 이유를 모르면 추측하지 말고 `confidence: 확인필요`와 `drift.md`의 질문으로 남긴다.
5. 동작 변경과 관련 `RULE`/`CONTRACT` 수정은 같은 변경에 둔다.

블록 형식과 ID 규칙은 [`README.md`](README.md), 전체 절차는 [`workflow.md`](workflow.md)를 따른다. 커밋·브랜치·PR·릴리스 절차의 정본은 [`git.md`](git.md)다.

## 검증

- 모든 wiki 변경: 저장소 루트에서 `node wiki/check.mjs`
- 블록을 추가하거나 requirement/confidence를 바꾼 경우: 저장소 루트에서 `node wiki/gen-index.mjs` 후 생성 결과 확인
- 링크와 `implemented_by`/`verified_by` 경로가 실제로 존재하는지 확인
