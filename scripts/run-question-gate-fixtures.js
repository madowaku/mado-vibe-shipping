import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import {
  isHumanAnswerableQuestion,
  resolveQuestionCandidate
} from "../src/question-gate.js";

const fixtureUrl = new URL("../fixtures/m0.2-question-gate.json", import.meta.url);
const fixture = JSON.parse(fs.readFileSync(fileURLToPath(fixtureUrl), "utf8"));

let asked = 0;
let suppressed = 0;

for (const scenario of fixture.cases) {
  const actual = resolveQuestionCandidate({
    id: scenario.id,
    ...scenario.candidate
  });

  for (const [key, value] of Object.entries(scenario.expected)) {
    assert.deepEqual(actual[key], value, `${scenario.id}: expected ${key}`);
  }

  if (actual.ask) {
    asked += 1;
    assert.equal(
      isHumanAnswerableQuestion(actual.question),
      true,
      `${scenario.id}: question contains implementation jargon`
    );
  } else {
    suppressed += 1;
  }
}

process.stdout.write(
  `PASS ${fixture.name} (${fixture.cases.length} cases, ${asked} asked, ${suppressed} suppressed)\n`
);
