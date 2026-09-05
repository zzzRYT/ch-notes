# ADR-0009 · 성경 본문 출처를 Open Bible 한국어판(CC BY-SA 4.0)으로

```yaml
id: ADR-0009
status: accepted
supersedes: DESIGN.md Premises P3 (개역한글 1961, 공공도메인)
statement: 번들되는 성경 본문은 개역한글 1961이 아니라 Open Bible 한국어판이며, 라이선스는 공공도메인이 아니라 CC BY-SA 4.0이다.
confidence: 확인필요
source:
  - apps/ch-life/app/licenses.tsx (openbible.uk, CC BY-SA 4.0)
  - docs/legal/privacy-policy.md 7장
  - README.md 라이선스 절
```

## 맥락

계획은 명확했다. `DESIGN.md` P3 — 개역한글 1961(2012년 저작권 만료, **공공도메인**)을 `bible.mearie.org` 또는 `getbible.net`에서 받아 번들. Week 0 de-risk 항목 B는 "라이선스 검증 결과를 디자인 doc에 한 줄 추가"였다.

**그 한 줄은 추가되지 않았다.** 대신 앱에는 Open Bible 한국어판이 들어가 있고, 라이선스 화면·개인정보처리방침·README가 모두 CC BY-SA 4.0을 고지한다.

## 결정

Open Bible 한국어판을 쓰고 CC BY-SA 4.0을 고지한다.

## 이유

**기록되어 있지 않다.** Week 0 검증 결과가 남지 않아, 원 계획 소스가 라이선스 명시를 하지 않아 갈아탔는지 다른 이유인지 알 수 없다. [`drift.md`](../drift.md) E절의 확인 질문.

## 귀결

- **공공도메인이 아니다.** SA 조항 때문에 본문을 포함해 재배포되는 산출물은 동일 라이선스를 유지해야 한다. 앱이 내보내는 `.md` 파일도 여기 해당한다.
- BY 조항 이행으로 앱 안에 출처·라이선스 화면이 필요하다(`app/licenses.tsx`).
- 다른 번역본을 섞어 넣기 어렵다. 라이선스가 다른 텍스트를 같은 파일에 합치면 조건이 충돌한다.
- 마크다운 인용 표식이 `(KRV)`로 굳어 있어 **데이터를 잘못 이름 붙이고 있다.** 호환성 때문에 바꾸지 못한다([`RULE-MD-003`](../rules/share-markdown.md)).
- `DESIGN.md`의 P3는 지금 사실이 아니지만, 역사 기록이므로 수정하지 않는다.
