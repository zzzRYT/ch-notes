# `policy/` — 사용자 정책 `POL-*`

> 손으로 쓴다. 전체 ID 표는 [`../index.md`](../index.md)(생성물), 절차는 [`../workflow.md`](../workflow.md).

이 앱이 **사용자에게 하는 약속**이다. "무엇을 할 수 있어야 하는가"까지만 적고, 어떻게 하는지는 [`../rules/index.md`](../rules/index.md)와 [`../contracts/index.md`](../contracts/index.md)에 위임한다.

그래서 `POL` 블록에는 `implemented_by`가 없다. 구현 책임은 자기를 `policy:`로 가리키는 하위 `RULE`/`CONTRACT`가 진다. **자동 증거도 대부분 하위 블록 쪽에 있다** — POL 자체의 증거 칸이 비어 있다고 검증되지 않는다는 뜻이 아니다.

## 파일

| 파일 | ID | 무엇을 약속하나 | 이럴 때 먼저 본다 |
|---|---|---|---|
| [POL-SCRIPTURE.md](POL-SCRIPTURE.md) | POL-SCRIPTURE-001<br>POL-SCRIPTURE-002 | 참조만 치면 오프라인으로 본문이 들어온다 · 성경 자체도 읽을 수 있다 | `src/parser/**`, `src/editor/useAutocomplete.ts`, `src/browser/**` |
| [POL-NOTE.md](POL-NOTE.md) | POL-NOTE-001<br>POL-NOTE-002<br>POL-NOTE-003 | 즉시 쓰고 자동 저장된다 · 설교 맥락을 남긴다 · 다시 찾을 수 있다 | 새 노트 흐름, 자동저장, 설교 메타 헤더, 목록·검색 |
| [POL-PRIVACY.md](POL-PRIVACY.md) | POL-PRIVACY-001 | 콘텐츠·식별정보·사용기록이 기기 밖으로 나가지 않는다 | **네트워크 호출·SDK를 하나라도 추가할 때** |
| [POL-ACCESSIBILITY.md](POL-ACCESSIBILITY.md) | POL-A11Y-001 | 글자 크기 4단계, 손가락으로 누를 수 있는 크기, 색만으로 뜻을 전하지 않음 | 새 화면·컴포넌트, `fontScale`, 터치 타깃 |
| [POL-PORTABILITY.md](POL-PORTABILITY.md) | POL-PORT-001 | 노트는 표준 Markdown으로 나가고 다시 들어온다 | `src/markdown/**`, `src/share/**` |
| [POL-LICENSE.md](POL-LICENSE.md) | POL-LICENSE-001 | 성경 본문은 CC BY-SA 4.0 — 출처 표시와 라이선스 승계 | `assets/bible.json` 교체, `app/licenses.tsx`, 내보내기 포맷 |
| [POL-RELEASE.md](POL-RELEASE.md) | POL-RELEASE-001 | CI를 통과한 커밋만 자동 OTA로 나간다 | `app.config.ts`, `eas.json`, `.github/workflows/**` |

## 이 계층에서 사고 나는 지점

- **POL-PRIVACY-001은 코드의 *부재*로 성립한다.** 자동 검사로 잡을 수 없다(그래서 `waiver`). `fetch` 한 줄이 이 정책을 깬다.
- **POL-A11Y-001의 "조용함"은 1.0.1에서 반쯤 깨졌다.** 저장 성공은 여전히 조용하지만 **구절 삽입 성공과 노트 삭제에는 배너가 뜬다**. 새 알림을 붙이려면 이 둘과 같은 급인지 먼저 따진다 — 기본값은 여전히 "띄우지 않는다"다(E14).
- **POL-SCRIPTURE-001은 "조용한 실패"를 요구한다.** 없는 참조에 빨간 표시나 경고를 붙이면 안 된다.
- **POL-LICENSE-001의 SA는 앱 밖까지 따라간다.** 내보낸 `.md`에 본문이 실리면 그 파일도 CC BY-SA다.
- **POL-RELEASE-001에는 앱 버전 결합 함정이 붙어 있다.** `version`을 올리면 OTA가 기존 설치본에 닿지 않는다.
- **POL-RELEASE-001은 지금 스토어 사용자와 끊겨 있다.** 1.0.1은 `expo-updates` 바이너리인데 `main`은 hot-updater다 — 1.0.1 설치본에는 OTA가 닿지 않는다([`../contracts/CONTRACT-RELEASE.md`](../contracts/CONTRACT-RELEASE.md)).

## 처음이라면

[POL-PRIVACY.md](POL-PRIVACY.md) → [POL-SCRIPTURE.md](POL-SCRIPTURE.md) → [POL-NOTE.md](POL-NOTE.md) 순으로. 로컬 전용이라는 제약이 나머지 전부의 틀이고, 그 안에서 성경 인용이 앱의 존재 이유이며, 노트가 매일 쓰는 화면이다. 나머지 넷은 해당 영역을 건드릴 때 찾아 읽으면 된다.

## 주의: 파일명으로 정책을 단정하지 말 것

한 `RULE` 파일 안의 블록들이 **서로 다른 POL**에 속한다. 예를 들어 `rules/editor-insert.md` 13개 블록은 **다섯 개 정책 블록으로 흩어져 있다**(파일로는 셋 — `POL-SCRIPTURE.md`·`POL-NOTE.md`·`POL-PORTABILITY.md`) — POL-SCRIPTURE-001(RULE-EDIT-001·002·003·005·006·007), POL-NOTE-001(RULE-EDIT-004·008), POL-NOTE-002(RULE-EDIT-011·012·013), POL-NOTE-003(RULE-EDIT-009), POL-PORT-001(RULE-EDIT-010). 파일 이름은 `editor-insert`지만 인용 삽입 정책에 속한 것은 절반뿐이다. 각 블록의 `policy:` 필드가 정본이고, 파일 헤더의 "상위 정책" 줄은 그 목록을 요약한 것이다.
