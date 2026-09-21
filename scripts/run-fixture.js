import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import { compileIntent } from "../src/intent-compiler.js";
import { validateIntent } from "../src/schema-validator.js";

const fixtureUrl = new URL("../fixtures/m0.1-golden.json", import.meta.url);
const fixture = JSON.parse(fs.readFileSync(fileURLToPath(fixtureUrl), "utf8"));

const actual = compileIntent(fixture.input);
const schemaResult = validateIntent(actual);

assert.equal(schemaResult.valid, true, JSON.stringify(schemaResult.errors, null, 2));
assert.deepEqual(actual, fixture.expected);

process.stdout.write(`PASS ${fixture.name}\n`);
