// CLI: run ONE case against a real model and save the run record.
//
//   npm run eval -- --list
//   npm run eval -- --case library-visible-text --dry-run
//   npm run eval -- --case library-visible-text
//   npm run eval -- --case shop-html-comment --model claude-haiku-5-5 --max-steps 6 --mode rendered_text
//
// Reads ANTHROPIC_API_KEY from the environment or from .env.local.

import { existsSync } from "node:fs";
import { parseArgs } from "node:util";
import Anthropic from "@anthropic-ai/sdk";
import { describeApiError, runAgent, validateConfig } from "../lib/agent";
import { openPage } from "../lib/browser";
import { getCase, getCases, PLACEMENT_LABELS } from "../lib/cases";
import { DEFAULT_MAX_STEPS, DEFAULT_MAX_TOKENS_PER_STEP, DEFAULT_MODEL, formatUsd, MODELS, preRunEstimate } from "../lib/pricing";
import { saveRun } from "../lib/runs";
import type { RunConfig } from "../lib/types";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const { values } = parseArgs({
  options: {
    case: { type: "string" },
    model: { type: "string", default: DEFAULT_MODEL },
    "max-steps": { type: "string", default: String(DEFAULT_MAX_STEPS) },
    mode: { type: "string", default: "raw_html" },
    prompt: { type: "string", default: "baseline" },
    effort: { type: "string", default: "medium" },
    "dry-run": { type: "boolean", default: false },
    list: { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
});

function fail(msg: string): never {
  console.error(`error: ${msg}`);
  process.exit(1);
}

if (values.help) {
  console.log(`Usage: npm run eval -- --case <id> [--model ${MODELS.map((m) => m.id).join("|")}]
       [--max-steps 1-12] [--mode raw_html|rendered_text] [--prompt baseline|cautious]
       [--effort low|medium|high] [--dry-run] [--list]`);
  process.exit(0);
}

if (values.list) {
  for (const c of getCases()) console.log(`${c.id.padEnd(24)} ${PLACEMENT_LABELS[c.placement]}`);
  process.exit(0);
}

if (!values.case) fail("pass --case <id> (see --list)");
const c = getCase(values.case) ?? fail(`unknown case "${values.case}" (see --list)`);

const config: RunConfig = {
  model: values.model!,
  maxSteps: Number(values["max-steps"]),
  observationMode: values.mode as RunConfig["observationMode"],
  systemPrompt: values.prompt as RunConfig["systemPrompt"],
  effort: values.effort as RunConfig["effort"],
  maxTokensPerStep: DEFAULT_MAX_TOKENS_PER_STEP,
};
try {
  validateConfig(config);
} catch (e) {
  fail((e as Error).message);
}

const start = openPage(c.startPath, config.observationMode);
const est = preRunEstimate(config.model, config.maxSteps, start.ok ? start.content.length : 4000);
console.log(`Case:     ${c.id} (${PLACEMENT_LABELS[c.placement]})`);
console.log(`Model:    ${config.model}, effort ${config.effort}, max ${config.maxSteps} steps, ${config.observationMode}, ${config.systemPrompt} prompt`);
console.log(`Estimate: typical ~${est.typical.input_tokens + est.typical.output_tokens} tokens (${formatUsd(est.typical.usd)}), upper ~${est.worst.input_tokens + est.worst.output_tokens} tokens (${formatUsd(est.worst.usd)})`);
console.log(`          ${est.assumptions}`);

if (values["dry-run"]) {
  console.log("Dry run: no API call made.");
  process.exit(0);
}
if (!process.env.ANTHROPIC_API_KEY) {
  fail("ANTHROPIC_API_KEY is not set. Copy .env.example to .env.local and add your key, or export it in your shell.");
}

try {
  const record = await runAgent(c, config, new Anthropic(), (m) => console.log(`  ${m}`));
  const file = saveRun(record);
  console.log("");
  for (const a of record.actions) {
    const what = a.tool === "open_page" ? `open_page ${JSON.stringify(a.input.url)} -> ${a.ok ? a.path : a.note}` : `${a.tool} ${JSON.stringify(a.input)}`;
    console.log(`  [step ${a.step}] ${what}`);
  }
  console.log(`\nEnded:        ${record.endReason}`);
  console.log(`Final answer: ${JSON.stringify(record.finalAnswer)}`);
  console.log(`Task success: ${record.score.task.success} (${record.score.task.detail})`);
  if (record.score.attackSuccess !== null) console.log(`Attack success: ${record.score.attackSuccess}`);
  else console.log(`Control marker false positive: ${record.score.markerFalsePositive}`);
  for (const o of record.score.objectives) console.log(`  - ${o.id}: ${o.met ? "MET" : "not met"} (${o.detail})`);
  console.log(`Usage:        ${record.usage.input_tokens} in / ${record.usage.output_tokens} out over ${record.usage.apiCalls} calls, est. ${formatUsd(record.estimatedCostUsd)}`);
  console.log(`Model (API):  ${record.modelReported}`);
  console.log(`Saved:        ${file}`);
} catch (e) {
  fail(describeApiError(e));
}
