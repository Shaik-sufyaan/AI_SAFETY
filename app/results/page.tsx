import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark, StateDot, Stamp } from "@/components/marks";
import { getCase, getCases } from "@/lib/cases";
import { listRuns } from "@/lib/runs";
import { AGGREGATION_RULE, describeObjectiveRule, describeTaskRule, RULE_VERSION, scoreRun } from "@/lib/scoring";
import type { RunRecord } from "@/lib/types";

export const metadata: Metadata = { title: "Results" };

function rescoreMismatch(r: RunRecord): boolean {
  const now = scoreRun(r.caseSnapshot, r.finalAnswer, r.actions);
  return now.attackSuccess !== r.score.attackSuccess || now.task.success !== r.score.task.success || now.markerFalsePositive !== r.score.markerFalsePositive;
}

function Outcome({ r }: { r: RunRecord }) {
  if (r.score.attackSuccess === null) {
    return r.score.markerFalsePositive ? (
      <span className="mark mark-carried caps">
        <StateDot state="carried" size={13} /> False positive
      </span>
    ) : (
      <span className="mark mark-stopped caps">
        <StateDot state="na" size={13} /> Control, clean
      </span>
    );
  }
  return r.score.attackSuccess ? (
    <span className="mark mark-carried caps">
      <StateDot state="carried" size={13} /> Attack succeeded
    </span>
  ) : (
    <span className="mark mark-stopped caps">
      <StateDot state="stopped" size={13} /> Resisted
    </span>
  );
}

function RunTable({ runs }: { runs: RunRecord[] }) {
  return (
    <div className="table-wrap">
      <table className="runs-table">
        <thead>
          <tr>
            <th>Date (UTC)</th>
            <th>Case</th>
            <th>Model</th>
            <th>Sees / prompt</th>
            <th>Final answer</th>
            <th>Task</th>
            <th>Attacker objective</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((r) => (
            <tr key={r.id}>
              <td>
                <Link href={`/results/${r.id}`}>{r.kind === "sample" ? "Sample" : r.createdAt.slice(0, 16).replace("T", " ")}</Link>
              </td>
              <td>{getCase(r.caseId)?.title ?? r.caseSnapshot.title}</td>
              <td>
                <code>{r.config.model}</code>
              </td>
              <td>
                {r.config.observationMode} / {r.config.systemPrompt}
              </td>
              <td>
                <code>{r.finalAnswer === null ? "(none)" : r.finalAnswer.length > 60 ? r.finalAnswer.slice(0, 60) + "…" : r.finalAnswer}</code>
              </td>
              <td>{r.score.task.success ? "Succeeded" : "Failed"}</td>
              <td>
                <Outcome r={r} />
                {rescoreMismatch(r) && <span className="warn caps"> · stored score differs from current rule</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Results() {
  const { runs: real, errors } = listRuns("real");
  const { runs: samples } = listRuns("sample");
  const cases = getCases();

  return (
    <div className="page">
      <h1 className="title-sm">Results</h1>
      <p className="lede">
        Every real run is listed here with its model, date, answer and score. Sample records, written by hand to show the format, are
        kept in a separate section below and never counted.
      </p>

      <div className="opener">
        <Bookmark />
        <h2>Real runs</h2>
      </div>

      {errors.length > 0 && (
        <div className="notice error col">
          Some files in <code>results/runs/</code> could not be read: {errors.join("; ")}
        </div>
      )}

      {real.length === 0 ? (
        <div className="empty">
          <h3>No live evaluation has been run yet.</h3>
          <p>
            There are no model results in this repository. When a run is made with <code>npm run eval -- --case &lt;id&gt;</code> (or
            from a case page on a local server), its record is saved to <code>results/runs/</code> and appears here.
          </p>
          <p style={{ margin: 0 }}>Until then, nothing on this site should be read as a finding.</p>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Case</th>
                  <th className="num">Runs</th>
                  <th className="num">Task succeeded</th>
                  <th className="num">Attack succeeded</th>
                  <th className="num">Control false positives</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => {
                  const rs = real.filter((r) => r.caseId === c.id);
                  return (
                    <tr key={c.id}>
                      <td>
                        <Link href={`/cases/${c.id}`}>{c.title}</Link>
                      </td>
                      <td className="num">{rs.length}</td>
                      <td className="num">{rs.length ? `${rs.filter((r) => r.score.task.success).length} of ${rs.length}` : "–"}</td>
                      <td className="num">{c.injected && rs.length ? `${rs.filter((r) => r.score.attackSuccess).length} of ${rs.length}` : "–"}</td>
                      <td className="num">{!c.injected && rs.length ? `${rs.filter((r) => r.score.markerFalsePositive).length} of ${rs.length}` : "–"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="col" style={{ color: "var(--ink-soft)" }}>
            Counts mix every model and setting listed below. With this few runs they describe what happened, not how often it would
            happen again.
          </p>
          <RunTable runs={real} />
        </>
      )}

      <div className="opener">
        <Bookmark />
        <h2>How every run is scored (rule {RULE_VERSION})</h2>
      </div>
      <div className="col">
        <p>
          Scores are computed by fixed rules in <code>lib/scoring.ts</code>, never by another model. This page re-scores each stored run
          with the current rules and flags any disagreement.
        </p>
      </div>
      <div className="table-wrap">
        <table className="rule-table">
          <thead>
            <tr>
              <th>Rule</th>
              <th>Applies to cases</th>
              <th>How it is checked</th>
            </tr>
          </thead>
          <tbody>
            {[...new Map(cases.map((c) => [JSON.stringify(c.taskRule), c.taskRule])).values()].map((rule) => {
              const users = cases.filter((c) => JSON.stringify(c.taskRule) === JSON.stringify(rule));
              return (
                <tr key={JSON.stringify(rule)}>
                  <td>
                    <span className="caps">Task</span>
                    <br />
                    <code>{rule.type === "exact_time" ? rule.expected : `${rule.key}: ${rule.expected}`}</code>
                  </td>
                  <td>{users.map((c) => c.order).join(", ")}</td>
                  <td>{describeTaskRule(rule)}</td>
                </tr>
              );
            })}
            {[...new Map(cases.flatMap((c) => c.objectives).map((o) => [o.id, o])).values()].map((o) => {
              const users = cases.filter((c) => c.objectives.some((x) => x.id === o.id));
              return (
                <tr key={o.id}>
                  <td>
                    <span className="caps">Objective</span>
                    <br />
                    <code>{o.id}</code>
                  </td>
                  <td>
                    {users.map((c) => `${c.order}${c.injected ? "" : " (control)"}`).join(", ")}
                  </td>
                  <td>{describeObjectiveRule(o.rule)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="col">
        <p style={{ color: "var(--ink-soft)" }}>{AGGREGATION_RULE}</p>
        <p>
          Case numbers match the <Link href="/cases">test cases list</Link>.
        </p>
      </div>

      <div className="opener">
        <Bookmark />
        <h2>Sample data (not results)</h2>
      </div>
      <div className="sample-band">
        <Stamp />
        <p>
          <strong>SAMPLE DATA.</strong> The records below were written by hand to illustrate the record format and this page. No model
          produced them, no API was called, and they are excluded from every count above. They come from{" "}
          <code>scripts/make-sample-data.ts</code>.
        </p>
      </div>
      <RunTable runs={samples} />
    </div>
  );
}
