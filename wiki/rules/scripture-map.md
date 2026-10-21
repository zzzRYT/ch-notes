# RULE-MAP — 말씀 지도

상위 정책: [`POL-NOTE-003`](../policy/POL-NOTE.md)(RULE-MAP-001~005), [`POL-PRIVACY-001`](../policy/POL-PRIVACY.md)(RULE-MAP-006), [`POL-LICENSE-002`](../policy/POL-LICENSE.md)(RULE-MAP-007)

말씀 지도는 저장된 노트의 `scripture`·`citedRefs`를 **앱에 넣어 둔 검토된 사건 범위**에 연결해, 시대별 장소와 관련 노트를 보여 주는 읽기 전용 화면이다(`/scripture-map`). 연결은 노트에 저장하지 않고 열 때마다 파생한다 — DB 컬럼·마이그레이션이 없다. 자유 글 분석, GPS, 외부 지도 타일은 없다. 지도는 번들 지형 위에서 끌어 옮기고 확대할 수 있다.

설계 원문은 [`docs/plans/2026-10-09-1523-feat-scripture-map-v1-plan.md`](../../docs/plans/2026-10-09-1523-feat-scripture-map-v1-plan.md)이나 **역사 기록**이다. 현재 동작의 기준은 이 문서와 코드다(경로는 계획서와 다르다 — 로직은 `features/scripture/map`, 지도 그림은 `widgets/scripture-map`).

---

## RULE-MAP-001 · 연결은 검토된 사건 범위와 겹치는 절로만 만든다

```yaml
id: RULE-MAP-001
policy: POL-NOTE-003
requirement: MUST
statement: 노트의 설교 본문과 인용 참조는 파싱되고 번들 본문 조회에 성공한 것만 사건 범위와 대조한다. 같은 책·장에서 절 구간이 겹치는 사건에만 연결하고, 장 전체나 책 분류로 장소를 퍼뜨리지 않는다. 역방향 범위·없는 절·자유 문장·연결표에 없는 본문은 조용히 건너뛰며 표식을 만들지 않는다. 한 노트의 여러 참조가 같은 사건에 닿으면 (노트, 장소) 한 쌍으로 합친다.
implemented_by:
  - apps/ch-life/src/features/scripture/map/model/match-notes.ts
  - apps/ch-life/src/features/scripture/map/api/{periods,places,scenes}.json (검토본 5건)
  - apps/ch-life/src/features/scripture/map/model/validate-data.ts
verified_by:
  - test: apps/ch-life/src/features/scripture/map/model/__tests__/match-notes.test.ts
  - test: apps/ch-life/src/features/scripture/map/model/__tests__/map-data.test.ts
confidence: 코드추론
source:
  - docs/plans/2026-10-09-1523-feat-scripture-map-v1-plan.md (R2·R3, AE1·AE2·AE5)
```

시대는 **성경 사건의 시대**이지 작성일이나 책의 저작 시기가 아니다. 신약 책이 구약 사건을 회상해도 사건 범위가 시대를 정한다. 데이터는 시대 3개(여호수아·왕국·예수님 사역), 시대별 장소 5개, 사건 5개뿐이며 근거(`source`·`basis`)가 있는 항목만 수록한다. 항목을 더할 때는 근거를 함께 남기고 `map-data.test.ts`(무결성·출처·좌표 정밀도)를 통과시킨다.

## RULE-MAP-002 · 시대별 장소는 독립 항목이고 좌표를 옮기지 않는다

```yaml
id: RULE-MAP-002
policy: POL-NOTE-003
requirement: MUST
statement: 장소는 시대별로 독립 식별한다. 전체 지도는 지역마다 묶음 표식 하나를 두고, 지역 지도는 시대별 장소를 각자의 좌표에 둔다 — 다른 좌표는 합치지 않고 위치를 옮기지 않으며 확대해서 가른다. 정확히 같은 좌표의 다른 시대 장소는 위치를 옮기지 않고 표식 하나(겹친 카드 모양)로 두며, 거듭 누르면 시대를 차례로 돌고 시대별 항목은 목록으로도 구분한다. 폰·태블릿이 같은 모델을 쓴다.
implemented_by:
  - apps/ch-life/src/widgets/scripture-map/model/projection.ts (groupByCoord, regionBounds)
  - apps/ch-life/src/widgets/scripture-map/ui/{OverviewMap,RegionMap}.tsx
verified_by:
  - test: apps/ch-life/src/widgets/scripture-map/model/__tests__/map-model.test.ts
  - manual: 실기기에서 표식 터치·시대 순환·라벨 겹침 (시뮬레이터에서 폰·태블릿 확인, 실기기 미확인)
confidence: 코드추론
source:
  - docs/plans/2026-10-09-1523-feat-scripture-map-v1-plan.md (R4·R8, AE3·AE4)
  - Claude Design `말씀 지도.html` (2026-10-11 개정)
```

2026-10-11 디자인 개정으로 화면 거리 기반 묶음(`layoutMarkers`)을 없앴다. 전체 지도의 지역 표식 위치는 그 지역 장소 좌표의 평균이다. 지역 지도의 표시 범위는 장소를 감싸되 최소 약 30km 폭을 보장한다(`regionBounds`). 가까운 장소(예: 여리고의 두 장소, 약 2km)는 기본 배율에서 표식이 가까이 놓이므로 라벨을 반대쪽에 두고(`labelSides`·`RegionMap`), 더 가르려면 확대한다.

## RULE-MAP-003 · 집계는 고유 노트 ID와 지역 키로 센다

```yaml
id: RULE-MAP-003
policy: POL-NOTE-003
requirement: MUST
statement: 요약의 기록 수는 고유 노트 ID, 지역 수는 지역 묶음 키로 센다. 한 노트가 여러 시대·장소에 연결돼도 한 편이고, 지역의 기록 수는 그 지역 장소별 수의 합이 아니다. 시대 필터를 건 뒤에도 그 집합에서 중복을 제거한다. 필터는 장소의 시대로 거르며 "시대 미상"은 그런 장소가 데이터에 있을 때만 보인다.
implemented_by:
  - apps/ch-life/src/features/scripture/map/model/match-notes.ts (summarize)
  - apps/ch-life/src/features/scripture/map/model/build-view.ts (buildRegions)
  - apps/ch-life/src/pages/scripture-map/ui/ScriptureMapPage.tsx
verified_by:
  - test: apps/ch-life/src/features/scripture/map/model/__tests__/build-view.test.ts
  - test: apps/ch-life/src/features/scripture/map/model/__tests__/match-notes.test.ts
confidence: 코드추론
source:
  - docs/plans/2026-10-09-1523-feat-scripture-map-v1-plan.md (R9, AE2)
```

`buildRegions`는 `summarize`와 같은 수를 낸다(테스트가 모든 필터에서 대조한다). 둘 중 하나만 바꾸면 요약과 목록이 어긋난다.

## RULE-MAP-004 · 전체 저장 기록을 대상으로 하고 변경을 반영한다

```yaml
id: RULE-MAP-004
policy: POL-NOTE-003
requirement: MUST
statement: 지도는 최근 목록의 200편 제한 없이 저장된 모든 노트를 대상으로 한다. 화면에 들어올 때와 삭제·복원(`noteRevision`) 뒤에 다시 읽고, 늦게 끝난 이전 조회는 버린다. 조회 실패는 빈 지도와 구분해 "다시 시도"를 제공하고, 조회 중에는 "0편"을 먼저 보이지 않는다. 사라진 선택(마지막 노트 삭제, 필터 변경으로 숨겨진 지역·장소)은 해제한다.
implemented_by:
  - apps/ch-life/src/entities/note/api/sqlite-note-repo.ts (listRefSummaries)
  - apps/ch-life/src/pages/scripture-map/model/useScriptureMap.ts
  - apps/ch-life/src/pages/scripture-map/ui/ScriptureMapPage.tsx
verified_by:
  - test: apps/ch-life/src/entities/note/api/__tests__/note-repo.test.ts
  - test: apps/ch-life/src/pages/scripture-map/model/__tests__/useScriptureMap.test.tsx
  - manual: 노트 열기 → 편집·삭제 → 지도 복귀에서 필터·지역 유지와 반영 (미확인)
confidence: 코드추론
source:
  - docs/plans/2026-10-09-1523-feat-scripture-map-v1-plan.md (R6·R11, AE6·AE8)
```

에디터에서 지도로 돌아올 때 마지막 입력이 저장돼 있어야 하므로 [`RULE-EDIT-017`](editor-insert.md#rule-edit-017--화면을-떠나기-전에-마지막-입력까지-저장하고-실패하면-남는다)에 기댄다. 지도에서 연 에디터는 `from=scripture-map` 라우트 파라미터로 헤더 뒤로 문구를 "말씀 지도"로 바꾼다.

## RULE-MAP-005 · 지도를 누르지 않아도 모든 흐름이 가능하다

```yaml
id: RULE-MAP-005
policy: POL-A11Y-001
requirement: SHOULD
statement: 지도 표식과 같은 정보를 지역 → 시대별 장소 → 노트 목록으로 제공하고, 표식 선택과 목록 선택은 같은 상태를 바꾼다. 시대는 색이 아니라 이름·선택 윤곽·표식 모양(묶음은 개수)으로 구분한다. 기록 수나 달성 압박(연속 기록·보상·미연결 지역 강조)을 넣지 않는다. 폰과 태블릿은 같은 화면·같은 동작이다 — 900px 이상에서는 지도(폭 524pt)와 목록을 나란히 놓을 뿐 기능·집계는 같다. 지도는 끌어서 옮기고, 두 손가락·더블탭·±버튼으로 확대하며, 표식·라벨은 확대해도 화면 크기를 유지한다.
implemented_by:
  - apps/ch-life/src/pages/scripture-map/ui/ScriptureMapPage.tsx
  - apps/ch-life/src/widgets/scripture-map/ui/{MapShell,usePanZoom,markers}.tsx
  - apps/ch-life/src/pages/notes/ui/{NotesPage,NoteListSidebar}.tsx (진입점)
verified_by:
  - manual: 표식 없이 목록만으로 노트 열기, 큰 글자·스크린리더, focus·dark 테마, 폰·태블릿 (미확인)
confidence: 코드추론
source:
  - docs/plans/2026-10-09-1523-feat-scripture-map-v1-plan.md (R1·R7)
```

진입점은 폰 노트 목록 제목 아래와 태블릿 사이드바 제목 아래의 텍스트 행(`말씀 지도 ›`)이다. 폰 목록 헤더의 아이콘 열에는 넣지 않았다(아이콘 간격 문제, [`drift.md` B22](../drift.md)). UI 자동 증거 수단이 없어([`drift.md` C3](../drift.md)) 대문자 `MUST`를 쓰지 않았다. 표식은 44pt 터치 영역의 버튼이고 이름·편수를 접근성 라벨로 가지며(`지역 · N시대 · N편`), 지형·라벨 글자는 장식이라 읽지 않는다. 확대 버튼과 목록이 있어 제스처 없이도 같은 흐름이 가능하다 — **목록이 접근 가능한 기본 경로**다. 손가락이 지도에 닿아 있는 동안 페이지 스크롤을 잠근다(`onTouching` → 페이지 `scrollEnabled`; 지도를 끌 때 페이지가 같이 움직이지 않게). 페이지는 지도 밖 영역을 끌어 스크롤한다.

## RULE-MAP-006 · 지도는 오프라인이고 노트 내용을 밖으로 보내지 않는다

```yaml
id: RULE-MAP-006
policy: POL-PRIVACY-001
requirement: MUST
statement: 지도 지형·장소 데이터·연결 로직은 모두 앱에 번들돼 설치 후 오프라인으로 작동한다. 노트·본문·선택한 시대를 외부로 전송하는 경로를 만들지 않는다. 지도 타일이나 지도 SDK를 쓰지 않는다 — 이동·확대는 번들 벡터 지형을 앱이 직접 그린다.
implemented_by:
  - apps/ch-life/assets/maps/{scripture-region,context-labels}.json
  - apps/ch-life/scripts/build-map-terrain.mjs
  - apps/ch-life/src/widgets/scripture-map/model/terrain.ts
  - apps/ch-life/src/widgets/scripture-map/ui/MapShell.tsx (react-native-svg)
verified_by:
  - manual: 비행기 모드에서 지도·시대 필터·노트 열기 (미확인)
confidence: 코드추론
waiver: 코드의 부재로 성립하는 규칙이라 자동 검사로 잡을 수 없다(POL-PRIVACY-001과 같다).
source:
  - docs/plans/2026-10-09-1523-feat-scripture-map-v1-plan.md (R10, AE7)
```

2026-10-11 디자인은 지형 음영을 Esri 타일로, 해안선을 CDN에서 런타임에 받도록 그렸다. 이 규칙과 충돌해 **채택하지 않았고**, 세밀한 지형은 필요 없다는 결정에 따라 같은 출처(Natural Earth)를 지도 범위로 더 촘촘히 잘라 번들했다. 확대할수록 윤곽이 거칠어지는 것이 이 방식의 한계다.

## RULE-MAP-007 · 지도 데이터의 출처·수정·불확실성을 앱에서 읽을 수 있다

```yaml
id: RULE-MAP-007
policy: POL-LICENSE-002
requirement: MUST
statement: 말씀 지도 화면에서 "출처 및 라이선스" 화면으로 갈 수 있고, 그 화면은 오프라인으로 읽힌다. 장소 위치의 출처(OpenBible CC BY 4.0)와 한 일(장소 선별·한국어 이름·위치 설명 추가), 지형의 출처(Natural Earth 해안선·호수·강, 공개 영역)와 한 일(범위로 자르고 단순화, 현대 지형이며 고대 지형이 아님), 지도에 곁들이는 참고 지명 라벨의 위치가 근사치라는 점, 수록한 장소별 출처 문자열, 시대·위치 불확실성 안내를 보인다. 장소 상세에는 위치 설명(`locationNote`)과 정밀도를 보인다.
implemented_by:
  - apps/ch-life/src/pages/licenses/ui/LicensesPage.tsx
  - apps/ch-life/src/pages/scripture-map/ui/ScriptureMapPage.tsx (PlaceDetail, 안내 링크)
  - apps/ch-life/src/features/scripture/map/api/places.json (source·locationNote)
verified_by:
  - test: apps/ch-life/src/features/scripture/map/model/__tests__/map-data.test.ts
  - manual: 비행기 모드에서 설정 → 출처 및 라이선스, 말씀 지도 → 안내 링크 (미확인)
confidence: 코드추론
source:
  - docs/plans/2026-10-09-1523-feat-scripture-map-v1-plan.md (R12, KTD6)
```

수록한 장소 목록은 `MAP_DATA`에서 그대로 그리므로 장소를 더하면 고지도 따라간다. `map-data.test.ts`가 모든 `source`에 `CC BY 4.0`과 링크가 있는지 확인한다. **OpenBible 외 출처를 쓰는 항목을 더하면 그 이용 조건을 `LicensesPage`에 직접 추가해야 한다** — 데이터 출처가 `source` 문자열에만 있고 이용 조건 문단은 정적이다.
