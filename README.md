# Superwork World Starter, Cohort 2 Edition

> **AI proposes. World decides. Runtime commits.**

**Educational Use Only · Source-available · Not Open Source.** Copyright © 2026 Josh Lee. All rights reserved. See [License](#license-and-ownership).

한국어: [README.ko.md](README.ko.md)

In this repository you model **one piece of your own work as a World**: what exists (Entities), where it can be (States), what changes it
and who may do that (Transitions), and what must never happen (Constraints). Then you try to break it, fix it with World rules, and
record why you decided what you decided.

- **You need:** Node.js 20 or newer, Git, a GitHub account, a text editor. An AI coding tool (Claude Code, Cursor, Copilot, …) is optional.
- **You do not need:** a Superwork account, a login, an invitation or access to Superwork Studio. **The whole homework runs on your computer.**
- **Execution happens at the review.** This kit validates your World and you desk-check your scenarios by hand. At your 1:1 review the
  instructor imports your submission into the Superwork Runtime, runs the same scenarios and compares the results with your predictions.

**Submission deadline:** `<announced by the instructor>` · **Submission link:** `<announced by the instructor>`

> **⚠️ Sensitive information.** You may model real work, but never put company secrets, customer personal data, API keys, account
> details or internal system addresses in this repository. Anonymize company, customer and people names, amounts and identifiers, or
> replace them with example data. A ZIP submission is no exception.

---

## 0. Set up (10 minutes)

```bash
git clone https://github.com/swit001/superwork-starter.git my-world
cd my-world
npm install
npm run validate          # the template must pass as it is: "Your world has no issues. ✓"
```

Check your tools first if something fails: `node --version` (20 or newer), `git --version`. See [Troubleshooting](#7-troubleshooting).

Want to keep your work on GitHub? Create an empty repository in your account and push to it
(`git remote set-url origin <your repository URL>` then `git push -u origin main`). A private repository is fine; the submission is a ZIP.

---

## 1. Commands

| Command | What it does |
|---|---|
| `npm run validate` | Checks `world.yaml` against the `superwork.world/v1` language and tells you what is wrong and how to fix it |
| `npm run summary` | The same check as a short summary (counts, PASS per check) |
| `npm run explain -- <topic>` | Language help. Topics: `states`, `transitions`, `constraints`, `expressions` |
| `npm run export` | Writes a normalized copy and `summary.json` to `dist/` |
| `npm run evidence` | Saves the summary to `evidence/validate-summary.txt` |
| `npm run package` | Validates, then builds your submission ZIP in `submission/` (see [Submit](#5-submit)) |

The tools are the published packages `@superwork/cli` 1.1.1 and `@superwork/world-spec` 1.1.1 (pinned in `package.json`).
The last summary line, `READY FOR STUDIO IMPORT ✓`, means your file is in the format the instructor can import. You do not import anything yourself.

**What validate checks:** the structure, references, transitions and constraint expressions of `world.yaml`.
**What validate does not check:** whether your business rules are right. A World without a "no self-approval" rule is still valid.
That is why there are scenarios and a BREAK step.

---

## 2. Day 1: World Design

Work in this order. Each step has a file where you write your own reasoning.

| Step | Question | Where |
|---|---|---|
| **Mission & domain** | Which piece of work? What outcome counts as success? What is out of scope? | `world.mission` in `world.yaml`, `assignment/world-fit.md` |
| **Ontology** | Which concepts exist in this work? Which are things, which are facts about things, which are steps? | `assignment/entity-decisions.md` |
| **Entity (E)** | What is tracked? Pick one core Work entity with a lifecycle. | `entities:` |
| **State (S)** | Where can the core entity be? Which states are final? | `states:`, `terminal_states:` |
| **Transition (T)** | What changes the state, from where to where, and which role may do it? | `transitions:` |
| **Constraint (C)** | What must never be allowed (self-approval, limits, missing inputs)? | `constraints:`, attached as `guards:` |
| **World Model Canvas** | One page that shows the whole World before you write YAML | [`docs/world-model-canvas.md`](docs/world-model-canvas.md) |

Start from the example in `world.yaml` (a purchase request) or from the blank [`templates/world.template.yaml`](templates/world.template.yaml).
Language reference: [`docs/world-dsl.md`](docs/world-dsl.md). Concepts: [`docs/concepts.md`](docs/concepts.md).

## 3. Day 2: World Execution (desk-check)

| Step | What you do | Where |
|---|---|---|
| **Validate** | `npm run validate` until there are no issues; save before/after evidence | `evidence/` |
| **Proposal → adjudication** | Write a scenario: an actor (`as`) *proposes* a transition on a record. Predict the World's decision: **ALLOW** or **DENY**, and why | `scenarios/happy-path.yaml` |
| **Guard and execution** | Desk-check in order: state → role → guards → global constraints. The first failure decides DENY | [`scenarios/README.md`](scenarios/README.md) |
| **Commit and audit** | On ALLOW the record moves to the `to` state; that new state is where the next step starts. Write each step's reason in `because:`; together they are your audit trail | your scenarios |
| **Runtime loop** | Chain steps on one record: propose → decide → commit → next proposal | your scenarios |
| **BREAK → FIX** | Write an adversarial scenario that tries to make a forbidden thing happen. If it would be allowed, fix the World rules, validate, predict again | `scenarios/adversarial.yaml`, `assignment/break-fix.md` |
| **Multi-agent collaboration** | Give agents and people different roles: one drafts, another checks, a person approves. Guards keep the maker from being the checker | [`examples/mini-agentic-world/`](examples/mini-agentic-world/) |
| **Mini Agentic World** | Put it together: your World, your seed records, at least one happy path and one adversarial scenario | your repository |

Scenarios are **predictions**. Never write that a scenario "ran" or "passed". At the review, the instructor runs exactly your `record`,
`as` and `transition` values on the Runtime and you compare the results together. A wrong prediction is good learning material: keep it.

### Write rules the Runtime can evaluate

These keep your predictions and the Runtime result comparable:

1. **Flags as strings or numbers.** Write `x == "yes"` or `x == 1`. The language has no `true` / `false`.
2. **Read the record and the principal directly.** Guards may use `principal.id`, `principal.roles` and attributes of the target record
   (`request.amount`). Avoid paths that go through another record (`job.spec.version`): copy the fact you need onto the record instead.
3. **One entity owns the state machine** (`owned_state: true`). Model other lifecycles as attributes or in a separate World.
4. **Seed every scenario.** Each scenario's `record` must exist in `seed.yaml` with a declared state.

---

## 4. Repository layout

```text
world.yaml                  your World (keep it at the root)
seed.yaml                   example records; a scenario starts from one of them
scenarios/                  happy-path.yaml, adversarial.yaml, README.md (format and desk-check)
assignment/                 your reasoning: world-fit, entity-decisions, modeling-decisions, break-fix, reflection
evidence/                   validate results before and after your fix
templates/                  blank world, seed and scenario templates
examples/mini-agentic-world a small multi-agent World (synthetic)
docs/                       concepts, language reference, World Model Canvas
submission-info.json        your name for the submission manifest
scripts/package-submission.mjs   the packager behind npm run package
AGENTS.md                   rules for your AI coding tool
.superwork/schema-version   language version (do not edit)
```

---

## 5. Submit

1. Fill in `submission-info.json`: `"participant"` (your name as the instructor knows you), optionally `"github"` (your handle), and
   `"aiAssistedReview"`: `"yes"` or `"no"` (see *Consent* below).
2. Give your World its own `world.id` (not `my-world`) and set `world.version`.
3. Run:

   ```bash
   npm run package
   ```

   It validates first and stops if the World is not ready, or if a file looks like it holds a secret. It writes
   `submission/<world-id>-<version>-submission.zip` and prints its SHA-256.
4. Send that ZIP through the submission link. Nothing is uploaded by the script.

**What is in the ZIP** (one folder `<world-id>-<version>/`):

| Part | Files |
|---|---|
| World source | `world.yaml`, `seed.yaml`, `.superwork/schema-version` |
| Your reasoning and predictions | `assignment/`, `scenarios/` |
| Validation result | `validation-summary.txt` (made by the packager), your `evidence/` |
| Submission metadata | `SUBMISSION.json`: your name, World id/version/spec, tool versions, file list with SHA-256 |

Only these folders and files are included; `node_modules/`, `.git/`, `.env` files and anything else are never packaged.
The same files always give a byte-identical ZIP, so you and the instructor can compare the SHA-256.

**Review results are not part of your submission.** The instructor's assessment is created later, in the review, from your ZIP.

**Several Worlds?** Each World is its own submission. A different `world.id` gives a different ZIP name and is reviewed independently.
A new version of the same World keeps its `world.id` and raises `world.version`.

### Checklist

- [ ] `npm run validate` reports no issues
- [ ] `assignment/world-fit.md`: why this work needs a World Model (3 to 6 sentences)
- [ ] `assignment/entity-decisions.md`: at least 3 final Entities and at least 2 concepts that are *not* Entities, each with a reason
- [ ] `assignment/modeling-decisions.md`: at least 2 ambiguous decisions (alternatives, choice, reason, ESTC impact)
- [ ] `scenarios/happy-path.yaml` and `scenarios/adversarial.yaml` with predictions and reasons
- [ ] `assignment/break-fix.md`: BEFORE → FIX → AFTER on the same scenario
- [ ] `evidence/`: validate results before and after the fix
- [ ] `assignment/reflection.md`
- [ ] no sensitive information
- [ ] `npm run package` succeeded and you sent the ZIP

The assignment files are written in Korean; answer in Korean or English. Details: [`assignment/README.md`](assignment/README.md).

**Consent when you submit.** By submitting you agree that the instructor reviews your submission, imports it into a private Superwork
Studio environment to validate, run, test and analyze it, and shows and discusses it with you in a
1:1 review. You keep ownership of your original work. Anonymized, generalized learnings that cannot reasonably identify you, your
company, customers or any person may be used to improve Superwork, for education and research. Original submissions are not published.
Details: [`LICENSE`](LICENSE) section 7.

**AI-assisted review (your choice).** With `"aiAssistedReview": "yes"`, the instructor may also analyze the files in your ZIP with an AI
model from an external provider (under the provider's commercial API terms; your files are not used to train the model). The AI only
proposes findings; the instructor decides the assessment. With `"no"`, your World is reviewed without any AI analysis. Your answer is
recorded in `SUBMISSION.json`.

---

## 6. Working with an AI coding tool

You may use one. **You make the decisions.** Start with the prompt in
[`assignment/claude-code-prompt.md`](assignment/claude-code-prompt.md); the tool follows [`AGENTS.md`](AGENTS.md).
When validation fails, **fix the World, not the validator.** When BREAK finds a gap, **fix the World rules, not the prompt.**

---

## 7. Troubleshooting

| Symptom | Fix |
|---|---|
| `npm: command not found` / `node: command not found` | Install Node.js 20 LTS or newer from nodejs.org, open a new terminal |
| `npm install` fails with a network or proxy error | Retry on another network; behind a company proxy set `npm config set proxy …` |
| `sh: superwork: command not found` | Run `npm install` in the repository folder; use `npm run …` (or `npx superwork …`) |
| validate: unknown state / role / constraint | The name in `transitions` or `guards` must match a declared state, role or constraint exactly (case-sensitive) |
| validate: expression error | `npm run explain -- expressions`; compare strings with quotes (`x == "yes"`) |
| `npm run package`: "world.id is still the template value" | Set your own `world.id` in `world.yaml` |
| `npm run package`: "Fill in your name" | Edit `submission-info.json` |
| `npm run package`: "looks like it contains …" | Remove the secret from that file (rotate it if it was real), package again |
| A scenario's record or actor is "not found" at the review | `record` must be an id in `seed.yaml`, `as` a principal id, `transition` a transition name |

---

## License and ownership

Copyright © 2026 Josh Lee. All rights reserved. This repository is **source-available, not open source**. Its original content is
licensed under the Educational Use Only License ([`LICENSE`](LICENSE)) for Agentic World Bootcamp participation and personal
educational homework only. Commercial use, production use, building competing products, redistribution as a product, template or
framework, and inclusion in third-party products or services are not permitted.

- **Josh Lee** owns the original code, templates, documents, examples and other Superwork materials in this repository.
- **You** own the homework you create with it (your World, answers, scenarios and evidence). Owning your homework does not give you rights
  to the starter materials beyond the license.
- npm dependencies keep their own licenses (`@superwork/world-spec`, `@superwork/cli`: MIT; `yaml`: ISC).

Viewing and forking under GitHub's Terms of Service remain available; forks are subject to this license. Details: [`LICENSE`](LICENSE),
[`NOTICE`](NOTICE).
