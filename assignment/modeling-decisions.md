# 애매한 모델링 결정

좋은 모델러는 애매함이 없는 사람이 아니라, **애매함을 알아채고 다룰 줄 아는 사람**입니다.
하나의 개념을 여러 방식으로 모델링할 수 있을 때, 그 대안을 비교하고 선택하세요.

최소 요건: **2개 이상.**

## 후보 예시

| 개념 | 가능한 모델링 |
|---|---|
| 승인 (Approval) | State(승인됨) · Transition(승인하다) · 별도 Entity(승인 기록) |
| 위험 평가 (Risk Assessment) | 별도 Entity · Attribute(위험 점수) |
| 취약점 (Weak Point) | Entity · Attribute · 파생 State |
| 법무 검토 (Legal Review) | State(검토 중) · 별도 Work(따로 시작할 수 있는 일) |

---

## 결정 1: 거절(Rejection)의 모델링 방식 (재작업 지시 vs 영구 폐기)

- **개념**: 설계 검토자(사람 심의자)의 거절 및 반려 처리
- **가능한 대안**:
  - **대안 A (단일 롤백 전이)**: `reject` 전이 하나만 두고 항상 `under_review -> designing`으로 롤백 처리. `rejected` 상태 미존재.
  - **대안 B (단일 종결 상태)**: `reject` 전이 발생 시 항상 `under_review -> rejected` (Terminal)로 종결. 거절 시 해당 시트는 영구 종료되고 재설계 불가.
  - **대안 C (이원화 분리 - 최종 선택)**: 일시적 보완 지시인 `request_rework` (`under_review -> designing`)와 회복 불가능한 영구 중단인 `abandon` (`under_review -> abandoned`, Terminal)으로 분리.
- **최종 선택**: **대안 C**
- **이유**:
  - 실제 배터리 설계 업무에서 검토자의 '거절'은 두 가지로 나뉩니다. "로딩 편차나 권취 장력을 재조정하라"는 보완 피드백(재작업 롤백)과 "셀 치수 및 원가 타당성 부족으로 프로젝트 자체를 드랍한다"는 영구 폐기가 혼재합니다.
  - 단일 전이나 단일 상태로 묶으면 단순 재작업 시트와 영구 실패 시트가 뒤섞여 감사 추적이 왜곡되므로, 행위의 목적과 귀결 상태를 분리하는 것이 안전합니다.
- **ESTC에 미친 영향**:
  - **State**: `abandoned`를 Terminal 상태로 확정.
  - **Transition**: `request_rework` (to: designing)와 `abandon` (to: abandoned) 2개로 분리.
  - **Constraint**: `C_require_rework_reason`, `C_require_abandon_reason`으로 각각 사유 입력을 강제.

---

## 결정 2: 설계가이드 반복 점검의 모델링 방식 (State vs Guard & Loop)

- **개념**: 상세 설계 후 목표 특성 및 가이드 기준을 만족할 때까지 반복 계산하는 점검 흐름
- **가능한 대안**:
  - **대안 A (세부 State 분리)**: `designing` -> `target_checked` -> `guideline_checked` 등 점검 단계마다 명시적인 State를 두어 전이.
  - **대안 B (Self-loop 전이 및 Guard 플래그 통제 - 최종 선택)**: 설계 작업 상태를 단일 `designing`으로 유지하고, `re_design` self-loop (`designing -> designing`)와 판단 플래그 속성(`is_target_achievable`, `is_guideline_satisfied`, `iteration_count`)에 대한 Guard로 제어.
- **최종 선택**: **대안 B**
- **이유**:
  - AI 에이전트의 전극/공간 연산과 점검은 수 초 내에 반복되는 마이크로 피드백 루프입니다. 이를 일일이 공식 State로 잘게 쪼개면 상태기계가 비대해지고 모델의 가독성이 급격히 떨어집니다.
  - 대신 Sheet의 단일 `designing` 상태 안에서 `iteration_count < max_iterations` 및 목표 달성 플래그를 Guard로 엄격히 검증하여 루프 탈출 조건(`request_review` 또는 `fail_design`)을 명확히 하는 것이 간결하고 안정적입니다.
- **ESTC에 미친 영향**:
  - **State**: 상태 수를 6개(`drafting, designing, under_review, revision_pending, approved, abandoned`)로 간결하게 압축.
  - **Transition**: `re_design` (self-loop), `rollback_to_spec` (drafting으로 복귀), `fail_design` (abandoned로 직행) 구성.
  - **Constraint**: `C_within_iteration_limit`, `C_iterations_exhausted`, `C_target_achievable` 선언.

---

## 결정 3: 승인 및 설계가이드 개정(사고 사례 5번 방어)의 모델링 방식

- **개념**: 검토자의 심의 결과에 따른 설계가이드 DB 개정 반영 통제 (사고 사례 5번 무단 가이드 오염 방지)
- **가능한 대안**:
  - **대안 A (단순 이벤트 발행 위임)**: 검토자의 `approve` 전이 시 `effects`에만 표시하고 DB 갱신은 런타임 외부 비동기 처리에 맡김.
  - **대안 B (중간 상태 `revision_pending` 및 후속 전이 강제 - 최종 선택)**: 검토자의 개정 인가 시 `revision_pending` 상태로 전이하고, `guideline_db_agent`가 `apply_guideline_revision` 전이를 수행해야만 최종 `approved`로 전이되도록 강제.
  - **대안 C (속성 플래그 숨김)**: approve 전이 속성에 `guideline_revision: "yes"` 플래그만 세우고 상태 전이는 일반 승인과 동일하게 처리.
- **최종 선택**: **대안 B**
- **이유**:
  - 대안 A는 에이전트가 검토자 인가 없이 가이드 DB를 임의 변경하는 것을 런타임 규칙으로 막을 수 없으며, 대안 C는 개정 실행 여부가 데이터 속성 뒤로 숨어 투명한 감사가 불가능합니다.
  - 대안 B는 검토자의 공식 개정 인가(`approve_with_revision`)를 거쳐야만 `revision_pending` 상태에 진입하도록 강제하고, 해당 상태에서만 `guideline_db_agent`의 개정 반영 전이(`apply_guideline_revision`)가 허용되도록 Guard를 결합하여 임의의 가이드 변경을 원천 차단합니다.
  - 단, 본 통제 범위는 **"본 World(런타임)를 경유하는 가이드 변경 경로에 한하여 에이전트의 임의 수정을 100% 차단(DENY)하며, World 외부 직접 DB 접근은 런타임 관할 밖(Out of Scope)으로 명시"**합니다.
- **ESTC에 미친 영향**:
  - **State**: `revision_pending` 상태 추가.
  - **Transition**: `approve_with_revision` (reviewer 권한), `apply_guideline_revision` (guideline_db_agent 권한) 2단계 구조화.
  - **Constraint**: `C_require_revision_proposal` (`has_revision_proposal == "yes"`) 가드 연동.
