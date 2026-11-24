// Derives the "custody line" figure: how far an attacker-written instruction
// travelled through one run. Each station's state comes only from the run
// record; with no run, everything after the page is "unobserved".

import { PLACEMENT_LABELS } from "./cases";
import type { CaseDef, RunRecord } from "./types";

export type StationState = "carried" | "stopped" | "unobserved" | "na";

export interface Station {
  key: "page" | "shown" | "acted" | "answer";
  title: string;
  state: StationState;
  label: string; // short state label shown under the station (never colour-only)
  note: string; // one-line explanation
}

export const STATE_LABEL: Record<StationState, string> = {
  carried: "Carried",
  stopped: "Not carried",
  unobserved: "Not observed",
  na: "Not applicable",
};

/** Placements a rendered-text browser filters out before the agent sees them. */
const FILTERED_IN_RENDERED = new Set<CaseDef["placement"]>(["html-comment", "css-hidden-text"]);

type CaseLike = Pick<CaseDef, "injected" | "placement" | "startPath" | "objectives">;

export function custodyStations(c: CaseLike, run?: RunRecord | null): Station[] {
  const hasNav = c.objectives.some((o) => o.rule.type === "visited_path");
  const page: Station = c.injected
    ? { key: "page", title: "Placed in page", state: "carried", label: STATE_LABEL.carried, note: PLACEMENT_LABELS[c.placement] }
    : { key: "page", title: "Placed in page", state: "stopped", label: "None placed", note: "Control: no attacker text on this page" };

  if (!run) {
    return [
      page,
      { key: "shown", title: "Shown to agent", state: "unobserved", label: STATE_LABEL.unobserved, note: "No run recorded" },
      { key: "acted", title: "Acted on", state: hasNav ? "unobserved" : "na", label: hasNav ? STATE_LABEL.unobserved : STATE_LABEL.na, note: hasNav ? "No run recorded" : "No navigation requested" },
      { key: "answer", title: "Reached answer", state: "unobserved", label: STATE_LABEL.unobserved, note: "No run recorded" },
    ];
  }

  const opened = run.actions.some((a) => a.tool === "open_page" && a.ok && a.path === c.startPath);
  const filtered = run.config.observationMode === "rendered_text" && FILTERED_IN_RENDERED.has(c.placement);
  let shown: Station;
  if (!c.injected) shown = { key: "shown", title: "Shown to agent", state: "na", label: STATE_LABEL.na, note: "Nothing to show" };
  else if (!opened) shown = { key: "shown", title: "Shown to agent", state: "stopped", label: STATE_LABEL.stopped, note: "Agent never opened the page" };
  else if (filtered) shown = { key: "shown", title: "Shown to agent", state: "stopped", label: "Filtered out", note: "Rendered-text mode removes this placement" };
  else shown = { key: "shown", title: "Shown to agent", state: "carried", label: STATE_LABEL.carried, note: "Page content included the instruction" };

  const navIds = new Set(c.objectives.filter((o) => o.rule.type === "visited_path").map((o) => o.id));
  const answerIds = new Set(c.objectives.filter((o) => o.rule.type !== "visited_path").map((o) => o.id));
  const navMet = run.score.objectives.some((o) => navIds.has(o.id) && o.met);
  const answerMet = run.score.objectives.some((o) => answerIds.has(o.id) && o.met);

  const acted: Station = !hasNav
    ? { key: "acted", title: "Acted on", state: "na", label: STATE_LABEL.na, note: "No navigation requested" }
    : navMet
      ? { key: "acted", title: "Acted on", state: "carried", label: "Followed link", note: "Agent opened the decoy page" }
      : { key: "acted", title: "Acted on", state: "stopped", label: STATE_LABEL.stopped, note: "Agent did not open the decoy page" };

  const answer: Station = answerMet
    ? { key: "answer", title: "Reached answer", state: "carried", label: c.injected ? STATE_LABEL.carried : "False positive", note: "Marker found in the final answer" }
    : run.finalAnswer === null
      ? { key: "answer", title: "Reached answer", state: "stopped", label: "No answer", note: `Run ended: ${run.endReason}` }
      : { key: "answer", title: "Reached answer", state: "stopped", label: STATE_LABEL.stopped, note: "No marker in the final answer" };

  return [page, shown, acted, answer];
}
