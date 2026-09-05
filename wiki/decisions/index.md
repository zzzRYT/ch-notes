# `decisions/` — 결정 기록 `ADR-*`

> 손으로 쓴다. 전체 ID 표는 [`../index.md`](../index.md)(생성물), 절차는 [`../workflow.md`](../workflow.md).

**왜 지금 이 모양인가.** 다른 세 계층이 "무엇"을 적는다면 여기는 "왜"를 적는다.

이 폴더는 다른 곳과 성격이 다르다. `requirement`도 `verified_by`도 없다 — 결정은 테스트로 검증할 수 있는 종류가 아니다. 그리고 **이 ADR들은 결정 당시에 쓰인 것이 아니라 사후에 재구성한 것이다.** 그래서 각 블록의 `confidence`를 반드시 함께 읽어야 한다.

아래 개수는 **2026-09-05 기준의 사본**이다. 최신값은 [`../index.md`](../index.md)의 "ADR — 결정 기록" 표에서 근거 열을 세면 나온다 (커버리지 절의 `확인 필요`는 RULE까지 포함한 위키 전체 합계라 이 표와 수가 다르다).

| `confidence` | 뜻 | 개수 |
|---|---|---|
| `기록됨` | 결정이 문서·커밋에 실제로 남아 있다 | 10 |
| `확인필요` | 무엇을 했는지는 알지만 **왜인지는 아무도 기록하지 않았다** | 5 |

`확인필요` 5건: ADR-0004 · ADR-0006 · ADR-0007 · ADR-0008 · ADR-0009. 질문은 [`../drift.md`](../drift.md) E절에 있고, 답은 사용자만 줄 수 있다.

여기에 더해 **`기록됨`인데 "이유" 절만 미기록인 것**이 넷 있다 — ADR-0002 · ADR-0005 · ADR-0013 · ADR-0014. 결정 자체는 문서에 남았지만 근거는 정황 추정뿐이라 "정황 (미기록)"으로 표시해 두었다. 지어내지 않은 자리다.

## 결정 목록

| ADR | 결정 | 이럴 때 먼저 읽는다 | 근거 |
|---|---|---|---|
| [ADR-0012](ADR-0012-local-only.md) | 로컬 전용 — 계정도 서버도 관측도 없다 | 네트워크·애널리틱스·동기화를 추가하려 할 때 | 기록됨 |
| [ADR-0001](ADR-0001-native-block-editor.md) | 리치 에디터 라이브러리 대신 네이티브 블록 에디터 | 에디터 렌더링 구조, 서식 툴바 | 기록됨 |
| [ADR-0015](ADR-0015-no-keyboard-shortcuts.md) | 외장 키보드 단축키를 범위에서 뺀다 | ⌘S 같은 단축키를 넣으려 할 때 | 기록됨 |
| [ADR-0002](ADR-0002-space-trigger.md) | 인용 확정 키는 Tab이 아니라 space | 자동완성 트리거, Esc 취소 재도입 | 기록됨 (이유 미기록) |
| [ADR-0003](ADR-0003-sqlite-markdown-hybrid.md) | 안은 SQLite, 밖은 노트별 마크다운 | 저장 계층과 공유 포맷 중 한쪽만 볼 때 | 기록됨 |
| [ADR-0007](ADR-0007-fts-scope.md) | 검색 색인은 제목과 인용까지만 | 본문 검색을 구현하려 할 때 | **확인필요** |
| [ADR-0005](ADR-0005-idempotent-migration.md) | 버전 없는 멱등 마이그레이션 | `notes`에 컬럼을 추가할 때 | 기록됨 (이유 미기록) |
| [ADR-0006](ADR-0006-duplicated-schema.md) | 스키마 DDL 이중 기록을 감수한다 | `schema.sql` / `db/index.ts` 중 하나만 고치려 할 때 | **확인필요** |
| [ADR-0008](ADR-0008-created-at-ordering.md) | 정렬 기준은 `updated_at`이 아니라 `created_at` | 목록·그룹핑·검색 정렬을 바꿀 때 | **확인필요** |
| [ADR-0004](ADR-0004-settings-file.md) | 설정은 MMKV가 아니라 `settings.json` | 설정 저장 방식·파싱 엄격도 | **확인필요** |
| [ADR-0009](ADR-0009-bible-source.md) | 성경 본문은 Open Bible 한국어판 (CC BY-SA 4.0) | 성경 데이터·라이선스 화면·`(KRV)` 표식 | **확인필요** |
| [ADR-0010](ADR-0010-variation-theming.md) | 라이트/다크가 아니라 4가지 변형 | 팔레트, OS 다크모드 추종 | 기록됨 |
| [ADR-0011](ADR-0011-bible-entrypoints.md) | 홈 성경은 읽기 전용, 인용은 에디터에서만 | 성경 진입점을 더하거나 `insertMode`를 바꿀 때 | 기록됨 |
| [ADR-0013](ADR-0013-release-path.md) | OTA는 CI 통과 후 자동, 네이티브 빌드는 수동 | 릴리스 파이프라인, `version` 변경 | 기록됨 (이유 미기록) |
| [ADR-0014](ADR-0014-worktree-workflow.md) | 기능 작업은 워크트리에서 격리한다 | **새 작업을 시작하기 전** | 기록됨 (이유 미기록) |
| [ADR-0016](ADR-0016-commit-convention.md) | 커밋은 gitmoji를 붙인 Conventional Commits로 쓴다 | 커밋 메시지를 쓸 때 | 기록됨 |
| [ADR-0017](ADR-0017-pr-gate.md) | main은 PR과 CI를 통과한 것만 받는다 | PR을 열거나 병합 방식을 바꿀 때 | 기록됨 |
| [ADR-0018](ADR-0018-issue-tracking.md) | 작업 항목은 GitHub Issues, 라벨은 type·area 두 축 | 이슈를 열거나 라벨을 더할 때 | 기록됨 |

## 만들지 않기로 한 결정

[ADR-0012](ADR-0012-local-only.md)와 [ADR-0015](ADR-0015-no-keyboard-shortcuts.md)는 무언가를 만든 결정이 아니라 **만들지 않기로 한** 결정이다. 코드는 그 *부재*로 이것들을 구현하고 있다. 그래서 "이 기능이 없네, 넣어야지"로 접근하면 결정을 모르고 뒤집게 된다. 새 기능을 붙이기 전에 이 둘부터 확인한다.

`supersedes:`를 가진 ADR은 15건 중 8건이다(0002·0004·0007·0008·0009·0010·0011·0015). 그중 일곱은 최초 설계 문서(`DESIGN.md`, v1 스펙)를 뒤집은 것이고, [ADR-0011](ADR-0011-bible-entrypoints.md)만 **나중에 쓰인 기능 설계 문서**(`docs/plans/2026-06-07-bible-reader-default-design.md`)를 뒤집었다 — 설계와 구현 사이의 간격이 가장 짧았던 번복이다. 그 뒤로 `InsertMode`의 `"newNote"`와 `pendingInsertRef`가 죽은 코드로 남았다([`../drift.md`](../drift.md) B6) — 코드에 남아 있다고 살아 있는 경로로 착각하면 안 된다.

## 읽는 순서 (전제가 앞선 것부터)

[ADR-0012](ADR-0012-local-only.md) → [ADR-0015](ADR-0015-no-keyboard-shortcuts.md) → [ADR-0001](ADR-0001-native-block-editor.md) → [ADR-0002](ADR-0002-space-trigger.md).
로컬 전용이 전체의 틀이고, 단축키 제외와 네이티브 에디터 채택이 함께 space 확정을 낳았다.

그다음 저장 축: [ADR-0003](ADR-0003-sqlite-markdown-hybrid.md) → [ADR-0007](ADR-0007-fts-scope.md) → [ADR-0005](ADR-0005-idempotent-migration.md) → [ADR-0006](ADR-0006-duplicated-schema.md) → [ADR-0008](ADR-0008-created-at-ordering.md) → [ADR-0004](ADR-0004-settings-file.md).
데이터 축: [ADR-0009](ADR-0009-bible-source.md). UI 축: [ADR-0010](ADR-0010-variation-theming.md) → [ADR-0011](ADR-0011-bible-entrypoints.md).
프로세스 축: [ADR-0013](ADR-0013-release-path.md) → [ADR-0014](ADR-0014-worktree-workflow.md) → [ADR-0016](ADR-0016-commit-convention.md) → [ADR-0017](ADR-0017-pr-gate.md) → [ADR-0018](ADR-0018-issue-tracking.md).

## 새 ADR을 쓸 때

**결정을 내린 그때 쓴다.** 이 폴더 15건 중 9건의 이유가 비어 있거나 정황 추정인 것은, 전부 나중에 복원하려 했기 때문이다. 나중에는 아무도 기억하지 못한다.

번호는 이어서 붙이고, 뒤집는 결정이면 `supersedes:`에 대상을 적는다. 이유를 모르겠으면 `confidence: 확인필요`로 두고 [`../drift.md`](../drift.md) E절에 질문을 남긴다 — 그럴듯한 이유를 지어내는 것보다 낫다.
