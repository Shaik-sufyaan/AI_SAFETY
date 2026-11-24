import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { readFileSync } from "node:fs";
import { CustodyLine } from "@/components/CustodyLine";
import { RunPanel } from "@/components/RunPanel";
import { Arrow, Bookmark } from "@/components/marks";
import { openPage, resolveLocalPath } from "@/lib/browser";
import { CASES, getCase, PLACEMENT_LABELS } from "@/lib/cases";
import { custodyStations } from "@/lib/custody";
import { listRuns } from "@/lib/runs";
import { AGGREGATION_RULE, describeObjectiveRule, describeTaskRule } from "@/lib/scoring";

export function generateStaticParams() {
  return CASES.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const c = getCase((await params).id);
  return { title: c ? c.title : "Case not found" };
}

const strip = (s: string) => s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

/** Page source from <body> to </main>, with the lines that carry the injection flagged. */
function sourceExcerpt(html: string, injection: string | null) {
  const lines = html.split(/\r?\n/);
  const from = Math.max(0, lines.findIndex((l) => l.includes("<body")));
  const toIdx = lines.findIndex((l) => l.includes("</main>"));
  const to = toIdx === -1 ? lines.length - 1 : toIdx;
  let hiStart = -1;
  let hiEnd = -1;
  if (injection) {
    const plain = injection.replace(/\s+/g, " ");
    const head = plain.slice(0, 24);
    const tail = plain.slice(-24);
    hiStart = lines.findIndex((l) => strip(l).includes(head) || l.includes(head));
    const endRel = lines.slice(Math.max(hiStart, 0)).findIndex((l) => strip(l).includes(tail) || l.includes(tail));
    hiEnd = endRel === -1 ? hiStart : hiStart + endRel;
  }
  return lines.slice(from, to + 1).map((text, i) => ({ n: from + i + 1, text, hi: from + i >= hiStart && from + i <= hiEnd && hiStart !== -1 }));
}

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = getCase(id);
  if (!c) notFound();

  const resolved = resolveLocalPath(c.startPath);
  const html = "file" in resolved ? readFileSync(/*turbopackIgnore: true*/ resolved.file, "utf8") : "";
  const excerpt = sourceExcerpt(html, c.injectionText);
  const raw = openPage(c.startPath, "raw_html");
  const rendered = openPage(c.startPath, "rendered_text");
  const pageChars = { raw_html: raw.ok ? raw.content.length : 4000, rendered_text: rendered.ok ? rendered.content.length : 4000 };
  const runs = listRuns("real").runs.filter((r) => r.caseId === c.id);
  const sorted = [...CASES].sort((a, b) => a.order - b.order);
  const idx = sorted.findIndex((x) => x.id === c.id);
  const prev = sorted[idx - 1];
  const next = sorted[idx + 1];

  return (
    <div className="page">
      <p className="caps" style={{ color: "var(--taupe)", margin: "0 0 0.8rem" }}>
        <Link href="/cases">Test cases</Link>
      </p>
      <h1 className="title-sm">{c.title}</h1>
      <p className="lede">{c.measures}</p>

      <CustodyLine
        stations={custodyStations(c, runs[0] ?? null)}
        caption={runs[0] ? <>Latest real run of this case.</> : <>No real run of this case has been recorded.</>}
        meta={runs[0] ? `${runs[0].createdAt.slice(0, 10)} · ${runs[0].config.model}` : "Not run"}
      />

      <div className="opener">
        <Bookmark />
        <h2>The user’s task</h2>
      </div>
      <div className="col">
        <blockquote className="task-quote">
          {c.task}
          <footer className="caps">Sent to the agent verbatim, with “Start page: {c.startPath}”</footer>
        </blockquote>
        <dl className="facts">
          <dt className="caps">Fictional site</dt>
          <dd>
            {c.site} ({c.siteDomain})
          </dd>
          <dt className="caps">Case</dt>
          <dd>
            {c.order} of {CASES.length} · {PLACEMENT_LABELS[c.placement]}
          </dd>
          <dt className="caps">Start page</dt>
          <dd>
            <a href={c.startPath} target="_blank" rel="noopener">
              {c.startPath}
            </a>
          </dd>
          <dt className="caps">Correct answer</dt>
          <dd>
            <code>{c.taskRule.type === "exact_time" ? c.taskRule.expected : JSON.stringify({ [c.taskRule.key]: c.taskRule.expected })}</code>
          </dd>
        </dl>
      </div>

      <div className="opener">
        <Bookmark />
        <h2>{c.injected ? "The attacker’s instruction" : "No attacker instruction"}</h2>
      </div>
      <div className="col">
        {c.injected ? (
          <blockquote className="injection">
            {c.injectionText}
            <footer className="caps">Placement: {PLACEMENT_LABELS[c.placement]}. Written by the simulated attacker.</footer>
          </blockquote>
        ) : (
          <p>
            This page is identical in task and layout to its injected versions, with the attacker’s text removed. The markers below are
            still checked so that any appearance would show up as a false positive.
          </p>
        )}
      </div>

      <div className="opener">
        <Bookmark />
        <h2>The page</h2>
      </div>
      <div className="preview">
        <div className="preview-bar caps">
          <span>Fictional page · {c.siteDomain}</span>
          <span>Rendered in a sandboxed frame</span>
        </div>
        <iframe src={c.startPath} title={`Test page for ${c.title}`} sandbox="" loading="lazy" />
      </div>
      <details>
        <summary className="caps" style={{ cursor: "pointer", margin: "0.5rem 0 0.75rem" }}>
          Page source{c.injected ? " (injection highlighted)" : ""}
        </summary>
        <pre className="source">
          <code>
            {excerpt.map((l) => (
              <span key={l.n} style={{ display: "block" }}>
                <span style={{ color: "var(--taupe)", userSelect: "none" }}>{String(l.n).padStart(3, " ")}  </span>
                {l.hi ? <mark>{l.text}</mark> : l.text}
              </span>
            ))}
          </code>
        </pre>
      </details>

      <div className="opener">
        <Bookmark />
        <h2>Scoring rule</h2>
      </div>
      <div className="col">
        <div className="rule">
          <span className="caps">Legitimate task</span>
          {describeTaskRule(c.taskRule)}
        </div>
        {c.objectives.map((o) => (
          <div className="rule" key={o.id}>
            <span className="caps">
              {c.injected ? "Attacker objective" : "Marker checked for false positives"} · {o.id}
            </span>
            {o.description} {describeObjectiveRule(o.rule)}
          </div>
        ))}
        <p style={{ color: "var(--ink-soft)" }}>{AGGREGATION_RULE}</p>
        <p>
          Source: <code>lib/scoring.ts</code>, tested in <code>test/scoring.test.ts</code>.
        </p>
      </div>

      <div className="opener">
        <Bookmark />
        <h2>Real runs of this case</h2>
      </div>
      {runs.length === 0 ? (
        <p className="col">None recorded. Nothing on this page is a model result.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Model</th>
                <th>Sees</th>
                <th>Task</th>
                <th>{c.injected ? "Attack" : "False positive"}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.id}>
                  <td>{r.createdAt.slice(0, 16).replace("T", " ")}</td>
                  <td>{r.config.model}</td>
                  <td>{r.config.observationMode}</td>
                  <td>{r.score.task.success ? "Succeeded" : "Failed"}</td>
                  <td>{c.injected ? (r.score.attackSuccess ? "Succeeded" : "Resisted") : r.score.markerFalsePositive ? "Yes" : "No"}</td>
                  <td>
                    <Link href={`/results/${r.id}`}>Record</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="opener">
        <Bookmark />
        <h2>Run it</h2>
      </div>
      <RunPanel caseId={c.id} pageChars={pageChars} />

      <div className="actions" style={{ justifyContent: "space-between", maxWidth: "var(--measure)", marginTop: "3.5rem" }}>
        {prev ? (
          <Link href={`/cases/${prev.id}`}>
            <span style={{ display: "inline-block", transform: "scaleX(-1)" }}>
              <Arrow />
            </span>{" "}
            {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/cases/${next.id}`}>
            {next.title} <Arrow />
          </Link>
        ) : (
          <Link href="/method">
            Method &amp; scoring <Arrow />
          </Link>
        )}
      </div>
    </div>
  );
}
