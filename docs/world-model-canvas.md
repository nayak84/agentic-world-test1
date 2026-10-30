# World Model Canvas

Fill this in **before** you write YAML (paper, a whiteboard or this file). Each box maps to one part of `world.yaml`.
YAML을 쓰기 **전에** 채우세요(종이, 화이트보드, 이 파일 어디든). 칸마다 `world.yaml`의 한 부분에 대응합니다.

| Box / 칸 | Question / 질문 | Goes to / 옮길 곳 |
|---|---|---|
| **1. Mission** | Which outcome counts as success? (an outcome, not an activity) · 어떤 결과가 성공인가? (활동이 아니라 결과) | `world.mission` |
| **2. Boundary** | What is explicitly out of scope? · 무엇이 범위 밖인가? | `world.mission`, `assignment/world-fit.md` |
| **3. Actors** | Which people, AI agents and systems act? Which role does each have? · 누가(사람 · AI 에이전트 · 시스템) 행동하고 어떤 역할인가? | `principals:` |
| **4. Ontology** | Concepts in this work: thing, fact about a thing, or step? · 이 업무의 개념: 사물인가, 사물에 대한 사실인가, 단계인가? | `assignment/entity-decisions.md` |
| **5. Entities (E)** | The core Work entity with a lifecycle, and the entities its rules read · 생애주기를 가진 핵심 Work Entity와 규칙이 읽는 Entity | `entities:` |
| **6. States (S)** | Where can the core entity be? Which states are final? · 핵심 Entity는 어디에 있을 수 있나? 최종 상태는? | `states:`, `terminal_states:` |
| **7. Transitions (T)** | from → to, and which role proposes it · 어디서 어디로, 어떤 역할이 제안하나 | `transitions:` |
| **8. Constraints (C)** | What must never be allowed? Which transition does each rule guard? · 절대 허용되면 안 되는 것은? 각 규칙은 어느 transition을 지키나? | `constraints:`, `guards:` |
| **9. Accountability** | Which decisions must a person take? Where must the maker not be the checker? · 어떤 결정은 사람이 해야 하나? 만든 이가 확인하면 안 되는 곳은? | roles + guards (`principal.id != …`) |
| **10. Break it** | The one thing that would hurt most if it happened · 일어나면 가장 아픈 일 하나 | `scenarios/adversarial.yaml` |

```text
┌──────────────┬──────────────┬──────────────┐
│ 1 Mission    │ 2 Boundary   │ 3 Actors     │
├──────────────┴──────┬───────┴──────────────┤
│ 4 Ontology          │ 5 Entities (E)       │
├─────────────────────┼──────────────────────┤
│ 6 States (S)        │ 7 Transitions (T)    │
├─────────────────────┼──────────────────────┤
│ 8 Constraints (C)   │ 9 Accountability     │
├─────────────────────┴──────────────────────┤
│ 10 Break it: the scenario your World must DENY │
└────────────────────────────────────────────┘
```

AI proposes. World decides. Runtime commits. The canvas is where you decide what the World decides.
