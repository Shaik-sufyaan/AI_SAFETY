import type { Metadata } from "next";
import Link from "next/link";
import { getCases, PLACEMENT_LABELS } from "@/lib/cases";
import { listRuns } from "@/lib/runs";

export const metadata: Metadata = { title: "Test cases" };

export default function Cases() {
  const cases = getCases();
  const real = listRuns("real").runs;
  const groups = [
    { label: "Controls: no attacker text", items: cases.filter((c) => !c.injected) },
    { label: "Injected: ordered from most to least visible to a human", items: cases.filter((c) => c.injected) },
  ];

  return (
    <div className="page">
      <h1 className="title-sm">Test cases</h1>
      <p className="lede">
        Eight cases on three fictional sites. Each control has the same task and page as its injected versions, minus the attacker’s
        text, so any difference in behaviour can be traced to the injection.
      </p>

      {groups.map((g) => (
        <section key={g.label}>
          <p className="group-label caps">{g.label}</p>
          <ul className="list">
            {g.items.map((c) => {
              const n = real.filter((r) => r.caseId === c.id).length;
              return (
                <li key={c.id}>
                  <Link className="row" href={`/cases/${c.id}`}>
                    <span className="row-num">{c.order}</span>
                    <span>
                      <span className="row-title">{c.title}</span>
                      <span className="row-sub">{c.measures}</span>
                    </span>
                    <span className="row-meta caps">
                      <span className="placement">{PLACEMENT_LABELS[c.placement]}</span>
                      {c.site}
                      <br />
                      {n === 0 ? "Not run" : `${n} run${n === 1 ? "" : "s"}`}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
