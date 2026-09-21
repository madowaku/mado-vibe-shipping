# MADO Vibe Shipping

**Intent → Working Software → Shipped Outcome**

MADO Vibe Shipping is an intent-to-software completion layer for non-engineers.

The project is built around one promise:

> A person should be able to say what they want, stay in human language, and reach a verified, shareable result without crossing the traditional software-engineering obstacle course.

## Why this exists

AI coding tools have made code generation dramatically easier, but non-engineers still get stranded by setup, package managers, Git, databases, deployment, permissions, environment variables, logs, and opaque failures.

MADO Vibe Shipping treats those as system responsibilities.

The target is not **Vibe Coding**. It is **Vibe Shipping**:

```text
Idea
  ↓
Intent Compiler
  ↓
Human-readable product hypothesis
  ↓
Build
  ↓
Verify
  ↓
Repair
  ↓
Deploy
  ↓
Evidence
  ↓
"Here is the working link."
```

## v0.1 Golden Path

Natural-language idea → small web app → verified deployment.

The first implementation milestone is **M0.1 Intent Compiler Fixture**.

A request like:

> “I want an app where my partner and I can save places we want to visit.”

becomes structured intent without forcing the user to answer engineering questions.

## M0.1 is executable

The first compiler is deliberately small and deterministic. It exists to harden the contract, provenance model, Question Gate, fixtures, and eval loop before a model-backed compiler is introduced behind the same interface.

Requirements:

- Node.js 20+

Run the golden fixture:

```bash
npm run fixture
```

Run all checks:

```bash
npm run check
```

Compile an intent directly:

```bash
npm run compile -- "I want an app where my partner and I can save places we want to visit."
```

Japanese input is supported by the M0.1 baseline as well:

```bash
npm run compile -- "パートナーと行きたい場所を保存できるアプリが欲しい"
```

The output is validated against `schemas/intent.schema.json` and records both explicit facts and reversible assumptions.

## Core principles

- Hide complexity, not reality.
- Ask questions people can answer.
- Prefer safe, reversible defaults.
- Treat every unnecessary question as abandonment risk.
- Convert raw engineering failures into human explanations.
- Never call something shipped without observable evidence.
- Keep a technical escape hatch for advanced users.

## Repository map

- `MADO_VIBE_SHIPPING_SPEC.md` — product and system specification
- `AGENTS.md` — implementation rules for coding agents
- `src/intent-compiler.js` — executable M0.1 compiler
- `src/question-gate.js` — interruption/clarification policy
- `src/schema-validator.js` — dependency-free schema validator
- `schemas/intent.schema.json` — machine-readable Intent contract
- `fixtures/` — Intent Compiler fixtures
- `test/` — executable tests
- `evals/` — evaluation contracts and scorecards

## Current milestone

**M0.1 Intent Compiler Fixture**

Success means the system can turn vague human intent into an implementation-ready product hypothesis while asking only questions that materially affect the result.

---

Status: early foundational work. Expect the architecture to evolve aggressively as fixtures and evals expose failure modes.
