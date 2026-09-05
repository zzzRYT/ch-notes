# POL-RELEASE — 사용자에게 실제로 닿는 배포

## POL-RELEASE-001 · 검증을 통과한 것만 나간다

```yaml
id: POL-RELEASE-001
requirement: MUST
statement: OTA 업데이트는 CI(타입체크·린트·테스트)가 통과한 커밋에서만 발행되고, 사용자에게 닿는 production 채널은 release 가지에서만 낸다. 네이티브 변경은 OTA로 전달할 수 없으므로 새 빌드를 낸다.
confidence: 기록됨
source:
  - .github/workflows/eas-update.yml (주석 + workflow_run 조건)
  - apps/ch-life/.claude/skills/eas-release/SKILL.md
verified_by:
  - test: .github/workflows/ci.yml
  - ci: .github/workflows/eas-update.yml
```

이 앱에는 서버가 없으므로 릴리스가 곧 배포의 전부다. 두 경로를 잘못 고르면 **수정이 사용자에게 아예 닿지 않는다.**

- **자동 OTA**: `main`에 머지 → CI 성공 → `preview` 채널로 자동 발행. CI가 실패하면 발행되지 않는다.
- **수동 OTA(production)**: 사용자에게 닿는 발행. `release/<버전>` 가지에서 수동 실행으로만 낸다 — 다른 가지에서 시도하면 워크플로가 거부한다([`ADR-0020`](../decisions/ADR-0020-release-strategy.md)).
- **수동 빌드**: 네이티브 의존성이나 `app.config.ts`가 바뀌면 GitHub Actions에서 수동 실행. 빌드 크레딧을 아끼려 `--no-wait`로 큐에만 넣는다.
- **함정**: OTA는 `updateStrategy: "appVersion"`이므로 `version`을 올리면 기존 설치본과 번들이 분리된다. 버전을 올리고 OTA만 쏘면 아무에게도 닿지 않는다.
- **지금 특히**: 스토어의 1.0.1은 `expo-updates` 바이너리인데 `main`은 hot-updater로 갈아탔다. **1.0.1 사용자에게는 OTA가 닿지 않는다** ([`CONTRACT-RELEASE`](../contracts/CONTRACT-RELEASE.md)).

하위 규칙: [`CONTRACT-RELEASE`](../contracts/CONTRACT-RELEASE.md), [`ADR-0013`](../decisions/ADR-0013-release-path.md)
