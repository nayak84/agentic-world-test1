# 시나리오와 desk-check

시나리오 하나 = **누가, 어떤 레코드에, 어떤 Transition을 시도하는가** + **여러분이 예측한 판정과 이유**.

이 저장소에는 실행 엔진이 없습니다. 여러분은 `world.yaml`을 보며 판정을 **손으로 확인(desk-check)** 합니다.
리뷰에서는 강사가 같은 시나리오를 Superwork Studio의 실제 Runtime으로 실행해 여러분의 예측과 비교합니다.

## 형식

```yaml
scenario:
  name: submit-happy-path          # 짧은 이름
  kind: happy-path                 # happy-path | adversarial
  record: R-1001                   # seed.yaml의 레코드 id — 그 레코드의 status가 시작 상태입니다
  protects: ""                     # (adversarial) 지키려는 안전 속성
  steps:
    - input: "Submit request R-1001."   # 자연어로 쓴 행동 (설명용)
      as: alex                          # 행위자 — principals의 id
      transition: submit                # 시도하는 transition 이름
      expect: ALLOW                     # 여러분의 예측: ALLOW 또는 DENY
      because: >                        # 예측의 이유 (아래 desk-check 순서대로)
        R-1001 is draft = submit.from. alex has role employee = submit.principal_role.
        C1_requester_only: principal.id (alex) == request.requester (alex) → true.
```

시작 상태가 다른 레코드가 필요하면 `seed.yaml`에 레코드를 추가하세요 (예: `status: submitted`인 R-2001).

> **중요:** 리뷰에서 강사는 `record` · `as` · `transition` 세 값 그대로 실제 Runtime에서 시나리오를 재현합니다.
> 이 세 값은 `seed.yaml`의 레코드 id, `world.yaml`의 principal id, transition 이름과 **정확히 같아야** 합니다.

## desk-check 순서

한 step을 판정할 때 `world.yaml`에서 순서대로 확인하세요. 하나라도 실패하면 **DENY**, 모두 통과하면 **ALLOW**.

1. **상태** — 레코드의 현재 상태가 transition의 `from`과 같은가?
2. **역할** — 행위자(`as`)의 `roles`에 transition의 `principal_role`이 있는가?
3. **Guard** — transition의 `guards`에 있는 각 constraint의 `expr`이 이 레코드 · 이 행위자에 대해 참인가?
   (`principal`은 행위자, `<주인공 entity 소문자>`는 대상 레코드 — 예: `request.amount`)
4. **Global** — `scope: global`인 constraint가 있다면 그것도 참인가?

DENY라면 **어느 단계의 무엇이** 막았는지(예: `C3_no_self_approval`)를 `because`에 쓰세요.

## 예측이 틀리면?

리뷰에서 실제 결과가 예측과 다르면, 그 차이가 가장 좋은 학습 재료입니다.
예측을 고치지 말고 그대로 두세요 — 리뷰에서 함께 봅니다.
