# POL-LICENSE — 본문 저작권을 지킨다

## POL-LICENSE-001 · 성경 본문의 출처와 라이선스

```yaml
id: POL-LICENSE-001
requirement: MUST
statement: 앱에 포함된 성경 본문은 Open Bible 한국어판이며 CC BY-SA 4.0을 따른다. 출처와 라이선스를 앱 안에서 확인할 수 있어야 하고, 재배포되는 본문은 동일 라이선스를 유지한다.
confidence: 기록됨
waiver: 법적 고지 의무. 화면 표시 여부를 검증할 UI 테스트 수단이 없어 릴리스 전 수동 확인으로 대신한다.
source:
  - apps/ch-life/app/licenses.tsx
  - docs/legal/privacy-policy.md 7장
  - README.md 라이선스 절
verified_by:
  - manual: 설정 → 출처 및 라이선스 화면에 출처·라이선스 링크가 보인다
```

저작권 안전은 처음부터 명시된 제약이었다(`DESIGN.md` "Constraints" — 공공도메인 텍스트만 사용, 추후 오픈소스 가능성 유지). 다만 **최종 채택된 데이터는 계획했던 개역한글 1961이 아니라 Open Bible 한국어판(CC BY-SA 4.0)** 이다. 이 전환의 이유는 기록되어 있지 않다([`ADR-0009`](../decisions/ADR-0009-bible-source.md)).

CC BY-SA는 공공도메인과 다르다. **SA(동일조건변경허락)** 때문에, 본문을 수정해 재배포하는 산출물도 같은 라이선스를 유지해야 한다. 앱이 내보내는 `.md` 파일에 본문이 포함되므로 이 조건은 export 산출물에도 적용된다.

하위 규칙: [`CONTRACT-BIBLE-JSON`](../contracts/CONTRACT-BIBLE-JSON.md)
