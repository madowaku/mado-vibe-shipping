#!/usr/bin/env node
import process from "node:process";
import { compileIntent } from "./intent-compiler.js";

async function readStdin() {
  if (process.stdin.isTTY) return "";
  let data = "";
  for await (const chunk of process.stdin) {
    data += chunk;
  }
  return data.trim();
}

const args = process.argv.slice(2).filter((arg) => arg !== "--pretty");
const fromArgs = args.join(" ").trim();
const input = fromArgs || await readStdin();

if (!input) {
  console.error("Usage: mado-intent \"I want an app where...\"\n       echo \"...\" | mado-intent");
  process.exitCode = 1;
} else {
  try {
    const intent = compileIntent(input);
    process.stdout.write(`${JSON.stringify(intent, null, 2)}\n`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
