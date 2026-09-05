# ch-life — 저장소 루트

한국 교회 통합 앱. 앱 본체는 `apps/ch-life/`이고, 그 안에서 작업할 때의 지침은
`apps/ch-life/CLAUDE.md`에 있다. 이 파일은 **저장소 어디에서 작업하든 적용되는 것**만 담는다.

## 무슨 일을 하든 정본을 먼저 본다

이 앱이 무엇을 보장하는지(`POL`), 무엇이 항상 참인지(`RULE`), 무엇이 고정되어 있는지(`CONTRACT`),
왜 그렇게 정했는지(`ADR`)는 **`wiki/`가 정본이다.**

1. `wiki/by-task.md`에서 작업 유형 또는 건드릴 코드 경로로 관련 ID를 찾는다.
   없는 영역이면 폴더 인덱스로 — `wiki/{policy,rules,contracts,decisions}/index.md`.
2. 그 `RULE`/`CONTRACT`를 **현재 코드와 대조한다.** 테스트는 이름이 아니라 본문을 본다.
3. 어긋나면 **코드가 정본이다.** 위키를 먼저 고치고 `wiki/drift.md`에 남긴다.
4. 작업한다.
5. 동작을 바꿨으면 **같은 변경에서** `RULE`/`CONTRACT`를 갱신하고 `node wiki/check.mjs`를 통과시킨다.

절차 전문은 `wiki/workflow.md`. 이유를 모르면 지어내지 않는다 — `confidence: 확인필요`로 두고
`wiki/drift.md` E절에 질문으로 남긴다.

## 이 저장소의 문서 지위

| | |
|---|---|
| `apps/ch-life/` | 구현 코드 — **최종 판정 기준** |
| `wiki/` | 정본 서술. 코드와 어긋나면 코드가 맞다 |
| `CLAUDE.md`, `README.md` | 작업용 요약. 위키와 어긋나면 위키가 맞다 |
| `DESIGN.md`, `docs/plans/**` | **역사 기록.** 현재의 합격 기준이 아니다. 수정하지 않는다 |

`DESIGN.md`·`docs/plans/**`가 지금 구현과 어긋나는 지점은 `wiki/drift.md`에 목록화되어 있다.

## 워크트리

기능 브랜치는 별도 워크트리에서 작업한다(`ADR-0014`). 검증은 **활성 워크트리 안에서** —
main 체크아웃의 `node_modules`는 깨져 있을 수 있다.
