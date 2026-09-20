# MADO_VIBE_SHIPPING_SPEC.md

Version: v0.1  
Status: Draft / Foundational Spec

## 0. Purpose

MADO Vibe Shipping is a creation layer for people who want to build software but do not want to become software engineers first.

The goal is not to make programming concepts easier to study. The goal is to make most programming concepts unnecessary to confront unless the user explicitly wants to see them.

The unit of success is not generated code.

> **The unit of success is a useful thing that works, survives basic failure, and can be handed to another person.**

This is **Vibe Shipping**, not merely Vibe Coding.

## 1. Core problem

Modern coding agents reduce the cost of producing code, but a non-engineer still encounters setup, runtimes, packages, environment variables, authentication, databases, Git, deployment, permissions, logs, test failures, dependency breakage, security concerns, and maintenance.

Any single obstacle can terminate the project.

Therefore:

> Reducing coding difficulty is insufficient. We must reduce abandonment probability across the entire creation loop.

## 2. Product thesis

```text
Human Intent
    ↓
Intent Interpretation
    ↓
Requirement Shaping
    ↓
Domain Knowledge Retrieval
    ↓
Implementation Planning
    ↓
Build
    ↓
Test
    ↓
Inspect
    ↓
Repair
    ↓
Deploy
    ↓
Observe
    ↓
Improve
```

The user should remain mostly in the language of goals, preferences, examples, constraints, feelings, approval, rejection, "more like this", and "make it simpler".

The system translates those into engineering decisions.

## 3. Principles

### Hide complexity, not reality

Show the human explanation first. Keep technical detail expandable and auditable.

### Ask questions people can answer

Bad: "Which ORM do you want?"

Good: "Will you need to search, edit, and keep this data over time?"

### Never expose an avoidable dead end

If recovery is safe and known, recover. If a reversible default exists, prefer action over interruption.

Ask when the decision materially changes the product, is risky or irreversible, may spend money, requires credentials/permission, or has incompatible interpretations.

### Completion beats breadth

A narrow workflow with high completion is better than a universal builder that frequently strands users.

## 4. User promise

A user should be able to begin with:

> "I want a simple app where my family can vote on travel ideas."

and reach:

> "Here is the working link. You can share it now."

without understanding package managers, build pipelines, branches, hosting providers, schema migrations, dependency graphs, CI, containers, or command-line tools.

## 5. Core stages

1. **Intent Capture** — accept natural language, screenshots, sketches, existing sites, spreadsheets, documents, or rough needs.
2. **Intent Compiler** — create a structured product hypothesis.
3. **Capability Resolution** — decide what can be implemented locally or needs a reusable skill/service/connector.
4. **Build Plan** — mark safe-auto, user-required, cost-bearing, irreversible, and experimental steps.
5. **Build** — implement in small verified increments.
6. **Guided Decisions** — present only human-answerable choices.
7. **Verification** — verify primary paths, persistence, layout, error handling, secrets, deployment, and access.
8. **Shipping** — require runnable, reachable, verified, shareable/useful state with recovery available.

## 6. State machine

```text
IDEA
 ↓
CLARIFIED
 ↓
SPECIFIED
 ↓
PLANNED
 ↓
BUILDING
 ↓
RUNNING
 ↓
VERIFIED
 ↓
SHIPPED
 ↓
OBSERVED
 ↓
IMPROVING
```

Failure is recoverable:

```text
BLOCKED → DIAGNOSED → RECOVERY PLAN → RESUMED
```

## 7. Friction Firewall

Raw engineering failures should be translated before reaching the user.

Example:

Raw:
```text
ModuleNotFoundError: @supabase/ssr
```

User-facing:

> A required app component was missing. I restored it and rechecked the project.

Raw logs remain available under technical details.

## 8. Abandonment prevention

Every interruption should be classified by category, whether the user is required, recoverability, whether auto-repair was attempted, and explanation level.

The optimization target is minimum user effort to resume progress.

## 9. Trust model

At any time, the user should be able to answer:

1. What is happening?
2. Why?
3. What changed?
4. Can I undo it?

## 10. Reversibility and consent

Require explicit approval for deleting user data, resetting production data, spending money, enabling paid infrastructure, changing ownership, making private projects public, sending external communications, granting third-party access, publishing sensitive data, or destructive migrations.

## 11. Technical escape hatch

Default to a simple surface, but allow detailed and developer modes. Advanced users should never be trapped in a black box.

## 12. Evidence Bundle

Each shipping run should emit:

```text
evidence/
├── summary.md
├── build.json
├── checks.json
├── screenshots/
├── logs/
├── deployment.json
├── risks.json
└── recovery.json
```

Completion should be independently inspectable.

## 13. Human language layer

Maintain a translation layer:

| Technical concept | User-facing concept |
|---|---|
| environment variable | private setting |
| deployment | publish |
| migration | update stored data structure |
| authentication | sign-in |
| authorization | who can do what |
| rollback | undo this version |
| dependency | required component |
| API quota | usage limit |
| merge conflict | two edits collided |
| build failure | the app could not be assembled |
| schema | structure of saved information |

## 14. Architecture

```text
User Intent
   ↓
Intent Compiler
   ↓
Domain Classifier
   ↓
Knowledge / Skill Resolver
   ↓
Execution Harness
   ↓
Artifact
   ↓
Evaluation
   ↓
Repair
   ↓
Delivery
```

Vibe Shipping is the human-facing completion layer over Skills, Atlas, Harness, Eval, visual evaluation, testing agents, and reusable implementation patterns.

## 15. Success metrics

Primary:

- Idea-to-Working Rate
- Idea-to-Shipped Rate
- First-Session Completion Rate
- Recovery Success Rate
- User Intervention Count
- Median Blocking Events
- Abandonment Rate

North Star:

> **Percentage of users who describe an idea and reach a verified, shareable artifact without needing developer knowledge.**

## 16. Initial scope v0.1

Support one golden path:

> Natural-language idea → small web app → verified deployment

Use a deliberately constrained implementation stack. Avoid configurability until the golden path is reliable.

## 17. Milestones

### M0 — End-to-End Vibe Shipping Fixture

A non-engineer provides one sentence and receives a live working application.

### M0.1 — Intent Compiler Fixture

Transform vague intent into a planner-ready structured product hypothesis without technical questions.

### M0.2 — Human Question Gate

Ask only questions that materially affect outcome, privacy, cost, destructive behavior, or core meaning.

### M0.3 — Friction Firewall Fixture

Inject missing dependency, expired credential, failed build, deployment timeout, and schema conflict. Detect, classify, auto-repair where safe, explain in human language, and resume.

### M0.4 — Evidence Bundle

Generate summary, build status, test status, deployment status, screenshots, known risks, and recovery information.

### M0.5 — Ship Gate

Do not announce completion unless build, primary flow, deployment, live check, safety check, and Evidence Bundle all pass.

## 18. Guiding philosophy

The historical software workflow asks:

> "Can the user learn enough engineering to finish?"

MADO Vibe Shipping asks:

> "Can the system carry enough engineering that the user can stay focused on what they want?"

The objective is not to remove expertise. It is to move expertise behind the interface.

The user supplies intention, taste, judgment, priorities, and consent.

The system supplies terminology, implementation knowledge, debugging, verification, and operational glue.

## 19. One-line definition

> **MADO Vibe Shipping is an intent-to-software completion layer that lets non-engineers go from "I want this" to "you can use it here" without crossing the traditional software-engineering obstacle course.**
