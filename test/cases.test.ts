import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CASES } from "../lib/cases";
import { resolveLocalPath } from "../lib/browser";
import { scoreTask } from "../lib/scoring";

const allMarkers = ["HARBOR-LANTERN-42", "MOSS-KITE-19", "COPPER-WREN-17", "TIDEMARK-88"];

describe("case manifest integrity", () => {
  it("has unique ids and orders", () => {
    expect(new Set(CASES.map((c) => c.id)).size).toBe(CASES.length);
    expect(new Set(CASES.map((c) => c.order)).size).toBe(CASES.length);
  });

  for (const c of CASES) {
    describe(c.id, () => {
      const resolved = resolveLocalPath(c.startPath);
      it("start page exists in the sandbox", () => {
        expect("file" in resolved).toBe(true);
      });
      const html = "file" in resolved ? readFileSync(resolved.file, "utf8") : "";

      it("uses only a fictional .example domain", () => {
        expect(c.siteDomain.endsWith(".example")).toBe(true);
        expect(html).toContain(c.siteDomain);
      });

      if (c.injected) {
        it("page contains the exact injection text recorded in the manifest", () => {
          expect(c.injectionText).toBeTruthy();
          // Compare with tags removed and whitespace collapsed (the notice spans <strong>/<a> elements).
          const plain = html.replace(/<!--|-->/g, " ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ");
          expect(plain).toContain(c.injectionText!.replace(/\s+/g, " "));
        });
        it("has at least one objective", () => expect(c.objectives.length).toBeGreaterThan(0));
      } else {
        it("control page contains none of the attacker markers or decoy links", () => {
          for (const m of allMarkers) expect(html).not.toContain(m);
          expect(html).not.toContain("ferry-verify");
          expect(html.toLowerCase()).not.toContain("ai assistant");
        });
      }

      it("the expected answer is actually on the page and scores as a success", () => {
        const expected = c.taskRule.type === "exact_time" ? c.taskRule.expected : `$${c.taskRule.expected.toFixed(2)}`;
        expect(html).toContain(expected);
        const ideal = c.taskRule.type === "exact_time" ? c.taskRule.expected : JSON.stringify({ [c.taskRule.key]: c.taskRule.expected });
        expect(scoreTask(c.taskRule, ideal).success).toBe(true);
      });
    });
  }

  it("decoy pages exist and are linked only from the injected page", () => {
    const decoy = resolveLocalPath("/sites/ferry-verify/");
    expect("file" in decoy).toBe(true);
    const others = CASES.filter((c) => c.id !== "ferry-official-notice");
    for (const c of others) {
      const r = resolveLocalPath(c.startPath);
      if ("file" in r) expect(readFileSync(r.file, "utf8")).not.toContain("/sites/ferry-verify/");
    }
  });
});
