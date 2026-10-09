# 말씀 지도 Claude Design 프로젝트

## Source

- [Claude Design 프로젝트 — 말씀 지도.html](https://claude.ai/design/p/811e4d00-63c8-40d4-abf7-3227614e8bb2?file=%EB%A7%90%EC%94%80+%EC%A7%80%EB%8F%84.html)
- 프로젝트 ID: `811e4d00-63c8-40d4-abf7-3227614e8bb2`
- 지정된 MCP: `https://api.anthropic.com/v1/design/mcp`
- 인증 경로: Claude Code의 `/design-login`
- 전달일: 2026-10-09
- 구현 이슈: [#98 — 시대별 말씀 지도와 설교 노트 연결](https://github.com/zzzRYT/ch-notes/issues/98)

이슈에는 V1 설계, 독립 디자인 브리프, 사용자 제공 원본 자료의 스냅샷을 포함했다.
디자인 MCP 인증 만료로 파일 내용 확인이 대기 중이라는 사실도 이슈에 명시했다.

## Requested Files

중심 파일은 `말씀 지도.html`이다.
사용자가 함께 읽도록 지정한 파일은 다음과 같다.

- `design-canvas.jsx`
- `frames.jsx`
- `map-app.jsx`
- `map-data.js`
- `map-geo.jsx`
- `map-screens.jsx`
- `map-ui.jsx`
- `map.css`
- `tweaks-panel.jsx`

위 목록은 사용자 메시지에 나온 파일 목록이며, 아직 MCP에서 확인한 목록은 아니다.

## Import Prerequisite

2026-10-09에 지정 MCP의 초기 연결을 시도했으나 OAuth 토큰 만료로 HTTP 401 응답을 받았다.
토큰이나 인증 정보를 프로젝트에 저장하지 않았다.
이 문서를 작성한 시점에는 프로젝트 가져오기, 파일 본문 확인, 화면 미리보기를 완료하지 못했다.

인증이 갱신되면 지정 MCP로 프로젝트를 가져오고 열 개 파일의 실제 내용을 확인한다.
원본 디자인 파일은 앱 코드와 분리해 보관하고, 출처·가져온 시점·원본과의 대응을 함께 기록한다.
읽기 전에는 파일명만으로 화면 상태, 컴포넌트 관계, 지도 데이터의 정확성이나 라이선스를 추정하지 않는다.

## Design Integration Checks

기준 설계는 [말씀 지도 V1 설계](../plans/2026-10-09-1523-feat-scripture-map-v1-plan.md)다.
독립적인 [Claude Design 브리프](2026-10-09-scripture-map-v1-claude-design-brief.md)와 다음 항목을 대조한다.

- 사건 시대와 기록 작성일이 구분되는가.
- 같은 지역의 다른 시대 장소와 동일 좌표의 다른 장소를 모두 표현하는가.
- 지역·시대·장소별 고유 노트 집계가 맞는가.
- 미연결·로딩·오류·필터 빈 상태를 구분하는가.
- 폰과 태블릿에 같은 동작을 제공하고 기존 테마와 접근성을 유지하는가.
- 사용자 데이터가 외부로 전송되지 않고 외부 지도 타일 없이 핵심 흐름이 작동하는가.
- 웹 시안의 예시 데이터·조정 패널과 앱에 반영할 제품 기능을 구분하는가.

차이가 있으면 실제 디자인 근거를 붙여 설계에 반영한다.
새 기능이나 검증되지 않은 시대·좌표를 시안에서 발견했다는 이유만으로 V1 요구사항에 추가하지 않는다.
