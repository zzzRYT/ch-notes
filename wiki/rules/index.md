# `rules/` — 도메인 규칙 `RULE-*`

> 손으로 쓴다. 전체 ID 표는 [`../index.md`](../index.md)(생성물), 절차는 [`../workflow.md`](../workflow.md).

**항상 참이어야 하는 것**을 코드 단위로 적은 곳이다. 정책([`../policy/index.md`](../policy/index.md))이 약속을, 계약([`../contracts/index.md`](../contracts/index.md))이 고정된 모양을 다룬다면, 여기는 **동작**을 다룬다.

파일 하나가 코드 한 영역을 덮는다(예외는 [release.md](release.md) 하나 — 코드가 아니라 배포 상황을 덮는다). 증거 밀도는 영역마다 크게 다르다 — 순수 로직은 자동 증거가 촘촘하고, UI는 **전부 수동**이라 대문자 `MUST`를 쓰지 않는다.

## 파일

아래 "자동 증거" 칸은 **2026-09-05 `check.mjs` 기준의 사본**이다. 최신값은 언제나 [`../index.md`](../index.md)에 있다.

| 파일 | ID | 무엇을 정하나 | 대응 코드 | 자동 증거 |
|---|---|---|---|---|
| [scripture-ref.md](scripture-ref.md) | RULE-REF-001 ~ RULE-REF-005 | 참조 파싱 → 책 이름 해석 → 본문 조회 → 표시 포맷 | `src/parser/**` | 5/5 |
| [editor-insert.md](editor-insert.md) | RULE-EDIT-001 ~ RULE-EDIT-013 | 참조 감지 → 문단 3분할 → 인용 블록 → 자동저장 | `src/editor/**` | 9/13 |
| [note-persistence.md](note-persistence.md) | RULE-NOTE-001 ~ RULE-NOTE-008 | 로컬 SQLite 저장, id 생성, read-then-merge, 마이그레이션 | `src/db/**` | 6/8 |
| [search.md](search.md) | RULE-SEARCH-001 ~ RULE-SEARCH-007 | FTS 접두 검색, 대상은 제목·인용뿐 | `src/db/note-repo.ts` | 5/7 |
| [bible-reader.md](bible-reader.md) | RULE-BIBLE-001 ~ RULE-BIBLE-007 | 리더 3-진입점, 탐색·위치 기억은 공유하고 삽입만 갈림 | `src/browser/**` | 4/7 |
| [share-markdown.md](share-markdown.md) | RULE-MD-001 ~ RULE-MD-008 | `.md` 왕복에서 무엇이 보존되고 무엇이 사라지는가 | `src/markdown/**`, `src/share/**` | 6/8 |
| [settings-theme.md](settings-theme.md) | RULE-SET-001 ~ RULE-SET-006 | 설정 파싱 엄격도, 색은 `variation` 하나로 결정 | `src/state/**`, `src/theme/**` | 4/6 |
| [layout-a11y.md](layout-a11y.md) | RULE-UI-001 ~ RULE-UI-006 | 900px 폰/태블릿 분기, 터치 크기·라벨·대비 | `src/workspace/**`, `src/chrome/**` | **0/6** |
| [release.md](release.md) | RULE-OTA-001 ~ RULE-OTA-010 | 오프라인 기본인 앱에 OTA를 얹을 때의 제약 | `app/_layout.tsx`, `src/db/migrate.ts`, `src/update/**` | **2/10** |

## 이 계층에서 사고 나는 지점

각 파일을 열기 전에 알아 둘 것 하나씩.

- **scripture-ref** — 본문 조회는 all-or-nothing이다. 범위의 끝 절이 없으면 앞이 다 있어도 통째로 `null`. 그리고 **숫자로 시작하는 영어 책 17권은 파서에 도달하지 못한다**([`../drift.md`](../drift.md) B11).
- **editor-insert** — 자동완성 트리거 정규식이 `parseRef`보다 좁다. `1 John 1:1 `을 치면 **요한복음**이 삽입된다(B10).
- **note-persistence** — `update`는 read-then-merge다. 새 컬럼을 더하면서 `null`=비움 / `undefined`=유지 규칙을 따르지 않으면, 다른 화면의 부분 저장이 방금 입력한 값을 조용히 지운다. 그리고 `restore`는 그 규칙 **바깥**이다 — id·`created_at`을 보존한 채 통째로 INSERT하므로 컬럼을 빠뜨리면 되돌린 노트만 그 필드를 잃는다.
- **search** — `body_text`는 언제나 빈 문자열로 색인된다. 그런데 검색창은 "본문"을 검색한다고 안내한다(D2). 태블릿은 또 다르게 동작한다(B8).
- **bible-reader** — 브라우저 ＋로 넣은 인용은 정식 한국어명, 자동완성으로 넣은 인용은 사용자가 친 그대로 저장된다. 같은 절인데 검색 결과가 갈린다(RULE-SEARCH-005).
- **share-markdown** — `(KRV)` 표식은 데이터를 잘못 이름 붙였지만 **파서의 판별자**라 바꾸면 기존 파일을 못 읽는다. 그리고 덮어쓰기 가져오기가 없는 필드를 지운다(B16).
- **settings-theme** — 새 설정 필드는 **반드시 개별 폴백**으로 추가한다. 필수 필드로 다루면 구버전 `settings.json` 전체가 버려진다.
- **layout-a11y** — 900px 상수가 두 곳에 복제되어 있다(B2). 한쪽만 고치면 목록은 태블릿인데 성경만 시트로 뜬다.
- **release** — 이 파일만 코드 영역이 아니라 **배포 상황**을 덮는다. [`RULE-OTA-010`](release.md)만 이 중 유일하게 화면에 무언가를 띄우는 규칙이고, 나머지는 전부 끼어들지 않기 위한 제약이다. 핵심은 하나다. **번들은 한 칸 되돌아가지만 데이터는 되돌아가지 않는다.** 그래서 되돌릴 수 없는 변경(컬럼 삭제·개명, 새 블록 타입)은 OTA에 실을 수 없다. 그리고 오프라인 기기는 중간 번들을 전부 건너뛴다 — 번들이 순서대로 적용된다는 전제를 세우면 안 된다.

## 처음이라면

[scripture-ref.md](scripture-ref.md)부터. 가장 순수한 변환이고 증거가 가장 촘촘해 블록 형식을 익히기에도 좋다. 그다음 [editor-insert.md](editor-insert.md) → [note-persistence.md](note-persistence.md) → [search.md](search.md) 순으로 읽으면 데이터가 흐르는 순서대로 따라가게 된다. [layout-a11y.md](layout-a11y.md)는 자동 증거가 없는 서술 계층이라 마지막이어도 된다.

## `MUST`를 읽을 때

대문자 `MUST`는 `verified_by`에 `test:`/`ci:`가 붙어 있을 때만 쓴다([`../README.md`](../README.md) 3절 `requirement`). 하지만 **`check.mjs`는 그 테스트가 정말 그 statement를 검증하는지는 모른다** — 파일과 테스트 이름이 존재하는지만 본다. 실제로 이름만 증거였던 사례가 있었다([`../drift.md`](../drift.md) C7). 2단계 대조에서 테스트 본문을 여는 이유다.
