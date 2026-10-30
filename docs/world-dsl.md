# Superwork World DSL — v1 레퍼런스 (superwork.world/v1)

`npx superwork explain <topic>`으로 터미널에서도 조회할 수 있습니다.

## 파일 구조

```yaml
world:          # id, version(여러분 세계의 버전), spec(언어 버전 — 고정), mission
entities:       # 존재하는 것들
states:         # 엔티티별 상태 목록
terminal_states:# 최종 사실 — 나가는 transition 금지
transitions:    # 허용된 변화 (from/to/principal_role/guards/effects)
constraints:    # 규칙 — expr/message/scope/on_fail_hint
principals:     # 행위 주체 — id/name/roles/manager
```

## 표현식 언어

| 범주 | 문법 |
|---|---|
| 비교 | `==` `!=` `<=` `>=` `<` `>` `in` |
| 논리 | `and` `or` `not` |
| 경로 | `principal.id` · `request.requester.manager` (자동 역참조) |
| 배열 | `["closed", "rejected"]` (`in`과 함께) |
| 함수 | `remaining(budget)` · `no_payment_attempt_with_key(id, key)` — 이 2개뿐 |

산술 연산자는 없습니다. 예산 잔액은 `remaining(budget)`.

흔한 교정: `<==`→`<=` · `&&`→`and` · `||`→`or` · `=`→`==`

## 자주 쓰는 패턴

```yaml
# 셀프 승인 금지
expr: principal.id != request.requester

# 요청자의 매니저만
expr: principal.id == request.requester.manager

# 금액 한도 + 대안 경로
expr: request.amount <= 5000
on_fail_hint: escalate

# 예산 확인
expr: remaining(budget) >= request.amount

# terminal 불변성 (global)
expr: not (request.status in ["closed", "rejected"])
scope: global
```
