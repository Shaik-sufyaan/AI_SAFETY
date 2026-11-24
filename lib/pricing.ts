// Model allowlist and list prices used for cost ESTIMATES only.
// Prices are USD per million tokens, Anthropic first-party list prices as of
// 2026-11-03. Check https://www.anthropic.com/pricing before relying on them;
// your actual bill is authoritative.

export interface ModelInfo {
  id: string;
  label: string;
  inputPerMTok: number;
  outputPerMTok: number;
}

export const PRICES_AS_OF = "2026-11-03";

export const MODELS: ModelInfo[] = [
  { id: "claude-haiku-5-5", label: "Claude Haiku 5.5 (default, cheapest)", inputPerMTok: 0.1, outputPerMTok: 0.5 },
  { id: "claude-sonnet-5-5", label: "Claude Sonnet 5.5", inputPerMTok: 2, outputPerMTok: 10 },
  { id: "claude-opus-5-5", label: "Claude Opus 5.5", inputPerMTok: 4, outputPerMTok: 20 },
];

export const DEFAULT_MODEL = "claude-haiku-5-5";
export const DEFAULT_MAX_STEPS = 6;
export const HARD_MAX_STEPS = 12;
export const DEFAULT_MAX_TOKENS_PER_STEP = 4096;

export function getModel(id: string): ModelInfo | undefined {
  return MODELS.find((m) => m.id === id);
}

export function estimateCostUsd(
  model: string,
  usage: { input_tokens: number; output_tokens: number; cache_read_input_tokens?: number; cache_creation_input_tokens?: number },
): number | null {
  const m = getModel(model);
  if (!m) return null;
  // Cache reads ~0.1x and cache writes ~1.25x input price (5-minute TTL).
  const input =
    usage.input_tokens * m.inputPerMTok +
    (usage.cache_read_input_tokens ?? 0) * m.inputPerMTok * 0.1 +
    (usage.cache_creation_input_tokens ?? 0) * m.inputPerMTok * 1.25;
  return (input + usage.output_tokens * m.outputPerMTok) / 1_000_000;
}

/**
 * Rough pre-run estimate. Assumes ~4 characters per token, a fixed overhead for
 * the system prompt, tool definitions and task, that the full history is resent
 * every step, and that one page is added to the history per step.
 * It is an order-of-magnitude guide, not a quote.
 */
export function preRunEstimate(model: string, maxSteps: number, pageChars: number) {
  const overhead = 900;
  const pageTokens = Math.ceil(pageChars / 4);
  const typicalSteps = Math.min(3, maxSteps);
  const inputFor = (steps: number) => {
    let total = 0;
    for (let k = 1; k <= steps; k++) total += overhead + pageTokens * Math.min(k - 1, steps) + 300 * (k - 1);
    return total;
  };
  const typical = { input_tokens: inputFor(typicalSteps), output_tokens: 500 * typicalSteps };
  const worst = { input_tokens: inputFor(maxSteps), output_tokens: 1500 * maxSteps };
  return {
    typical: { ...typical, usd: estimateCostUsd(model, typical) },
    worst: { ...worst, usd: estimateCostUsd(model, worst) },
    assumptions: `~4 chars/token; ${overhead} tokens of fixed prompt; page ≈ ${pageTokens} tokens; history resent each step. Typical = ${typicalSteps} steps, upper = ${maxSteps} steps with long outputs.`,
  };
}

export function formatUsd(n: number | null): string {
  if (n === null) return "unknown";
  if (n === 0) return "$0";
  if (n < 0.01) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(3)}`;
}
