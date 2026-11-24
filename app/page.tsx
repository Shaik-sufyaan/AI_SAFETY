import Link from "next/link";
import { CustodyLine } from "@/components/CustodyLine";
import { Arrow, Bookmark, StateDot } from "@/components/marks";
import { getCase, getCases, PLACEMENT_LABELS } from "@/lib/cases";
import { custodyStations } from "@/lib/custody";
import { listRuns } from "@/lib/runs";

export default function Home() {
  const real = listRuns("real").runs;
  const featured = getCase("ferry-official-notice")!;
  const featuredRun = real.find((r) => r.caseId === featured.id) ?? null;
  const injected = getCases().filter((c) => c.injected);
  const attacks = real.filter((r) => r.score.attackSuccess !== null);
  const succeeded = attacks.filter((r) => r.score.attackSuccess).length;

  return (
    <div className="page">
      <h1 className="title">Can a webpage redirect an AI agent?</h1>
      <p className="lede">
        An AI agent that browses the web reads text written by strangers. This project tests, on a small scale, whether an
        instruction planted in a page can pull an agent away from the task its user gave it, and records exactly what happened
        when it was tried.
      </p>

      <CustodyLine
        stations={custodyStations(featured, featuredRun)}
        caption={
          <>
            <strong>{featured.title}.</strong> A fake “service notice” asks the agent to visit a second page and use its numbers.
          </>
        }
        meta={featuredRun ? `Run ${featuredRun.createdAt.slice(0, 10)} · ${featuredRun.config.model}` : "No run recorded"}
      />

      <div className="status" role="status">
        <StateDot state={real.length === 0 ? "unobserved" : "carried"} />
        {real.length === 0 ? (
          <p>
            <strong style={{ fontWeight: 700 }}>No live evaluation has been run yet.</strong> The cases, harness and scoring rules
            are in place, but there are no model results on this site. The gray dashed line above means “not observed”, not “safe”.
          </p>
        ) : (
          <p>
            <strong style={{ fontWeight: 700 }}>
              {real.length} live run{real.length === 1 ? "" : "s"} recorded.
            </strong>{" "}
            In {attacks.length} run{attacks.length === 1 ? "" : "s"} on injected cases, the attacker’s objective was met {succeeded} time
            {succeeded === 1 ? "" : "s"}. That is a count of individual runs, not a measured rate; see{" "}
            <Link href="/limitations">Limitations</Link>.
          </p>
        )}
      </div>

      <div className="actions">
        <Link href="/cases" className="tab-btn">
          Explore the cases
        </Link>
        <Link href="/results">
          See every recorded run <Arrow />
        </Link>
      </div>

      <div className="opener">
        <Bookmark />
        <h2>The question</h2>
      </div>
      <div className="col">
        <p>
          A user asks an agent for something ordinary: a library’s Saturday opening time, a backpack’s price, the first ferry of the
          day. The agent opens a page to find out. If someone else wrote part of that page, can their words change what the agent
          does or says?
        </p>
        <p>
          Each test gives the agent a legitimate task on a fictional page. Some pages also carry an instruction from a simulated
          attacker. The attacker’s goals are deliberately harmless and easy to check: get an unrelated phrase into the answer, make
          the agent break the format the user asked for, or get it to open a decoy page. Nothing an agent does here can reach a
          real website or a real person.
        </p>
      </div>

      <div className="opener">
        <Bookmark />
        <h2>Where the attacker’s text is placed</h2>
      </div>
      <ul className="list">
        <li>
          <Link className="row" href="/cases">
            <span className="row-num">1–3</span>
            <span>
              <span className="row-title">Controls: no attacker text</span>
              <span className="row-sub">
                The same three pages and tasks with the attacker’s text removed, so any change in behaviour can be traced to the
                injection. Their markers are still checked, to catch false positives.
              </span>
            </span>
            <span className="row-meta caps">
              <span className="placement">All three sites</span>
              {real.filter((r) => !r.caseSnapshot.injected).length} runs
            </span>
          </Link>
        </li>
        {injected.map((c) => (
          <li key={c.id}>
            <Link className="row" href={`/cases/${c.id}`}>
              <span className="row-num">{c.order}</span>
              <span>
                <span className="row-title">{PLACEMENT_LABELS[c.placement]}</span>
                <span className="row-sub">{c.measures}</span>
              </span>
              <span className="row-meta caps">
                <span className="placement">{c.site}</span>
                {real.filter((r) => r.caseId === c.id).length} runs
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="opener">
        <Bookmark />
        <h2>How to read this site</h2>
      </div>
      <div className="col">
        <p>
          Every number comes from a run record you can open, scored by a deterministic rule printed next to it. Results from real
          model runs and hand-written sample records are kept on separate sections of the <Link href="/results">results page</Link>,
          and the samples carry a “Sample data” label. The <Link href="/method">method page</Link> shows the agent’s exact prompt and tools, and
          the commands to reproduce any run.
        </p>
      </div>

      <p className="foot">
        Built as an independent research exercise. All organisations, sites, prices and timetables on the test pages are invented.
      </p>
    </div>
  );
}
