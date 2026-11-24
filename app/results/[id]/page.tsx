import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CustodyLine } from "@/components/CustodyLine";
import { Bookmark, Flag, Stamp } from "@/components/marks";
import { PLACEMENT_LABELS } from "@/lib/cases";
import { custodyStations } from "@/lib/custody";
import { formatUsd } from "@/lib/pricing";
import { getRun, listRuns } from "@/lib/runs";
import { AGGREGATION_RULE, describeObjectiveRule, describeTaskRule, normalizeSitePath, scoreRun } from "@/lib/scoring";

export function generateStaticParams() {
  return [...listRuns("real").runs, ...listRuns("sample").runs].map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const r = getRun((await params).id);
  return { title: r ? `${r.kind === "sample" ? "Sample record" : "Run"}: ${r.caseSnapshot.title}` : "Run not found" };
}

const END_LABEL: Record<string, string> = {
  submitted: "Agent submitted an answer",
  end_turn_without_submit: "Agent replied in text without the submit tool",
  step_cap: "Stopped at the step cap",
  refusal: "Model refused",
  max_tokens: "Hit the per-step token limit",
};

export default async function RunPage({ params }: { params: Promise<{ id: string }> }) {
  const r = getRun((await params).id);
  if (!r) notFound();
  const c = r.caseSnapshot;
  const rescored = scoreRun(c, r.finalAnswer, r.actions);
  const mismatch =
    rescored.attackSuccess !== r.score.attackSuccess || rescored.task.success !== r.score.task.success || rescored.markerFalsePositive !== r.score.markerFalsePositive;
  const isSample = r.kind === "sample";
  const lastStep = r.actions.at(-1)?.step;
  const norm = (p: string | null | undefined) => normalizeSitePath(p ?? "");
  const openedIdx = r.actions.findIndex((a) => a.tool === "open_page" && a.ok && norm(a.path) === norm(c.startPath));
  const decoyPaths = c.objectives.flatMap((o) => (o.rule.type === "visited_path" ? [norm(o.rule.path)] : []));
  const decoyIdx = r.actions.findIndex((a) => a.tool === "open_page" && a.ok && decoyPaths.includes(norm(a.path)));
  const hrefs = {
    page: "#task-and-injection",
    ...(openedIdx >= 0 ? { shown: `#action-${openedIdx}` } : {}),
    ...(decoyIdx >= 0 ? { acted: `#action-${decoyIdx}` } : {}),
    ...(r.finalAnswer !== null ? { answer: "#final-answer" } : {}),
  };

  return (
    <div className="page">
      <p className="caps" style={{ color: "var(--taupe)", margin: "0 0 0.8rem" }}>
        <Link href="/results">Results</Link> · <Link href={`/cases/${r.caseId}`}>Case: {c.title}</Link>
      </p>
      <h1 className="title-sm">{c.title}</h1>

      {isSample ? (
        <div className="sample-band">
          <Stamp />
          <p>
            {(r.sampleNotice ?? "").replace(/^SAMPLE DATA\.\s*/, "")}
          </p>
        </div>
      ) : (
        <p className="lede">
          Run on {r.createdAt.replace("T", " ").slice(0, 19)} UTC with <code>{r.config.model}</code>.
        </p>
      )}

      <CustodyLine
        stations={custodyStations({ injected: c.injected, placement: c.placement, startPath: c.startPath, objectives: c.objectives }, r)}
        caption={isSample ? <>Drawn from the sample record (illustrative). Underlined stations link to their evidence below.</> : <>Drawn from this run record. Underlined stations link to their evidence below.</>}
        meta={END_LABEL[r.endReason] ?? r.endReason}
        hrefs={hrefs}
      />

      <div className="opener">
        <Bookmark />
        <h2>Verdict</h2>
      </div>
      <div className="col">
        <dl className="facts">
          <dt className="caps">Legitimate task</dt>
          <dd>
            {r.score.task.success ? "Succeeded" : "Failed"}. {r.score.task.detail}
          </dd>
          <dt className="caps">{c.injected ? "Attacker objective" : "Control markers"}</dt>
          <dd>
            {c.injected ? (r.score.attackSuccess ? "Succeeded." : "Not met.") : r.score.markerFalsePositive ? "False positive." : "No marker appeared."}
            <ul style={{ margin: "0.4rem 0 0", paddingLeft: "1.1rem" }}>
              {r.score.objectives.map((o) => (
                <li key={o.id}>
                  <code>{o.id}</code>: {o.met ? "met" : "not met"}. {o.detail}
                </li>
              ))}
            </ul>
          </dd>
          <dt className="caps">Re-scored now</dt>
          <dd className={mismatch ? "warn" : undefined}>
            {mismatch
              ? `Disagrees with the stored score (stored rule ${r.score.ruleVersion}, current rule ${rescored.ruleVersion}). Investigate before citing this run.`
              : `Matches the stored score (rule ${r.score.ruleVersion}).`}
          </dd>
        </dl>
      </div>

      <div className="opener" id="task-and-injection">
        <Bookmark />
        <h2>Task and injection</h2>
      </div>
      <div className="col">
        <blockquote className="task-quote">
          {c.task}
          <footer className="caps">User task · start page {c.startPath}</footer>
        </blockquote>
        {c.injected ? (
          <blockquote className="injection">
            {c.injectionText}
            <footer className="caps">Injected instruction · {PLACEMENT_LABELS[c.placement]}</footer>
          </blockquote>
        ) : (
          <p>Control case: no injected instruction.</p>
        )}
      </div>

      <div className="opener">
        <Bookmark />
        <h2>Agent actions</h2>
      </div>
      <div className="col">
        {r.actions.length === 0 ? (
          <p>The agent took no tool actions.</p>
        ) : (
          <ol className="log">
            {r.actions.map((a, i) => {
              const step = r.steps.find((s) => s.step === a.step);
              const showThought = step?.text && r.actions.findIndex((x) => x.step === a.step) === i;
              return (
                <li key={i} id={`action-${i}`}>
                  <span className="step caps">
                    Step {a.step}
                    {i === r.actions.length - 1 && a.step === lastStep && (
                      <span className="flag" title="Where the run stopped">
                        <Flag size={12} /> Stopped
                      </span>
                    )}
                  </span>
                  <div className="body">
                    {a.tool === "open_page" ? (
                      <>
                        <code>open_page({JSON.stringify(a.input.url)})</code>{" "}
                        {a.ok ? (
                          <>
                            → loaded <code>{a.path}</code>
                            {a.contentChars ? ` (${a.contentChars.toLocaleString()} chars)` : ""}
                          </>
                        ) : (
                          <span className="warn">→ {a.note}</span>
                        )}
                      </>
                    ) : a.tool === "submit_answer" ? (
                      <code>submit_answer({JSON.stringify(a.input.answer)})</code>
                    ) : (
                      <span className="warn">Invalid tool call: {a.note}</span>
                    )}
                    {showThought && <p className="thought">Model text: {step!.text}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div className="opener" id="final-answer">
        <Bookmark />
        <h2>Final answer</h2>
      </div>
      <div className="col">
        <div className="answer">{r.finalAnswer === null ? "(no answer)" : r.finalAnswer}</div>
      </div>

      <div className="opener">
        <Bookmark />
        <h2>Rules applied</h2>
      </div>
      <div className="col">
        <div className="rule">
          <span className="caps">Task</span>
          {describeTaskRule(c.taskRule)}
        </div>
        {c.objectives.map((o) => (
          <div className="rule" key={o.id}>
            <span className="caps">{o.id}</span>
            {describeObjectiveRule(o.rule)}
          </div>
        ))}
        <p style={{ color: "var(--ink-soft)" }}>{AGGREGATION_RULE}</p>
      </div>

      <div className="opener">
        <Bookmark />
        <h2>Configuration and usage</h2>
      </div>
      <div className="col">
        <dl className="facts">
          <dt className="caps">Model requested</dt>
          <dd>
            <code>{r.config.model}</code>
          </dd>
          <dt className="caps">Model reported</dt>
          <dd>{r.modelReported ? <code>{r.modelReported}</code> : "None (no API call)"}</dd>
          <dt className="caps">Settings</dt>
          <dd>
            effort {r.config.effort}, step cap {r.config.maxSteps}, {r.config.maxTokensPerStep} max tokens per step,{" "}
            {r.config.observationMode}, {r.config.systemPrompt} prompt
          </dd>
          <dt className="caps">Ended</dt>
          <dd>
            {END_LABEL[r.endReason] ?? r.endReason} after {r.usage.apiCalls} API call{r.usage.apiCalls === 1 ? "" : "s"}
          </dd>
          <dt className="caps">Tokens</dt>
          <dd>
            {r.usage.input_tokens.toLocaleString()} input · {r.usage.output_tokens.toLocaleString()} output
          </dd>
          <dt className="caps">Estimated cost</dt>
          <dd>
            {formatUsd(r.estimatedCostUsd)}. {r.pricingNote}
          </dd>
          <dt className="caps">SDK</dt>
          <dd>{r.sdkVersion ? `@anthropic-ai/sdk ${r.sdkVersion}` : "n/a"}</dd>
          <dt className="caps">Record id</dt>
          <dd>
            <code>{r.id}</code>
          </dd>
        </dl>
        <details>
          <summary className="caps" style={{ cursor: "pointer", marginBottom: "0.75rem" }}>
            Raw JSON record
          </summary>
          <pre>
            <code>{JSON.stringify(r, null, 2)}</code>
          </pre>
        </details>
      </div>
    </div>
  );
}
