# CONTRACT-BIBLE-JSON — 번들 성경 데이터

```yaml
id: CONTRACT-BIBLE-JSON
policy: POL-LICENSE-001
statement: 성경 본문은 assets/bible.json 하나로 앱에 번들되며, 책코드 → 장 → 절 → 본문의 3단 중첩 객체다. 출처는 Open Bible 한국어판, 라이선스는 CC BY-SA 4.0이다.
implemented_by:
  - apps/ch-life/assets/bible.json
  - apps/ch-life/src/parser/verse-lookup.ts
  - apps/ch-life/src/browser/books-meta.ts
verified_by:
  - test: apps/ch-life/src/data/__tests__/bible-data.test.ts
  - test: apps/ch-life/src/browser/__tests__/books-meta.test.ts
confidence: 기록됨
source:
  - apps/ch-life/app/licenses.tsx
  - docs/legal/privacy-policy.md 7장
```

## 형식

```jsonc
{
  "Gen": { "1": { "1": "태초에 하나님이 천지를 창조하시니라.", "2": "…" } },
  "Col": { "3": { "20": "자녀들아 모든 일에 부모에게 순종하라" } }
}
```

- 최상위 키는 66개 `BookCode` (`book-map.ts`의 유니온과 일치해야 한다).
- 장·절 키는 **숫자가 아니라 문자열**이다.
- 조회는 `DATA[book]?.[String(ch)]?.[String(v)]` — O(1), 네트워크 없음.
- 파일 크기 약 5MB. 앱 시작 시 `import`로 메모리에 상주하며 해제되지 않는다. 저사양 안드로이드에서 이 상주 비용은 측정된 적이 없다.

## 파생 데이터

`books-meta.ts`가 책 순서·한국어 이름·구약/신약 구분을 갖고, 장 수와 절 수는 이 JSON에서 계산한다. 하드코딩된 장·절 개수는 없다.

## 라이선스 의무

CC BY-SA 4.0은 공공도메인이 아니다.

- **BY**: 출처를 표시해야 한다 → 설정 → "출처 및 라이선스" 화면(`app/licenses.tsx`)이 그 이행이다.
- **SA**: 본문을 포함해 재배포되는 산출물은 동일 라이선스를 유지해야 한다 → 앱이 내보내는 `.md` 파일에도 적용된다.

계획 문서(`DESIGN.md` P3)의 개역한글 1961(공공도메인)과 **다른 데이터**이며, 전환 근거는 기록되어 있지 않다([`ADR-0009`](../decisions/ADR-0009-bible-source.md)).

## 바꾸려면

번역본을 추가하거나 교체하려면 라이선스 검토가 먼저다(현재 데이터의 SA 조건 때문에 다른 번역본과 한 파일로 섞을 수 없다). 자료 구조상 번역본 축이 없으므로 `Verse`·조회 함수·마크다운 `(KRV)` 표식까지 함께 설계해야 한다.
