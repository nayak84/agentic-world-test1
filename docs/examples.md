# 도메인별 시작 예시

여러분의 업무에서 **주인공 Entity(Work)** 와 **가장 중요한 규칙 하나**를 찾는 것이 시작입니다.
아래는 출발점일 뿐 정답이 아닙니다 — 여러분의 업무에 맞게 결정하고, 그 이유를 `assignment/`에 기록하세요.

| 도메인 | 주인공 후보 | 상태 흐름 예 | 핵심 규칙 후보 |
|---|---|---|---|
| Procurement | PurchaseRequest | draft→submitted→approved→ordered→closed | 금액별 승인 단계 |
| Sourcing / Contract | Contract | draft→legal_review→approved→signed | 법무 검토 없는 서명 금지 |
| Sales / CRM | Deal | lead→qualified→proposal→won/lost | 할인율 한도 |
| Trading | Order | proposed→approved→executed→settled | 위험 한도 초과 주문 금지 |
| Support | Ticket | open→triaged→in_progress→resolved | SLA 초과 시 에스컬레이션 |
| PM / Requirement | Requirement | proposed→accepted→in_progress→delivered | 승인 없는 범위 변경 금지 |

각 칸은 **여러분이 검토할 후보**입니다. 예를 들어 "승인"은 State일 수도, Transition일 수도,
별도 Entity일 수도 있습니다 — 그 결정이 바로 `assignment/modeling-decisions.md`의 과제입니다.
