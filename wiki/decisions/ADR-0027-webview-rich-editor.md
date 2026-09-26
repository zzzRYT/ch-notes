# ADR-0027 · 본문 에디터를 WebView(TipTap) 리치 에디터로 되돌린다 — 제안

```yaml
id: ADR-0027
status: proposed
statement: 노트 본문 에디터를 @10play/tentap-editor(WebView + TipTap/ProseMirror)로 바꾸고, 저장 모델(BlockNode[] + 텍스트 속 경량 마크다운)은 그대로 둔다. 채택되면 ADR-0001과 ADR-0015를 뒤집는다.
confidence: 기록됨
source:
  - apps/ch-life/src/widgets/note-editor/ui/RichNoteEditor.tsx
  - apps/ch-life/src/widgets/note-editor/lib/rich-doc.ts
  - apps/ch-life/src/widgets/note-editor/lib/verse-bridge.ts
  - apps/ch-life/src/widgets/note-editor/lib/doc-sync-bridge.ts
  - apps/ch-life/editor-web/extensions.ts
  - 사용자 요청(2026-09-26) — 마커 없이 실제 서식으로 보이는 타이핑, 블루투스 키보드 특화, Notion식 "/" 메뉴
```

## 맥락

[`ADR-0001`](ADR-0001-native-block-editor.md)은 무게와 어르신·구형 안드로이드를 이유로 WebView를 버렸다. 그 뒤 네이티브 `TextInput`으로 서식을 붙여 보니(브랜치 `feat/editor-format-toolbar`) 한계가 코드로 확인됐다.

- `**굵게**`를 치면 마커가 남는다. RN `TextInput`은 텍스트가 같으면 자식 스타일을 다시 적용하지 않는다.
- Cmd+B, 방향키, Esc 같은 하드웨어 키가 JS에 오지 않는다. 받으려면 네이티브 `UIKeyCommand`를 붙여야 하는데, 그러면 OTA로 고칠 수 없다.
- 문단마다 입력칸이 따로라서 여러 문단에 걸쳐 선택할 수 없다.

## 스파이크 결과 (2026-09-26, iPad Pro 13 시뮬레이터 · iPhone 13 mini 시뮬레이터)

| 항목 | 결과 |
|---|---|
| `요 3:16` + space 또는 Enter → 인용 카드 | **통과.** 두 트리거 모두 [`RULE-EDIT-001`](../rules/editor-insert.md) 그대로다. Enter는 막지 않고 문단이 먼저 나뉜 뒤, 응답이 오면 두 문단 사이에 카드를 끼운다. 판정과 조회는 RN이 한다(`detectRefAtCursor`·`lookupVerses`·`makeQuoteBlock` 재사용). 웹은 [앞][카드][뒤]로 나누고 캐럿을 카드 아래에 둔다 |
| 한글 IME 조합 | **통과(조건부).** tentap `useEditorContent`는 RN이 `injectJavaScript`로 `getJSON`을 당겨 가는데, 이 주입이 조합을 끊어 다음 글자를 삼켰다. 같은 입력을 Safari contenteditable에 넣으면 손실이 없었다. 웹이 조합 중이 아닐 때 스스로 보내게 바꾸자(`doc-sync-bridge`) 손실이 사라졌다 |
| `**x**` `_x_` `++x++` → 서식 | **통과.** 마커가 사라지고 실제 서식이 보인다 |
| "/" 메뉴 | **통과.** 한글 필터(`/목록`)와 Enter 선택이 되고 "/검색어"는 지워진다 |
| Cmd+B/I/U (하드웨어 키보드) | **미확인.** 시뮬레이터에 합성 키를 넣어서는 검증할 수 없었다. iPadOS는 Cmd+B를 `beforeinput(formatBold)`로 보내는 것으로 보고 그 경로에 핸들러를 달았다. 실기기와 키보드로 확인해야 한다 |
| 저장 형식 왕복 | **통과.** DB에 `**…**`·`_…_`·`++…++`로 저장되고, 앱을 재시작해도 그대로 복원된다. 네이티브 에디터로 만든 기존 노트도 그대로 열린다. 단위 테스트는 `rich-doc.test.ts` |
| 무게 | 웹 번들 717KB(gzip 225KB). tentap `lib-web`이 TipTap을 통째로 싣고 있어서, 우리 확장이 import하는 `@tiptap/core`가 한 벌 더 들어간다. **구형 안드로이드는 미측정** |

## 채택 전에 남은 일

- 실기기 iPad와 키보드로 Cmd+B/I/U, 방향키, "/" 메뉴 확인.
- 구형 안드로이드 에뮬레이터에서 첫 로드 시간과 타이핑 지연 측정 — ADR-0001의 원래 이유.
- 폰에서 메타 헤더가 WebView 밖에 고정되어 화면의 40%를 차지한다. 헤더를 함께 스크롤시킬 방법이 필요하다.
- 네이티브 의존성 `react-native-webview`가 추가된다 → 스토어 빌드가 필요하다([`ADR-0013`](ADR-0013-release-path.md)).
- 채택하면 RULE-EDIT-* 중 `TextInput` 구조를 전제로 한 규칙(디바운스 두 겹, 문단 memo, Android IME 포커스 가드)을 다시 쓴다.
