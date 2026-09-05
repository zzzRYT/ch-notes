# POL-RELEASE — 사용자에게 실제로 닿는 배포

## POL-RELEASE-001 · 검증을 통과한 것만 나간다

```yaml
id: POL-RELEASE-001
requirement: MUST
statement: 자동 OTA 업데이트는 CI(타입체크·린트·테스트)가 통과한 커밋에서만 발행되고, 네이티브 변경은 OTA로 전달할 수 없으므로 새 빌드를 낸다.
confidence: 기록됨
source:
  - .github/workflows/eas-update.yml (주석 + workflow_run 조건)
  - apps/ch-life/.claude/skills/eas-release/SKILL.md
verified_by:
  - test: .github/workflows/ci.yml
```

이 앱에는 서버가 없으므로 릴리스가 곧 배포의 전부다. 두 경로를 잘못 고르면 **수정이 사용자에게 아예 닿지 않는다.**

- **자동 OTA**: `main`에 머지 → CI 성공 → `preview` 브랜치로 자동 발행. CI가 실패하면 발행되지 않는다.
- **수동 빌드**: 네이티브 의존성이나 `app.config.ts`가 바뀌면 GitHub Actions에서 수동 실행. 빌드 크레딧을 아끼려 `--no-wait`로 큐에만 넣는다.
- **함정**: OTA는 `updateStrategy: "appVersion"`이므로 `version`을 올리면 기존 설치본과 번들이 분리된다. 버전을 올리고 OTA만 쏘면 아무에게도 닿지 않는다.
- **지금 특히**: 스토어의 1.0.1은 `expo-updates` 바이너리인데 `main`은 hot-updater로 갈아탔다. **1.0.1 사용자에게는 OTA가 닿지 않는다** ([`CONTRACT-RELEASE`](../contracts/CONTRACT-RELEASE.md)).

하위 규칙: [`CONTRACT-RELEASE`](../contracts/CONTRACT-RELEASE.md), [`ADR-0013`](../decisions/ADR-0013-release-path.md)

---

## POL-RELEASE-002 · 설치한 그대로도 완전한 앱이다

```yaml
id: POL-RELEASE-002
requirement: MUST
statement: 네트워크에 한 번도 닿지 않아도 스토어에서 설치한 앱은 모든 기능이 동작하고, 업데이트 확인의 실패나 지연이 사용을 막지 않는다.
confidence: 코드추론
source:
  - apps/ch-life/app/_layout.tsx
  - wiki/decisions/ADR-0012-local-only.md
verified_by:
  - manual: 비행기 모드에서 설치 직후 실행
waiver: 코드의 부재로 성립하는 약속이라 자동 증거를 붙일 수단이 없다. POL-PRIVACY-001과 같은 성격이다.
```

OTA는 **네트워크를 전제한 배포 방식**이고 이 앱은 **네트워크 없는 상태가 기본**이다([`ADR-0012`](../decisions/ADR-0012-local-only.md)). 그 둘을 같이 쓰기로 한 이상, 둘 중 무엇이 우선인지를 먼저 정해 둬야 한다. **오프라인이 우선이다.**

- OTA를 받지 않는 기기가 실재한다 — 스토어의 1.0.1, 셀룰러를 끈 기기, 지하 예배당.
- 그 기기들에게 **임베디드 번들이 앱의 전부**다. "부족한 건 나중에 OTA로"는 성립하지 않는다.
- 업데이트 확인은 **있으면 좋은 것**이지 실행 조건이 아니다. 확인 화면·오류 화면을 앞에 세우지 않는다.

하위 규칙: [`RULE-OTA-001`](../rules/release.md) · [`RULE-OTA-002`](../rules/release.md)

## POL-RELEASE-003 · 업데이트가 이미 쓴 노트를 잃게 하지 않는다

```yaml
id: POL-RELEASE-003
requirement: MUST
statement: 업데이트는 진행 중인 작성을 끊지 않고, 그 업데이트를 되돌리더라도 사이에 저장된 노트를 열 수 없거나 내보낼 수 없게 만들지 않는다.
confidence: 코드추론
source:
  - apps/ch-life/src/db/migrate.ts
  - apps/ch-life/src/domain/types.ts
  - apps/ch-life/app/_layout.tsx
verified_by:
  - manual: 번들 되돌린 뒤 그 사이 작성한 노트를 열고 내보내기
waiver: 실제 발행 두 번과 실기기 없이는 재현되지 않는다(drift C3).
```

노트는 기기 안 SQLite 하나가 정본이고([`RULE-NOTE-001`](../rules/note-persistence.md)) 사본이 없다. **번들은 되돌아가지만 데이터는 되돌아가지 않는다** — 그래서 번들 롤백은 데이터에 대해 비대칭이다.

- 스키마는 앞으로만 간다([`ADR-0005`](../decisions/ADR-0005-idempotent-migration.md)). 되돌아간 번들이 **바뀐 DB를 그대로 읽는다.**
- 기기가 되돌아갈 수 있는 곳은 **한 칸뿐**이고, 오프라인 기기에는 그 지시조차 늦게 닿는다.
- 따라서 "되돌리면 된다"를 전제로 위험한 번들을 낼 수 없다. **되돌릴 수 없는 변경은 OTA에 싣지 않는다.**

하위 규칙: [`RULE-OTA-003`](../rules/release.md) ~ [`RULE-OTA-009`](../rules/release.md)
