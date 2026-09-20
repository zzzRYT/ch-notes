# ADR-0024 · FSD 레이어와 선택적 DDD로 앱 구조를 나눈다

```yaml
id: ADR-0024
status: accepted
statement: 앱 구조는 FSD의 단방향 레이어와 Slice 공개 인터페이스를 따르고, note와 scripture에만 필요한 만큼 DDD를 적용한다. Expo Router의 src/app은 Route 전용 Composition Root로 유지한다.
confidence: 기록됨
source:
  - https://github.com/zzzRYT/ch-notes/issues/28
  - https://fsd.how/kr/docs/get-started/overview/
  - https://lapidix.dev/posts/fsd-ddd-clean-architecture
```

## 맥락

현재 `apps/ch-life/src`의 최상위 폴더는 도메인(`notes`), 화면 영역(`editor`, `browser`, `workspace`)과 기술 기반(`db`, `state`, `markdown`)을 같은 깊이에서 나눈다. 이 구조에서는 화면이 SQLite 구현을 직접 호출하고 하나의 Zustand store가 설정, 노트, 성경 위치, 피드백과 삭제 복원을 함께 소유한다. 파일이 어느 폴더에 있는지는 보이지만 어느 방향의 의존이 허용되는지는 드러나지 않는다.

FSD는 변경 범위와 의존 방향을 Layer, Slice와 Segment로 표현한다. DDD와 Clean Architecture는 도메인 규칙과 저장 기술 사이에 명시적인 seam을 만든다. 두 방식을 모두 기계적으로 적용하면 현재 규모에서는 폴더와 Interface가 실제 로직보다 커질 수 있으므로, 구조 규칙과 도메인 패턴의 강도를 다르게 정한다.

## 결정

### FSD 레이어

의존은 다음 방향으로만 흐른다.

```text
app → pages → widgets → features → entities → shared
```

- `app`은 Expo Router Route와 `_layout.tsx`만 포함한다. 이 파일들이 실제 Adapter, Provider와 Use Case를 조립하는 Composition Root다.
- `pages`는 Route 단위 화면 조립, 로더, 오류 화면, Page 전용 UI와 짧은 수명의 상태를 소유한다.
- `widgets`는 둘 이상의 Page에서 실제로 반복되는 큰 UI 구조만 소유한다. 최초 대상은 Note Editor와 Scripture Browser다.
- `features`는 사용자 의도와 애플리케이션 정책을 소유한다. Note, Scripture, Settings 같은 Slice Group은 탐색만 돕고 Group 내부 공유를 허용하지 않는다.
- `entities`는 Note와 Scripture 도메인의 모델, 불변조건과 필요한 표현을 소유한다.
- `shared`는 도메인 의미가 없는 UI 및 기술 기반만 소유한다.

모든 Slice는 필요한 항목만 이름으로 내보내는 `index.ts` 공개 인터페이스를 제공한다. 외부 Deep import, `export *`, 상향 의존과 같은 Layer의 Slice 간 직접 import는 금지하며 ESLint와 CI에서 검사한다.

### 선택적 DDD

DDD 전술 패턴은 불변조건이나 실제 Adapter 교체점이 있는 곳에만 둔다. 모든 값에 Entity class, Value Object, Factory와 Repository를 만들지 않는다.

Entity Slice는 FSD 표준 Segment인 `model`, `api`, `ui`, `lib`를 사용한다. `model`은 UI 없이 판단 가능한 정본이다. `ui`는 반복되는 도메인 표현이 확인될 때만 만들고 Page나 Feature를 알지 못한다. 제한된 표현 차이는 명시적인 variant로, 구조 차이는 slot과 Composition으로 처리한다.

Repository Interface는 Entity의 `model`에, SQLite와 번들 데이터 Adapter 및 외부 표현 Mapper는 해당 Entity의 `api`에 둔다. Expo SQLite의 범용 연결 기반은 `shared`가 소유한다. Use Case는 필요한 Interface를 명시적으로 주입받으며 숨은 기본 구현이나 전역 Service Locator를 사용하지 않는다.

### Note와 Scripture 관계

Note와 Scripture는 독립 Slice다. Note는 Scripture Entity를 직접 참조하지 않고 인용 당시의 판본, 정규화된 참조와 구절 본문을 Citation Snapshot으로 소유한다. 새로운 성경 판본이나 원본 데이터가 추가되어도 기존 노트는 자동으로 바뀌지 않는다.

새 Citation Snapshot은 `editionId`를 필수로 저장한다. 기존 인용에 이 값이 없으면 Adapter가 현재 번들 판본으로 해석한다. 이 호환 처리는 기존 SQLite 노트와 마크다운 파일을 계속 읽기 위한 전환 규칙이다.

### 상태와 설정

상태는 사용하는 기술이 아니라 수명과 책임에 따라 소유 Slice로 나눈다. Page 수명의 값은 로컬 React 상태를 우선하고 여러 화면에 걸쳐 유지되는 상태에만 Zustand를 사용한다.

Settings Page는 화면과 임시 폼 상태만 소유한다. 설정 변경과 영속화는 Settings Feature가 소유하고, 도메인 의미가 없는 Theme Provider와 표현 기반은 Shared가 제공한다. 최근 노트와 성경 읽기 위치는 각각 Note와 Scripture 책임으로 분리한다.

## 대안

- **FSD 폴더만 적용하고 현재 도메인과 의존을 유지한다.** 이동량은 작지만 화면의 DB 직접 참조와 전역 Store의 혼합 책임이 남아 구조 변경의 목적을 달성하지 못한다.
- **모든 Entity에 Clean Architecture를 중첩한다.** `domain`, `application`, `infrastructure`, `presentation`을 각 Slice 안에 다시 만들면 FSD Segment와 분류축이 겹치고 현재 규모에서 얕은 Interface가 늘어난다.
- **Entity는 항상 UI를 갖지 않는다.** 규칙은 단순하지만 Note와 Scripture의 동일한 의미 표현이 여러 Page에서 반복될 때 일관성과 locality를 잃는다.
- **Expo Router를 사용자 정의 Route로 옮긴다.** 정식 `src/app` 폴더를 일반 App Layer로 쓸 수 있지만 Expo가 사용자 정의 Router 경로를 권장하지 않는다.
- **기존 구조와 FSD를 점진적으로 병행한다.** 변경 위험은 나눌 수 있지만 같은 책임의 공식 위치가 두 곳이 되는 기간이 길어진다. 현재 약 100개 TypeScript 파일은 원자적 전환과 전체 검증이 가능한 범위라고 판단했다.

## 귀결

- 전체 폴더와 import를 한 번에 바꾸며 화면 디자인과 사용자 흐름은 동결한다.
- Phone과 Tablet 표현은 같은 Notes Page가 소유한다. 한 Page에서만 쓰이는 Tablet UI를 Widget 예외로 만들지 않는다.
- Note Editor와 Scripture Browser는 실제 반복되는 구조이므로 Widget이 된다. 성경 삽입 동작은 Scripture Feature가 Widget에 조합한다.
- Note의 SQL과 외부 표현 매핑은 Note Entity로 이동하고 SQLite 실행 기반만 Shared에 남는다.
- 기존 `app-store`는 Slice별 상태로 해체된다.
- 아키텍처 규칙 위반은 코드 리뷰 관례가 아니라 자동 검사 실패가 된다.
- 상세 작업 범위와 완료 기준은 [GitHub Issue #28](https://github.com/zzzRYT/ch-notes/issues/28)이 추적한다.

## 구현 기록 (2026-09-20)

전환은 커밋 하나로 들어갔고, 결정문이 정하지 않은 자리는 다음과 같이 잡았다.

| 결정문의 빈 자리 | 잡은 방식 | 이유 |
|---|---|---|
| 설정 상태의 소유자 | `features/settings/change`가 스토어·검증·영속화를 전부 든다. `Variation` 등 테마 축의 타입은 `shared/ui/ThemeProvider.tsx`가 정본이고 `Settings`가 가져다 쓴다 | `ThemeProvider`(shared)는 위 레이어를 import하지 못하므로 `settings` prop을 받는다. Composition Root가 스토어에서 꺼내 넘긴다 |
| `lastBibleRef`의 "Scripture 책임" | 저장은 `settings.json`에 그대로(계약 동결). **포맷을 아는 훅**(`useBiblePosition`)만 `widgets/scripture-browser`가 든다 | 파일을 쪼개면 `CONTRACT-SETTINGS-FILE`이 깨지고, feature끼리는 서로 import할 수 없다. widget → feature 방향은 허용된다 |
| `lastOpenedNoteId`의 "Note 책임" | 옮기지 않았다. 읽는 코드가 없는 파일 호환용 필드다 | 옮길 동작이 없다([`drift.md`](../drift.md) B6) |
| 피드백 배너 | `shared/lib/feedback.ts`. 액션은 `"undo-delete"` 같은 태그가 아니라 `{ label, onPress }` 콜백 | shared가 노트 삭제를 알면 안 된다. 삭제 기능이 저장소를 닫아 넣은 콜백을 배너에 준다 |
| 삭제 복원 상태 | `features/note/delete`의 `useNoteDeleteStore`(스냅샷·`noteRevision`·`lastRestoredNoteId`) | [`RULE-NOTE-007`](../rules/note-persistence.md) |
| 저장소 주입 | `entities/note/model/note-repo.ts`의 `NoteRepo` 타입 + `NoteRepoProvider`/`useNoteRepo`. 화면이 꺼내 유스케이스에 인자로 넘긴다 | 결정문의 "명시적 주입, 숨은 기본 구현 금지"를 React에서 가장 얇게 구현한 것. 컨텍스트는 Composition Root가 채우므로 서비스 로케이터가 아니다 |
| DB 열기 | `shared/lib/sqlite.ts`의 `openSqliteDatabase(name, migrations)`가 **첫 질의 때** 연다. `_layout.tsx`가 `[runNoteMigrations]` 순서를 준다 | 부팅 렌더를 막지 않는다([`RULE-OTA-002`](../rules/release.md)) |
| 노트 ↔ 성경 엔티티 분리의 실제 이음새 | ① 인용 생성은 `features/scripture/insert`가 `makeQuoteBlock(ref, verses, BUNDLED_EDITION_ID)`로. ② 인용 표시(`QuoteBlock`, `formatRef` 필요)는 `widgets/note-editor`가. ③ 마크다운 파서는 `resolveRef`를 주입받는다. ④ `Verse`는 성경 엔티티에, 같은 모양의 `CitationVerse`는 노트 엔티티에 | 엔티티끼리 import하지 않는다는 규칙을 타입 수준까지 지켰다 |
| `editionId` | 타입에서는 선택, 새 인용은 항상 기록, 어댑터(SQLite·마크다운)가 읽을 때 `LEGACY_CITATION_EDITION_ID`로 채운다. 마크다운 형식은 바꾸지 않았다 | 필수로 하면 기존 데이터·테스트 픽스처를 전부 옮겨야 하고, 지금 이 값을 읽는 코드가 없다. [`CONTRACT-DOMAIN-NOTE`](../contracts/CONTRACT-DOMAIN-NOTE.md) |
| 폰·태블릿 편집 상태 | `widgets/note-editor/model/useNoteDraft.ts` 하나. 태블릿의 목록 캐시 갱신은 `onSaved` 콜백, 오류 문구는 옵션 | "Widget이 Entity와 자동저장·삽입 Feature를 조합한다"를 문자 그대로. 두 화면의 미세한 차이(삽입 실패 시 본문 유지, 없는 id는 저장 안 함)는 안전한 쪽으로 통일했다 |
| 경계 검사 | `eslint.config.js`의 `import/no-restricted-paths`(레이어 방향·같은 층 Slice) + `no-restricted-imports`(Deep import·2단계 이상 상대 경로) + `no-restricted-syntax`(`export *`). `__tests__/**`는 제외 | 새 의존성 없음 — expo 설정이 싣고 오는 `eslint-plugin-import`. 테스트는 Slice 공개 표면이 아니다 |
| `shared`의 공개 인터페이스 | 세그먼트 단위 — `@/shared/ui`, `@/shared/lib`, `@/shared/config` | FSD의 shared는 Slice가 없다 |

남은 것: `entities/*/ui`는 아직 없다(반복이 확인된 도메인 표현이 없다). `features/note/search`의 태블릿 사이드바 메모리 필터는 여전히 `pages/notes` 안에 있다([`drift.md`](../drift.md) B8).
