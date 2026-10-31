# Entity 결정 — 가장 중요한 과제

업무 설명에 등장하는 **후보 개념**을 모두 적고, 하나씩 **최종 분류**와 **이유**를 결정합니다.
AI가 제안할 수는 있지만, 분류를 결정하고 이유를 쓰는 사람은 여러분입니다.

## 분류

| 분류 | 뜻 | 예 |
|---|---|---|
| **Entity** | 고유한 정체성을 갖고 시간이 지나도 추적되는 것 | 계약, 주문, 학생 |
| **Role** | 행동하는 주체의 역할 | 요청자, 승인자, 트레이더 |
| **Attribute** | 어떤 Entity에 기록되는 값 | 금액, 마감일, 수량 |
| **State** | Entity가 흐름 속 어디에 있는가 | 제출됨, 승인됨, 체결됨 |
| **Transition** | 상태를 바꾸는 허용된 행동 | 제출, 승인, 서명 |
| **Constraint** | 행동을 허용하거나 막는 규칙 | 셀프 승인 금지, 금액 한도 |
| **Event / Effect** | 일어난 일, 또는 World 밖으로 나가는 효과 | 이메일 발송, 브로커 주문 전송 |
| **제외** | 이 World에 필요 없는 것 | |

## 결정 기록

최소 요건: 최종 **Entity 3개 이상**, Entity가 **아닌** 개념 **2개 이상** — 각각 이유 포함.

| 후보 개념 | 최종 분류 | 이유 (체크리스트 중 무엇이 결정적이었나) |
|---|---|---|
| **Sheet (설계 시트)** | Entity (Work Entity) | 고유한 작업 ID를 갖고 목표 입력부터 계산, 반복 점검, 심의, 보고서 발행까지 전체 생애주기 상태를 단독 소유하며 행동이 작용함 (`owned_state: true`). |
| **MaterialPart (소재·부품)** | Entity (Reference Entity) | 캔, 탑캡, 탭, 활물질 등 독립된 규격 식별자를 가지고 치수 계산 및 내부 공간 설계 시 지속 참조되는 마스터 데이터임. |
| **DesignGuideline (설계가이드)** | Entity (Reference Entity) | 안전성/성능 기준 항목별로 고유 식별자를 가지며, 심의 결과에 따라 지속적으로 버전이 개정되는 참조 기준임. |
| **CandidateCase (설계 후보군)** | Entity (Child Entity) | 설계 시트 내에서 계산되어 생성되는 개별 설계 케이스로 고유 식별자와 전극/공간 사양을 독립적으로 보유함. |
| **target_capacity / loading 등 치수·사양** | Attribute | 독립 식별자나 상태를 갖지 않고 Sheet나 CandidateCase에 귀속되어 측정 및 연산되는 수치 속성임. |
| **is_target_achievable / is_guideline_satisfied** | Attribute | 점검 통과 여부를 나타내는 판단 플래그 문자열("yes"/"no")로, Sheet의 속성으로 귀속되어 Guard 표현식이 직접 평가함. |
| **engineer / reviewer / 에이전트 4종** | Role | 업무 행위를 수행하는 주체의 역할이며, 상태를 갖는 독립 객체가 아니라 전이 권한(principal_role)을 규정하는 행위자 범주임. |
| **drafting / designing / under_review 등** | State | Sheet라는 작업 실체가 생애주기 흐름 속에서 현재 머무르고 있는 공식적인 상태 좌표임. |
| **submit_inputs / request_review / approve 등** | Transition | 상태 좌표를 실질적으로 변화시키는 허용된 행위임. |
| **검토 결과 DB 기록** | 제외 (Out of Scope) | World 런타임 자체의 Audit Trail 기능으로 자동 보장되므로 별도 모델링 대상에서 제외함. |

## 주인공 Entity

상태기계를 갖는 Entity(`owned_state: true`) 하나를 고르세요. 이 World의 **Work** 입니다.

- 주인공 Entity: Sheet (설계 시트)
- 왜 이것인가: 목표 사양 입력, AI 상세 설계 계산, 설계가이드 만족 점검 및 롤백 루프, 사람 검토자 심의, 최종 보고서 발행에 이르는 전 과정의 맥락과 라이프사이클을 단독으로 소유하고 추적하는 실체이기 때문입니다.
