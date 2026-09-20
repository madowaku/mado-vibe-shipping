# Evals

MADO Vibe Shipping is evaluated on whether a non-engineer can keep moving, not on how sophisticated the generated code looks.

## M0.1 Intent Compiler scorecard

Each fixture should be checked for:

1. **Intent fidelity** — preserves the user's actual goal.
2. **No invented core requirements** — does not silently change the product's meaning.
3. **Useful defaults** — fills reversible low-risk gaps.
4. **Question discipline** — asks only when the answer materially changes the result.
5. **Human-answerable questions** — no engineering vocabulary required.
6. **Planner sufficiency** — output contains enough product structure for downstream planning.
7. **Traceability** — inferred values are distinguishable from explicit user facts.

## Hard failures

The fixture fails immediately if the compiler:

- asks the user to pick implementation technologies without an explicit request,
- makes a private/public access decision where ambiguity materially affects privacy,
- invents a paid service requirement,
- hides a destructive or cost-bearing decision,
- emits invalid Intent JSON.

## Evaluation output

```yaml
fixture:
pass:
hard_failure:
scores:
  intent_fidelity:
  useful_defaults:
  question_discipline:
  planner_sufficiency:
notes:
```

Use evidence from the actual compiler output. Do not award success based on intent or claims alone.
