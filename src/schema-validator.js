import fs from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { fileURLToPath } from "node:url";

const schemaUrl = new URL("../schemas/intent.schema.json", import.meta.url);
const schema = JSON.parse(fs.readFileSync(fileURLToPath(schemaUrl), "utf8"));

function typeMatches(value, type) {
  switch (type) {
    case "null":
      return value === null;
    case "array":
      return Array.isArray(value);
    case "object":
      return value !== null && typeof value === "object" && !Array.isArray(value);
    case "integer":
      return Number.isInteger(value);
    default:
      return typeof value === type;
  }
}

function matchesAnyType(value, typeDefinition) {
  const types = Array.isArray(typeDefinition) ? typeDefinition : [typeDefinition];
  return types.some((type) => typeMatches(value, type));
}

function validateNode(value, node, path, errors) {
  if (node.enum && !node.enum.some((candidate) => isDeepStrictEqual(candidate, value))) {
    errors.push({
      instancePath: path,
      keyword: "enum",
      message: `must be one of: ${node.enum.join(", ")}`
    });
    return;
  }

  if (node.type && !matchesAnyType(value, node.type)) {
    const expected = Array.isArray(node.type) ? node.type.join(" or ") : node.type;
    errors.push({
      instancePath: path,
      keyword: "type",
      message: `must be ${expected}`
    });
    return;
  }

  if (typeof value === "string" && node.minLength !== undefined && value.length < node.minLength) {
    errors.push({
      instancePath: path,
      keyword: "minLength",
      message: `must NOT have fewer than ${node.minLength} characters`
    });
  }

  if (typeof value === "number" && node.minimum !== undefined && value < node.minimum) {
    errors.push({
      instancePath: path,
      keyword: "minimum",
      message: `must be >= ${node.minimum}`
    });
  }

  if (Array.isArray(value)) {
    if (node.minItems !== undefined && value.length < node.minItems) {
      errors.push({
        instancePath: path,
        keyword: "minItems",
        message: `must NOT have fewer than ${node.minItems} items`
      });
    }

    if (node.uniqueItems) {
      for (let i = 0; i < value.length; i += 1) {
        for (let j = i + 1; j < value.length; j += 1) {
          if (isDeepStrictEqual(value[i], value[j])) {
            errors.push({
              instancePath: path,
              keyword: "uniqueItems",
              message: "must NOT contain duplicate items"
            });
            i = value.length;
            break;
          }
        }
      }
    }

    if (node.items) {
      value.forEach((item, index) => {
        validateNode(item, node.items, `${path}/${index}`, errors);
      });
    }
  }

  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    const properties = node.properties ?? {};
    const required = node.required ?? [];

    for (const key of required) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) {
        errors.push({
          instancePath: path,
          keyword: "required",
          message: `must have required property '${key}'`
        });
      }
    }

    if (node.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!Object.prototype.hasOwnProperty.call(properties, key)) {
          errors.push({
            instancePath: `${path}/${key}`,
            keyword: "additionalProperties",
            message: "must NOT have additional properties"
          });
        }
      }
    }

    for (const [key, childSchema] of Object.entries(properties)) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        validateNode(value[key], childSchema, `${path}/${key}`, errors);
      }
    }
  }
}

export function validateIntent(intent) {
  const errors = [];
  validateNode(intent, schema, "", errors);
  return {
    valid: errors.length === 0,
    errors
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
