import fs from "node:fs";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const schemaUrl = new URL("../schemas/intent.schema.json", import.meta.url);
const schema = JSON.parse(fs.readFileSync(fileURLToPath(schemaUrl), "utf8"));

const ajv = new Ajv2020({
  allErrors: true,
  strict: false
});

const validate = ajv.compile(schema);

export function validateIntent(intent) {
  const valid = validate(intent);
  return {
    valid: Boolean(valid),
    errors: valid ? [] : (validate.errors ?? []).map((error) => ({
      instancePath: error.instancePath,
      keyword: error.keyword,
      message: error.message,
      params: error.params
    }))
  };
}

export function assertValidIntent(intent) {
  const result = validateIntent(intent);
  if (!result.valid) {
    const details = result.errors
      .map((error) => `${error.instancePath || "/"} ${error.message}`)
      .join("; ");
    throw new Error(`Intent failed schema validation: ${details}`);
  }
  return intent;
}
