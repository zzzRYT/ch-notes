# POL-LICENSE — 본문 저작권을 지킨다

## POL-LICENSE-001 · 성경 본문의 출처와 라이선스

```yaml
id: POL-LICENSE-001
requirement: MUST
statement: 앱에 포함된 성경 본문은 Open Bible 한국어판이며 CC BY-SA 4.0을 따른다. 출처와 라이선스를 앱 안에서 확인할 수 있어야 하고, 재배포되는 본문은 동일 라이선스를 유지한다.
confidence: 기록됨
waiver: 법적 고지 의무. 화면 표시 여부를 검증할 UI 테스트 수단이 없어 릴리스 전 수동 확인으로 대신한다.
source:
  - apps/ch-life/src/pages/licenses/ui/LicensesPage.tsx
  - docs/legal/privacy-policy.md 7장
  - README.md 라이선스 절
verified_by:
  - manual: 설정 → 출처 및 라이선스 화면에 출처·라이선스 링크가 보인다
```

저작권 안전은 처음부터 명시된 제약이었다(`DESIGN.md` "Constraints" — 공공도메인 텍스트만 사용, 추후 오픈소스 가능성 유지). 다만 **최종 채택된 데이터는 계획했던 개역한글 1961이 아니라 Open Bible 한국어판(CC BY-SA 4.0)** 이다. 이 전환의 이유는 기록되어 있지 않다([`ADR-0009`](../decisions/ADR-0009-bible-source.md)).

CC BY-SA는 공공도메인과 다르다. **SA(동일조건변경허락)** 때문에, 본문을 수정해 재배포하는 산출물도 같은 라이선스를 유지해야 한다. 앱이 내보내는 `.md` 파일에 본문이 포함되므로 이 조건은 export 산출물에도 적용된다.

하위 규칙: [`CONTRACT-BIBLE-JSON`](../contracts/CONTRACT-BIBLE-JSON.md)

## POL-LICENSE-002 · 말씀 지도 데이터의 출처와 이용 조건

```yaml
id: POL-LICENSE-002
requirement: MUST
statement: 말씀 지도가 번들한 장소 위치(OpenBible.info 성경 지리 데이터, CC BY 4.0)와 지형(Natural Earth, 공개 영역)의 출처·이용 조건·수정 내역을 앱 안에서 오프라인으로 확인할 수 있어야 한다. 성경 본문의 CC BY-SA 고지는 그대로 유지한다. 지도 위치는 참고 정보이며 정확한 사건 지점을 보증하지 않는다고 알린다.
confidence: 코드추론
waiver: 법적 고지 의무. 화면 표시 여부를 검증할 UI 테스트 수단이 없어 릴리스 전 수동 확인으로 대신한다. 장소 출처 문자열의 이용 조건 표기는 `map-data.test.ts`가 자동 검증한다.
source:
  - apps/ch-life/src/pages/licenses/ui/LicensesPage.tsx
  - apps/ch-life/src/features/scripture/map/api/places.json
verified_by:
  - test: apps/ch-life/src/features/scripture/map/model/__tests__/map-data.test.ts
  - manual: 설정 → 출처 및 라이선스 화면에 말씀 지도 절(출처·링크·수정 내역·수록 장소)이 보인다
```

CC BY 4.0은 SA와 달리 **동일 조건 승계를 요구하지 않는다** — 출처 표시·라이선스 링크·변경 사실 표시가 의무다. OpenBible의 사진과 OSM 도형은 가져오지 않았다. 하위 규칙: [`RULE-MAP-007`](../rules/scripture-map.md)
