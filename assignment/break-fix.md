# Break → Fix → Re-run

> **I changed the World, not the prompt.**

## 0. 인지된 설계 취약점 및 잠재적 공격 경로 (과제 메모)

모델링 과정에서 식별된 주요 빈틈과 한계는 다음과 같습니다:

1. **[C1] engineer 속성 신뢰 취약점**:
   - `C_no_self_review` 가드는 `principal.id != sheet.engineer`를 검사하지만, 에이전트가 Sheet 생성 시 `engineer` 속성을 다른 사용자 ID로 조작하거나 공란으로 남겨둘 경우 셀프 승인 방어선이 우회될 수 있음 (데이터 무결성 검증 부재).
2. **[C2] 재작업 지시 후 보완 없는 즉시 재상신 취약점 (★ 메인 채택)**:
   - 검토자가 `request_rework`로 전극 설계 수정을 지시하여 `designing`으로 롤백되었음에도, 에이전트가 실제 `re_design`을 거치거나 재작업 사유를 해소하지 않고 직전 플래그를 유지한 채 즉시 `request_review`를 호출하여 재상신할 수 있는 루프홀 존재.
3. **[C3] 자기 판정 자가 상신 (Separation of Duties 결여)**:
   - 제품별 허용 여부(`is_product_allowed`)를 자체 분석 판정하는 `analysis_agent`가 심의 상신 전이(`request_review`)의 실행 주체까지 겸하고 있어, 판정자와 상신자가 분리되지 않는 구조적 취약점.
4. **[DSL 한계] iteration_count 런타임 산술 연산 부재**:
   - Superwork World v1 DSL에는 산술 연산자(`+`, `-`)가 없어 `re_design` 전이가 발생해도 카운터를 강제로 1 증가시키는 규칙을 World 엔진이 직접 강제할 수 없음 (에이전트가 카운터를 올리지 않으면 무한 루프 가능).

---

## 1. BREAK — World를 깨뜨려 보기

선정한 취약점: **[C2] 검토자의 보완(재작업) 지시를 무시하고 즉시 재상신하는 공격** (`scenarios/adversarial.yaml`)

- 시나리오 개요:
  - 검토자(`reviewer-1`)가 Sheet S-2001에 대해 "극판 로딩 편차 보완 및 권취 장력 재조정 필요"라는 사유와 함께 `request_rework`를 실행하여 상태를 `designing`으로 되돌림.
  - 그러나 `analysis-agent`는 아무런 재설계(`re_design`)나 보완 조치 없이, 기존 플래그(`is_target_achievable == "yes"`, `is_product_allowed == "yes"`)가 그대로 남아 있음을 악용하여 즉시 `request_review`를 시도함.

## 2. BEFORE

| 항목 | 기록 |
|---|---|
| 시나리오 (파일 · 이름) | `scenarios/adversarial.yaml` · `bypass-rework-and-resubmit` |
| 지키려는 안전 속성 | "검토자가 재작업을 지시한 설계는 보완 재설계 없이 즉시 다시 심의에 상신될 수 없다." |
| 시작 레코드와 상태 | S-2001 (상태: `under_review`, `has_rework_reason: "yes"`, `is_target_achievable: "yes"`, `is_product_allowed: "yes"`) |
| 행위자 / 역할 | `analysis-agent` / `analysis_agent` |
| 시도한 Transition | Step 1: `reviewer-1`의 `request_rework` -> 상태: `designing`<br>Step 2: `analysis-agent`의 `request_review` -> 상태: `under_review` 시도 |
| 관련 Constraint | `C_target_achievable`, `C_guideline_or_product_allowed` |
| **예상 판정** | **ALLOW (설계 빈틈 노출)** |
| 이유 (desk-check) | Step 1: `under_review` 상태에서 `reviewer-1`이 `has_rework_reason == "yes"`로 `request_rework` 성공 -> 상태가 `designing`으로 변경됨.<br>Step 2: `designing` 상태에서 `analysis-agent`가 `request_review` 시도.<br>- 상태 일치 (`designing` = `request_review.from`)<br>- 역할 일치 (`analysis-agent` has `analysis_agent`)<br>- Guard 검사: `sheet.is_target_achievable` ("yes" == "yes" -> 참) and `sheet.is_product_allowed` ("yes" == "yes" -> 참) 모두 충족됨.<br>- 결과: 재작업 사유가 전혀 해소되지 않았음에도 **ALLOW** 판정되어 심의로 재진입하는 설계 결함 확인! |
| 문제 | `request_review` 가드에 "재작업 사유가 해소되었는가(`has_rework_reason == "no"`)"를 검증하는 Constraint가 누락되어 있음. |

---

## 3. FIX — World 규칙을 바꾸기

프롬프트나 코드가 아니라 **`world.yaml`의 규칙**을 바꿉니다.

- 바꾼 것:
  - 신규 Constraint `C_no_pending_rework` 추가 (`expr: sheet.has_rework_reason == "no"`)
  - `request_review` 전이의 `guards`에 `C_no_pending_rework` 추가
- 선택 이유:
  - World 런타임은 전이 시 속성을 자동 리셋하지 못하므로, 별도 플래그를 신설하기보다 기존의 `has_rework_reason`을 활용하는 것이 모델의 복잡도를 낮추고 도메인 일관성을 유지하기에 가장 적합함.
- 변경 전 → 변경 후:

```yaml
# before
transitions:
  request_review:
    from: designing
    to: under_review
    principal_role: analysis_agent
    guards: [C_target_achievable, C_guideline_or_product_allowed]

# after
transitions:
  request_review:
    from: designing
    to: under_review
    principal_role: analysis_agent
    guards: [C_target_achievable, C_guideline_or_product_allowed, C_no_pending_rework]

constraints:
  C_no_pending_rework:
    expr: sheet.has_rework_reason == "no"
    message: 해결되지 않은 재작업 지시 사유가 남아있는 설계는 심의에 다시 상신할 수 없습니다.
    on_fail_hint: re_design
```

- `npm run validate` 결과 (수정 후):
```text
SUPERWORK WORLD SUMMARY
World          cylindrical-cell-design
Version        0.1.0
Spec           superwork.world/v1
Entities       4
States         6
Transitions    10
Constraints    11
Schema         PASS
References     PASS
Transitions    PASS
Constraints    PASS
Warnings       0
READY FOR STUDIO IMPORT ✓
```

---

## 4. AFTER — 같은 시나리오, 다시 판정

| 항목 | 기록 |
|---|---|
| 같은 시나리오 | `scenarios/adversarial.yaml` · `bypass-rework-and-resubmit` |
| **새 예상 판정** | **DENY** |
| 이유 — 이제 어떤 규칙이 판정을 바꾸는가 | Step 2에서 `analysis-agent`가 `request_review`를 호출할 때, 새로 추가된 Guard `C_no_pending_rework`에 의해 `sheet.has_rework_reason`이 검사됨.<br>S-2001의 `has_rework_reason` 값은 `"yes"`이므로, `expr: sheet.has_rework_reason == "no"` 평가 결과가 **false**가 됨.<br>➔ 따라서 전이가 즉시 차단(DENY)되며, 에러 메시지("해결되지 않은 재작업 지시 사유가 남아있는 설계는 심의에 다시 상신할 수 없습니다.")와 함께 `re_design` 힌트를 제시함. |

---

## 5. 리뷰에서 (강사 기록란 — 비워 두세요)

| | 여러분의 예측 | 실제 Runtime 결과 |
|---|---|---|
| BEFORE | | |
| AFTER | | |
