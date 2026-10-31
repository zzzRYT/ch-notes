---
title: Firebase를 공통 lib 배럴에서 내보내면 무관한 테스트가 네이티브 SDK를 로드한다
date: 2026-10-09
category: test-failures
module: Firebase 화면 추적
problem_type: test_failure
component: observability
severity: medium
symptoms:
  - "화면 추적의 개별 테스트는 통과하지만 note-actions 테스트가 NativeRNFBTurboApp is not registered 오류로 시작하지 못한다"
root_cause: test_isolation
resolution_type: code_fix
tags: [firebase, analytics, barrel-import, jest, native-module]
---

# Firebase import는 공통 lib 배럴에서 분리한다

## Problem

#95의 화면 추적 구현 중 `useScreenTracking`을 `@/shared/lib`에서 내보내자, 화면 통계를 사용하지 않는 노트 삭제 테스트가 실행 전에 실패했다. 이 수정은 아직 병합 전이다.

## Symptoms

화면 추적 테스트는 Firebase를 mock하므로 통과했다. 전체 테스트에서는 `apps/ch-life/src/features/note/delete/model/__tests__/note-actions.test.ts`의 `@/shared/lib` import가 `NativeRNFBTurboApp is not registered`를 일으켰다.

## What Didn't Work

네이티브 API 호출을 `useEffect`와 `try/catch` 안에 넣어도 해결되지 않았다. 오류는 호출 시점이 아니라 Firebase 모듈을 import하는 시점에 발생했다.

## Solution

Firebase를 import하는 훅과 공개 인터페이스를 `apps/ch-life/src/shared/analytics/`에 두고, 조립 지점인 `apps/ch-life/src/app/_layout.tsx`만 이를 import한다.

```ts
import { useScreenTracking } from '@/shared/analytics';
import { openSqliteDatabase, useHardwareKeyboardDismiss } from '@/shared/lib';
```

Firebase mock는 화면 추적 테스트에만 둔다. 무관한 테스트에 Firebase mock를 추가하지 않고도 전체 테스트가 통과했다.

## Why This Works

공통 배럴의 re-export도 모듈을 평가한다. 네이티브 SDK를 import하는 훅을 그 배럴에 넣으면, 다른 함수만 가져가는 소비자도 네이티브 모듈을 로드하게 된다. 호출을 지연하는 것과 import의 평가를 분리하는 것은 다르다.

## Prevention

- import 시 네이티브 초기화가 발생하는 SDK를 공통 `shared/lib`에 내보내기 전에는 그 배럴의 소비자를 검색하고 전체 테스트를 실행한다. 기능별 경계로 분리해 무관한 소비자가 SDK를 로드하지 않게 한다.

## Related Issues

- [#95 GA 화면 추적](https://github.com/zzzRYT/ch-notes/issues/95)
- [화면 조회 계약](../../../wiki/decisions/ADR-0029-firebase-analytics.md)
