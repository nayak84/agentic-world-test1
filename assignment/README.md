# 과제 — Bootcamp Homework

실제 업무 하나를 World로 모델링하고, 정상 시나리오와 공격 시나리오로 시험하고,
빈틈을 World 규칙으로 고친 뒤, 그 과정을 기록합니다.

평가는 "정답 World"가 아니라 **여러분이 모델링을 이해하고 스스로 결정했는가**를 봅니다.
작고 정확한 World가 크고 흐릿한 World보다 낫습니다.

**제출 마감:** `<강사가 안내합니다>` — 제출 방법과 체크리스트는 [`../README.ko.md`](../README.ko.md#5-제출) (English: [`../README.md`](../README.md#5-submit))

**제출 방법:** `npm run package`로 만든 ZIP(`submission/<world-id>-<version>-submission.zip`)을 강사가 안내하는 제출 링크로 보냅니다.
GitHub 공개 저장소, 강사 collaborator 초대, Superwork 로그인이나 Studio 접근은 필요하지 않습니다.
제출 시 동의 사항(리뷰를 위한 사용, 그리고 참가자 · 소속 회사 · 고객 · 개인을 합리적으로 특정할 수 없게 익명화 · 일반화된 학습 내용의 활용)은 [`../README.ko.md`](../README.ko.md#5-제출)와 [`../LICENSE`](../LICENSE) 7조를 확인하세요.

> **⚠️ 민감정보 주의**
> 실제 업무를 모델링해도 좋지만 회사 기밀, 고객 개인정보, API Key, 계정정보, 내부 시스템 주소 등 민감정보를 저장소에 올리지 마세요.
> 회사명·고객명·사람 이름·금액·식별정보 등은 필요하면 익명화하거나 예시 데이터로 바꾸세요.
> 비밀값(secret)이나 계정 정보(credential)는 커밋하지 말고, 공유 권한이 없는 회사 문서는 포함하지 마세요.
> ZIP으로 제출하더라도 공유 권한이 없는 정보를 넣어도 된다는 뜻은 아닙니다.

## 제출물 (최소 요건)

| # | 제출물 | 위치 | 최소 요건 |
|---|---|---|---|
| 1 | World | `world.yaml` | `npm run validate` 통과. 상태기계를 갖는 Entity(`owned_state: true`) 1개로 시작 |
| 2 | World Model이 필요한 이유 | `world-fit.md` | 3–6문장 |
| 3 | Entity 결정 | `entity-decisions.md` | 최종 Entity 3개 이상 · Entity가 아닌 개념 2개 이상 · 각각 이유 |
| 4 | 애매한 모델링 결정 | `modeling-decisions.md` | 2개 이상 · 대안 · 최종 선택 · 이유 · ESTC 영향 |
| 5 | 정상 시나리오 | `../scenarios/happy-path.yaml` | 1개 · 예상 판정과 이유 |
| 6 | 공격 시나리오 | `../scenarios/adversarial.yaml` | 1개 · 지키려는 안전 속성 · 예상 판정과 이유 |
| 7 | 발견한 설계 빈틈 **또는** 이미 막혀 있던 실패 | `break-fix.md` | 1개 |
| 8 | 수정(FIX) | `world.yaml`, `break-fix.md` | 무엇을 어떤 규칙으로 바꿨는가 |
| 9 | 재판정(RE-RUN) | `break-fix.md`, `../evidence/` | 같은 시나리오 · 수정 후 validate 결과 · 새 예상 판정 |
| 10 | 회고 | `reflection.md` | 짧게 |

> 공격 시나리오가 처음부터 막혀 있었다면(DENY) 그것도 좋은 결과입니다 — 어떤 규칙이 막았는지 기록하세요.
> 단, FIX 단계를 위해 **빈틈 하나**는 찾아서 고쳐 보세요 (다른 공격 시나리오여도 됩니다).

## 진행 순서

1. `world-fit.md` — 무엇을 모델링할지, 왜 World Model이 필요한지
2. `entity-decisions.md` — 후보 개념을 나열하고 하나씩 분류
3. `world.yaml` — ESTC 선언 → `npm run validate`
4. `modeling-decisions.md` — 모델링 중 애매했던 결정 기록
5. `../seed.yaml` + `../scenarios/` — 시작 레코드와 시나리오 작성, desk-check
6. `break-fix.md` — BEFORE → FIX → AFTER
7. `reflection.md` → 제출 체크리스트(`../README.md`)

## 리뷰에서 일어나는 일

강사가 여러분의 저장소를 Superwork Studio로 가져와 여러분의 시나리오를 실제 Runtime으로 실행합니다.
여러분이 예측한 판정과 실제 판정을 비교하고, 다른 부분이 있으면 그 이유를 함께 봅니다 —
**예측이 틀린 것은 감점이 아니라 가장 좋은 학습 재료입니다.** 예측의 이유를 분명히 써 두세요.
