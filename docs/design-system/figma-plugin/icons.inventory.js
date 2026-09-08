// 자동 생성 — apps/ch-life 전수 조사 결과. 재생성은 조사 워크플로를 다시 돌린다.
// lucide 벡터의 도형은 icons.js(설치된 패키지에서 추출)에서 온다.
// glyph 는 앱과 동일하게 텍스트로 그린다 — 코드에서도 <Text> 이기 때문이다.
const ICON_INVENTORY = [
 {
  "symbol": "ChevronLeft",
  "kind": "lucide",
  "meaning": "뒤로가기(헤더 좌측, 이전 화면으로)",
  "sizes": [
   24
  ],
  "colorTokens": [
   "ink2"
  ],
  "usedAt": [
   "src/chrome/HeaderControls.tsx:65",
   "app/settings.tsx:124",
   "app/licenses.tsx:36",
   "app/note/[id].tsx:201"
  ],
  "inconsistency": "크기·색 자체는 4개 호출부 전부 24/ink2로 일관됨. 다만 '뒤로가기'라는 같은 의미가 src/browser/BibleReader.tsx:111 에서는 텍스트 글리프 \"← 뒤로\"(15px, 하드코딩 #555)로 별도 구현되어 있어, 이 화면(성경 브라우저) 안에서만 뒤로가기가 벡터 대신 글리프로 새어나감."
 },
 {
  "symbol": "NotebookPen",
  "kind": "lucide",
  "meaning": "앱 브랜드 아이콘(노트 목록 상단 '설교 노트' 이름 옆)",
  "sizes": [
   16
  ],
  "colorTokens": [
   "ink3"
  ],
  "usedAt": [
   "src/chrome/HeaderControls.tsx:117",
   "app/index.tsx:146"
  ],
  "inconsistency": ""
 },
 {
  "symbol": "Trash2",
  "kind": "lucide",
  "meaning": "현재 노트 삭제",
  "sizes": [
   17,
   21
  ],
  "colorTokens": [
   "errText"
  ],
  "usedAt": [
   "src/workspace/TabletWorkspace.tsx:366 (17px, 태블릿 센터 헤더)",
   "src/chrome/HeaderControls.tsx:43 (내부 고정 21px)",
   "app/note/[id].tsx:214-217 (21px, 폰 헤더, tint=\"error\")"
  ],
  "inconsistency": "완전히 같은 동작(현재 노트 삭제)에 같은 벡터 아이콘을 쓰면서도 태블릿 센터 헤더는 17px, 폰 헤더는 HeaderIconButton이 강제하는 21px — 17은 어떤 크기 토큰과도 맞지 않는 임의값."
 },
 {
  "symbol": "Download",
  "kind": "lucide",
  "meaning": "마크다운 노트 가져오기(import)",
  "sizes": [
   16,
   21
  ],
  "colorTokens": [
   "ink2"
  ],
  "usedAt": [
   "src/workspace/NoteListSidebar.tsx:87 (16px, 태블릿 사이드바)",
   "src/chrome/HeaderControls.tsx:43 (내부 고정 21px)",
   "app/index.tsx:159-163 (21px, 폰 헤더)"
  ],
  "inconsistency": "동일 액션이 태블릿에서는 16px, 폰 헤더에서는 21px — Settings 아이콘과 똑같은 패턴(사이드바 버튼 vs 헤더 버튼)으로 반복됨. 기기별 역할 차이로 의도된 것일 수 있으나 문서화된 규칙이 코드 어디에도 없음."
 },
 {
  "symbol": "Settings",
  "kind": "lucide",
  "meaning": "설정 화면 열기",
  "sizes": [
   16,
   21
  ],
  "colorTokens": [
   "ink2"
  ],
  "usedAt": [
   "src/workspace/NoteListSidebar.tsx:96 (16px, 태블릿 사이드바)",
   "src/chrome/HeaderControls.tsx:43 (내부 고정 21px)",
   "app/index.tsx:164-168 (21px, 폰 헤더)"
  ],
  "inconsistency": "Download와 동일: 태블릿 16px / 폰 21px."
 },
 {
  "symbol": "Calendar",
  "kind": "lucide",
  "meaning": "날짜 선택 달력 열기(설교 날짜 필드 옆 버튼)",
  "sizes": [
   18
  ],
  "colorTokens": [
   "accent"
  ],
  "usedAt": [
   "src/editor/SermonMetaHeader.tsx:176-180 (scaled(18, fontScale))"
  ],
  "inconsistency": "이 앱의 유일한 스케일링(scaled()) 벡터 아이콘 — 다른 8개 lucide 아이콘은 전부 고정 픽셀인데 이것만 폰트 스케일을 따라 커진다."
 },
 {
  "symbol": "BookOpen",
  "kind": "lucide",
  "meaning": "성경 읽기 화면 열기",
  "sizes": [
   21
  ],
  "colorTokens": [
   "ink2"
  ],
  "usedAt": [
   "src/chrome/HeaderControls.tsx:43",
   "app/index.tsx:149-153",
   "app/note/[id].tsx:204-208"
  ],
  "inconsistency": "'성경/본문' 계열 의미가 src/editor/SermonMetaHeader.tsx:253 에서는 완전히 다른 기술(이모지 📖, 18px, 색상 토큰 미적용)로도 그려짐 — 벡터·이모지 두 체계 혼재."
 },
 {
  "symbol": "Search",
  "kind": "lucide",
  "meaning": "노트 검색 입력창으로 포커스 이동(액션 버튼)",
  "sizes": [
   21
  ],
  "colorTokens": [
   "ink2"
  ],
  "usedAt": [
   "src/chrome/HeaderControls.tsx:43",
   "app/index.tsx:154-158"
  ],
  "inconsistency": "'검색'이라는 같은 개념이 검색창 내부 장식 아이콘으로는 텍스트 글리프 ⌕(13~14px, ink3, 아래 별도 항목)로 또 그려짐 — 액션 버튼은 벡터, 장식 아이콘은 글리프로 역할에 따라 두 체계가 나뉘어 있음(용도 차이는 있지만 시각 언어가 통일되어 있지 않음)."
 },
 {
  "symbol": "Share",
  "kind": "lucide",
  "meaning": "노트 공유(마크다운으로 내보내기)",
  "sizes": [
   21
  ],
  "colorTokens": [
   "ink2"
  ],
  "usedAt": [
   "src/chrome/HeaderControls.tsx:43",
   "app/note/[id].tsx:209-213"
  ],
  "inconsistency": "이 아이콘의 벡터/글리프 분리가 이 인벤토리에서 가장 뚜렷한 사례다: 태블릿(TabletWorkspace.tsx:376-378)에서 완전히 동일한 handleExport 동작이 이 Share 벡터 대신 \"↑\" 텍스트 글리프(15px, ink2)로 그려진다. 심지어 app/settings.tsx:263 안내 문구 \"내보내기는 노트 화면 오른쪽 위의 ↑ 버튼을 사용하세요\"가 이 글리프를 유일한 정본처럼 설명하고 있어, 폰에서 실제로 보이는 아이콘(Share)과 앱 자체 도움말이 서로 다른 기호를 가리킨다."
 },
 {
  "symbol": "›",
  "kind": "glyph",
  "meaning": "브레드크럼 구분자(월 › 일 › 제목, 클릭 불가한 순수 구분 기호)",
  "sizes": [
   12
  ],
  "colorTokens": [
   "ink4"
  ],
  "usedAt": [
   "src/workspace/TabletWorkspace.tsx:339-341",
   "src/workspace/TabletWorkspace.tsx:345-347"
  ],
  "inconsistency": "같은 문자 ›가 이 파일 안에서만도 최소 3가지 다른 크기·역할로 또 쓰인다 — 패널 펼치기(14px, PanelRail), 성경 패널 접기(18px, BiblePanel/BibleLookupPanel), 설정 하위 이동(22px, settings.tsx), 날짜 다음 달(24px, DatePickerModal). 순수 구분자와 클릭 가능한 내비게이션 화살표가 같은 글자를 공유해 접근성 라벨 없이는 구분이 안 된다."
 },
 {
  "symbol": "› / ‹",
  "kind": "glyph",
  "meaning": "접힌 패널을 다시 펼치기(레일 형태, 방향은 좌/우 위치에 따라 반전)",
  "sizes": [
   14
  ],
  "colorTokens": [
   "ink3"
  ],
  "usedAt": [
   "src/workspace/PanelRail.tsx:40-42"
  ],
  "inconsistency": "같은 '노트 패널 펼치기/접기' 쌍에서 펼치기(이 레일, 14px·ink3)와 접기(NoteListSidebar의 ‹, 16px·ink2)가 크기·색 둘 다 다르다 — 정확히 과제에서 예로 든 '펼치기/접기가 서로 다른 스타일' 패턴."
 },
 {
  "symbol": "›",
  "kind": "glyph",
  "meaning": "성경 패널/보기 접기",
  "sizes": [
   18
  ],
  "colorTokens": [
   "ink2"
  ],
  "usedAt": [
   "src/workspace/BiblePanel.tsx:38-46",
   "src/workspace/BibleLookupPanel.tsx:60-68"
  ],
  "inconsistency": "이 둘끼리는 18px/ink2로 일관되지만, 반대 동작인 '성경 패널 펼치기'는 같은 크기가 아니라 ◧(15px) 또는 ✦(16px)로 완전히 다른 기호를 쓴다 — 접기/펼치기가 짝을 이루지 않음."
 },
 {
  "symbol": "‹",
  "kind": "glyph",
  "meaning": "노트 목록 사이드바 접기",
  "sizes": [
   16
  ],
  "colorTokens": [
   "ink2"
  ],
  "usedAt": [
   "src/workspace/NoteListSidebar.tsx:98-106"
  ],
  "inconsistency": "짝이 되는 '펼치기'는 PanelRail의 14px·ink3 ‹/›로 그려져 접기(16·ink2)와 펼치기(14·ink3)가 크기·색 둘 다 어긋난다."
 },
 {
  "symbol": "‹ / ›",
  "kind": "glyph",
  "meaning": "날짜 선택 모달의 이전 달/다음 달 이동",
  "sizes": [
   24
  ],
  "colorTokens": [
   "ink2"
  ],
  "usedAt": [
   "src/editor/DatePickerModal.tsx:51-59 (이전)",
   "src/editor/DatePickerModal.tsx:68-76 (다음)"
  ],
  "inconsistency": "과제에서 예시로 든 '이전/다음 ‹›가 14와 24로 갈린다'의 실체 확인 결과: 24는 이 날짜 모달의 ‹›이고, 14는 사실 다른 글자인 ←/→(성경 장 이전/다음, VerseList.tsx)다. 즉 '같은 기호가 다른 크기'가 아니라 '같은 의미(이전/다음 이동)에 서로 다른 기호(‹› vs ←→)와 서로 다른 크기(24 vs 14)와 서로 다른 색 체계(토큰 ink2 vs 하드코딩 #222)'가 동시에 벌어지는, 더 심각한 이원화."
 },
 {
  "symbol": "›",
  "kind": "glyph",
  "meaning": "설정 화면 안의 하위 항목으로 이동(라이선스 화면)",
  "sizes": [
   22
  ],
  "colorTokens": [
   "ink3"
  ],
  "usedAt": [
   "app/settings.tsx:272-284"
  ],
  "inconsistency": "같은 settings.tsx 안, 같은 navRowChevron 스타일(22px·ink3)을 '외부 링크 열기'(↗)와 '메일 문의'(✉)에도 그대로 재사용 — 세 가지 다른 목적지(내부 화면 이동/외부 웹/메일 앱)가 시각적으로 구분되지 않는다."
 },
 {
  "symbol": "≡",
  "kind": "glyph",
  "meaning": "접힌 노트 목록을 다시 펼치기(센터 헤더의 브레드크럼 버튼)",
  "sizes": [
   15
  ],
  "colorTokens": [
   "ink2"
  ],
  "usedAt": [
   "src/workspace/TabletWorkspace.tsx:320-333"
  ],
  "inconsistency": "이 버튼은 leftOpen===false일 때만 보이는데, 바로 그 조건에서 화면 맨 왼쪽에는 PanelRail(같은 동작, ≡ 글리프 16px·accent)이 이미 렌더링되어 있다. 즉 정확히 같은 onPress(setLeftOpen(true))에 대해 서로 다른 크기·색의 ≡ 두 개가 동시에 화면에 뜬다."
 },
 {
  "symbol": "≡",
  "kind": "glyph",
  "meaning": "접힌 노트 패널 레일의 표시 아이콘('노트' 레이블 위)",
  "sizes": [
   16
  ],
  "colorTokens": [
   "accent"
  ],
  "usedAt": [
   "src/workspace/PanelRail.tsx:29-42",
   "src/workspace/TabletWorkspace.tsx:310-316 (glyph=\"≡\")"
  ],
  "inconsistency": "위 항목(TabletWorkspace 크럼 버튼의 ≡, 15px·ink2)과 동시에 화면에 존재하는 중복 컨트롤. 두 ≡가 크기(15/16)와 색(ink2/accent) 모두 다르다."
 },
 {
  "symbol": "◧",
  "kind": "glyph",
  "meaning": "접힌 성경 패널을 다시 펼치기(센터 헤더의 브레드크럼 버튼)",
  "sizes": [
   15
  ],
  "colorTokens": [
   "accent"
  ],
  "usedAt": [
   "src/workspace/TabletWorkspace.tsx:380-394"
  ],
  "inconsistency": "rightOpen===false일 때만 보이는데, 같은 조건에서 화면 오른쪽 끝 PanelRail이 이미 같은 동작(setRightOpen(true))을 ✦ 글리프(16px·accent)로 표시하며 동시에 떠 있다 — 완전히 동일한 클릭 타겟에 서로 다른 두 기호(◧/✦)가 화면에 함께 존재하는, 이 인벤토리에서 가장 명백한 중복."
 },
 {
  "symbol": "✦",
  "kind": "glyph",
  "meaning": "접힌 성경 패널 레일의 표시 아이콘('성경' 레이블 위)",
  "sizes": [
   16
  ],
  "colorTokens": [
   "accent"
  ],
  "usedAt": [
   "src/workspace/PanelRail.tsx:29-42",
   "src/workspace/TabletWorkspace.tsx:457-463 (glyph=\"✦\")"
  ],
  "inconsistency": "◧ 항목과 동일한 중복 문제의 짝. 색은 우연히 같지만(accent) 기호 자체가 다르고 크기도 15/16으로 다르다."
 },
 {
  "symbol": "↑",
  "kind": "glyph",
  "meaning": "노트 공유(내보내기) — 태블릿 센터 헤더 버전",
  "sizes": [
   15
  ],
  "colorTokens": [
   "ink2"
  ],
  "usedAt": [
   "src/workspace/TabletWorkspace.tsx:369-379",
   "app/settings.tsx:262-264 (도움말 문구가 이 글리프를 지칭)"
  ],
  "inconsistency": "폰에서는 같은 동작(handleExport)이 lucide Share 벡터(21px·ink2)로 그려진다. 완전히 다른 기술(벡터 vs 글리프)·크기(21 vs 15)로 같은 의미를 표현하는, 벡터/글리프 이원화의 대표 사례. 게다가 설정 화면 도움말이 이 태블릿 전용 글리프를 유일한 공유 버튼처럼 설명해 폰 사용자에게는 실제 UI(Share 아이콘)와 안내 문구(↑)가 어긋난다."
 },
 {
  "symbol": "✕",
  "kind": "glyph",
  "meaning": "닫기·지우기(성경 검색어 지우기 / 성경 브라우저 모달 닫기, 두 가지 의미가 같은 기호를 공유)",
  "sizes": [
   12,
   20
  ],
  "colorTokens": [
   "ink3",
   "hardcoded:#555"
  ],
  "usedAt": [
   "src/workspace/BibleLookupPanel.tsx:90-100 (12px, ink3, '검색어 지우기')",
   "src/browser/BibleBrowser.tsx:82-90 (20px, 하드코딩 #555, '브라우저 닫기')"
  ],
  "inconsistency": "과제에 언급된 '닫기 ✕가 12와 20 두 크기'를 그대로 확인함. 크기 차이(12↔20)뿐 아니라 색상 체계 자체가 다르다 — 하나는 테마 토큰(ink3), 하나는 하드코딩 헥스(#555)라 다크모드/테마 변경 시 후자만 색이 안 바뀐다. 또한 두 사용처는 각각 '입력값 지우기'와 '모달 닫기'로 의미가 미묘하게 다른데도 같은 크기 계열 안에서 임의로 갈렸다."
 },
 {
  "symbol": "⌕",
  "kind": "glyph",
  "meaning": "검색 입력창 안의 장식용 돋보기 아이콘(성경 참조 검색)",
  "sizes": [
   13,
   14
  ],
  "colorTokens": [
   "ink3"
  ],
  "usedAt": [
   "src/workspace/NoteListSidebar.tsx:109-113 (13px)",
   "src/workspace/BibleLookupPanel.tsx:71-73 (14px)"
  ],
  "inconsistency": "1px 차이지만 두 값 모두 하드코딩된 숫자라 크기 토큰이 실제로 강제되지 않는다는 증거. 또 '검색' 개념은 헤더의 실행 가능한 Search 벡터 버튼(21px)과도 겹쳐, 같은 의미에 장식용 글리프(13/14px)·액션 벡터(21px) 두 체계가 공존한다."
 },
 {
  "symbol": "＋",
  "kind": "glyph",
  "meaning": "새 노트 만들기",
  "sizes": [
   16,
   28
  ],
  "colorTokens": [
   "accent",
   "paper (28px 버전은 ink 배경 위 paper색 글자)"
  ],
  "usedAt": [
   "src/workspace/NoteListSidebar.tsx:69-79 (16px, 태블릿 사이드바 버튼)",
   "app/index.tsx:291-301 (28px, 폰 FAB)"
  ],
  "inconsistency": "폰은 FAB(28, fab 토큰), 태블릿은 인라인 버튼(16, md 토큰) — 두 문맥이 다르다는 점에서 완전히 부당한 차이는 아니지만, 이 규칙이 코드 어디에도 명시되어 있지 않다. 또한 같은 ＋ 기호가 아래 두 항목(구절 삽입)에서 전혀 다른 의미로도 쓰인다."
 },
 {
  "symbol": "＋",
  "kind": "glyph",
  "meaning": "성경 구절을 현재 노트에 인용 삽입",
  "sizes": [
   13,
   18
  ],
  "colorTokens": [
   "accent",
   "hardcoded:white (18px 버전, #222 원형 배지 위)"
  ],
  "usedAt": [
   "src/workspace/BibleLookupPanel.tsx:140-152 ('＋ 노트에 삽입', 13px, accent, 인라인 텍스트형)",
   "src/browser/VerseList.tsx:91-101 (18px, 하드코딩 white on #222, 원형 배지형)"
  ],
  "inconsistency": "같은 '구절 삽입' 의미에 완전히 다른 두 시각 형태(인라인 텍스트 vs 원형 배지)와 크기(13/18)가 쓰이고, 후자는 색상 토큰을 아예 쓰지 않는 하드코딩(#222 배경 + white 글자) — 이 파일(VerseList.tsx) 전체가 테마 시스템 밖에 있다."
 },
 {
  "symbol": "✓",
  "kind": "glyph",
  "meaning": "확인/선택 표시(생명양식 본문 형식이 유효함 / 설정에서 현재 테마가 선택됨 — 서로 다른 두 의미가 같은 기호 공유)",
  "sizes": [
   16
  ],
  "colorTokens": [
   "accent"
  ],
  "usedAt": [
   "src/editor/SermonMetaHeader.tsx:236-238 (16px, fontWeight 700, '생명양식 형식 유효')",
   "app/settings.tsx:165-169 (fontSize 미지정 — 플랫폼 기본값 상속, fontWeight 600, '테마 선택됨')"
  ],
  "inconsistency": "두 번째 사용처는 fontSize를 아예 지정하지 않아 플랫폼 기본 텍스트 크기를 그대로 물려받는다 — 즉 이 항목은 실질적으로 '토큰이 없다'. fontWeight도 700 vs 600으로 다르다. 의미도 '형식 검증'과 '옵션 선택'으로 다른데 같은 기호를 재사용."
 },
 {
  "symbol": "▾ / ▸",
  "kind": "glyph",
  "meaning": "성경 인용 블록(QuoteBlock)의 아코디언 펼침/접힘",
  "sizes": [
   11
  ],
  "colorTokens": [
   "accent"
  ],
  "usedAt": [
   "src/editor/QuoteBlock.tsx:176-183 (scaled(11, fontScale))"
  ],
  "inconsistency": "'펼치기/접기'라는 같은 인터랙션 패턴에 이 채워진 삼각형(▾▸, 11px)과 홑화살괄호 계열(‹›, 14~18px)이 함께 쓰인다 — 하나의 상호작용 문법에 최소 2가지 기하학적 기호가 혼재. 이 아이콘도 SermonMetaHeader의 Calendar처럼 스케일링(scaled())되는 몇 안 되는 글리프 중 하나."
 },
 {
  "symbol": "↵",
  "kind": "glyph",
  "meaning": "자동 인용 삽입 완료를 위한 Return 키 안내(키보드 힌트 배지)",
  "sizes": [
   11
  ],
  "colorTokens": [
   "ink3"
  ],
  "usedAt": [
   "src/editor/NoteEditor.tsx:208-214"
  ],
  "inconsistency": ""
 },
 {
  "symbol": "📖",
  "kind": "glyph",
  "meaning": "생명양식(설교 본문) 미리보기 열기",
  "sizes": [
   18
  ],
  "colorTokens": [
   "색상 토큰 없음 — 이모지라 텍스트 color가 적용되지 않고 opacity만 토글됨"
  ],
  "usedAt": [
   "src/editor/SermonMetaHeader.tsx:239-255"
  ],
  "inconsistency": "같은 '성경/본문 읽기' 의미 영역에서 헤더는 lucide BookOpen 벡터(21px, 색 지정 가능)를 쓰는데 여기는 컬러 이모지 📖를 쓴다 — lucide 벡터·텍스트 글리프에 더해 '이모지'라는 세 번째 아이콘 기술까지 섞여 있다는 증거."
 },
 {
  "symbol": "✉",
  "kind": "glyph",
  "meaning": "이메일로 문의하기",
  "sizes": [
   22
  ],
  "colorTokens": [
   "ink3"
  ],
  "usedAt": [
   "app/settings.tsx:298-310"
  ],
  "inconsistency": "설정 화면의 navRowChevron 스타일을 그대로 재사용해 '›'(내부 이동), '↗'(외부 링크)와 시각적으로 구분되지 않는다."
 },
 {
  "symbol": "↗",
  "kind": "glyph",
  "meaning": "외부 웹페이지로 이동(개인정보 처리방침)",
  "sizes": [
   22
  ],
  "colorTokens": [
   "ink3"
  ],
  "usedAt": [
   "app/settings.tsx:285-297"
  ],
  "inconsistency": "위 ✉·아래 › 항목과 같은 22px·ink3 스타일 재사용 — '내부 이동/외부 링크/메일 실행'이라는 서로 다른 목적지 유형이 오직 기호 모양만으로 구분되고 크기·색으로는 전혀 구분되지 않는다."
 },
 {
  "symbol": "← / →",
  "kind": "glyph",
  "meaning": "성경 장(chapter) 이전/다음 이동",
  "sizes": [
   14
  ],
  "colorTokens": [
   "hardcoded:#222"
  ],
  "usedAt": [
   "src/browser/VerseList.tsx:53-75"
  ],
  "inconsistency": "같은 '이전/다음 이동' 개념인 DatePickerModal의 ‹›(24px, ink2 토큰)와 기호·크기·색 셋 다 다르다. 이 컴포넌트 전체(VerseList.tsx)가 #222/#888/#111/white 등 하드코딩 색만 쓰고 useTheme()를 전혀 호출하지 않아, 다크모드에서도 색이 안 바뀐다."
 },
 {
  "symbol": "←",
  "kind": "glyph",
  "meaning": "성경 브라우저 안에서 책 목록으로 뒤로가기",
  "sizes": [
   15
  ],
  "colorTokens": [
   "hardcoded:#555"
  ],
  "usedAt": [
   "src/browser/BibleReader.tsx:103-112"
  ],
  "inconsistency": "앱의 표준 '뒤로가기'는 lucide ChevronLeft 벡터(24px, ink2 토큰, 헤더 좌측)인데, 성경 브라우저 내부에서만 별도로 텍스트 \"← 뒤로\"(15px, 하드코딩 #555)를 쓴다 — 벡터/글리프 이원화 + 컬러 토큰 이탈이 겹친 사례이며, src/browser/ 서브트리(BibleReader·VerseList·BibleBrowser)가 통째로 테마 시스템 밖에 있다는 패턴의 일부."
 }
];

const ICON_NOTES = [
 "글리프→lucide 벡터 치환 매핑표를 만들어 하나씩 교체한다: ✕→X, ‹/›→ChevronLeft/ChevronRight, ＋→Plus, ✓→Check, ⌕→Search, ↑→Share, ≡→PanelLeft(또는 Menu), ◧/✦→PanelRight(우선 코드에서부터 하나로 통합), 📖→BookOpen, ✉→Mail, ↗→ExternalLink, ▾/▸→ChevronDown/ChevronRight, ↵→CornerDownLeft, ←/→→ChevronLeft/ChevronRight. 이 작업의 실질 목표는 'Figma에 벡터 심볼을 하나 더 그리는 것'이 아니라, 지금 텍스트 글리프로만 존재하는 12개 이상의 의미를 lucide 라이브러리가 이미 가진 아이콘으로 흡수하는 것이다.",
 "'펼치기/접기'라는 하나의 인터랙션 패턴에 지금 최소 4가지 서로 다른 기호 체계(‹›, ≡, ◧/✦, ▾▸)가 쓰인다. 방향성 chevron(ChevronLeft/Right/Down) 하나로 통일하고, '어떤 패널인지'는 별도의 라벨/아이콘(노트=PanelLeft, 성경=BookOpen)으로, '열림/닫힘 상태'는 오직 chevron 방향으로만 표현하도록 역할을 분리한다.",
 "코드 차원의 진짜 버그부터 고친다: TabletWorkspace에서 leftOpen===false, rightOpen===false일 때 각각 ≡(15px/16px)와 ◧/✦(15px/16px)가 동일한 클릭 동작에 대해 두 벌씩 동시에 렌더링된다. Figma 시트를 그리기 전에 이 중복 컨트롤을 하나로 합쳐야, 시트에 그릴 '정본 아이콘'이 명확해진다.",
 "src/browser/(BibleReader.tsx, VerseList.tsx, BibleBrowser.tsx) 서브트리는 useTheme()를 전혀 쓰지 않고 #222/#555/#888/#111/#eee/#f4f4f4/white 등을 하드코딩한 완전히 별도의 컬러 체계다. 아이콘 색상을 focus/ink·ink2·ink3·ink4·accent·err-text·paper 토큰으로 통일하기 전에, 이 서브트리를 먼저 테마 토큰 기반으로 옮겨야 한다 — 안 그러면 벡터 아이콘을 새로 넣어도 색만 따로 논다.",
 "제안된 크기 토큰(glyph: xs12/sm14/md16/lg18/fab28, vector: sm16/header21/lg24) 중 상당수 값(11, 13, 15, 17, 20, 22, 24-글리프-버전)이 실제 코드에서 스케일 밖에 있다. 아이콘 전용 래퍼 컴포넌트를 만들어 숫자 대신 토큰 이름만 지정하게 강제하지 않으면, 토큰을 문서화해도 실제 코드는 계속 새어나간다.",
 "기기별 크기 차이(Download/Settings: 사이드바 16 vs 헤더 21, ＋: 사이드바 16 vs FAB 28)는 '툴바 문맥 vs 헤더/FAB 문맥'이라는 의도로 보이며 각 값이 개별 토큰과는 일치하므로 유지해도 된다 — 다만 이 규칙을 코드 주석이나 컴포넌트 이름으로 명시할 것. 반면 Trash2의 17px(태블릿 헤더)는 어떤 토큰과도 안 맞고 정당화할 문맥 차이도 없어 21(header)로 맞추는 단순 버그 수정이 필요하다.",
 "'뒤로가기/이전/다음'류 방향 이동이 ChevronLeft 벡터(24, 표준 헤더) / \"← 뒤로\"(15, 성경 브라우저) / \"← 이전·다음 →\"(14, 장 탐색) / ‹›(24, 날짜 선택) 넷으로 흩어져 있다. 최소한 이 네 가지를 ChevronLeft/ChevronRight 벡터 하나로 합치는 것을 1순위 통합 대상으로 삼는다.",
 "공유(Share) 아이콘은 폰(lucide Share, 21px)과 태블릿(↑ 글리프, 15px)이 다를 뿐 아니라, 설정 화면 도움말 문구(app/settings.tsx:263)가 태블릿 전용 ↑ 글리프를 유일한 정본처럼 설명하고 있다. 아이콘을 통일하면서 이 안내 문구도 함께 검토해 실제 UI와 어긋나지 않게 한다.",
 "Figma 시트는 '기호'가 아니라 '의미' 단위로 컴포넌트를 만들고, 크기는 variant(xs/sm/md/lg/fab, sm/header/lg)로만 바꾸도록 설계한다. 이번 조사에서 확인됐듯 같은 의미가 여러 기호로 새는 근본 원인은 크기·색을 매번 숫자로 하드코딩하는 습관이므로, 시트 자체가 '의미 하나 = 컴포넌트 하나'라는 제약을 강제해야 한다."
];
