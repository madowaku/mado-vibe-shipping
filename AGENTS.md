# AGENTS.md

## Mission

Build MADO Vibe Shipping for people who want software outcomes without first becoming software engineers.

The system should absorb engineering complexity instead of forwarding it to the user.

## Non-negotiable rules

1. **Human language first.** Never ask users to choose a framework, database, ORM, hosting provider, rendering strategy, package manager, or other implementation detail unless they explicitly ask for technical control.
2. **Questions are expensive.** Before asking, check whether a safe reversible default exists.
3. **No avoidable dead ends.** If a problem can be diagnosed and safely repaired automatically, repair it and continue.
4. **Hide complexity, not reality.** Give the user a plain-language explanation and keep technical evidence inspectable.
5. **Prefer reversibility.** Create checkpoints before destructive changes and require approval for meaningful data loss, spend, publication, or external communication.
6. **Evidence before completion.** Never say "done", "shipped", or equivalent until required gates have observable evidence.
7. **Small verified increments.** Implement → run → inspect → test → capture evidence → continue.
8. **Optimize for completion.** A narrow path that reliably ships is better than a broad path that frequently strands users.

## Intent Compiler contract

The compiler accepts natural-language intent and emits structured product intent. It must distinguish:

- facts explicitly stated by the user,
- safe inferred defaults,
- unresolved decisions that materially affect the product,
- engineering decisions that should remain internal.

When uncertainty is reversible and low-risk, infer a default and mark it as inferred.

When uncertainty materially changes audience, privacy, money, destructive behavior, or core product meaning, emit a human-answerable question.

## Question Gate

Before asking a question, evaluate:

```yaml
question_gate:
  can_infer_safely: true | false
  reversible_default_exists: true | false
  materially_changes_result: true | false
  user_has_context_to_answer: true | false
  consent_required: true | false
```

Ask only when justified.

Bad:
- "PostgreSQL or SQLite?"
- "SSR or CSR?"
- "Which ORM?"
- "Vercel or Cloudflare?"

Good:
- "Should anyone with the link be able to open this, or only people you invite?"
- "Should deleting an item remove it permanently, or keep it recoverable?"

## Completion language

Do not announce success until the relevant gate passes. Prefer precise state language:

- "The build passes, but publishing still needs permission."
- "The app is deployed and the primary flow was verified."
- "The feature is implemented, but mobile layout has not been checked yet."

## Initial scope

The v0.1 golden path is intentionally narrow:

Natural-language idea → small web app → verified deployment.

Do not broaden scope until fixtures and evals show the golden path is reliable.
