# ADR-0013 · OTA는 CI 통과 후 자동, 네이티브 빌드는 수동

```yaml
id: ADR-0013
status: accepted
statement: main의 CI가 성공한 커밋만 OTA로 자동 발행하고, EAS Build는 수동 실행으로만 큐에 넣는다. 이 자동 발행의 대상은 preview 채널이며, 사용자에게 닿는 production 발행은 ADR-0020이 정한다.
confidence: 기록됨
source:
  - .github/workflows/eas-update.yml 주석
  - .github/workflows/eas-build.yml 주석 ("빌드 크레딧을 아끼려 --no-wait")
  - apps/ch-life/.claude/skills/eas-release/SKILL.md
```

## 맥락

워크플로 주석이 목적을 직접 적어 두었다. OTA는 CI 성공 뒤에만 자동 실행되므로 "typecheck/lint/test에 실패한 OTA 업데이트를 결코 배포하지 않는다", 네이티브 빌드는 "빌드 크레딧이 요청할 때만 소비되도록" 수동(`workflow_dispatch`)으로 유지한다.

> **정황 (미기록).** 리뷰어가 없는 1인 저장소라 기계 게이트가 사람의 승인을 대신한다는 해석은 어디에도 적혀 있지 않다. 주석이 말하는 범위는 "실패한 코드를 배포하지 않는다"와 "크레딧을 아낀다"까지다.

## 결정

- **OTA**: `workflow_run`으로 CI 완료를 기다렸다가, 성공일 때만 `preview` 브랜치로 발행. 배포 대상은 CI를 통과한 정확한 커밋 SHA.
- **Build**: `workflow_dispatch` 전용. `--no-wait`로 큐에만 넣고 URL을 돌려준다.
- `expo doctor`는 실행하되 **차단하지 않는다**(pnpm 환경에서 Metro 설정 오탐이 알려져 있다 — 워크플로 주석).

## 귀결

- 타입체크·린트·테스트를 통과하지 못한 코드는 사용자에게 닿지 않는다. 이 프로젝트에서 [`POL-RELEASE-001`](../policy/POL-RELEASE.md)을 실제로 강제하는 유일한 장치다.
- 자동 OTA의 기본 목적지가 `preview`다. `production` 발행은 항상 수동 선택이다.
- **앱 버전 결합 함정이 있다.** `version`을 올리면 번들이 분리되므로 OTA가 기존 설치본에 닿지 않는다. 이 규칙은 스킬 문서에 경고로 박제되어 있다.
- **2026-09-05 갱신:** OTA 구현이 `expo-updates`(EAS Update)에서 `hot-updater`(Cloudflare R2+D1+Worker)로 바뀌었다(`30b6a60`, PR #14). **두 경로라는 결정 자체는 그대로**이고 자동/수동 분담도 같다 — 바뀐 것은 OTA 발행 수단이다. 왜 갈아탔는지는 기록이 없다([`../drift.md`](../drift.md) E13).
- CI가 검증하는 것은 순수 로직과 DB 계층뿐이다. UI 회귀와 네이티브 문제는 게이트를 통과한다.
