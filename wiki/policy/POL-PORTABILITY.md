# POL-PORT — 노트는 사용자 소유다

## POL-PORT-001 · 내보내기와 가져오기

```yaml
id: POL-PORT-001
statement: 노트 한 개는 언제든 표준 Markdown 파일로 내보낼 수 있어야 하고, 그 파일은 다른 마크다운 앱에서 열려야 하며, 다시 가져와도 내용이 보존되어야 한다.
confidence: 기록됨
source:
  - docs/plans/2026-05-17-ch-life-v1-spec.md 5.1, 5.8, 8장 DoD
  - DESIGN.md "Premises" P4
```

서버도 계정도 없으므로 백업 책임은 사용자에게 있다. "폰을 잃어버려 3년치 설교 노트를 날렸다"를 막는 유일한 장치가 이 기능이다. 그래서 내보내기 포맷은 앱 전용 바이너리가 아니라 **사람이 읽을 수 있는 Markdown + YAML frontmatter**다([`ADR-0003`](../decisions/ADR-0003-sqlite-markdown-hybrid.md)).

사용자에게 "마크다운"이라는 단어는 노출하지 않는다. 화면상의 이름은 "공유"와 "가져오기"다.

### 지금 보장하는 것 / 보장하지 않는 것

| | 상태 |
|---|---|
| 노트 1개 내보내기 (공유 시트) | 동작 |
| `.md` 파일 1개 가져오기 (파일 선택) | 동작 |
| 왕복 보존 (DB→MD→DB) | 자동 테스트로 보장 |
| 외부 앱이 만든 frontmatter 없는 `.md` 수용 | 동작 |
| 전체 백업 zip | **없음** (v1 spec 5.9 계획분 미구현) |
| 시스템 "다른 앱에서 열기" 인텐트 수신 | **없음** (v1 spec 5.10 계획분 미구현) |
| `schemaVersion` 불일치 시 거부 | **없음** — 값을 쓰기만 하고 읽지 않는다 |

미구현 항목은 [`drift.md`](../drift.md)에 기록되어 있다.

하위 규칙: [`RULE-MD-*`](../rules/share-markdown.md), [`CONTRACT-MD-NOTE`](../contracts/CONTRACT-MD-NOTE.md)
