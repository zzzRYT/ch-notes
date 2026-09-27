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
  - apps/ch-life/editor-web/vite.config.ts
  - apps/ch-life/patches/@10play__tentap-editor@1.0.1.patch
  - 사용자 요청(2026-09-26) — 마커 없이 실제 서식으로 보이는 타이핑, 블루투스 키보드 특화, Notion식 "/" 메뉴
  - 사용자 결정(2026-09-27) — 장기적으로 앱 전용 에디터를 직접 만든다. 그때까지 TenTap으로 가며 지속적으로 다듬는다
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
| 무게 | 웹 번들 623KB(gzip 197KB). 처음엔 717KB였다 — tentap `lib-web`이 TipTap을 통째로 싣고 있어 우리 확장의 `@tiptap/core`가 한 벌 더 들어갔다. `editor-web/vite.config.ts`가 tentap 웹 진입점을 TS 소스로 별칭해 한 벌로 줄였다. **구형 안드로이드는 미측정** |

## 노트를 열 때의 공백 (2026-09-27, iPhone 13 mini 시뮬레이터)

노트 상세에 들어가면 본문 자리가 잠깐 비었다가 나타난다. 네트워크와는 무관하다 — 에디터 HTML은 `lib/generated/editor-html.js`에 문자열로 들어 있고 외부 리소스를 부르지 않는다. SQLite 조회는 한 프레임 수준이다. 공백은 **WebView가 HTML을 파싱하고 TipTap을 띄우는 시간**이다.

| 원인 | 조치 |
|---|---|
| 테마 CSS를 로드 뒤 `injectCSS`로 넣어, 첫 화면이 기본 색으로 그려졌다 바뀌었다 | `RichNoteEditor`가 마운트 때 한 번 `<style data-tag="chlife-theme">`을 HTML `<head>`에 넣는다. 이후 테마 변경만 `injectCSS`가 같은 태그를 덮어쓴다 |
| tentap이 iOS에서 첫 `onLoad` 뒤 WebView를 **일부러 한 번 더 로드**했다(react-native-webview #3578 — 첫 로드에서 `injectedJavaScriptBeforeContentLoaded`가 안 도는 문제의 우회) | `pnpm patch`로 재로드를 지우고, 같은 초기화 스크립트를 HTML `<head>`의 `<script>`로 미리 넣는다. `<`는 `\u003c`로 바꿔 본문 속 `</script>`가 태그를 닫지 못하게 한다 |
| 번들 중복(위 "무게") | 717KB → 623KB |
| 준비 전의 빈 WebView가 그대로 보였다 | `doc-ready`까지 opacity 0, 이후 150ms 페이드 |

측정(30fps 녹화, 탭부터 본문이 보일 때까지): 앱을 켠 뒤 첫 진입 약 1.3초, 이후 진입 약 0.7초. 조치 전 수치는 같은 조건으로 재지 않았다 — 비교가 필요하면 조치를 되돌려 다시 잰다. 공백을 0으로 만들려면 WebView 한 개를 앱 수명 동안 살려 두고 `setContent`로 노트만 바꾸는 방식이 필요하다(전환 애니메이션·키보드 위치를 직접 다뤄야 해서 보류).

## 장기 방향 — 앱 전용 에디터를 직접 만든다

사용자 결정(2026-09-27). WebView가 아닌 대안을 검토했지만 지금 요구(마커 없는 서식, 문단을 넘는 선택, 하드웨어 키, "/" 메뉴, 인용 카드 블록, OTA로 고칠 수 있음)를 모두 채우는 기성품은 없었다.

- ADR-0001의 네이티브 `TextInput` 블록 에디터 — 공백은 없지만 위 "맥락"의 한계 그대로다.
- `react-native-enriched`(네이티브 리치 입력) — 서식·인용·멘션은 되지만 헤더가 달린 인용 카드 같은 임의 블록이 어렵고, 로직이 네이티브라 OTA로 고치기 어렵다. 하드웨어 단축키 지원은 확인하지 않았다(`확인필요`).

그래서 TenTap은 **과도기 구현**이다. 전용 에디터를 만들 때까지 위 조치처럼 계속 다듬고, 저장 모델(BlockNode[] + 텍스트 속 경량 마크다운)과 판정 로직(`detectRefAtCursor`·`lookupVerses`·`makeQuoteBlock`)은 에디터 밖에 두어 교체 비용을 낮게 유지한다.

## 채택 전에 남은 일

- 실기기 iPad와 키보드로 Cmd+B/I/U, 방향키, "/" 메뉴 확인.
- 구형 안드로이드 에뮬레이터에서 첫 로드 시간과 타이핑 지연 측정 — ADR-0001의 원래 이유.
- 폰에서 메타 헤더가 WebView 밖에 고정되어 화면의 40%를 차지한다. 헤더를 함께 스크롤시킬 방법이 필요하다.
- 네이티브 의존성 `react-native-webview`가 추가된다 → 스토어 빌드가 필요하다([`ADR-0013`](ADR-0013-release-path.md)).
- 채택하면 RULE-EDIT-* 중 `TextInput` 구조를 전제로 한 규칙(디바운스 두 겹, 문단 memo, Android IME 포커스 가드)을 다시 쓴다.
