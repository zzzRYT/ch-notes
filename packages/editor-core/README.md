# @ch-life/editor-core

에디터 순수 로직을 이식하기 위한 Phase 1 스캐폴드다. 현재 공개 API는
스모크 검사에 쓰는 `EDITOR_CORE_VERSION`뿐이며 앱은 이 패키지를 사용하지 않는다.

## 검증

저장소 루트에서 Node 22 이상, pnpm 10.15.0으로 실행한다.

```sh
pnpm install --frozen-lockfile
pnpm -F @ch-life/editor-core build
pnpm -F @ch-life/editor-core typecheck
pnpm -F @ch-life/editor-core test
```

빌드는 `dist/index.js`(ESM), `dist/index.cjs`(CJS), 타입 선언을 만든다.
`exports`는 import에 `.d.ts`, require에 `.d.cts` 타입 선언을 연결한다.
스모크 테스트는 빌드 후 실행한다. 생성된 패키지를 Node의 import·require로
불러오고 Node16 방식의 ESM·CJS 소비자 타입 검사를 수행한다.

## 앱과 통합 브랜치

이 단계의 PR 대상은 `feat/editor-core-pkg`다. 앱이 패키지를 실제로 소비하기
전까지 `main`이나 `dev`에 병합하지 않는다. 후속 로직과 테스트는 패키지에
복사하며, 앱의 기존 구현은 앱 import 전환 단계까지 유지한다.

워크스페이스에는 `packages/*`만 포함한다. pnpm 10은 앱 폴더에서도 상위
워크스페이스를 찾으므로 앱 의존성을 설치할 때는 다음 명령을 쓴다.

```sh
cd apps/ch-life
pnpm install --frozen-lockfile --ignore-workspace
```

CI의 앱 설치만 이 플래그를 사용한다. 이 브랜치에서는 EAS Build·OTA를 실행하지
않는다. 그 수동 워크플로의 설치 단계는 아직 워크스페이스에 맞추지 않았다.

RN·Expo·성경 데이터 의존성은 넣지 않는다. 패키지는 `private: true`이며,
라이선스와 배포처는 버저닝·배포 단계에서 결정한다.
