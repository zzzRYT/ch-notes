# ch-life 정본 위키

이 디렉터리는 **씀씀(ch-life)의 정본(canon)** 이다. "무엇을 보장하는 앱인가 → 어떤 규칙이 항상 참인가 → 어떤 계약으로 고정되어 있는가 → 무엇이 그것을 증명하는가"를 ID로 연결해 둔 곳이다.

이 위키는 새 기획서가 아니다. **이미 구현되어 동작 중인 앱에서 실제 의사결정을 역추출해 기록한 것**이다. 결정은 있었지만 기록이 남지 않았고, 그 공백을 코드·커밋·설계 문서에서 복원했다.

> **작업을 시작하려는 사람은 여기부터.**
> 절차: [`workflow.md`](workflow.md) — 코드를 열기 전에 무엇을 확인하는가
> 진입점: [`by-task.md`](by-task.md) — 내가 하려는 작업에서 무엇을 먼저 읽는가

---

## 1. 정본 우선순위 (충돌 시 이 순서로 이긴다)

1. **구현 코드** (`apps/ch-life/`) — 최종 판정 기준.
2. **이 위키** (`wiki/`) — 코드가 무엇을 보장하는지에 대한 정본 서술.
3. `apps/ch-life/CLAUDE.md`, `README.md` — 작업용 요약. 위키와 어긋나면 위키가 맞다.
4. `DESIGN.md`, `docs/plans/**` — **역사 기록(archive)**. 당시의 의도를 담고 있고 근거 출처로 인용하지만, **현재의 합격 기준이 아니다.**

`DESIGN.md`와 `docs/plans/**`는 수정하지 않는다. 그것들이 지금 구현과 어긋나는 지점은 [`drift.md`](drift.md)에 전부 목록화되어 있다.

## 2. ID 체계

| 접두 | 뜻 | 정본 위치 | 답하는 질문 |
|---|---|---|---|
| `POL-*` | 사용자·제품 정책 | [`policy/`](policy/) | 사용자가 무엇을 할 수 있어야 하는가 |
| `RULE-*` | 도메인 규칙·불변조건·상태 전이 | [`rules/`](rules/) | 항상 참이어야 하는 것은 무엇인가 |
| `CONTRACT-*` | 데이터·파일·API·릴리스 경계 | [`contracts/`](contracts/) | 컴포넌트/파일/외부 세계와 무엇을 약속했는가 |
| `ADR-*` | 결정과 그 이유 | [`decisions/`](decisions/) | 왜 이 경계를 골랐는가 |

모든 `RULE`은 상위 `POL` 하나를 가리킨다. 모든 ID는 저장소 전체에서 유일하다. 한 번 발급한 ID는 재사용하지 않는다 — 폐기할 때는 `status: superseded` 로 두고 대체 ID를 적는다.

## 3. 규칙 블록 형식

각 규칙은 사람이 읽는 한 문단과, 기계가 읽는 YAML 블록 한 개로 이루어진다.

````markdown
```yaml
id: RULE-REF-001
policy: POL-SCRIPTURE-001
requirement: MUST
statement: 성경 참조는 "책 장:절" 또는 "책 장:절-끝절" 형태만 인식한다.
implemented_by:
  - apps/ch-life/src/parser/ref-parser.ts
verified_by:
  - test: apps/ch-life/src/parser/__tests__/ref-parser.test.ts
confidence: 코드추론
```
````

### `requirement` — RFC 2119 어휘

`MUST` / `MUST NOT` 대문자는 **자동 검증(`verified_by`의 `test:` 또는 `ci:`)이 붙어 있을 때만** 쓴다. 자동 증거가 없고 수동 확인만 가능한 규칙은 `SHOULD` / `MAY`로 쓰고 `verified_by: manual`을 적는다. 이 규칙은 [`check.mjs`](check.mjs)가 강제한다 — 증거 없는 MUST는 검사 실패다.

예외가 두 가지 있다.

- **`waiver:`** — 자동 검증 수단이 원리적으로 없는데 요구 강도는 낮출 수 없는 경우(법적 의무, 코드의 *부재*로 성립하는 정책)에만 쓴다. 왜 자동 검증이 불가능한지를 한 줄로 적는다. 편의로 쓰면 이 체계가 무의미해진다.
- **`requirement` 생략** — 규범이 아니라 **현재 동작의 서술**인 블록은 요구 강도를 적지 않는다. "지금 이렇게 되어 있다"와 "이렇게 되어야 한다"는 다른 문장이며, 미구현·미배선을 기록한 항목이 여기 해당한다.

### `confidence` — 이 서술의 출처 신뢰도

| 값 | 뜻 |
|---|---|
| `기록됨` | 설계 문서·커밋 메시지·코드 주석에 근거가 남아 있다. 해당 위치를 본문에 인용한다. |
| `코드추론` | 근거 기록은 없지만 코드가 한 가지로만 읽힌다. 동작 서술로서는 확정. |
| `확인필요` | 왜 그렇게 했는지 알 수 없다. **추측으로 이유를 지어내지 않는다.** 사용자 확인 대기. |

`확인필요` 항목은 [`drift.md`](drift.md) 마지막 절에 질문 형태로 모아 두었다.

## 4. 증거 계층 — 이 프로젝트에서 무엇이 증거가 되는가

일반적인 서비스라면 증거는 `테스트 → 계약 검증 → 실물 QA → 운영 trace/metric` 4층이다. 씀씀에는 **4층이 의도적으로 없다.** [`POL-PRIVACY-001`](policy/POL-PRIVACY.md)이 애널리틱스·사용 로그·서버 전송을 금지하므로, 관측 신호를 수집할 수단 자체가 존재하지 않는다. 이것은 결함이 아니라 정책의 귀결이다([`ADR-0012`](decisions/ADR-0012-local-only.md)).

따라서 증거는 세 가지뿐이다.

1. **자동 테스트** — `pnpm test` (jest-expo + better-sqlite3). 순수 로직·DB 계층만. RN 컴포넌트 테스트 라이브러리는 미설치이므로 **UI 동작은 자동 증거가 없다.**
2. **수동 QA** — 실기기/시뮬레이터 확인. `verified_by: manual`.
3. **내보낸 `.md` 파일** — 사용자가 만든 실제 노트를 회귀 fixture로 쓸 수 있는 유일한 재현 자산.

이 제약 때문에 UI 규칙 다수가 `SHOULD` 이고, 그 비율은 [`index.md`](index.md)의 커버리지 표에 정직하게 드러난다.

## 5. 검사

```bash
node wiki/check.mjs
```

- ID 유일성
- 모든 `RULE`의 상위 `POL` 실재 여부
- `implemented_by` / `verified_by` 경로가 실제로 존재하는지
- **`verified_by`의 `#조각`이 그 파일 안에 실제로 있는 문자열인지** — 증거로 지목한 테스트 이름이 바뀌거나 사라지면 검사가 실패한다. 조각은 `describe`/`it` 이름을 **그대로** 옮겨 적는다(요약하면 실패한다).
- 증거 없는 `MUST` 적발
- **폴더 인덱스 완전성** — 폴더 안 모든 `.md`가 그 폴더 `index.md`에 **링크로** 걸려 있고, 모든 ID가 적혀 있는지. ID는 하나씩 적거나 `RULE-SET-001 ~ RULE-SET-006` 범위로 적는다(범위는 끝 번호까지만 덮으므로 007을 만들면 걸린다)
- **산문 ID 실재** — 위키 어디서든 ID 모양으로 적힌 것이 실재하는 블록인지 (`RULE-EDIT`처럼 계열 이름으로 쓰는 것은 허용)
- **링크 대상 실재** — `](대상)` 상대 링크가 실제 파일을 가리키는지
- **생성기 커버리지** — `gen-index.mjs`의 `AREAS`에 없는 `RULE` 계열이 있는지 (있으면 `index.md`에서 조용히 빠진다)
- **안내 문서의 코드 경로** — `by-task.md`·`workflow.md`가 백틱으로 안내하는 경로가 실재하는지 (코드가 옮겨지면 걸린다)
- 커버리지 집계 출력

블록을 더하거나 `requirement`·`confidence`를 고쳤으면 ID 표를 다시 만든다:

```bash
node wiki/gen-index.mjs   # index.md 재생성
```

이 `README.md`는 위 예시 블록이 실제 ID처럼 수집되지 않도록 검사 대상에서 제외된다.

CI 연결과 PR 템플릿은 아직 하지 않았다. 다음 단계 후보다([`drift.md`](drift.md) 참고).

## 6. 목차

**절차와 진입점**

- [`workflow.md`](workflow.md) — 작업 절차. 정본을 먼저 확인하는 다섯 단계
- [`by-task.md`](by-task.md) — 작업 유형·코드 경로별 진입점
- [`git.md`](git.md) — 커밋·브랜치·PR·이슈·릴리스를 다루는 방식

**정본 계층** (폴더마다 역할 인덱스가 있다)

- [`policy/index.md`](policy/index.md) — 사용자 정책 `POL-*`
- [`rules/index.md`](rules/index.md) — 도메인 규칙 `RULE-*`
- [`contracts/index.md`](contracts/index.md) — 계약 `CONTRACT-*`
- [`decisions/index.md`](decisions/index.md) — 결정 기록 `ADR-*`

**전체 조회와 미결**

- [`index.md`](index.md) — 전체 ID 표와 커버리지 (**생성물** — `gen-index.mjs`가 쓴다)
- [`drift.md`](drift.md) — 계획↔구현 차이, 내부 모순, 오라클 문제, 확인필요 큐

### index.md가 두 종류다

| | 어디에 | 무엇이 | 누가 쓰는가 |
|---|---|---|---|
| 루트 [`index.md`](index.md) | `wiki/` | 모든 ID의 표와 집계 | **생성물.** `node wiki/gen-index.mjs` |
| 폴더 `index.md` | `policy/` `rules/` `contracts/` `decisions/` | 그 폴더 파일들의 **역할**과 언제 읽는지 | **손으로 쓴다.** 검사기가 빠진 항목을 잡는다 |

폴더 인덱스는 생성하지 않는다 — 값어치가 산문(역할·읽을 시점·함정)에 있기 때문이다. 대신 `check.mjs`가 폴더 안 모든 파일과 모든 ID가 인덱스에 있는지 확인한다.
