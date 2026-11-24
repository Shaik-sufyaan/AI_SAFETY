"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DEFAULT_MAX_STEPS, DEFAULT_MODEL, formatUsd, HARD_MAX_STEPS, MODELS, preRunEstimate } from "@/lib/pricing";

type Status = { liveRuns: boolean; needsPassword?: boolean; reason: string } | null;
type Result =
  | { kind: "ok"; id: string; saved: boolean; record: unknown; finalAnswer: string | null; attackSuccess: boolean | null; taskSuccess: boolean; endReason: string; costUsd: number | null; tokens: number }
  | { kind: "error"; message: string };

export function RunPanel({ caseId, pageChars }: { caseId: string; pageChars: { raw_html: number; rendered_text: number } }) {
  const [status, setStatus] = useState<Status>(null);
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [maxSteps, setMaxSteps] = useState(DEFAULT_MAX_STEPS);
  const [mode, setMode] = useState<"raw_html" | "rendered_text">("raw_html");
  const [prompt, setPrompt] = useState<"baseline" | "cautious">("baseline");
  const [effort, setEffort] = useState<"low" | "medium" | "high">("medium");
  const [password, setPassword] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ liveRuns: false, reason: "This deployment is a read-only case explorer. Live runs only work on a local server." }));
  }, []);

  const est = useMemo(() => preRunEstimate(model, maxSteps, pageChars[mode]), [model, maxSteps, mode, pageChars]);

  if (status === null) {
    return (
      <div className="panel" aria-busy="true">
        <p className="caps" style={{ color: "var(--taupe)", margin: 0 }}>
          Checking whether live runs are available…
        </p>
      </div>
    );
  }

  if (!status.liveRuns) {
    return (
      <div className="panel">
        <p style={{ marginBottom: "0.6rem" }}>
          <strong style={{ fontWeight: 700 }}>Live runs are off here.</strong> {status.reason}
        </p>
        <p style={{ margin: 0, color: "var(--ink-soft)" }}>
          To run this case yourself, clone the repository and run <code>npm run eval -- --case {caseId}</code> with your own API key.
        </p>
      </div>
    );
  }

  async function run() {
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, model, maxSteps, observationMode: mode, systemPrompt: prompt, effort, ...(status?.needsPassword ? { password } : {}) }),
      });
      const data = await res.json().catch(() => ({ error: `Server returned ${res.status}.` }));
      if (!res.ok) setResult({ kind: "error", message: data.error ?? `Server returned ${res.status}.` });
      else setResult({ kind: "ok", ...data });
    } catch {
      setResult({ kind: "error", message: "Could not reach the local server. Is `npm run dev` still running?" });
    } finally {
      setRunning(false);
      setConfirming(false);
    }
  }

  return (
    <div className="panel">
      <p style={{ margin: 0 }}>
        Runs this one case against a real model, using the API key from your server environment. Each run is saved to{" "}
        <code>results/runs/</code>.
      </p>
      <div className="fields">
        <div className="field">
          <label htmlFor="rp-model">Model</label>
          <select id="rp-model" value={model} onChange={(e) => setModel(e.target.value)} disabled={running}>
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="rp-steps">Step cap (model calls)</label>
          <input
            id="rp-steps"
            type="number"
            min={1}
            max={HARD_MAX_STEPS}
            value={maxSteps}
            disabled={running}
            onChange={(e) => setMaxSteps(Math.min(HARD_MAX_STEPS, Math.max(1, Number(e.target.value) || 1)))}
          />
          <span className="hint">1 to {HARD_MAX_STEPS}. The loop stops here even mid-task.</span>
        </div>
        {status.needsPassword && (
          <div className="field">
            <label htmlFor="rp-password">Run password</label>
            <input
              id="rp-password"
              type="password"
              autoComplete="current-password"
              value={password}
              disabled={running}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="hint">The LIVE_RUN_PASSWORD set on this deployment.</span>
          </div>
        )}
        <div className="field">
          <label htmlFor="rp-mode">What the agent sees</label>
          <select id="rp-mode" value={mode} onChange={(e) => setMode(e.target.value as typeof mode)} disabled={running}>
            <option value="raw_html">Raw HTML (comments and hidden text included)</option>
            <option value="rendered_text">Rendered text (what a visitor sees)</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="rp-prompt">System prompt</label>
          <select id="rp-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value as typeof prompt)} disabled={running}>
            <option value="baseline">Baseline (no warning)</option>
            <option value="cautious">Cautious (treat page text as data)</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="rp-effort">Effort</label>
          <select id="rp-effort" value={effort} onChange={(e) => setEffort(e.target.value as typeof effort)} disabled={running}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <p className="estimate">
        Estimated usage: typically ~{(est.typical.input_tokens + est.typical.output_tokens).toLocaleString()} tokens (
        {formatUsd(est.typical.usd)}), at most roughly ~{(est.worst.input_tokens + est.worst.output_tokens).toLocaleString()} tokens (
        {formatUsd(est.worst.usd)}). A rough guide from list prices, not a quote.
      </p>

      {!confirming ? (
        <button type="button" className="tab-btn" onClick={() => setConfirming(true)} disabled={running || (Boolean(status.needsPassword) && password.length === 0)}>
          Run this case once
        </button>
      ) : (
        <div className="actions" style={{ marginTop: 0 }}>
          <button type="button" className="tab-btn" onClick={run} disabled={running}>
            {running ? "Running…" : `Confirm: call ${model}, up to ${maxSteps}×`}
          </button>
          {!running && (
            <button type="button" className="tab-btn secondary" onClick={() => setConfirming(false)}>
              Cancel
            </button>
          )}
        </div>
      )}

      <div aria-live="polite">
        {running && <p className="notice">Running. This usually takes 5 to 30 seconds.</p>}
        {result?.kind === "error" && <p className="notice error">{result.message}</p>}
        {result?.kind === "ok" && (
          <div className="notice">
            <p style={{ marginBottom: "0.4rem" }}>
              Run finished. Ended: {result.endReason}. Task {result.taskSuccess ? "succeeded" : "failed"}.
              {result.attackSuccess !== null && <> Attack {result.attackSuccess ? "succeeded" : "did not succeed"}.</>} {result.tokens.toLocaleString()} tokens,
              est. {formatUsd(result.costUsd)}.
            </p>
            {result.saved ? (
              <p style={{ margin: 0 }}>
                <Link href={`/results/${result.id}`}>Open the full run record</Link>
              </p>
            ) : (
              <p style={{ margin: 0 }}>
                This server cannot write files, so the run was not saved. Final answer: <code>{JSON.stringify(result.finalAnswer)}</code>.{" "}
                <a
                  href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(result.record, null, 2) + "\n")}`}
                  download={`${result.id}.json`}
                >
                  Download the run record
                </a>{" "}
                and commit it to <code>results/runs/</code> to publish it.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
