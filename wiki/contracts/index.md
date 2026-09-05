# `contracts/` — 계약 `CONTRACT-*`

> 손으로 쓴다. 전체 ID 표는 [`../index.md`](../index.md)(생성물), 절차는 [`../workflow.md`](../workflow.md).

**경계에서 고정된 모양**이다. 파일 형식, DDL, 함수 시그니처, 배포 식별자 — 남(다른 컴포넌트, 이미 저장된 데이터, 이미 설치된 앱, 스토어)이 의존하고 있어서 마음대로 못 바꾸는 것들.

그래서 `CONTRACT` 블록에는 `requirement`가 없다. RFC 2119 강도를 매기는 규범이 아니라 "지금 이 경계는 이렇게 고정되어 있다"는 **현재 상태의 서술**이기 때문이다. 대신 일곱 중 여섯이 **"바꾸려면"** 절로 끝난다 — 그 경계를 건드릴 때 함께 움직여야 하는 파일 목록이고, 그 절이 이 폴더의 값어치다. 예외는 [CONTRACT-RELEASE.md](CONTRACT-RELEASE.md)로, 배포 식별자는 위키가 아니라 `eas.json`·`app.config.ts`가 정본이라 "정본이 아닌 것" 절로 끝난다.

## 파일

| 파일 | ID | 무엇이 고정되어 있나 | 이럴 때 먼저 본다 |
|---|---|---|---|
| [CONTRACT-DOMAIN-NOTE.md](CONTRACT-DOMAIN-NOTE.md) | CONTRACT-DOMAIN-NOTE | `Note` / `BlockNode` / `Verse` / `Settings` 타입 — 모든 계층이 여기로 수렴 | `Note`에 필드를 더하거나 새 블록 종류를 만들 때 |
| [CONTRACT-DB-NOTES.md](CONTRACT-DB-NOTES.md) | CONTRACT-DB-NOTES | `notes` / `notes_fts` DDL과 FTS 트리거 | 컬럼 추가, 검색 대상 변경, 마이그레이션 |
| [CONTRACT-NOTE-REPO.md](CONTRACT-NOTE-REPO.md) | CONTRACT-NOTE-REPO | 저장소 일곱 함수와 `DbAdapter` — 화면은 SQL을 직접 쓰지 않는다 | 저장·조회 기능 추가, 어댑터 변경 |
| [CONTRACT-MD-NOTE.md](CONTRACT-MD-NOTE.md) | CONTRACT-MD-NOTE | 공유 `.md` 문법 — frontmatter 키, 인용 판별 토큰, 파일명 | 내보내기·가져오기 문법 변경 |
| [CONTRACT-BIBLE-JSON.md](CONTRACT-BIBLE-JSON.md) | CONTRACT-BIBLE-JSON | `bible.json` 3단 중첩 구조와 CC BY-SA 의무 | 번역본 교체·추가, 조회 방식 변경 |
| [CONTRACT-SETTINGS-FILE.md](CONTRACT-SETTINGS-FILE.md) | CONTRACT-SETTINGS-FILE | `settings.json` 스키마와 두 가지 검증 엄격도 | 설정 필드 추가, validator 변경 |
| [CONTRACT-RELEASE.md](CONTRACT-RELEASE.md) | CONTRACT-RELEASE | 배포 경로 두 개(Hot Updater OTA · EAS Build), 채널 결합, 고정 식별자 | `version` 변경, `eas.json`, 릴리스 발행 |

## 이 계층에서 사고 나는 지점

- **CONTRACT-DB-NOTES — DDL이 두 파일에 있고 이미 다르다.** `db/index.ts`(프로덕션이 실행)에만 `DROP INDEX IF EXISTS idx_notes_updated_at`이 있고 `db/schema.sql`(테스트가 읽음)에는 없다. **테스트가 검증하는 스키마는 실물이 아니다**([`../drift.md`](../drift.md) B1·C1, [`../decisions/ADR-0006-duplicated-schema.md`](../decisions/ADR-0006-duplicated-schema.md)). 신규 설치는 `CREATE TABLE`, 기존 설치는 `ALTER TABLE` — 한쪽만 고치면 한쪽 사용자군에서만 깨진다.
- **CONTRACT-DOMAIN-NOTE — `Note`에 필드를 더하는 것은 타입만의 변경이 아니다.** DB 컬럼 · 마이그레이션 · repo 매핑(`Row`/`rowToNote`/`create`/`update` 네 곳) · 마크다운 frontmatter · 자동저장 payload가 함께 움직인다.
- **CONTRACT-MD-NOTE — 하위호환 제약이 가장 세다.** `(KRV)` 토큰은 파서의 유일한 인용 판별자다. 바꾸면 이미 내보낸 파일을 못 읽는다. `schemaVersion`은 **쓰기만 하고 읽는 분기가 없다** — 문법을 바꾸며 버전을 올리려면 그 분기를 새로 만들어야 한다.
- **CONTRACT-NOTE-REPO — `delete`와 `restore`는 짝이다.** `delete`는 지우기 전 스냅샷을 반환하고 `restore`가 그것을 되돌린다. `restore`는 **id와 `created_at`을 보존**하므로 `create`의 발급 규칙이 적용되지 않는다 — 새 컬럼을 더하면 `restore`의 INSERT 목록도 함께 고쳐야 하고, 빠뜨리면 되돌린 노트만 그 필드를 잃는다. 어댑터 차이(better-sqlite3 ↔ expo-sqlite)는 여전히 검증되지 않는다(C4).
- **CONTRACT-SETTINGS-FILE — 엄격도가 두 가지다.** `fontScale`·`themePreference`는 **전체 거부**(파일 전체를 버리고 기본값), 나머지는 개별 폴백. 새 필드를 전체 거부 쪽에 잘못 넣으면 기존 사용자 설정이 통째로 리셋된다. `lastOpenedNoteId`는 스키마에 있으나 읽는 코드가 없다.
- **CONTRACT-RELEASE — 표의 값들이 손으로 옮겨 적은 사본이다.** EAS project UUID는 `app.config.ts`에 두 번, 이 표에 세 번째로 적혀 있다. `appVersionSource: "remote"` ↔ 동적 `app.config.ts` ↔ `autoIncrement`는 3자 결합이고 컴파일 타임 검사가 없다(커밋 `769fe51`이 이게 깨져 실패한 사례).
- **CONTRACT-BIBLE-JSON — 번역본 축이 데이터 구조에 없다.** 다른 번역본을 넣으려면 `Verse` 타입·조회 함수·`(KRV)` 표식까지 함께 재설계해야 한다.

## 66권 목록이 세 곳에 따로 있다

`parser/book-map.ts`의 `ALIAS_TABLE`, `browser/books-meta.ts`의 `BOOKS_META`, `assets/bible.json`의 최상위 키. 지금은 셋 다 일치하지만 **교차 검증 테스트가 없다**([`../drift.md`](../drift.md) B13). 책 이름이나 코드를 건드릴 때는 세 곳을 함께 본다.

## 처음이라면

[CONTRACT-DOMAIN-NOTE.md](CONTRACT-DOMAIN-NOTE.md) → [CONTRACT-DB-NOTES.md](CONTRACT-DB-NOTES.md) → [CONTRACT-NOTE-REPO.md](CONTRACT-NOTE-REPO.md) → [CONTRACT-MD-NOTE.md](CONTRACT-MD-NOTE.md). 타입 → 저장 → API → 외부 파일 순서다. [CONTRACT-BIBLE-JSON.md](CONTRACT-BIBLE-JSON.md)·[CONTRACT-SETTINGS-FILE.md](CONTRACT-SETTINGS-FILE.md)·[CONTRACT-RELEASE.md](CONTRACT-RELEASE.md)는 독립적이라 필요할 때 찾아 읽으면 된다.
