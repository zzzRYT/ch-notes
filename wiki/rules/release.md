# RULE-OTA — 오프라인 우선 앱에 OTA를 얹을 때

상위 정책: [`POL-RELEASE-002`](../policy/POL-RELEASE.md)(RULE-OTA-001·002·010), [`POL-RELEASE-003`](../policy/POL-RELEASE.md)(RULE-OTA-003~009)

OTA는 **네트워크를 전제한 배포 방식**이다. 이 앱은 [`ADR-0012`](../decisions/ADR-0012-local-only.md)로 **네트워크 없는 상태가 기본**이다. 둘을 같이 쓰면 다른 앱에는 없는 문제가 생긴다 — 어떤 기기는 발행한 번들을 **영원히 받지 않고**, 받은 기기도 **되돌아갈 곳이 한 칸뿐**이며, 서버에서 내린 롤백 지시는 **오프라인 기기에 닿지 않는다.**

이 파일은 그 세 가지가 강제하는 것을 적는다. 배포 절차 자체는 `docs/store/ota-deploy.md`, 고정 식별자는 [`CONTRACT-RELEASE`](../contracts/CONTRACT-RELEASE.md)에 있다.

> **이 영역에는 자동 증거가 거의 없다.** OTA 동작은 실기기 두 대와 실제 발행 없이는 재현되지 않는다([`../drift.md`](../drift.md) C3). 대문자 요구를 쓴 자리에는 전부 `waiver`가 붙어 있다 — 검증됐다는 뜻이 아니라 **검증 수단이 없다**는 뜻이다.

---

## 오프라인에서도 앱은 완전하다

[`RULE-OTA-001`](#rule-ota-001--임베디드-번들-하나로-앱이-완결된다)·[`RULE-OTA-002`](#rule-ota-002--업데이트-확인이-실패해도-앱은-막히지-않는다)·[`RULE-OTA-010`](#rule-ota-010--스토어-새-버전-안내는-닫을-수-있고-오프라인에서는-없다)은 [`POL-RELEASE-002`](../policy/POL-RELEASE.md)(설치본 단독 완결), [`RULE-OTA-003`](#rule-ota-003--적용은-다음-콜드-런치에서만-일어난다)은 [`POL-RELEASE-003`](../policy/POL-RELEASE.md)(쓰던 것을 잃지 않는다)에 속한다. 넷 다 "업데이트가 앱의 실행 경로에 끼어들지 않는다"는 한 가지를 서로 다른 시점에 말한다 — 시작할 때, 확인이 실패할 때, 새 스토어 빌드를 안내할 때, 실행 중일 때.

### RULE-OTA-001 · 임베디드 번들 하나로 앱이 완결된다

```yaml
id: RULE-OTA-001
policy: POL-RELEASE-002
requirement: MUST
statement: 스토어 빌드에 들어간 임베디드 번들은 OTA가 한 번도 도착하지 않아도 모든 기능이 동작해야 한다. 기능·자산·데이터를 OTA 번들에만 두지 않는다.
implemented_by:
  - apps/ch-life/app/_layout.tsx
  - apps/ch-life/hot-updater.config.ts
verified_by:
  - manual: 비행기 모드에서 설치 직후 실행 — 노트 작성·성경 조회·검색·내보내기가 모두 동작
waiver: 코드의 *부재*로 성립하는 규칙이라 자동으로 증명할 수단이 없다. POL-PRIVACY-001과 같은 성격이다.
confidence: 코드추론
source:
  - apps/ch-life/app/_layout.tsx
  - wiki/decisions/ADR-0012-local-only.md
```

이 앱을 쓰는 기기 중 **OTA를 한 번도 받지 않을 기기가 실제로 있다.** 지금 스토어에 있는 1.0.1 설치본이 그렇고([`CONTRACT-RELEASE`](../contracts/CONTRACT-RELEASE.md)), 데이터를 아끼려 셀룰러를 끈 기기, 예배당 지하에서만 앱을 켜는 기기도 그렇다. **임베디드 번들이 곧 그 사람이 쓰는 앱 전부다.**

그래서 "일단 스토어에 내고 부족한 건 OTA로 채운다"는 계획을 세울 수 없다. 스토어 빌드를 자를 때 그 번들만으로 합격해야 한다.

### RULE-OTA-002 · 업데이트 확인이 실패해도 앱은 막히지 않는다

```yaml
id: RULE-OTA-002
policy: POL-RELEASE-002
requirement: MUST
statement: 네트워크가 없거나 OTA 서버가 응답하지 않아도 앱은 즉시 렌더되고, 확인 실패는 경고 로그 한 줄로 끝난다. 로딩 화면이나 오류 화면을 띄우지 않는다.
implemented_by:
  - apps/ch-life/app/_layout.tsx
verified_by:
  - manual: 비행기 모드 콜드 런치 — 첫 화면까지 지연이나 오류 표시가 없다
waiver: RN 컴포넌트 통합 테스트 도구가 없다(drift C3).
confidence: 코드추론
source:
  - apps/ch-life/app/_layout.tsx
```

`HotUpdater.wrap`에 **`fallbackComponent`를 주지 않은 것이 이 규칙의 구현**이다. 주는 순간 확인이 끝날 때까지 그 컴포넌트가 화면을 잡고, 오프라인 기기는 매 실행마다 그 화면을 먼저 본다. `onError`도 `console.warn` 한 줄이다 — 사용자에게 아무것도 알리지 않는다([`POL-A11Y-001`](../policy/POL-ACCESSIBILITY.md)의 "조용함").

⚠️ **`fallbackComponent`를 추가하는 것은 이 규칙을 깨는 변경이다.** 진행률을 보여 주고 싶어지는 자리지만, 오프라인이 기본인 이 앱에서는 정상 상태에 오류 화면을 붙이는 셈이 된다.

스토어 버전 확인([`RULE-OTA-010`](#rule-ota-010--스토어-새-버전-안내는-닫을-수-있고-오프라인에서는-없다))도 같은 규칙 아래 있다. 확인을 기다리는 화면은 `fallbackComponent`를 다른 이름으로 넣는 것과 같다.

### RULE-OTA-010 · 스토어 새 버전 안내는 닫을 수 있고 오프라인에서는 없다

```yaml
id: RULE-OTA-010
policy: POL-RELEASE-002
requirement: MUST
statement: 스토어 최신 버전은 website/app-version.json에서 플랫폼별로 읽어 설치본과 자리별 숫자로 비교하고, 높을 때만 닫을 수 있는 다이어로그를 한 번 띄운다. 확인은 첫 렌더 뒤 콜드 런치마다 한 번이며, 네트워크 실패·형식 오류·노트 편집 중에는 아무것도 띄우지 않는다.
implemented_by:
  - apps/ch-life/src/update/compare-version.ts
  - apps/ch-life/src/update/latest-store-version.ts
  - apps/ch-life/src/update/store-link.ts
  - apps/ch-life/src/update/StoreUpdateDialog.tsx
  - apps/ch-life/app/_layout.tsx
  - website/app-version.json
verified_by:
  - test: apps/ch-life/src/update/__tests__/compare-version.test.ts#숫자로 비교한다 — 1.0.10이 1.0.9보다 크다
  - test: apps/ch-life/src/update/__tests__/compare-version.test.ts#형식이 어긋나면 null이다 — 비교하지 않는다
  - test: apps/ch-life/src/update/__tests__/latest-store-version.test.ts#빠졌거나 문자열이 아니면 null이다
  - manual: 비행기 모드 콜드 런치 — 지연·오류 표시·다이어로그가 없다
  - manual: 서버가 설치본보다 낮거나 같은 버전을 돌려줄 때 다이어로그가 없다
  - manual: 닫은 뒤 다시 켜도 같은 버전은 뜨지 않고, 값을 올리면 다시 뜬다
waiver: 순수 함수(비교·응답 파싱)에만 자동 증거를 붙일 수 있다. 네트워크·다이어로그·스토어 이동은 실기기와 실제 발행 없이는 재현되지 않는다(drift C3).
confidence: 기록됨
source:
  - apps/ch-life/src/update/StoreUpdateDialog.tsx
  - wiki/decisions/ADR-0022-store-update-notice.md
```

OTA로 닿지 않는 변경이 실재하는데([`RULE-OTA-008`](#rule-ota-008--ota-번들은-스키마를-파괴적으로-바꾸지-않는다)·[`RULE-OTA-009`](#rule-ota-009--새-블록-타입은-ota로-내보내지-않는다)) 그 사용자를 새 스토어 빌드로 옮길 수단이 앱에 없었다. **hot-updater는 스토어의 최신 버전을 모른다** — 서버 질의는 그 appVersion에 맞는 번들 하나를 돌려줄 뿐이다([`RULE-OTA-004`](#rule-ota-004--기기는-중간-번들을-전부-건너뛴다)). 그래서 버전 소스를 따로 뒀다([`ADR-0022`](../decisions/ADR-0022-store-update-notice.md)).

이 기능이 지켜야 하는 것은 전부 **하지 않는 것**이다.

| 하지 않는다 | 왜 |
|---|---|
| 확인을 기다리는 화면 | [`RULE-OTA-002`](#rule-ota-002--업데이트-확인이-실패해도-앱은-막히지-않는다) — 첫 렌더를 막지 않는다. 실패는 `console.warn` 한 줄 |
| 닫을 수 없는 다이어로그 | [`POL-RELEASE-002`](../policy/POL-RELEASE.md) — 강제 업데이트는 두지 않았다 |
| 오프라인 기기에서의 어떤 표시 | [`RULE-OTA-001`](#rule-ota-001--임베디드-번들-하나로-앱이-완결된다) — 한 번도 네트워크에 닿지 않는 기기가 정상 사용자다 |
| 문자열 비교 | `1.0.10`이 `1.0.9`보다 **작다**고 판정한다. 자리별 숫자 비교여야 한다 |
| 형식이 어긋난 값으로 안내 | 없는 업데이트를 안내하는 쪽이 안 하는 쪽보다 나쁘다. `compareAppVersion`은 `null`을 돌려준다 |
| 노트를 쓰는 화면 위에 띄우기 | [`ADR-0016`](../decisions/ADR-0016-cold-launch-apply.md)의 정신 — 폰은 `/note/*` 경로로, 태블릿은 키보드로 가른다 |
| 같은 버전 두 번 안내 | 닫으면 `settings.json`의 `dismissedUpdateVersion`에 남는다([`CONTRACT-SETTINGS-FILE`](../contracts/CONTRACT-SETTINGS-FILE.md)) |

⚠️ **`website/app-version.json`은 스토어 심사가 끝난 뒤에 올린다.** 버전 bump와 같은 PR에 넣으면 아직 스토어에 없는 버전을 안내하게 된다. `pages.yml`은 `main` 푸시에만 돌므로 `main`으로 별도 PR을 낸다.

⚠️ **이 안내는 이 기능이 들어간 다음 스토어 빌드부터 효력이 있다.** 1.0.1 설치본에는 이 코드가 없다.

### RULE-OTA-003 · 적용은 다음 콜드 런치에서만 일어난다

```yaml
id: RULE-OTA-003
policy: POL-RELEASE-003
requirement: MUST
statement: reloadOnForceUpdate가 false이므로 서버가 강제 업데이트나 롤백을 지시해도 실행 중인 화면을 갈아치우지 않고 다음 콜드 런치까지 기다린다.
implemented_by:
  - apps/ch-life/app/_layout.tsx
verified_by:
  - manual: 앱을 켜 둔 채 번들을 발행해도 화면이 바뀌지 않고, 완전 종료 후 재실행에서 적용된다
waiver: 실제 발행과 실기기 없이는 재현되지 않는다.
confidence: 기록됨
source:
  - apps/ch-life/app/_layout.tsx
  - wiki/decisions/ADR-0016-cold-launch-apply.md
```

이유가 **코드 주석에 남아 있는 드문 경우**다 — "업데이트가 진행 중인 예배를 끊어서는 안 된다". 결정 기록은 [`ADR-0016`](../decisions/ADR-0016-cold-launch-apply.md).

대가는 [`RULE-OTA-006`](#rule-ota-006--서버-롤백은-네트워크가-있어야-닿는다)에 있다. 나쁜 번들을 발견해 서버에서 내려도, 지금 앱을 켜 둔 사람은 앱을 완전히 껐다 켤 때까지 계속 그 번들을 쓴다.

---

## 이 메커니즘이 실제로 하는 일

아래 셋은 요구가 아니라 **현상**이다. 정하는 것이 아니라 사실이고, 뒤의 세 규칙이 여기서 나온다.

### RULE-OTA-004 · 기기는 중간 번들을 전부 건너뛴다

```yaml
id: RULE-OTA-004
policy: POL-RELEASE-003
statement: 업데이트 확인은 (platform, appVersion, channel, minBundleId, bundleId)로 한 번 질의해 목표 번들 하나를 받는다. 오래 오프라인이던 기기는 그 사이 발행된 번들을 순서대로 밟지 않고 최신 하나로 바로 건너뛴다.
implemented_by:
  - apps/ch-life/app/_layout.tsx
  - apps/ch-life/hot-updater.config.ts
confidence: 코드추론
source:
  - hot-updater 공식 문서 — GET /hot-updater/app-version/:platform/:version/:channel/:minBundleId/:bundleId 는 updateAvailable과 url 하나를 돌려준다
```

**"번들을 순서대로 적용한다"는 전제를 세우면 안 된다.** 3주 만에 앱을 켠 기기는 그 사이 나간 번들 다섯 개를 보지 못한 채 여섯 번째로 간다. 각 번들이 다음 번들의 전제가 되는 설계 — 예를 들어 "n번 번들이 데이터를 옮겨 두면 n+1번이 그 결과를 쓴다" — 는 그 기기에서 깨진다.

뒤집으면 **낡은 번들을 서버에서 지워도 아무도 곤란해지지 않는다.** 어떤 기기도 최신 것 말고는 요청하지 않기 때문이다([`../drift.md`](../drift.md) E17).

### RULE-OTA-005 · 기기가 되돌아갈 수 있는 곳은 한 칸뿐이다

```yaml
id: RULE-OTA-005
policy: POL-RELEASE-003
statement: 기기는 임베디드 번들, 마지막으로 정상 기동한 stable 번들, 검증 중인 staging 번들만 가진다. 자동 롤백의 착지점은 stable 하나이고 그것이 없으면 임베디드다. 두 칸 전 번들로는 돌아갈 수 없다.
implemented_by:
  - apps/ch-life/app/_layout.tsx
confidence: 코드추론
source:
  - hot-updater 공식 문서 — automatic rollback (staging/stable, 실패 시 이전 stable 또는 임베디드로 복귀)
  - docs/store/ota-deploy.md 롤백
```

기기에 번들 히스토리는 없다. **"이전 번들에 대한 정책"이라고 부를 만한 저장은 딱 한 칸**이고, 그마저도 새 번들이 한 번 정상 기동하면 그 자리를 새 번들이 차지한다.

자동 롤백이 잡는 것은 **첫 렌더에 도달하지 못한 번들뿐**이다. 화면은 잘 뜨는데 저장이 깨지는 번들은 자동 롤백에 걸리지 않는다 — 기기 입장에서는 정상 기동이다.

### RULE-OTA-006 · 서버 롤백은 네트워크가 있어야 닿는다

```yaml
id: RULE-OTA-006
policy: POL-RELEASE-003
statement: hot-updater bundle disable은 서버 상태만 바꾼다. 오프라인 기기는 다음 확인에 성공할 때까지 나쁜 번들을 계속 실행하고, 확인에 성공한 뒤에도 적용은 그다음 콜드 런치다.
implemented_by:
  - apps/ch-life/scripts/deploy-ota.mjs
confidence: 코드추론
source:
  - docs/store/ota-deploy.md 롤백
  - apps/ch-life/app/_layout.tsx
```

**롤백에 걸리는 시간의 하한이 없다.** 오프라인 기기에게 롤백은 "다음에 인터넷에 닿고, 그다음에 앱을 껐다 켰을 때" 일어난다. 몇 주가 될 수 있다.

그래서 이 앱에서 롤백은 **사고 수습 수단이지 안전망이 아니다.** 되돌릴 수 있다는 전제로 위험한 번들을 내면, 되돌린 뒤에도 그 번들이 상당 기간 살아 있다.

---

## 그래서 번들에 담을 수 없는 것

### RULE-OTA-007 · 마이그레이션은 건너뛰기에 안전하다

```yaml
id: RULE-OTA-007
policy: POL-RELEASE-003
requirement: MUST
statement: 스키마 변경은 PRAGMA table_info로 현재 상태를 읽어 없는 컬럼만 추가하는 방식이어야 한다. 버전 카운터가 아니라 상태에서 유도되므로 번들을 몇 개 건너뛰어도 결과가 같다.
implemented_by:
  - apps/ch-life/src/db/migrate.ts
verified_by:
  - test: apps/ch-life/src/db/__tests__/migrate.test.ts#구버전 테이블에 누락된 메타 컬럼을 추가한다
  - test: apps/ch-life/src/db/__tests__/migrate.test.ts#멱등하다 — 두 번 실행해도 오류 없음
confidence: 코드추론
source:
  - wiki/decisions/ADR-0005-idempotent-migration.md
```

[`ADR-0005`](../decisions/ADR-0005-idempotent-migration.md)의 버전 없는 멱등 마이그레이션이 **OTA에서 뜻밖의 값을 한다.** [`RULE-OTA-004`](#rule-ota-004--기기는-중간-번들을-전부-건너뛴다)로 기기가 번들을 건너뛰어도, 스키마는 "몇 번째 마이그레이션까지 돌았나"가 아니라 "지금 테이블에 무엇이 있나"로 결정되므로 결과가 같다. 버전 테이블을 쓰는 설계였다면 건너뛴 기기마다 다른 상태가 됐다.

이 성질을 유지하는 것이 규칙이다. **`ADDED_NOTE_COLUMNS`에 순서 의존이나 데이터 백필을 넣으면 깨진다.**

### RULE-OTA-008 · OTA 번들은 스키마를 파괴적으로 바꾸지 않는다

```yaml
id: RULE-OTA-008
policy: POL-RELEASE-003
requirement: MUST NOT
statement: OTA로 내보내는 번들은 기존 컬럼을 삭제·개명·타입변경하지 않는다. 마이그레이션에 되돌리는 경로가 없어, 번들을 되돌려도 스키마는 되돌아가지 않고 이전 번들이 바뀐 DB를 그대로 읽는다.
implemented_by:
  - apps/ch-life/src/db/migrate.ts
verified_by:
  - manual: 마이그레이션 목록이 ALTER TABLE ... ADD COLUMN 뿐인지 발행 전 확인
waiver: "하지 않았음"을 자동으로 증명할 수 없다. 발행 전 사람이 diff를 본다.
confidence: 코드추론
source:
  - apps/ch-life/src/db/migrate.ts
  - wiki/decisions/ADR-0005-idempotent-migration.md
```

번들 롤백과 스키마는 **비대칭**이다. 번들은 한 칸 되돌아가지만([`RULE-OTA-005`](#rule-ota-005--기기가-되돌아갈-수-있는-곳은-한-칸뿐이다)) 스키마는 앞으로만 간다. 컬럼을 더하기만 하면 이 비대칭이 무해하다 — 이전 번들의 `SELECT *`는 모르는 컬럼을 그냥 무시한다.

지우거나 이름을 바꾸는 순간 무해하지 않게 된다. **되돌아간 이전 번들이 없는 컬럼을 읽는다.** 그리고 그 상황에서 다시 앞으로 갈 방법은 새 번들뿐인데, 그 기기는 [`RULE-OTA-006`](#rule-ota-006--서버-롤백은-네트워크가-있어야-닿는다)에 따라 언제 그것을 받을지 모른다.

### RULE-OTA-009 · 새 블록 타입은 OTA로 내보내지 않는다

```yaml
id: RULE-OTA-009
policy: POL-RELEASE-003
requirement: MUST NOT
statement: body_json에 새 BlockNode type을 기록하는 번들은 OTA로 발행하지 않는다. 되돌아간 이전 번들에서 그 노트를 열면, text 필드가 없는 블록은 에디터와 목록 미리보기를 즉시 깨뜨리고 있더라도 Markdown 내보내기에서 조용히 사라진다.
implemented_by:
  - apps/ch-life/src/editor/NoteEditor.tsx
  - apps/ch-life/src/editor/ParagraphInput.tsx
  - apps/ch-life/src/markdown/serialize.ts
  - apps/ch-life/src/list/group-notes.ts
verified_by:
  - manual: 발행 전 BlockNode 유니온에 새 멤버가 들어갔는지 확인
waiver: 아직 존재하지 않는 타입에 대한 규칙이라 재현할 대상이 없다. 발행 전 사람이 타입 정의 diff를 본다.
confidence: 코드추론
source:
  - apps/ch-life/src/domain/types.ts
  - apps/ch-life/src/editor/NoteEditor.tsx
```

컬럼과 달리 **블록 타입은 앞으로 호환되지 않는다.** 어느 코드도 모르는 `type`을 다룰 준비가 되어 있지 않다([`../drift.md`](../drift.md) B20):

| 경로 | 모르는 타입을 만나면 |
|---|---|
| `NoteEditor` | `quote`가 아니면 전부 `ParagraphInput`으로 보낸다 |
| `ParagraphInput` | `initialText.length`를 읽는다 — `text`가 없으면 **크래시** |
| `notePreview` | `stripInlineMarks(block.text)` — `text`가 없으면 **크래시** |
| `blockToMarkdown` | `switch`에 `default`가 없다 — `undefined`를 돌려주고 **내보내기에서 사라진다** |

`text`를 가진 타입이라면 크래시는 면하지만 내보내기 손실은 남는다. **어느 쪽이든 이전 번들에서 데이터가 온전하지 않다.**

블록 타입을 추가해야 한다면 두 갈래다 — 렌더러·직렬화에 알 수 없는 타입 폴백을 먼저 넣고(그 자체가 OTA로 내보낼 수 있는 변경이다) **한 번들 뒤에** 새 타입을 쓰거나, 스토어 빌드로 내보내 되돌릴 일을 만들지 않는 것이다. 어느 쪽으로 갈지는 정해진 바 없다([`../drift.md`](../drift.md) E18).
