# ch-life app

Expo SDK 54 기반 React Native 앱이다. 이 디렉터리에서는 루트 `AGENTS.md`와 이 파일을 함께 따른다.

## 작업 전

- Expo는 자주 바뀐다. 코드 작성 전 필요한 API를 [Expo SDK 54 문서](https://docs.expo.dev/versions/v54.0.0/)에서 확인한다.
- [`../../wiki/by-task.md`](../../wiki/by-task.md)에서 작업 경로에 해당하는 `POL`·`RULE`·`CONTRACT`·`ADR`을 찾고 실제 코드·테스트 본문과 대조한다.
- 상세 코드 지도와 알려진 함정은 [`CLAUDE.md`](CLAUDE.md)에 있다. 현재 동작 판정은 문서가 아니라 코드가 우선한다.

## 명령

이 디렉터리에서 `pnpm`을 사용한다. `.npmrc`의 `node-linker=hoisted`를 유지한다.

| 검증 | 명령 |
|---|---|
| 타입 | `pnpm typecheck` |
| 린트 | `pnpm lint` |
| 테스트 | `pnpm test:ci` |

변경 범위에 맞는 검증부터 실행하고, 앱 동작을 바꿨으면 세 명령을 모두 통과시킨다.

## 구현 불변조건

- DB 스키마는 `src/db/index.ts`와 `src/db/schema.sql` 두 곳에 있다. 컬럼 변경 시 둘과 `src/db/migrate.ts`를 함께 수정한다.
- 테스트는 Node의 `better-sqlite3`, 프로덕션은 `expo-sqlite`를 사용한다. 한 어댑터만 검증했다고 전체 경로가 검증된 것으로 보지 않는다.
- `Note` 업데이트에서 `null`은 필드 비움, `undefined`는 기존값 유지다.
- 테마의 실제 색상 분기는 `themePreference`가 아니라 `variation`이다.
- phone/tablet 분기 기준은 900px이며 여러 파일에 중복되어 있다.
- `assets/bible.json`의 성경 본문은 CC BY-SA 4.0이다. 본문이 포함된 재배포 산출물도 같은 라이선스를 유지한다.

## 배포

- JS/에셋만 바뀌면 Hot Updater OTA, 네이티브 의존성·plugin·권한·`app.config.ts`의 `version`이 바뀌면 EAS Build다.
- `updateStrategy: appVersion`이므로 버전을 올리고 OTA만 발행하면 기존 설치본에 닿지 않는다.
- `main`이나 `release/**`에 버전 bump를 직접 commit/push하지 않는다. `app.config.ts` 버전은 작업 브랜치에서 올려 `release/<version>` 대상 PR로 병합한다.
- native release, production OTA, release hotfix는 해당 release 커밋을 임시 `chore/backmerge-<version>` PR로 `main`에 역머지해야 끝난다. `release/**`에 새 PR이 병합될 때마다 이 의무가 다시 생긴다.
- [`../../wiki/git.md`](../../wiki/git.md#릴리스-절차)의 명령과 병합 방향을 따른다. `main`을 `release/**` 자체에 merge하지 않고 임시 역머지 브랜치에만 merge한다.
