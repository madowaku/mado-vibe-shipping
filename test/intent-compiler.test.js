import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import { compileIntent } from "../src/intent-compiler.js";
import { evaluateQuestionGate } from "../src/question-gate.js";
import { validateIntent } from "../src/schema-validator.js";

const fixtureUrl = new URL("../fixtures/m0.1-golden.json", import.meta.url);
const fixture = JSON.parse(fs.readFileSync(fileURLToPath(fixtureUrl), "utf8"));

test("M0.1 golden fixture compiles exactly", () => {
  const actual = compileIntent(fixture.input);
  assert.deepEqual(actual, fixture.expected);
});

test("compiled output conforms to the Intent schema", () => {
  const intent = compileIntent(fixture.input);
  assert.equal(validateIntent(intent).valid, true);
});

test("Japanese partner/place intent resolves without technical questions", () => {
  const intent = compileIntent("パートナーと行きたい場所を保存できるアプリが欲しい");

  assert.equal(intent.app_type, "shared_list");
  assert.deepEqual(intent.audience, {
    kind: "small_private_group",
    size_hint: 2
  });
  assert.equal(intent.primary_entity, "place");
  assert.equal(intent.access.visibility, "invite_only");
  assert.equal(intent.access.auth_required, true);
  assert.equal(intent.open_questions.length, 0);
});

test("explicit public intent does not invent authentication", () => {
  const intent = compileIntent("I want a public app where everyone can save ideas.");

  assert.equal(intent.audience.kind, "public");
  assert.equal(intent.access.visibility, "public");
  assert.equal(intent.access.auth_required, false);
});

test("ambiguous sharing emits a human-answerable privacy question", () => {
  const intent = compileIntent("I want an app for sharing photos.");

  assert.equal(intent.access.visibility, "unknown");
  assert.equal(intent.open_questions.length, 1);
  assert.equal(intent.open_questions[0].materiality, "privacy");
  assert.equal(intent.open_questions[0].allow_choose_for_me, true);
  assert.equal(intent.open_questions[0].default_choice, "invite_only");
  assert.deepEqual(intent.open_questions[0].choices, ["invite_only", "link_access", "public"]);
  assert.match(intent.open_questions[0].question, /invite|link|everyone/i);
  assert.doesNotMatch(intent.open_questions[0].question, /database|orm|framework|ssr|csr|postgres|sqlite/i);
});

test("Question Gate skips safe reversible defaults", () => {
  assert.deepEqual(
    evaluateQuestionGate({
      canInferSafely: true,
      reversibleDefaultExists: true,
      materiallyChangesResult: true,
      userHasContextToAnswer: true,
      consentRequired: false
    }),
    { ask: false, reason: "safe_reversible_default" }
  );
});

test("Question Gate asks when consent is required", () => {
  assert.deepEqual(
    evaluateQuestionGate({
      canInferSafely: true,
      reversibleDefaultExists: true,
      materiallyChangesResult: false,
      userHasContextToAnswer: true,
      consentRequired: true
    }),
    { ask: true, reason: "consent_required" }
  );
});

test("empty input fails loudly", () => {
  assert.throws(() => compileIntent("   "), /non-empty string/);
});
