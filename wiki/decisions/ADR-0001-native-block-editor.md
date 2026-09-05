# ADR-0001 · 리치 에디터 라이브러리 대신 네이티브 블록 에디터

```yaml
id: ADR-0001
status: accepted
statement: 노트 에디터는 WebView 기반 리치 에디터(@10play/tentap-editor)를 쓰지 않고, 블록 배열을 직접 렌더하는 순수 React Native 구현으로 만든다.
confidence: 기록됨
source:
  - DESIGN.md "자동완성 UX 디테일" 구현 갱신(2026-05-31)
  - DESIGN.md "Next Steps" Week 0 A항 (결론 갱신)
  - 커밋 c001e36 "refactor: 웹뷰(tentap) 리치 에디터 제거, 네이티브 NoteEditor로 일원화"
  - 커밋 701c908 (webview 기반 시도, 미완성 상태로 남음)
```

## 맥락

계획 단계의 1순위는 `@10play/tentap-editor`(WebView + ProseMirror)였고, Week 0 de-risk 항목에 "빈 앱에 붙여 자동완성 데코레이션 1개 부착"이 있었다. 실제로 WebView 기반 구현이 한 번 시도되어 미완성 상태로 커밋되었다(`701c908`).

## 결정

WebView를 버리고 네이티브 블록 에디터로 간다. 본문은 `BlockNode[]`이고, 문단은 각각 `TextInput`, 성경 인용은 편집 불가 카드로 렌더한다.

## 이유 (기록된 것)

노트마다 WebView + ProseMirror를 띄우는 **무게**, 그리고 **어르신·구형 안드로이드 타깃**. `DESIGN.md`에 그대로 남아 있다.

## 귀결

- 인라인 ghost text 데코레이션을 쓸 수 없다 → 확정 UX가 [`ADR-0002`](ADR-0002-space-trigger.md)로 이어졌고, 힌트는 화면 하단 칩이 되었다([`RULE-EDIT-005`](../rules/editor-insert.md)).
- 문단마다 `TextInput`이 분리되어 커서·포커스·리렌더를 직접 관리해야 한다 — 디바운스 두 겹, memo, `bodyRef` 같은 구조가 전부 여기서 나온다([`RULE-EDIT-008`](../rules/editor-insert.md)).
- WebView·ProseMirror 의존성이 없다. 번들이 가볍고 OTA로 에디터 로직을 고칠 수 있다.
- 서식 툴바가 없다. `heading`/`bullet`/`todo` 블록은 타입에만 있고 입력 경로가 없다([`CONTRACT-DOMAIN-NOTE`](../contracts/CONTRACT-DOMAIN-NOTE.md)).
