# 전체 ID 표

[`README.md`](README.md)의 규약에 따라 발급된 모든 ID다. 숫자는 `node wiki/check.mjs` 실행 시점 기준이며, 이 표와 실제 파일이 어긋나면 **파일이 정본**이다.

## 커버리지

| | 개수 |
|---|---|
| 사용자 정책 `POL` | 10 |
| 도메인 규칙 `RULE` | 60 |
| 계약 `CONTRACT` | 7 |
| 결정 `ADR` | 15 |
| **합계** | **92** |

| 지표 | 값 |
|---|---|
| 자동 증거(test/ci)가 붙은 RULE | **39/60 (65%)** |
| 나머지 21건 | 수동 QA 또는 현상 서술 — 대부분 UI 계층 |
| 근거가 기록으로 남아 있는 항목 | 50 |
| 코드에서 추론한 항목 | 37 |
| **확인 필요 (사용자 답 대기)** | **5** → [`drift.md`](drift.md) E절 |

자동 증거 비율이 67% 언저리인 이유는 감추지 않는다. RN 컴포넌트 테스트 도구가 없어 **UI 규칙 전체에 자동 증거가 없다**([`drift.md`](drift.md) C3). 그 규칙들은 대문자 MUST를 쓰지 않는다.

## POL — 사용자 정책

| ID | 요구 | 증거 | 근거 | 내용 |
|---|---|---|---|---|
| [`POL-A11Y-001`](policy/POL-ACCESSIBILITY.md) | — | — | 기록됨 | 글자 크기를 4단계로 키울 수 있어야 하고, 모든 조작 대상은 손가락으로 누를 수 있는 크기여야 하며, 색만으로 의미를 전달하지 않는다. |
| [`POL-LICENSE-001`](policy/POL-LICENSE.md) | MUST | 수동 (waiver) | 기록됨 | 앱에 포함된 성경 본문은 Open Bible 한국어판이며 CC BY-SA 4.0을 따른다. 출처와 라이선스를 앱 안에서 확인할 수 있어야 하고, 재배포되는 본문은 동일 라이선스를 유지한다. |
| [`POL-NOTE-001`](policy/POL-NOTE.md) | — | — | 기록됨 | 새 노트는 한 번의 탭으로 즉시 열려 바로 입력 가능해야 하고, 저장은 사용자가 의식하지 않아도 자동으로 이루어져야 한다. |
| [`POL-NOTE-002`](policy/POL-NOTE.md) | — | — | 기록됨 | 노트 상단에 설교 제목·날짜·설교자·장소·생명양식(대표 본문)을 항상 보이는 형태로 기록할 수 있어야 한다. |
| [`POL-NOTE-003`](policy/POL-NOTE.md) | — | — | 코드추론 | 노트는 날짜별로 묶여 최신순으로 보이고, 제목과 인용한 구절로 찾을 수 있어야 한다. |
| [`POL-PORT-001`](policy/POL-PORTABILITY.md) | — | — | 기록됨 | 노트 한 개는 언제든 표준 Markdown 파일로 내보낼 수 있어야 하고, 그 파일은 다른 마크다운 앱에서 열려야 하며, 다시 가져와도 내용이 보존되어야 한다. |
| [`POL-PRIVACY-001`](policy/POL-PRIVACY.md) | MUST NOT | waiver | 기록됨 | 앱은 사용자 콘텐츠·식별 정보·사용 기록을 외부로 전송하지 않는다. 계정도 서버도 애널리틱스도 없다. |
| [`POL-RELEASE-001`](policy/POL-RELEASE.md) | MUST | 자동 | 기록됨 | 자동 OTA 업데이트는 CI(타입체크·린트·테스트)가 통과한 커밋에서만 발행되고, 네이티브 변경은 OTA로 전달할 수 없으므로 새 빌드를 낸다. |
| [`POL-SCRIPTURE-001`](policy/POL-SCRIPTURE.md) | — | — | 기록됨 | 노트를 쓰다가 성경 참조를 입력하면, 앱을 벗어나지 않고 인터넷도 없이 본문이 인용 블록으로 들어와야 한다. |
| [`POL-SCRIPTURE-002`](policy/POL-SCRIPTURE.md) | — | — | 기록됨 | 노트를 쓰지 않을 때도 성경 자체를 책→장→절로 찾아 읽을 수 있어야 하며, 읽던 자리에서 이어 읽을 수 있어야 한다. |

## RULE — 도메인 규칙

### 성경 참조 해석 — [`rules/scripture-ref.md`](rules/scripture-ref.md)

| ID | 요구 | 증거 | 근거 | 내용 |
|---|---|---|---|---|
| [`RULE-REF-001`](rules/scripture-ref.md) | MUST | 자동 | 코드추론 | 참조는 "책 장:절" 또는 "책 장:절-끝절" 형태만 인식한다. 책과 장 사이 공백은 있어도 없어도 되고, 장·절은 각각 1~3자리 숫자다. |
| [`RULE-REF-002`](rules/scripture-ref.md) | MUST | 자동 | 기록됨 | 66권 각각에 대해 한국어 정식명·한국어 축약·영어 정식명·영어 축약을 모두 같은 책 코드로 해석한다. |
| [`RULE-REF-003`](rules/scripture-ref.md) | MUST | 자동 | 코드추론 | 본문은 번들된 bible.json에서만 조회한다. 범위 중 한 절이라도 없거나 끝 절이 시작 절보다 작으면 부분 결과를 주지 않고 전체를 null로 반환한다. |
| [`RULE-REF-004`](rules/scripture-ref.md) | MUST | 자동 | 코드추론 | 화면에 보이는 참조 라벨은 축약·영어 입력이라도 정식 한국어 책 이름으로 확장한다. 파싱할 수 없는 문자열은 공백만 정리해 그대로 보여준다. |
| [`RULE-REF-005`](rules/scripture-ref.md) | MUST NOT | 자동 | 기록됨 | 본문 조회에 실패한 참조는 힌트 칩을 띄우지 않고, 인용 블록도 만들지 않으며, 오류 메시지도 표시하지 않는다. |

### 에디터·인용 삽입 — [`rules/editor-insert.md`](rules/editor-insert.md)

| ID | 요구 | 증거 | 근거 | 내용 |
|---|---|---|---|---|
| [`RULE-EDIT-001`](rules/editor-insert.md) | MUST | 자동 | 기록됨 | 유효한 참조 바로 뒤에 공백이나 개행이 입력되면 인용 블록으로 확정한다. 문단 끝뿐 아니라 문단 중간에서도 동작한다. |
| [`RULE-EDIT-002`](rules/editor-insert.md) | MUST | 자동 | 코드추론 | 인용 확정 시 원래 문단은 [참조 앞 텍스트] / [인용 블록] / [참조 뒤 텍스트] 세 블록으로 나뉜다. 참조 문자열과 트리거 공백은 사라진다. |
| [`RULE-EDIT-003`](rules/editor-insert.md) | SHOULD | 수동 | 기록됨 | 인용 블록이 삽입되면 캐럿은 그 아래 새 문단으로 이동해, 사용자가 손을 떼지 않고 계속 쓸 수 있어야 한다. |
| [`RULE-EDIT-004`](rules/editor-insert.md) | SHOULD | 수동 | 코드추론 | 인용 블록 바로 아래 문단의 맨 앞에서 backspace를 누르면 인용 블록이 삭제되고, 위·아래 문단이 하나로 합쳐진다. |
| [`RULE-EDIT-005`](rules/editor-insert.md) | SHOULD | 수동 | 기록됨 | 커서 바로 앞이 본문 조회에 성공하는 참조일 때만 화면 하단에 떠 있는 힌트 칩(참조 + space 안내)을 보여준다. |
| [`RULE-EDIT-006`](rules/editor-insert.md) | SHOULD NOT | 수동 | 코드추론 | 인용 블록의 본문은 사용자가 수정할 수 없다. 표시 형태(카드/인용바/접힘)만 설정에 따라 달라진다. |
| [`RULE-EDIT-007`](rules/editor-insert.md) | MUST | 자동 | 코드추론 | 저장되는 인용 블록의 status는 언제나 "loaded"다. "loading"과 "error"는 타입에는 있으나 어떤 코드 경로에서도 생성되지 않는다. |
| [`RULE-EDIT-008`](rules/editor-insert.md) | SHOULD | 자동 | 코드추론 | 문단 텍스트는 입력이 멈춘 뒤 800ms에 블록 배열로 반영되고, 노트 전체는 그로부터 500ms 뒤 DB에 저장된다. 성공은 알리지 않고 실패만 상단 배너로 알린다. |
| [`RULE-EDIT-009`](rules/editor-insert.md) | MUST | 자동 | 코드추론 | 노트의 citedRefs는 사용자가 관리하는 값이 아니라, 저장 시점에 body의 quote 블록에서 등장 순서대로 중복 없이 추출한 결과다. |
| [`RULE-EDIT-010`](rules/editor-insert.md) | MUST | 자동 | 기록됨 | 굵게·기울임·밑줄은 별도 스팬 모델이 아니라 블록 텍스트 안의 경량 마크다운(**굵게**, _기울임_, ++밑줄++)으로 저장한다. |
| [`RULE-EDIT-011`](rules/editor-insert.md) | MUST | 자동 | 기록됨 | 설교 메타 필드는 제목 → 날짜 → 설교자 → 장소 → 생명양식 순으로 Return 키로 이동하고, 마지막 필드에서 Return을 누르면 본문 첫 문단으로 포커스가 넘어간다. |
| [`RULE-EDIT-012`](rules/editor-insert.md) | MUST | 자동 | 기록됨 | 날짜 입력은 구분자(. - / 공백)를 섞어 쓸 수 있고 연도를 생략하면 올해로 채운다. 저장 형식은 언제나 YYYY-MM-DD 문자열이며, 해석 불가한 입력은 저장하지 않고 직전 값으로 되돌린다. |
| [`RULE-EDIT-013`](rules/editor-insert.md) | MUST | 자동 | 기록됨 | 생명양식 필드는 입력값으로 본문 조회가 성공할 때만 체크 표시를 보여주고 본문 미리보기 버튼을 활성화한다. 실패해도 입력 자체는 그대로 저장된다. |

### 노트 저장 — [`rules/note-persistence.md`](rules/note-persistence.md)

| ID | 요구 | 증거 | 근거 | 내용 |
|---|---|---|---|---|
| [`RULE-NOTE-001`](rules/note-persistence.md) | MUST | 수동 (waiver) | 기록됨 | 모든 노트는 앱 문서 디렉터리의 ch-life.db 한 파일에 저장되며, 어떤 경로로도 자동 전송·동기화·백업되지 않는다. |
| [`RULE-NOTE-002`](rules/note-persistence.md) | MUST | 자동 | 기록됨 | 노트 부분 수정 시 null을 넘기면 해당 필드를 비우고, undefined(생략)면 기존 값을 유지한다. 존재하지 않는 id에 대한 수정은 예외를 던진다. |
| [`RULE-NOTE-003`](rules/note-persistence.md) | MUST | 자동 | 코드추론 | 노트 id는 36진수 타임스탬프 10자 + 36진수 난수 10자를 대문자로 이어붙인 20자 문자열이다. ULID가 아니다. |
| [`RULE-NOTE-004`](rules/note-persistence.md) | MUST | 자동 | 코드추론 | 노트 목록과 검색 결과는 created_at 내림차순으로 정렬하고 한 번에 최대 200건을 읽는다. 노트를 수정해도 순서는 바뀌지 않는다. |
| [`RULE-NOTE-005`](rules/note-persistence.md) | MUST | 자동 | 기록됨 | 스키마 변경은 버전 번호나 마이그레이션 이력 테이블 없이, 매 실행마다 PRAGMA table_info로 누락 컬럼만 찾아 ALTER 한다. 몇 번을 실행해도 결과가 같아야 한다. |
| [`RULE-NOTE-006`](rules/note-persistence.md) | MAY | 수동 | 기록됨 | 새 노트 버튼을 누르면 빈 문단 하나를 가진 노트가 즉시 DB에 생성된다. 사용자가 아무것도 쓰지 않고 나가도 그 빈 노트는 남는다. |
| [`RULE-NOTE-007`](rules/note-persistence.md) | MUST | 자동 | 기록됨 | 노트는 목록 스와이프·에디터·태블릿 세 경로에서 삭제할 수 있다. delete는 지우기 전에 노트 전체를 스냅샷으로 반환하고, 그 스냅샷으로 되돌리는 undo 경로가 제공된다. 되돌리기는 id와 created_at까지 원본 그대로 복원한다. |
| [`RULE-NOTE-008`](rules/note-persistence.md) | MUST | 자동 | 코드추론 | 노트 목록은 createdAt의 날짜로 묶고 최신 날짜 그룹이 위에 온다. 같은 그룹 안에서도 createdAt 내림차순이며 updatedAt은 무시한다. |

### 검색 — [`rules/search.md`](rules/search.md)

| ID | 요구 | 증거 | 근거 | 내용 |
|---|---|---|---|---|
| [`RULE-SEARCH-001`](rules/search.md) | MUST | 자동 | 기록됨 | 노트 검색은 title과 cited_refs만 대상으로 한다. body_text 컬럼은 색인 구조상 존재하지만 언제나 빈 문자열이 들어가므로, 본문 검색은 동작하지 않는다. |
| [`RULE-SEARCH-002`](rules/search.md) | MUST | 자동 | 코드추론 | 검색어는 FTS 접두 질의(query*)로 변환된다. 토큰의 앞부분과만 일치하며, 단어 중간 일치는 되지 않는다. |
| [`RULE-SEARCH-003`](rules/search.md) | MUST | 자동 | 코드추론 | 검색어에서 작은따옴표와 큰따옴표를 제거한 뒤 질의한다. 제거 후 남는 것이 없으면 빈 결과를 반환한다. |
| [`RULE-SEARCH-004`](rules/search.md) | SHOULD | 수동 | 코드추론 | 검색창 입력이 멈춘 뒤 200ms에 질의하고, 입력이 비면 즉시 전체 목록으로 되돌아간다. 결과가 없으면 "검색 결과 없음"을 보여준다. |
| [`RULE-SEARCH-005`](rules/search.md) | 현상 서술 | 자동 | 코드추론 | cited_refs에는 인용을 만든 경로에 따라 서로 다른 표기가 저장된다. 따라서 같은 절이라도 검색어 형태에 따라 찾히기도 하고 찾히지 않기도 한다. |
| [`RULE-SEARCH-006`](rules/search.md) | MUST | 자동 | 코드추론 | 검색 결과는 created_at 내림차순으로 정렬된다. |
| [`RULE-SEARCH-007`](rules/search.md) | 현상 서술 | — | 코드추론 | 검색 결과는 최대 200건까지만 반환된다. 그 뒤는 조용히 잘린다. |

### 공유 파일 — [`rules/share-markdown.md`](rules/share-markdown.md)

| ID | 요구 | 증거 | 근거 | 내용 |
|---|---|---|---|---|
| [`RULE-MD-001`](rules/share-markdown.md) | MUST | 자동 | 코드추론 | 내보내기는 현재 노트 하나를 YYYY-MM-DD-{제목슬러그 또는 id뒷자리}.md 파일로 만들어 OS 공유 시트에 넘긴다. |
| [`RULE-MD-002`](rules/share-markdown.md) | MUST | 자동 | 코드추론 | id/createdAt/updatedAt/citedRefs/schemaVersion은 항상 쓰고, title·sermonDate·preacher·location·scripture는 값이 있을 때만 키를 만든다. |
| [`RULE-MD-003`](rules/share-markdown.md) | MUST | 자동 | 코드추론 | 성경 인용 블록은 첫 줄이 "> **{참조}** (KRV)"인 blockquote로 직렬화한다. 이 머리줄이 없는 blockquote는 사용자가 쓴 일반 인용으로 복원한다. |
| [`RULE-MD-004`](rules/share-markdown.md) | MUST | 자동 | 코드추론 | DB → 마크다운 → DB 왕복 후 id·제목·설교 메타·블록 구조·인용 참조가 보존된다. |
| [`RULE-MD-005`](rules/share-markdown.md) | MUST | 자동 | 코드추론 | frontmatter가 없거나 일부만 있는 파일도 노트로 받는다. id가 없으면 새로 발급하고, citedRefs가 없으면 본문 인용 블록에서 추출하며, 따옴표 없는 날짜(YAML Date)는 달력 문자열로 정규화한다. |
| [`RULE-MD-006`](rules/share-markdown.md) | MUST | 자동 | 코드추론 | 가져오는 노트의 id가 기존 노트와 같을 때만 덮어쓰기 / 새 id로 추가 / 건너뛰기를 묻는다. 겹치지 않으면 묻지 않고 그대로 삽입한다. |
| [`RULE-MD-007`](rules/share-markdown.md) | 현상 서술 | — | 코드추론 | 내보낼 때 schemaVersion: 1을 기록하지만, 가져올 때 그 값을 검사하지 않는다. 버전이 달라도 거부하지 않는다. |
| [`RULE-MD-008`](rules/share-markdown.md) | 현상 서술 | — | 코드추론 | 노트 전체를 zip으로 묶는 백업, 그리고 다른 앱에서 .md 파일을 씀씀으로 "공유"해 여는 흐름은 구현되어 있지 않다. |

### 성경 리더 — [`rules/bible-reader.md`](rules/bible-reader.md)

| ID | 요구 | 증거 | 근거 | 내용 |
|---|---|---|---|---|
| [`RULE-BIBLE-001`](rules/bible-reader.md) | SHOULD | 자동 | 기록됨 | 성경은 책 목록 → 장 그리드 → 절 목록 3단으로 탐색한다. 책 목록은 구약/신약 세그먼트로 나뉘고, 리더 안의 "뒤로"는 한 단계씩 거슬러 올라간다. |
| [`RULE-BIBLE-002`](rules/bible-reader.md) | MUST | 자동 | 코드추론 | 성경 검색창은 "골"(책) / "골 3"(장) / "골 3:20"(절) 세 가지를 구분해 해당 단계로 바로 이동한다. 영어 책 이름도 같게 동작한다. |
| [`RULE-BIBLE-003`](rules/bible-reader.md) | MUST | 자동 | 기록됨 | 마지막으로 본 책과 장을 settings.lastBibleRef에 "Gen 1" 형태로 저장하고, 다음에 리더를 열면 그 장부터 시작한다. 절 스크롤 위치는 저장하지 않는다. |
| [`RULE-BIBLE-004`](rules/bible-reader.md) | SHOULD | 수동 | 기록됨 | 홈에서 연 성경은 읽기 전용이라 삽입 버튼을 렌더하지 않는다. 에디터 모달과 태블릿 패널에서만 절 옆 ＋ 버튼으로 현재 노트에 인용을 넣는다. |
| [`RULE-BIBLE-005`](rules/bible-reader.md) | MUST | 자동 | 코드추론 | 이전/다음 장 버튼은 1장과 마지막 장에서 비활성화된다. 장 수는 bible.json에서 계산한다. |
| [`RULE-BIBLE-006`](rules/bible-reader.md) | SHOULD | 수동 | 코드추론 | 절 옆 ＋로 넣는 인용의 참조 문자열은 "{정식한국어책명} {장}:{절}" 이며 언제나 한 절이다. 범위 인용은 이 경로로 만들 수 없다. |
| [`RULE-BIBLE-007`](rules/bible-reader.md) | SHOULD | 수동 | 기록됨 | 절을 노트에 담아도 시트·사이드바·패널은 열린 상태를 유지해 연속으로 여러 절을 담을 수 있다. |

### 설정·테마 — [`rules/settings-theme.md`](rules/settings-theme.md)

| ID | 요구 | 증거 | 근거 | 내용 |
|---|---|---|---|---|
| [`RULE-SET-001`](rules/settings-theme.md) | MUST | 자동 | 코드추론 | 설정은 문서 디렉터리의 settings.json에 저장한다. 읽기·파싱에 실패하면 예외를 올리지 않고 기본값으로 시작한다. |
| [`RULE-SET-002`](rules/settings-theme.md) | MUST | 자동 | 기록됨 | fontScale과 themePreference가 허용값이 아니면 설정 파일 전체를 버리고 기본값으로 시작한다. 그 밖의 필드는 값이 틀려도 파일을 버리지 않고 개별 폴백한다. |
| [`RULE-SET-003`](rules/settings-theme.md) | MUST | 자동 | 기록됨 | 화면 색은 variation(minimal/paper/focus/dark) 하나로 결정된다. isDark는 variation === "dark"이며 themePreference나 OS 다크모드와 무관하다. |
| [`RULE-SET-004`](rules/settings-theme.md) | SHOULD | 수동 | 코드추론 | blockStyle과 accentChoice가 "default"면 현재 변형의 기본값을 쓰고, 사용자가 고른 값이 있으면 그것이 이긴다. |
| [`RULE-SET-005`](rules/settings-theme.md) | MUST | 자동 | 코드추론 | 글꼴 크기는 1.0 / 1.2 / 1.4 / 1.6 네 값만 허용하며, 화면의 글자 크기는 기준값 × 배율을 반올림해 계산한다. |
| [`RULE-SET-006`](rules/settings-theme.md) | SHOULD | 수동 | 코드추론 | 설정 객체가 바뀔 때마다 파일에 저장하되, 앱 시작 시 파일을 다 읽기 전에는 저장하지 않는다. |

### 레이아웃·접근성 — [`rules/layout-a11y.md`](rules/layout-a11y.md)

| ID | 요구 | 증거 | 근거 | 내용 |
|---|---|---|---|---|
| [`RULE-UI-001`](rules/layout-a11y.md) | SHOULD | 수동 | 기록됨 | 화면 너비 900px 이상이면 3-pane 태블릿 작업공간을, 미만이면 폰 목록·에디터 흐름을 쓴다. 같은 기준으로 성경이 사이드바가 되거나 하단 시트가 된다. |
| [`RULE-UI-002`](rules/layout-a11y.md) | SHOULD | 수동 | 기록됨 | 태블릿 화면은 노트 목록(280px) / 에디터(가변) / 성경 패널(340px) 세 칸이며, 양쪽 패널은 접어서 얇은 레일로 만들 수 있다. |
| [`RULE-UI-003`](rules/layout-a11y.md) | SHOULD | 수동 | 기록됨 | 폰에서 에디터의 성경은 화면 높이 70% 하단 시트로 열린다. 어두워지는 배경은 시트와 분리된 레이어로 화면 전체에 균일하게 페이드한다(진입 240ms / 종료 190ms). |
| [`RULE-UI-004`](rules/layout-a11y.md) | SHOULD | 수동 | 기록됨 | 모든 조작 요소는 44~48px 이상의 터치 영역을 갖고, 한국어 accessibilityLabel과 적절한 accessibilityRole을 가진다. |
| [`RULE-UI-005`](rules/layout-a11y.md) | SHOULD | 수동 | 기록됨 | 인용 블록은 색 막대나 배경만이 아니라 참조 라벨을 항상 함께 표시한다. 선택 상태도 색과 함께 체크 표시나 accessibilityState로 전달한다. |
| [`RULE-UI-006`](rules/layout-a11y.md) | SHOULD | 수동 | 코드추론 | 네이티브 스택 헤더는 앱 전체에서 숨기고, 화면마다 공통 AppHeader 컴포넌트로 직접 그린다. |

## CONTRACT — 계약

| ID | 근거 | 내용 |
|---|---|---|
| [`CONTRACT-BIBLE-JSON`](contracts/CONTRACT-BIBLE-JSON.md) | 기록됨 | 성경 본문은 assets/bible.json 하나로 앱에 번들되며, 책코드 → 장 → 절 → 본문의 3단 중첩 객체다. 출처는 Open Bible 한국어판, 라이선스는 CC BY-SA 4.0이다. |
| [`CONTRACT-DB-NOTES`](contracts/CONTRACT-DB-NOTES.md) | 기록됨 | 노트는 ch-life.db의 notes 테이블에 저장되고, 검색은 notes_fts 가상 테이블에 트리거로 동기화된다. 이 DDL은 두 파일에 중복 기록되어 있으며 항상 함께 바뀌어야 한다. |
| [`CONTRACT-DOMAIN-NOTE`](contracts/CONTRACT-DOMAIN-NOTE.md) | 코드추론 | 앱 전체가 공유하는 Note / BlockNode / Verse / Settings 타입 정의. DB 행, 마크다운 파일, 화면 상태가 모두 이 모양으로 수렴한다. |
| [`CONTRACT-MD-NOTE`](contracts/CONTRACT-MD-NOTE.md) | 기록됨 | 노트 하나는 YAML frontmatter + 표준 Markdown 본문을 가진 .md 파일 하나로 표현된다. 이 형식은 앱 밖으로 나가므로 하위 호환을 깨면 이미 내보낸 파일을 다시 읽을 수 없다. |
| [`CONTRACT-NOTE-REPO`](contracts/CONTRACT-NOTE-REPO.md) | 코드추론 | 화면은 SQL을 직접 쓰지 않고 note-repo가 노출하는 일곱 함수만 사용한다. repo는 DbAdapter 인터페이스에만 의존해 프로덕션(expo-sqlite)과 테스트(better-sqlite3)에서 같은 코드로 동작한다. |
| [`CONTRACT-RELEASE`](contracts/CONTRACT-RELEASE.md) | 기록됨 | 앱은 Hot Updater(OTA)와 EAS Build 두 경로로만 사용자에게 닿는다. OTA 번들은 앱 버전(updateStrategy appVersion)과 채널에 묶이므로 version을 올리면 기존 설치본에는 전달되지 않는다. |
| [`CONTRACT-SETTINGS-FILE`](contracts/CONTRACT-SETTINGS-FILE.md) | 기록됨 | 앱 설정은 문서 디렉터리의 settings.json 하나에 객체 그대로 직렬화된다. fontScale과 themePreference는 필수이며, 나머지 필드는 없거나 잘못돼도 개별 폴백한다. |

## ADR — 결정 기록

| ID | 근거 | 결정 |
|---|---|---|
| [`ADR-0001`](decisions/ADR-0001-native-block-editor.md) | 기록됨 | 노트 에디터는 WebView 기반 리치 에디터(@10play/tentap-editor)를 쓰지 않고, 블록 배열을 직접 렌더하는 순수 React Native 구현으로 만든다. |
| [`ADR-0002`](decisions/ADR-0002-space-trigger.md) | 기록됨 | 유효한 성경 참조는 Tab이 아니라 뒤이어 입력되는 공백 또는 개행으로 인용 블록으로 확정한다. |
| [`ADR-0003`](decisions/ADR-0003-sqlite-markdown-hybrid.md) | 기록됨 | 노트의 정본 저장은 SQLite(+FTS5)로 하고, 외부와 주고받는 형식은 노트 하나당 Markdown 파일 하나로 한다. |
| [`ADR-0004`](decisions/ADR-0004-settings-file.md) | 확인필요 | 앱 설정은 react-native-mmkv가 아니라 expo-file-system으로 쓰는 JSON 파일 한 개에 저장한다. |
| [`ADR-0005`](decisions/ADR-0005-idempotent-migration.md) | 기록됨 | 스키마 마이그레이션은 버전 번호나 이력 테이블 없이, 매 실행마다 현재 스키마를 조회해 누락된 컬럼만 추가하는 방식으로 한다. |
| [`ADR-0006`](decisions/ADR-0006-duplicated-schema.md) | 확인필요 | 같은 DDL이 db/index.ts의 인라인 문자열(프로덕션 실행)과 db/schema.sql 파일(테스트 로드)에 중복 기록되어 있으며, 이 상태를 수용하고 규율로 관리한다. |
| [`ADR-0007`](decisions/ADR-0007-fts-scope.md) | 확인필요 | FTS 색인에는 title과 cited_refs만 채우고, body_text 컬럼은 구조만 남긴 채 빈 문자열로 둔다. |
| [`ADR-0008`](decisions/ADR-0008-created-at-ordering.md) | 확인필요 | 노트 목록·그룹핑·검색 결과는 모두 created_at 기준으로 정렬한다. updated_at은 저장 시각 기록으로만 남는다. |
| [`ADR-0009`](decisions/ADR-0009-bible-source.md) | 확인필요 | 번들되는 성경 본문은 개역한글 1961이 아니라 Open Bible 한국어판이며, 라이선스는 공공도메인이 아니라 CC BY-SA 4.0이다. |
| [`ADR-0010`](decisions/ADR-0010-variation-theming.md) | 기록됨 | 화면 색은 minimal·paper·focus·dark 네 가지 변형 중 하나로 결정된다. OS 다크모드를 따라가지 않고, themePreference 필드는 색에 관여하지 않는다. |
| [`ADR-0011`](decisions/ADR-0011-bible-entrypoints.md) | 기록됨 | 노트 목록에서 여는 성경은 삽입 버튼이 없는 전체화면 읽기 전용 라우트이고, 인용 삽입은 에디터에서 연 성경(모달/패널)에서만 한다. |
| [`ADR-0012`](decisions/ADR-0012-local-only.md) | 기록됨 | 백엔드·계정·동기화·애널리틱스를 두지 않는다. 그 결과 운영 관측(trace/metric)으로 회귀를 잡는 증거 계층이 존재하지 않는다. |
| [`ADR-0013`](decisions/ADR-0013-release-path.md) | 기록됨 | main의 CI가 성공한 커밋만 OTA로 자동 발행하고, EAS Build는 수동 실행으로만 큐에 넣는다. |
| [`ADR-0014`](decisions/ADR-0014-worktree-workflow.md) | 기록됨 | 모든 기능·수정 작업은 .worktrees/ 아래의 별도 git worktree와 브랜치에서 하고, 검증도 그 안에서 실행한다. main 체크아웃에서 직접 작업하지 않는다. |
| [`ADR-0015`](decisions/ADR-0015-no-keyboard-shortcuts.md) | 기록됨 | ⌘/Ctrl 조합 단축키를 구현하지 않는다. 키보드 상호작용은 필드 간 Return 이동과 인용 확정 공백까지로 한정한다. |

## 정본이 아닌 것

- [`drift.md`](drift.md) — 계획 문서와의 차이, 구현 내부 모순, 오라클 문제, 공개 문서와의 충돌, 확인 필요 질문
- `DESIGN.md`, `docs/plans/**` — 역사 기록. 근거 출처로 인용하되 합격 기준으로 쓰지 않는다.
