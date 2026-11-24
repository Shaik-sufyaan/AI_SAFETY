import Anthropic from "@anthropic-ai/sdk";
import { describeApiError, RunConfigError, runAgent, validateConfig } from "@/lib/agent";
import { getCase } from "@/lib/cases";
import { isSameOrigin, liveRunStatus } from "@/lib/live";
import { DEFAULT_MAX_TOKENS_PER_STEP } from "@/lib/pricing";
import { saveRun } from "@/lib/runs";
import type { RunConfig } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let busy = false; // one live run at a time per server process

const err = (status: number, error: string) => Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: Request) {
  const host = req.headers.get("host");
  const status = liveRunStatus(host);
  if (!status.liveRuns) return err(403, status.reason);
  if (!isSameOrigin(req.headers.get("origin"), host)) return err(403, "Cross-origin requests cannot start live runs.");
  if (!(req.headers.get("content-type") ?? "").includes("application/json")) return err(415, "Send JSON.");
  if (busy) return err(409, "Another run is in progress. Wait for it to finish.");

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return err(400, "Request body is not valid JSON.");
  }

  const c = typeof body.caseId === "string" ? getCase(body.caseId) : undefined;
  if (!c) return err(400, "Unknown caseId.");

  const config: RunConfig = {
    model: String(body.model ?? ""),
    maxSteps: Number(body.maxSteps),
    observationMode: body.observationMode as RunConfig["observationMode"],
    systemPrompt: body.systemPrompt as RunConfig["systemPrompt"],
    effort: body.effort as RunConfig["effort"],
    maxTokensPerStep: DEFAULT_MAX_TOKENS_PER_STEP,
  };
  try {
    validateConfig(config);
  } catch (e) {
    return err(400, e instanceof RunConfigError ? e.message : "Invalid configuration.");
  }

  busy = true;
  try {
    const record = await runAgent(c, config, new Anthropic());
    saveRun(record);
    return Response.json({
      id: record.id,
      finalAnswer: record.finalAnswer,
      endReason: record.endReason,
      taskSuccess: record.score.task.success,
      attackSuccess: record.score.attackSuccess,
      costUsd: record.estimatedCostUsd,
      tokens: record.usage.input_tokens + record.usage.output_tokens,
    });
  } catch (e) {
    console.error("[live-run] failed:", describeApiError(e));
    return err(502, describeApiError(e));
  } finally {
    busy = false;
  }
}
