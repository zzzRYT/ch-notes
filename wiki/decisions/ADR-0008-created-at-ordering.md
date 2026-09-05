# ADR-0008 · 목록 정렬 기준을 updated_at에서 created_at으로

```yaml
id: ADR-0008
status: accepted
supersedes: docs/plans/2026-05-17-ch-life-v1-spec.md 2.2 (updatedAt DESC)
statement: 노트 목록·그룹핑·검색 결과는 모두 created_at 기준으로 정렬한다. updated_at은 저장 시각 기록으로만 남는다.
confidence: 확인필요
source:
  - apps/ch-life/src/db/index.ts ("DROP INDEX IF EXISTS idx_notes_updated_at")
  - apps/ch-life/src/db/note-repo.ts (listRecent / searchNotes)
  - apps/ch-life/src/list/group-notes.ts
```

## 맥락

초기 스키마에는 `idx_notes_updated_at`이 있었고 목록도 `updated_at DESC`였다. 지금은 인덱스를 **명시적으로 제거**하고 `idx_notes_created_at`을 새로 만든다 — 우연이 아니라 의도적 전환의 흔적이다.

## 결정

정렬·그룹핑·검색 결과 모두 `created_at`.

## 이유

기록되어 있지 않다. 정황: 설교 노트는 "언제 들은 설교인가"로 찾는 자료다. `updated_at` 기준이면 오래된 노트를 잠깐 열어 오타 하나만 고쳐도 목록 맨 위로 올라와, 날짜별 그룹 머리글이 실제 예배 날짜와 어긋난다. **확인이 필요하다.**

## 귀결

- 노트를 나중에 손봐도 목록에서 자리를 지킨다. 테스트가 이 성질을 명시적으로 고정하고 있다("업데이트해도 순서 변하지 않음").
- 날짜 그룹 머리글이 **작성일**이지 설교일(`sermonDate`)이 아니다. 지난 주 설교를 이번 주에 정리해 넣으면 이번 주로 묶인다.
- `updated_at`은 마크다운 파일명과 frontmatter에만 쓰인다.
- 검색 결과 정렬도 `created_at`인데, **테스트 이름은 여전히 "최신 updated_at 우선"이다** — 이름과 검증 내용이 어긋난 오라클이다([`drift.md`](../drift.md) C절).
