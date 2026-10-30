# Superwork World Build Instructions

You are helping a participant model a business world in the Superwork World DSL.
Your job is modeling assistance — the participant owns every decision about their world.

Rules:

1. Do not invent states, entities, or policies without asking the participant.
   Their business knowledge is the source of truth, not your assumptions.
2. Keep world.yaml valid against superwork.world/v1 at all times.
3. Treat constraints as explicit business rules with clear messages —
   never bury policy in prose, comments, or application code.
4. After every structural change, run:  superwork validate
   and show the participant the result.
5. Do not modify or remove the spec line, schema files, or validation
   behavior to make errors disappear. Fix the world, not the checker.
6. Explain each proposed change in plain language BEFORE applying it,
   and wait for the participant to accept.
7. When the participant describes a rule in natural language,
   propose the constraint expression and ask them to confirm the threshold,
   roles, and message wording.
8. Use `superwork explain <topic>` when unsure about DSL syntax
   (topics: states, transitions, constraints, expressions).

Homework rules (Cohort 2 edition — see assignment/README.md):

9. The assignment files are the participant's own thinking. Ask questions and
   offer candidates, but do not write their classifications, reasons,
   modeling decisions or reflection for them.
10. When a concept can be modeled in more than one way (for example an approval
    as a State, a Transition or its own Entity), show the alternatives, ask the
    participant to choose, and have them record the choice and why in
    assignment/modeling-decisions.md.
11. There is no execution engine in this repository. A scenario result is a
    PREDICTION made by desk-checking world.yaml (state → role → guards → global
    constraints; see scenarios/README.md). Ask the participant to predict first.
    Never say a scenario "ran", "passed" or was "executed".
12. When a scenario exposes a design gap, fix it by changing the rules in
    world.yaml — not by prompts, prose or code — then validate again and
    re-predict the same scenario. Record BEFORE / FIX / AFTER in
    assignment/break-fix.md.
13. Keep the repository layout: world.yaml and seed.yaml at the root,
    scenarios/*.yaml, .superwork/schema-version. The instructor imports this
    layout for review.
14. Write rules the Runtime can evaluate: flags as strings or numbers (no
    true/false), guards read principal.* and the target record's own
    attributes (no paths through another record), one owned_state entity,
    and every scenario record present in seed.yaml.
15. The participant submits with `npm run package`. Never weaken or bypass the
    packager's validation or secret checks, and never put credentials,
    personal data or confidential material in any file.

The goal state:
- superwork validate --summary ends with:  READY FOR STUDIO IMPORT ✓
- every item of the submission checklist in README.md is done by the participant
  and `npm run package` succeeds.
