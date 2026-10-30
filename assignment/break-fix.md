# Break → Fix → Re-run

> **I changed the World, not the prompt.**

## 1. BREAK — World를 깨뜨려 보기

여러분의 World가 막아야 하는 일을 하나 골라, 그 일이 **일어나도록** 시도하는 시나리오를 씁니다.
(`../scenarios/adversarial.yaml`)

공격 유형 예시:

- 권한 없는 행위자 — 그 역할이 없는 사람이 행동한다
- 셀프 승인 — 요청한 사람이 스스로 승인한다
- 잘못된 상태에서의 전이 — 아직 도달하지 않은 상태에서 행동한다
- 한도 초과 — 금액 · 수량이 정책 한도를 넘는다
- 선행 조건 누락 — 필요한 단계(검토 등)를 건너뛴다
- 중복 행동 / 중복 효과 — 같은 행동이나 외부 효과가 두 번 일어난다

## 2. BEFORE

| 항목 | 기록 |
|---|---|
| 시나리오 (파일 · 이름) | |
| 지키려는 안전 속성 | 예: "누구도 자신의 요청을 승인할 수 없다" |
| 시작 레코드와 상태 | |
| 행위자 / 역할 | |
| 시도한 Transition | |
| 관련 Constraint | |
| **예상 판정** | ALLOW / DENY |
| 이유 (desk-check) | |
| 문제 | ALLOW라면: 어떤 규칙이 빠져 있었나? · DENY라면: 어떤 규칙이 막았나? |

## 3. FIX — World 규칙을 바꾸기

프롬프트나 코드가 아니라 **`world.yaml`의 규칙**을 바꿉니다.

- 바꾼 것: (새 Constraint · Transition에 guard 추가 · 역할 변경 · 상태/전이 수정 …)
- 변경 전 → 변경 후 (해당 부분만 붙여 넣기):

```yaml
# before

# after
```

- `npm run validate` 결과 (수정 후) → `../evidence/`에 저장

## 4. AFTER — 같은 시나리오, 다시 판정

| 항목 | 기록 |
|---|---|
| 같은 시나리오 | |
| **새 예상 판정** | ALLOW / DENY |
| 이유 — 이제 어떤 규칙이 판정을 바꾸는가 | |

## 5. 리뷰에서 (강사 기록란 — 비워 두세요)

| | 여러분의 예측 | 실제 Runtime 결과 |
|---|---|---|
| BEFORE | | |
| AFTER | | |

---

## 예시 (작성 방법 참고용)

구매 요청 World에서 `approve`(submitted → approved, 역할 manager)에 금액 한도 `C2_amount_limit`만 있었습니다.
Alex는 employee이면서 manager입니다.

- **BEFORE** — Alex가 자신이 제출한 R-2001(submitted, 1,200)을 approve.
  상태 일치(submitted) · 역할 일치(manager) · C2(1,200 ≤ 5,000) 통과 → **예상 ALLOW**.
  문제: 요청자와 승인자가 같은지 확인하는 규칙이 없다.
- **FIX** — 새 Constraint를 추가하고 `approve`의 guard에 붙였다.

  ```yaml
  constraints:
    C3_no_self_approval:
      expr: principal.id != request.requester
      message: Nobody can approve their own request.
  transitions:
    approve:
      guards: [C2_amount_limit, C3_no_self_approval]
  ```

- **AFTER** — 같은 시나리오. C3에서 `alex != alex`가 거짓 → **예상 DENY (C3_no_self_approval)**.

수정 전 World도 `npm run validate`를 통과했다는 점에 주목하세요 — **valid한 World도 안전하지 않을 수 있습니다.**
