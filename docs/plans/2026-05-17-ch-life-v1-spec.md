# ch-life V1 Spec — 설교노트 + 성경 브라우저

작성일: 2026-05-17
상태: 합의 완료, 구현 대기
기반: `/DESIGN.md` (2026-05-10 office-hours) + 2026-05-17 브레인스토밍 합의

## 0. 한 줄 요약

설교 중 "골 3:20"을 입력하고 Tab을 누르면 다음 줄에 본문이 인용블록으로 풀리고, 사이드바/시트로 성경을 탐색해 절을 + 버튼으로 노트에 넣을 수 있는 단독 Expo 앱.

---

## 1. 플랫폼 & 화면 구조

### 1.1 플랫폼

- **Expo (React Native) iOS + Android + 태블릿 반응형**
- 웹은 V2 의제
- 오프라인-퍼스트 (정적 자산 + 로컬 파일)
- 백엔드·계정 없음

### 1.2 화면 (3개)

| 화면 | 진입 | 역할 |
|---|---|---|
| 노트 목록 | 앱 시작 기본 화면 | 노트 카드 리스트, 검색, 새 노트 |
| 노트 에디터 | 카드 탭 / 새 노트 FAB | 본문 작성, 자동완성, 인용블록 |
| 성경 브라우저 | 에디터 우상단 `📖` | 책-장-절 탐색, 절→노트 인용 |

### 1.3 성경 브라우저의 반응형 변형

- **태블릿(가로)** = 우측 1/3 폭 사이드바, 에디터와 동시 표시
- **폰 / 태블릿(세로)** = 하단 시트(70% 높이), 에디터 위에 오버레이

### 1.4 핵심 흐름 (cross-screen)

- **에디터 → 인용 (자동완성)**: ref 패턴 감지 → 인라인 칩 → Tab/탭 → 다음 줄 인용블록
- **사이드바/시트 → 인용 (수동)**: 절 옆 + 버튼 → 현재 노트 커서 위치에 인용블록

### 1.5 원래 DESIGN.md 대비 변경

- 4개 화면 → 3개 ("절 보기"를 사이드바/시트 안에 흡수)
- 폰에서 하단 탭 전환 → 하단 시트 (에디터 컨텍스트 유지)
- 외장키보드 단축키 spec 제거 (V1 범위 밖)

---

## 2. 노트 목록 화면

### 2.1 카드 표시

- **제목 있음**: 제목 큰 글씨 (1줄) + 우상단 작은 날짜
- **제목 없음**: `"2026년 5월 17일 주일"` 형식의 날짜+요일을 메인 텍스트로
- 카드 하단에 인용된 ref 칩 최대 3개 (예: `골 3:20` `엡 5:21` `+2`)
- 카드 높이 ≥ 72px (어른친화 탭 타깃)

### 2.2 정렬·그룹화

- 단순 최신순 (`updatedAt DESC`)
- 그룹 헤더 없음
- 무한스크롤 (V1 노트 수 < 200 가정)

### 2.3 새 노트

- 우하단 큰 + FAB
- 탭 → 즉시 에디터 진입 (제목 빈 상태, 오늘 날짜 자동 기록)
- 별도 모달 없음

### 2.4 검색

- 상단 고정 검색바
- 검색 대상: 제목, 본문 텍스트, `citedRefs` 배열
- 한국어/영어 책명 모두 매칭 (예: "골" 검색 → "Col 3:20" 포함 노트 매칭)

### 2.5 빈 상태

- 첫 실행 시 일러스트 + "첫 번째 설교 노트를 시작하세요" + 큰 시작 버튼

---

## 3. 노트 에디터 화면

### 3.1 자동완성 칩 (ref 패턴 감지 시)

- **위치**: 입력 커서 바로 옆 인라인
- **모양**: 둥근 회색 칩 `[↹ 골 3:20 채움]`
- **확정**:
  - `Tab` 키 → 다음 줄에 인용블록 삽입, 칩 사라짐
  - 칩 직접 탭 → 동일 동작
- **취소**:
  - `Esc` 키 → 칩 사라짐, 원본 텍스트만 유지
  - 다른 글자 입력으로 패턴 무효화 → 칩 자동 사라짐
- **데드 ref** ("골 99:99"): 칩 자체가 안 뜸 (조용한 실패)

### 3.2 인용블록 시각 (3가지 상태)

| 상태 | 시각 |
|---|---|
| Loading | 회색 좌측 바 + "골 3:20 불러오는 중..." + spinner |
| Loaded | 회색 좌측 바 + 헤더 `골 3:20` + 본문 텍스트 |
| Error | 빨간 좌측 바 + "본문을 찾을 수 없습니다" + 휴지통 버튼 |

본문 예시:
```
│ 골 3:20
│ 자녀들아 모든 일에 부모에게 순종하라
│ 이는 주 안에서 기쁘게 하는 것이니라
```

### 3.3 원본 텍스트 정책

- **자동완성으로 삽입**: 원본 "골 3:20" 텍스트는 **유지**, 그 아래 새 줄에 인용블록
- **사이드바/시트 + 버튼으로 삽입**: 원본 텍스트 없이 인용블록만 (현재 커서 위치)

### 3.4 비동기 입력 흐름 (핵심 UX 원칙)

- 인용블록 삽입(자동완성 Tab 또는 사이드바 +)으로 **사용자 입력 흐름이 끊기면 안 됨**
- 삽입 직후:
  - 인용블록은 즉시 Loading 상태로 노트에 들어감
  - 커서는 인용블록 다음 줄에 위치 (사용자는 이어서 작성)
  - 메모리에서 본문 lookup → Loaded 상태로 전환 (사실상 즉시, ~ms)
- 사용자는 인용블록 완료를 기다리지 않고 다음 단락 계속 작성

### 3.5 자동저장

- 입력 멈춤 500ms 후 `notes.json` 전체 덮어쓰기
- UI 표시 없음 (어른친화 노이즈 최소화)
- 실패 시: 상단 빨간 배너 "저장 실패. 다시 시도 중..."

### 3.6 citedRefs 자동 동기화

- 인용블록 추가/삭제 시 `note.citedRefs` 배열 자동 갱신
- 노트 목록 검색 인덱스로 사용

---

## 4. 성경 브라우저 (사이드바/시트)

### 4.1 진입

- 노트 에디터 우상단 `📖` 아이콘 버튼 (토글)
- 태블릿 가로 = 사이드바 오픈/닫기
- 폰 / 태블릿 세로 = 하단 시트 모달 오픈/닫기

### 4.2 3단 네비게이션

**Lv1 — 책 목록**
- 상단: `[구약] [신약]` 세그먼트 컨트롤
- 상단: 검색 입력 ("골 3:20", "골", "Col 3" 모두 인식)
- 본문: 책 명단 세로 리스트 (구약=39권, 신약=27권)

**Lv2 — 장 그리드**
- 상단 헤더: `← 골로새서` (탭 시 책 목록으로)
- 본문: 장 번호 정사각형 카드, 4열 그리드

**Lv3 — 절 리스트**
- 상단 헤더: `← 골로새서 3장` (탭 시 장 그리드로)
- 상단 보조: `[이전 장] [다음 장]` 버튼
- 본문: 절 번호 + 본문 + 우측 `[+]` 버튼

### 4.3 + 버튼 동작

- 현재 열린 노트의 커서 위치에 **즉시 Loading 인용블록 삽입**
- 메모리에서 본문 lookup → Loaded 전환 (사실상 즉시)
- **시트/사이드바는 닫히지 않음** — 연속해서 다른 절 추가 가능
- 하단 토스트 "골 3:20 추가됨" (1초 후 fade out)

### 4.4 검색 입력 동작

| 입력 | 동작 |
|---|---|
| `골` | 책 자동완성 → "골로새서" → 탭 시 Lv2 진입 |
| `골 3` | 골로새서 3장 (Lv3) 직접 진입 |
| `골 3:20` | 골로새서 3장 진입 + 20절로 스크롤 + 강조 |
| `Col 3:20` | 영어 책명도 동일하게 인식 |

### 4.5 "노트 안 열린 상태"에서 + 누름

- 액션 시트 모달:
  1. 가장 최근 노트에 추가
  2. 오늘 날짜로 새 노트 만들고 추가
  3. 취소

### 4.6 V1 범위 외

- 절 길게 누르기 메뉴 (복사/공유/하이라이트)
- 다른 번역본 전환
- 즐겨찾기 / 책갈피

---

## 5. 저장 정책 (하이브리드: SQLite 내부 저장 + 마크다운 export/import)

### 5.1 결정 배경

iOS Apple Notes·Android Google Keep·Samsung Notes는 모두 단일 SQLite DB에 노트를 몰아넣고 다른 앱 접근을 막는 샌드박스 구조다. 우리가 원하는 "각 노트를 개별로 export/import 편함"은 사실 Obsidian/iA Writer 같은 **마크다운 파일 기반 패턴**의 특성이다.

**저장 엔진 vs 프레임워크 구분**:
- Apple Notes는 *Core Data*, Google Keep은 *Room*을 쓰지만, **둘 다 밑바닥은 SQLite**다.
- Core Data·Room은 Swift·Kotlin 전용 네이티브 ORM이라 Expo managed workflow에서 직접 사용 불가.
- V1은 **같은 SQLite 엔진**을 React Native 바인딩(`expo-sqlite`)으로 사용한다. 저장 파일 포맷·성능·오프라인 동작은 동일하며, 다른 점은 *개발자가 쓰는 API의 모양*뿐이다.
- 시스템 메모 앱·위젯과 데이터 공유가 필요해지면 V2에서 bare workflow + 네이티브 모듈로 전환 검토.

V1은 **하이브리드 접근**을 택한다:
- **내부 저장 = SQLite (`expo-sqlite`)** (빠른 검색·정렬, 한국어 인덱싱, 인용블록 메타데이터 관계)
- **외부 노출 = 노트별 마크다운 파일** (export·import·다른 앱 호환)

### 5.2 저장 위치

| 데이터 | 위치 | 형식 |
|---|---|---|
| 노트 (source of truth) | `documentDirectory/ch-life.db` | SQLite |
| 설정 | `documentDirectory/settings.json` | JSON 객체 |
| 성경 데이터 | 앱 번들 `assets/bible-krv.json` | 정적 JSON |
| Export 산출물 | 사용자 선택 폴더 (iCloud Drive, Downloads 등) | `.md` 파일 |

- iOS: `~/Documents/`, `UIFileSharingEnabled=YES`로 Files App에 노출 (사용자가 DB 파일 직접 백업 가능)
- Android: `/data/data/<pkg>/files/`, export 시 StorageAccessFramework로 사용자 폴더 선택

### 5.3 SQLite 스키마

```sql
CREATE TABLE notes (
  id          TEXT PRIMARY KEY,         -- ulid
  title       TEXT,                     -- nullable
  body_json   TEXT NOT NULL,            -- BlockNode[] 직렬화
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL,
  cited_refs  TEXT NOT NULL DEFAULT '[]'  -- JSON array
);

CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC);
CREATE INDEX idx_notes_title ON notes(title);

-- FTS5 가상 테이블 (한국어 본문·제목·ref 통합 검색)
CREATE VIRTUAL TABLE notes_fts USING fts5(
  id UNINDEXED,
  title,
  body_text,         -- BlockNode[]에서 추출한 plain text
  cited_refs,
  content='notes',
  tokenize='unicode61'
);
```

### 5.4 Note 도메인 타입

```ts
type Note = {
  id: string;          // ulid
  title: string | null;
  body: BlockNode[];   // DB의 body_json을 파싱
  createdAt: number;
  updatedAt: number;
  citedRefs: string[];
};

type BlockNode =
  | { type: "paragraph"; text: string }
  | { type: "quote"; ref: string; verses: Verse[]; status: "loading" | "loaded" | "error" };

type Verse = {
  book: string;        // "Col"
  chapter: number;
  verse: number;
  text: string;
};
```

### 5.5 Settings 스키마

```ts
type Settings = {
  fontScale: 1.0 | 1.2 | 1.4 | 1.6;
  themePreference: "system" | "light" | "dark";
  lastOpenedNoteId: string | null;
};
```

### 5.6 성경 데이터 (정적 자산)

- `assets/bible-krv.json` 빌드 시 번들
- `import bibleData from "./assets/bible-krv.json"` — 앱 시작 시 메모리 상수
- 절 lookup = `bibleData[book][chapter][verse]` (O(1))
- 메모리 사용 ~3-4MB 항상 점유 (저사양 Android 모니터링 필요)

### 5.7 쓰기 정책

- 노트 자동저장: 입력 멈춤 500ms 후 해당 노트 row만 UPDATE
- FTS5 인덱스는 트리거로 자동 동기화
- 트랜잭션 단위 = 단일 노트 (다른 노트 영향 없음)

### 5.8 마크다운 직렬화 포맷

노트 1개 = 마크다운 파일 1개. YAML frontmatter로 메타데이터, 본문은 표준 마크다운.

파일명: `YYYY-MM-DD-{slug-or-id}.md`
- 제목 있으면: `2026-05-17-주일설교.md`
- 제목 없으면: `2026-05-17-{shortId}.md`

```markdown
---
id: 01HXXXX...
title: 주일설교
createdAt: 2026-05-17T09:30:00+09:00
updatedAt: 2026-05-17T11:45:00+09:00
citedRefs:
  - Col 3:20
  - Eph 5:21
schemaVersion: 1
---

오늘 본문은 골 3:20

> **골 3:20** (KRV)
> 자녀들아 모든 일에 부모에게 순종하라
> 이는 주 안에서 기쁘게 하는 것이니라

이어지는 메모...
```

**왕복 변환 보장**:
- DB → MD: BlockNode 트리를 단락·인용블록으로 직렬화
- MD → DB: YAML frontmatter 파싱 + 본문 마크다운을 BlockNode 트리로 역직렬화
- 인용블록 패턴(`> **{ref}**` 첫 줄 + 나머지 줄)을 명시적으로 인식해서 `quote` 노드로 복원
- 다른 마크다운 앱에서 편집·재import해도 ref/본문이 보존되도록 정규화

### 5.9 Export 흐름

**개별 노트 export** (V1 기본):
- 노트 카드 길게 누르기 / 에디터 우상단 메뉴 → "공유"
- DB row → 마크다운 변환 → 임시 파일 → `expo-sharing` 공유 시트
- 카카오톡·메일·iCloud Drive·Google Drive·Files App 등으로 보냄

**전체 export** (백업 용도):
- 설정 → "전체 내보내기" → 노트 전체를 `ch-life-backup-{date}.zip`으로 묶어 공유
- zip 안에 노트별 `.md` 파일 + `settings.json`

### 5.10 Import 흐름

**파일 선택 import**:
- 설정 또는 노트 목록 빈 상태 → "가져오기"
- `expo-document-picker`로 파일 선택 (단일 `.md` 또는 `.zip`)
- YAML frontmatter의 `schemaVersion` 확인 → 다르면 거부
- ID 충돌 시 정책 모달 (5.11)

**Open-in 흐름** (iOS·Android 시스템 공유):
- 다른 앱에서 `.md` 파일을 ch-life로 "공유" → 가져오기 모달 자동 표시
- iOS `LSItemContentTypes` / Android `intent-filter`에 마크다운 MIME 등록

### 5.11 Import 충돌 정책

동일 `id` 노트가 이미 DB에 있으면 모달:
- 덮어쓰기 (DB row 교체, `updatedAt` 갱신)
- 새 ID로 추가 (ulid 재생성, 둘 다 보존)
- 건너뛰기
- "모두 적용" 체크박스

`id`가 비어 있는 외부 마크다운 파일(다른 앱에서 만든 일반 노트):
- 항상 새 ulid 발급해서 추가
- frontmatter 없으면 파일명에서 날짜 추출, 본문 첫 줄을 제목으로

---

## 6. 설정·접근성

### 6.1 설정 화면 (노트 목록 우상단 톱니바퀴)

| 항목 | 값 | 기본 |
|---|---|---|
| 글꼴 크기 | 1.0× / 1.2× / 1.4× / 1.6× (4단 슬라이더) | 1.2× |
| 테마 | 시스템 / 라이트 강제 / 다크 강제 | 시스템 |
| 노트 내보내기 | 공유 시트 | — |
| 노트 가져오기 | 파일 선택 + 충돌 모달 | — |
| 버전 | "V1 (build #)" | — |

### 6.2 접근성

- 모든 탭 타깃 ≥ 48×48 px
- 색만으로 의미 전달 금지 (인용블록 = 좌측 바 + ref 라벨 둘 다)
- 다크모드 라이트 강제 옵션 명시적 제공 (예배실 환경 고려)
- 한국어 폰트는 시스템 기본 (Apple SD Gothic Neo / Noto Sans CJK)

### 6.3 외장키보드 단축키

- V1 범위 외. Tab/Esc는 자동완성 칩 조작에만 한정.

---

## 7. 기술 스택

| 영역 | 선택 |
|---|---|
| 앱 | Expo SDK 51+, Expo Router (file-based) |
| 내부 저장 | `expo-sqlite` (notes 테이블 + FTS5) + `expo-file-system` (settings.json) |
| 파일 IO | `expo-file-system` (documentDirectory + StorageAccessFramework) |
| Export/Import | `expo-sharing` (공유 시트), `expo-document-picker` (파일 선택) |
| iOS 파일 노출 | `UIFileSharingEnabled=YES`, `LSSupportsOpeningDocumentsInPlace=YES` |
| Android intent-filter | `text/markdown`, `text/plain` 받기 |
| 마크다운 직렬화 | `gray-matter` (frontmatter), `unified` + `remark-parse`/`remark-stringify` (본문) |
| 상태 | Zustand |
| 에디터 | `@10play/tentap-editor` 1순위 (Week 0 PoC) — 실패 시 fallback 결정 |
| ref 파서 | `bible-passage-reference-parser` + 한국어 책명 매핑 어댑터 |
| 성경 데이터 | 개역한글 1961 (공공도메인) — 빌드 스크립트로 정적 JSON 생성 |
| 테스트 | Jest (파서 어댑터 + 마크다운 왕복 변환 ~200 케이스), Maestro (E2E 골든패스) |
| TS | strict mode |

---

## 8. V1 성공 기준 (DoD)

- [ ] iOS/Android EAS Build 본인 디바이스 설치 동작
- [ ] 비행기 모드에서 새 노트 → "골 3:20" → Tab → 인용블록 풀림 → 저장 → 재시작 → 노트 그대로
- [ ] 책명 매핑 KRV 66권 한국어 정식·축약·영어 3가지 형태 Jest 통과
- [ ] 노트 ~30개·자동완성 100회 실사용 시 체감 지연 없음
- [ ] **노트 1개를 `.md` 파일로 공유 → 다른 마크다운 앱(예: iA Writer)에서 열림 + 본문·인용블록 보존**
- [ ] **카톡으로 받은 `.md` 파일을 ch-life로 "공유" → 자동 import → DB에 정상 삽입**
- [ ] 전체 백업 zip export → 새 디바이스에 import → 노트 보존
- [ ] **본인이 일요일 설교 1회 이상 실제로 사용**

---

## 9. V1 범위 외 (V1.1 / V2 후보)

- 외장키보드 단축키 (⌘N, ⌘B 등)
- 다른 성경 번역본
- 절 길게 누르기 메뉴 (복사·공유·하이라이트)
- 즐겨찾기 / 책갈피
- 다중 기기 동기화
- 음성 녹음 + 타임스탬프 노트
- 찬송가 / 묵상 / 일정 (원래 5 pillar 비전)
- 웹 버전

---

## 10. Week 0 De-risk (코드 시작 전)

DESIGN.md의 Week 0 항목 그대로 유효:

- [ ] 에디터 PoC (`@10play/tentap-editor`에 인용블록 + 자동완성 칩 1개 부착)
- [ ] 개역한글 JSON 라이선스 검증 (bible.mearie.org / Wikisource 등)
- [ ] Apple Developer ($99/년) + Google Play ($25 1회) 등록 + EAS Build 빈 앱 한 번 통과

이 셋 중 하나라도 막히면 spec 재검토 트리거.

---

## 변경 로그

- 2026-05-17 v0.1: 초안 작성 (브레인스토밍 합의 반영)
  - 원본 DESIGN.md(2026-05-10) 대비 주요 변경:
    - 화면 4개 → 3개 (절 보기 흡수)
    - 폰 하단 탭 → 하단 시트
    - SQLite + MMKV → JSON 파일 only
    - 자동완성 미리보기 → 명시적 Tab/탭 확정 + 비동기 Loading 인용블록
    - 외장키보드 단축키 spec 제거
- 2026-05-17 v0.2: 저장 정책 재검토 후 하이브리드로 전환
  - 리서치: Apple Notes·Google Keep·Samsung Notes는 모두 단일 SQLite DB·샌드박스 격리. 사용자 의도("각 노트 개별 export/import")는 Obsidian/iA Writer 스타일에 더 가까움.
  - 결정: 내부 저장은 SQLite + FTS5 (검색·성능), 외부 노출은 노트별 마크다운 파일 (호환·이식·공유)
  - 새 산출물: 마크다운 직렬화/역직렬화 로직, iOS Files App 노출, Android intent-filter
  - DoD에 "다른 마크다운 앱에서 열림" 항목 추가
