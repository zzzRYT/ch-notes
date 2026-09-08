# CH Life Domain

CH Life는 설교를 들으며 성경 본문을 빠르게 인용하고 노트로 보존하는 로컬 우선 앱이다. 노트 기록과 성경 탐색은 서로 연결되지만 각각 독립된 도메인으로 다룬다.

## Language

**Note (노트)**:
사용자가 작성한 제목, 본문 블록, 설교 메타데이터와 인용 스냅샷을 함께 보존하는 기록이다.
_Avoid_: Document, memo

**Scripture (성경)**:
책, 장, 절과 참조 체계로 탐색하고 읽을 수 있는 성경 본문이다. 노트에 종속되지 않고 독립적으로 읽는 대상이다.
_Avoid_: Bible data, verse database

**Scripture Edition (성경 판본)**:
고유한 식별자와 표시 이름을 가진 특정 성경 본문의 출처 및 번역 판본이다.
_Avoid_: Bible file, dataset version

**Citation Snapshot (인용 스냅샷)**:
노트에 삽입할 때 선택한 성경 판본, 정규화된 참조와 구절 본문을 고정한 기록이다. 새로운 판본이 추가되거나 원본 자료가 바뀌어도 자동으로 달라지지 않는다.
_Avoid_: Live verse reference, scripture link
