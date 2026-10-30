# Superwork World Starter, Cohort 2 Edition

> **AI proposes. World decides. Runtime commits.** — AI는 제안하고, World가 판정하고, Runtime이 커밋합니다.

**Educational Use Only · Source-available · Not Open Source** — Copyright © 2026 Josh Lee. All rights reserved. ([라이선스](#라이선스와-소유권))

English: [README.md](README.md)

이 저장소에서 여러분은 **자신의 업무 하나를 World로 모델링**합니다. 무엇이 존재하는가(Entity), 어디에 있을 수 있는가(State),
무엇이 그것을 바꾸고 누가 할 수 있는가(Transition), 무엇이 절대 일어나면 안 되는가(Constraint)를 정하고,
스스로 깨뜨려 보고, World 규칙으로 고치고, 왜 그렇게 결정했는지 기록합니다.

- **필요한 것:** Node.js 20 이상, Git, GitHub 계정, 텍스트 편집기. AI 코딩 도구(Claude Code, Cursor, Copilot 등)는 선택입니다.
- **필요 없는 것:** Superwork 계정, 로그인, 초대, Superwork Studio 접근. **숙제 전체가 여러분의 컴퓨터에서 끝납니다.**
- **실행은 리뷰에서 합니다.** 이 키트는 World를 검증하고, 시나리오는 여러분이 손으로 판정(desk-check)합니다.
  1:1 리뷰에서 강사가 제출물을 Superwork Runtime으로 가져와 같은 시나리오를 실행하고, 여러분의 예측과 함께 비교합니다.

**제출 마감:** `<강사가 안내합니다>` · **제출 링크:** `<강사가 안내합니다>`

> **⚠️ 민감정보 주의.** 실제 업무를 모델링해도 좋지만 회사 기밀, 고객 개인정보, API Key, 계정정보, 내부 시스템 주소를
> 저장소에 넣지 마세요. 회사명 · 고객명 · 사람 이름 · 금액 · 식별정보는 익명화하거나 예시 데이터로 바꾸세요. ZIP 제출도 예외가 아닙니다.

---

## 0. 시작하기 (10분)

```bash
git clone https://github.com/swit001/superwork-starter.git my-world
cd my-world
npm install
npm run validate          # 템플릿 그대로 통과해야 정상입니다: "Your world has no issues. ✓"
```

실패하면 먼저 도구를 확인하세요: `node --version`(20 이상), `git --version`. [문제 해결](#7-문제-해결) 참고.

작업을 GitHub에 보관하려면 여러분 계정에 빈 저장소를 만들고 push 하세요
(`git remote set-url origin <여러분의 저장소 URL>` 후 `git push -u origin main`). 비공개 저장소여도 됩니다. 제출은 ZIP으로 합니다.

---

## 1. 명령어

| 명령 | 하는 일 |
|---|---|
| `npm run validate` | `world.yaml`이 `superwork.world/v1` 규격에 맞는지 검사하고, 어디가 왜 틀렸고 어떻게 고치는지 알려줍니다 |
| `npm run summary` | 같은 검사의 요약 (개수, 항목별 PASS) |
| `npm run explain -- <topic>` | 언어 도움말. 주제: `states`, `transitions`, `constraints`, `expressions` |
| `npm run export` | 정규화한 사본과 `summary.json`을 `dist/`에 씁니다 |
| `npm run evidence` | 요약을 `evidence/validate-summary.txt`로 저장합니다 |
| `npm run package` | 검증한 뒤 제출 ZIP을 `submission/`에 만듭니다 ([제출](#5-제출) 참고) |

도구는 공개 배포된 `@superwork/cli` 1.1.1과 `@superwork/world-spec` 1.1.1입니다(`package.json`에 고정).
요약의 마지막 줄 `READY FOR STUDIO IMPORT ✓`는 강사가 가져올 수 있는 형식이라는 뜻입니다. 여러분이 직접 가져올 것은 없습니다.

**validate가 확인하는 것:** `world.yaml`의 구조 · 참조 · transition · constraint 표현식.
**validate가 확인하지 않는 것:** 업무 규칙이 옳은지. 셀프 승인을 막는 규칙이 없어도 World는 valid입니다.
그래서 시나리오와 BREAK 단계가 있습니다.

---

## 2. Day 1: World Design

이 순서로 진행하세요. 단계마다 여러분의 생각을 적는 파일이 있습니다.

| 단계 | 질문 | 위치 |
|---|---|---|
| **Mission과 도메인** | 어떤 업무인가? 어떤 결과가 성공인가? 무엇이 범위 밖인가? | `world.yaml`의 `world.mission`, `assignment/world-fit.md` |
| **Ontology** | 이 업무에 어떤 개념이 있나? 무엇이 사물이고, 무엇이 사물에 대한 사실이고, 무엇이 단계인가? | `assignment/entity-decisions.md` |
| **Entity (E)** | 무엇을 추적하는가? 생애주기를 가진 핵심 Work Entity 하나를 고릅니다 | `entities:` |
| **State (S)** | 핵심 Entity는 어디에 있을 수 있나? 어떤 상태가 최종인가? | `states:`, `terminal_states:` |
| **Transition (T)** | 무엇이 상태를 바꾸나? 어디서 어디로, 어떤 역할이 할 수 있나? | `transitions:` |
| **Constraint (C)** | 무엇이 절대 허용되면 안 되나(셀프 승인, 한도, 빠진 입력)? | `constraints:`, `guards:`로 연결 |
| **World Model Canvas** | YAML을 쓰기 전에 World 전체를 한 장으로 | [`docs/world-model-canvas.md`](docs/world-model-canvas.md) |

`world.yaml`의 예시(구매 요청)나 빈 템플릿 [`templates/world.template.yaml`](templates/world.template.yaml)에서 시작하세요.
언어 레퍼런스: [`docs/world-dsl.md`](docs/world-dsl.md). 개념: [`docs/concepts.md`](docs/concepts.md).

## 3. Day 2: World Execution (desk-check)

| 단계 | 하는 일 | 위치 |
|---|---|---|
| **Validate** | 문제가 없을 때까지 `npm run validate`, 수정 전/후 증거 저장 | `evidence/` |
| **제안 → 판정** | 시나리오를 씁니다. 행위자(`as`)가 레코드에 transition을 *제안*합니다. World의 판정 **ALLOW** / **DENY**와 이유를 예측합니다 | `scenarios/happy-path.yaml` |
| **Guard와 실행** | 상태 → 역할 → guard → global constraint 순서로 판정. 처음 실패한 곳이 DENY를 정합니다 | [`scenarios/README.md`](scenarios/README.md) |
| **Commit과 감사 기록** | ALLOW면 레코드가 `to` 상태로 갑니다. 다음 step은 거기서 시작합니다. step마다 이유를 `because:`에 쓰면 그것이 감사 기록입니다 | 여러분의 시나리오 |
| **Runtime loop** | 한 레코드에 step을 잇습니다: 제안 → 판정 → 커밋 → 다음 제안 | 여러분의 시나리오 |
| **BREAK → FIX** | 금지된 일을 일으키려는 공격 시나리오를 씁니다. 허용된다면 World 규칙을 고치고, 다시 검증하고, 다시 예측합니다 | `scenarios/adversarial.yaml`, `assignment/break-fix.md` |
| **멀티 에이전트 협업** | 에이전트와 사람에게 다른 역할을 줍니다: 하나는 초안, 다른 하나는 확인, 사람이 승인. Guard가 만든 이가 확인하지 못하게 합니다 | [`examples/mini-agentic-world/`](examples/mini-agentic-world/) |
| **Mini Agentic World** | 모두 합칩니다: 여러분의 World, seed 레코드, 정상 시나리오와 공격 시나리오 각각 하나 이상 | 여러분의 저장소 |

시나리오는 **예측**입니다. 시나리오가 "실행됐다", "통과했다"고 쓰지 마세요. 리뷰에서 강사가 여러분의 `record`, `as`, `transition`
값 그대로 Runtime에서 실행하고 결과를 함께 비교합니다. 틀린 예측은 좋은 학습 재료이니 그대로 두세요.

### Runtime이 판정할 수 있게 규칙 쓰기

예측과 Runtime 결과를 비교할 수 있게 해 줍니다.

1. **플래그는 문자열이나 숫자로.** `x == "yes"` 또는 `x == 1`. 언어에 `true` / `false`가 없습니다.
2. **레코드와 principal을 직접 읽기.** Guard는 `principal.id`, `principal.roles`, 대상 레코드의 속성(`request.amount`)을 씁니다.
   다른 레코드를 거치는 경로(`job.spec.version`)는 피하고, 필요한 사실을 레코드에 옮겨 적으세요.
3. **상태기계는 Entity 하나만** (`owned_state: true`). 다른 생애주기는 속성으로 두거나 별도 World로 만드세요.
4. **시나리오마다 seed.** 각 시나리오의 `record`는 `seed.yaml`에 선언된 상태로 있어야 합니다.

---

## 4. 저장소 구조

```text
world.yaml                  여러분의 World (루트에 두세요)
seed.yaml                   예시 레코드. 시나리오는 이 중 하나에서 시작합니다
scenarios/                  happy-path.yaml, adversarial.yaml, README.md (형식과 desk-check)
assignment/                 여러분의 생각: world-fit, entity-decisions, modeling-decisions, break-fix, reflection
evidence/                   수정 전/후 validate 결과
templates/                  빈 world · seed · scenario 템플릿
examples/mini-agentic-world 작은 멀티 에이전트 World (예시 데이터)
docs/                       개념, 언어 레퍼런스, World Model Canvas
submission-info.json        제출 manifest에 들어갈 이름
scripts/package-submission.mjs   npm run package가 쓰는 패키저
AGENTS.md                   AI 코딩 도구의 작업 규칙
.superwork/schema-version   언어 버전 (수정하지 마세요)
```

---

## 5. 제출

1. `submission-info.json`을 채웁니다: `"participant"`(강사가 아는 이름), 선택으로 `"github"`(핸들), 그리고
   `"aiAssistedReview"`: `"yes"` 또는 `"no"`(아래 *동의 사항* 참고).
2. World에 고유한 `world.id`(`my-world`가 아닌)를 주고 `world.version`을 정합니다.
3. 실행:

   ```bash
   npm run package
   ```

   먼저 검증하고, World가 준비되지 않았거나 비밀값처럼 보이는 파일이 있으면 멈춥니다.
   `submission/<world-id>-<version>-submission.zip`을 만들고 SHA-256을 출력합니다.
4. 그 ZIP을 제출 링크로 보냅니다. 스크립트는 아무것도 업로드하지 않습니다.

**ZIP에 들어가는 것** (폴더 하나 `<world-id>-<version>/`):

| 구분 | 파일 |
|---|---|
| World 원본 | `world.yaml`, `seed.yaml`, `.superwork/schema-version` |
| 여러분의 생각과 예측 | `assignment/`, `scenarios/` |
| 검증 결과 | `validation-summary.txt`(패키저가 만듦), 여러분의 `evidence/` |
| 제출 메타데이터 | `SUBMISSION.json`: 이름, World id/version/spec, 도구 버전, 파일 목록과 SHA-256 |

이 폴더와 파일만 들어갑니다. `node_modules/`, `.git/`, `.env` 파일 등은 절대 포함되지 않습니다.
같은 파일이면 언제나 바이트까지 같은 ZIP이 나오므로, 여러분과 강사가 SHA-256으로 확인할 수 있습니다.

**리뷰 결과는 제출물이 아닙니다.** 강사의 평가는 나중에 리뷰에서 여러분의 ZIP으로부터 만들어집니다.

**World가 여러 개라면?** World마다 따로 제출합니다. `world.id`가 다르면 ZIP 이름이 다르고 독립적으로 리뷰됩니다.
같은 World의 새 판은 `world.id`를 유지하고 `world.version`을 올립니다.

### 체크리스트

- [ ] `npm run validate` 문제 없음
- [ ] `assignment/world-fit.md`: 이 업무에 World Model이 필요한 이유 3–6문장
- [ ] `assignment/entity-decisions.md`: 최종 Entity 3개 이상, Entity가 *아닌* 개념 2개 이상, 각각 이유
- [ ] `assignment/modeling-decisions.md`: 애매했던 결정 2개 이상 (대안 · 선택 · 이유 · ESTC 영향)
- [ ] `scenarios/happy-path.yaml`, `scenarios/adversarial.yaml`: 예측과 이유
- [ ] `assignment/break-fix.md`: 같은 시나리오의 BEFORE → FIX → AFTER
- [ ] `evidence/`: 수정 전/후 validate 결과
- [ ] `assignment/reflection.md`
- [ ] 민감정보 없음
- [ ] `npm run package` 성공, ZIP 제출 완료

자세한 과제 요건: [`assignment/README.md`](assignment/README.md).

**제출 시 동의 사항.** 제출하면 강사가 제출물을 검토하고, 비공개 Superwork Studio 환경에 가져와 검증 · 실행 · 테스트 · 분석하며,
1:1 리뷰에서 여러분과 함께 화면에 표시하고 논의하는 것에 동의한 것으로 봅니다. 원본 과제의 소유권은 여러분에게 남습니다.
여러분, 소속 회사, 고객 또는 개인을 합리적으로 특정할 수 없게 익명화 · 일반화된 학습 내용은 Superwork 제품 개선, 교육, 연구에
활용될 수 있습니다. 원본 제출물은 공개하지 않습니다. 자세한 조건: [`LICENSE`](LICENSE) 7조.

**AI 보조 리뷰(선택).** `"aiAssistedReview": "yes"`이면 강사가 ZIP 안의 파일을 외부 제공자의 AI 모델로도 분석할 수 있습니다(제공자의
상용 API 약관에 따르며, 여러분의 파일은 모델 학습에 쓰이지 않습니다). AI는 발견 사항을 제안할 뿐이고 평가는 강사가 정합니다.
`"no"`이면 AI 분석 없이 리뷰합니다. 선택은 `SUBMISSION.json`에 기록됩니다.

---

## 6. AI 코딩 도구와 함께

써도 좋습니다. **결정은 여러분이 합니다.** 시작 프롬프트는 [`assignment/claude-code-prompt.md`](assignment/claude-code-prompt.md),
도구는 [`AGENTS.md`](AGENTS.md)의 규칙을 따릅니다.
검증 에러가 나면 **검증기가 아니라 World를 고치세요.** BREAK에서 빈틈을 찾으면 **프롬프트가 아니라 World 규칙을 고치세요.**

---

## 7. 문제 해결

| 증상 | 해결 |
|---|---|
| `npm: command not found` / `node: command not found` | nodejs.org에서 Node.js 20 LTS 이상을 설치하고 터미널을 새로 엽니다 |
| `npm install`이 네트워크 · 프록시 오류로 실패 | 다른 네트워크에서 다시 시도. 회사 프록시 뒤라면 `npm config set proxy …` |
| `sh: superwork: command not found` | 저장소 폴더에서 `npm install`, 그리고 `npm run …`(또는 `npx superwork …`)으로 실행 |
| validate: 알 수 없는 state / role / constraint | `transitions`나 `guards`의 이름이 선언한 상태 · 역할 · constraint와 정확히 같아야 합니다(대소문자 구분) |
| validate: 표현식 오류 | `npm run explain -- expressions`. 문자열은 따옴표로 비교(`x == "yes"`) |
| `npm run package`: "world.id is still the template value" | `world.yaml`에 고유한 `world.id`를 정합니다 |
| `npm run package`: "Fill in your name" | `submission-info.json`을 채웁니다 |
| `npm run package`: "looks like it contains …" | 그 파일에서 비밀값을 지우고(실제 값이었다면 교체하고) 다시 패키징합니다 |
| 리뷰에서 시나리오의 레코드나 행위자를 찾지 못함 | `record`는 `seed.yaml`의 id, `as`는 principal id, `transition`은 transition 이름이어야 합니다 |

---

## 라이선스와 소유권

Copyright © 2026 Josh Lee. All rights reserved. 이 저장소는 **소스 공개(source-available)이지만 오픈소스가 아닙니다.**
원본 콘텐츠는 **Educational Use Only License**([`LICENSE`](LICENSE))에 따라 Agentic World Bootcamp 참여와 개인 교육용 숙제에만
사용할 수 있습니다. 상업적 사용, 프로덕션 사용, 경쟁 제품 개발, 제품 · 템플릿 · 프레임워크로의 재배포, 제3자 제품이나 서비스에의
포함은 허용되지 않습니다.

- **Josh Lee**가 이 저장소의 원본 코드 · 템플릿 · 문서 · 예시 및 기타 Superwork 저작물을 소유합니다.
- **여러분**은 직접 만든 숙제 결과물(World · 답안 · 시나리오 · 증거)의 소유권을 가집니다. 그렇다고 스타터 저작물을 라이선스 밖에서
  재사용하거나 재배포할 권리가 생기지는 않습니다.
- npm 의존성은 원래의 라이선스를 따릅니다(`@superwork/world-spec`, `@superwork/cli`: MIT, `yaml`: ISC).

GitHub 이용약관에 따른 공개 저장소의 열람 · Fork 권리는 그대로이며, Fork도 이 라이선스를 따릅니다. 자세한 내용: [`LICENSE`](LICENSE), [`NOTICE`](NOTICE).
