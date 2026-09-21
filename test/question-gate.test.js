import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import {
  evaluateQuestionGate,
  isHumanAnswerableQuestion,
  makeOpenQuestion,
  resolveQuestionCandidate
} from "../src/question-gate.js";

const fixtureUrl = new URL("../fixtures/m0.2-question-gate.json", import.meta.url);
const fixture = JSON.parse(fs.readFileSync(fileURLToPath(fixtureUrl), "utf8"));

for (const scenario of fixture.cases) {
  test(`M0.2 fixture: ${scenario.id}`, () => {
    const actual = resolveQuestionCandidate({
      id: scenario.id,
      ...scenario.candidate
    });

    for (const [key, value] of Object.entries(scenario.expected)) {
      assert.deepEqual(actual[key], value, `${scenario.id}: ${key}`);
    }

    if (actual.ask) {
      assert.equal(isHumanAnswerableQuestion(actual.question), true);
    }
  });
}

test("implementation choices are suppressed unless technical control was requested", () => {
  assert.deepEqual(
    evaluateQuestionGate({
      implementationDetail: true,
      requestedTechnicalControl: false,
      materiallyChangesResult: true,
      userHasContextToAnswer: true
    }),
    { ask: false, reason: "implementation_detail" }
  );

  assert.deepEqual(
    evaluateQuestionGate({
      materiality: "other",
      implementationDetail: true,
      requestedTechnicalControl: true,
      materiallyChangesResult: true,
      userHasContextToAnswer: true
    }),
    { ask: true, reason: "material_unresolved_decision" }
  );
});

test("user-facing question builder rejects implementation jargon", () => {
  assert.throws(
    () => makeOpenQuestion(
      "Should I use PostgreSQL or SQLite?",
      "Storage needs a choice.",
      "other"
    ),
    /implementation jargon/
  );
});

test("choose-for-me requires a safe default", () => {
  assert.throws(
    () => makeOpenQuestion(
      "Should this be private or public?",
      "This changes visibility.",
      "privacy",
      {
        choices: ["private", "public"],
        allowChooseForMe: true
      }
    ),
    /safe default/
  );
});

test("safe reversible material choices can be resolved without interruption", () => {
  assert.deepEqual(
    evaluateQuestionGate({
      materiality: "other",
      canInferSafely: true,
      reversibleDefaultExists: true,
      materiallyChangesResult: true,
      userHasContextToAnswer: true
    }),
    { ask: false, reason: "safe_reversible_default" }
  );
});

test("consent always wins over an available default", () => {
  assert.deepEqual(
    evaluateQuestionGate({
      materiality: "cost",
      canInferSafely: true,
      reversibleDefaultExists: true,
      materiallyChangesResult: false,
      userHasContextToAnswer: true,
      consentRequired: true
    }),
    { ask: true, reason: "consent_required" }
  );
});
