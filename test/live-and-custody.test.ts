import { afterEach, describe, expect, it } from "vitest";
import { getCase } from "../lib/cases";
import { custodyStations } from "../lib/custody";
import { isSameOrigin, liveRunStatus, passwordMatches } from "../lib/live";
import { scoreRun } from "../lib/scoring";
import type { AgentAction, RunRecord } from "../lib/types";

describe("live-run gate", () => {
  const saved = { flag: process.env.ENABLE_LIVE_RUNS, key: process.env.ANTHROPIC_API_KEY };
  afterEach(() => {
    process.env.ENABLE_LIVE_RUNS = saved.flag;
    process.env.ANTHROPIC_API_KEY = saved.key;
    if (saved.flag === undefined) delete process.env.ENABLE_LIVE_RUNS;
    if (saved.key === undefined) delete process.env.ANTHROPIC_API_KEY;
  });

  it("is off unless the flag is exactly 'true'", () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    for (const v of [undefined, "", "1", "TRUE", "yes"]) {
      if (v === undefined) delete process.env.ENABLE_LIVE_RUNS;
      else process.env.ENABLE_LIVE_RUNS = v;
      expect(liveRunStatus("localhost:3000").liveRuns).toBe(false);
    }
  });

  it("is off without a key", () => {
    process.env.ENABLE_LIVE_RUNS = "true";
    delete process.env.ANTHROPIC_API_KEY;
    expect(liveRunStatus("localhost:3000")).toMatchObject({ liveRuns: false });
  });

  it("is on only for localhost hosts", () => {
    process.env.ENABLE_LIVE_RUNS = "true";
    process.env.ANTHROPIC_API_KEY = "test-key";
    expect(liveRunStatus("localhost:3000").liveRuns).toBe(true);
    expect(liveRunStatus("127.0.0.1:3000").liveRuns).toBe(true);
    expect(liveRunStatus("my-site.vercel.app").liveRuns).toBe(false);
    expect(liveRunStatus(null).liveRuns).toBe(false);
  });

  it("remote hosts need LIVE_RUNS_ALLOW_REMOTE and a long enough password", () => {
    process.env.ENABLE_LIVE_RUNS = "true";
    process.env.ANTHROPIC_API_KEY = "test-key";
    process.env.LIVE_RUNS_ALLOW_REMOTE = "true";
    process.env.LIVE_RUN_PASSWORD = "short";
    expect(liveRunStatus("my-site.vercel.app").liveRuns).toBe(false);
    process.env.LIVE_RUN_PASSWORD = "a-long-enough-password";
    expect(liveRunStatus("my-site.vercel.app")).toMatchObject({ liveRuns: true, needsPassword: true });
    // A spoofed Host: localhost must not waive the password in remote mode.
    expect(liveRunStatus("localhost:3000")).toMatchObject({ liveRuns: true, needsPassword: true });
    delete process.env.LIVE_RUNS_ALLOW_REMOTE;
    // On a hosted platform, localhost is never trusted even without remote mode.
    process.env.VERCEL = "1";
    expect(liveRunStatus("localhost:3000").liveRuns).toBe(false);
    delete process.env.VERCEL;
    expect(liveRunStatus("my-site.vercel.app").liveRuns).toBe(false);
    delete process.env.LIVE_RUN_PASSWORD;
  });

  it("checks the run password exactly", () => {
    process.env.LIVE_RUN_PASSWORD = "a-long-enough-password";
    expect(passwordMatches("a-long-enough-password")).toBe(true);
    expect(passwordMatches("a-long-enough-passwor")).toBe(false);
    expect(passwordMatches("")).toBe(false);
    expect(passwordMatches(undefined)).toBe(false);
    process.env.LIVE_RUN_PASSWORD = "short";
    expect(passwordMatches("short")).toBe(false); // too short to be accepted at all
    delete process.env.LIVE_RUN_PASSWORD;
  });

  it("never includes the key in its response", () => {
    process.env.ENABLE_LIVE_RUNS = "true";
    process.env.ANTHROPIC_API_KEY = "sk-secret-value";
    expect(JSON.stringify(liveRunStatus("localhost:3000"))).not.toContain("sk-secret");
  });

  it("requires a same-origin request", () => {
    expect(isSameOrigin("http://localhost:3000", "localhost:3000")).toBe(true);
    expect(isSameOrigin("https://evil.example", "localhost:3000")).toBe(false);
    expect(isSameOrigin(null, "localhost:3000")).toBe(false);
  });
});

function fakeRun(caseId: string, answer: string | null, actions: AgentAction[], mode: "raw_html" | "rendered_text" = "raw_html"): RunRecord {
  const c = getCase(caseId)!;
  return {
    config: { observationMode: mode },
    actions,
    finalAnswer: answer,
    endReason: "submitted",
    score: scoreRun(c, answer, actions),
  } as unknown as RunRecord;
}
const opened = (path: string, step = 1): AgentAction => ({ step, tool: "open_page", input: { url: path }, path, ok: true });

describe("custody line states", () => {
  it("with no run, everything after the page is unobserved", () => {
    const s = custodyStations(getCase("library-visible-text")!, null);
    expect(s.map((x) => x.state)).toEqual(["carried", "unobserved", "na", "unobserved"]);
  });

  it("marks a followed redirect and a carried marker", () => {
    const c = getCase("ferry-official-notice")!;
    const run = fakeRun(c.id, "07:10 TIDEMARK-88", [opened("/sites/ferry-b/"), opened("/sites/ferry-verify/", 2)]);
    expect(custodyStations(c, run).map((x) => x.state)).toEqual(["carried", "carried", "carried", "carried"]);
  });

  it("marks a resisted attack as not carried", () => {
    const c = getCase("ferry-official-notice")!;
    const run = fakeRun(c.id, "06:45", [opened("/sites/ferry-b/")]);
    expect(custodyStations(c, run).map((x) => x.state)).toEqual(["carried", "carried", "stopped", "stopped"]);
  });

  it("shows comment injections as filtered in rendered-text mode", () => {
    const c = getCase("shop-html-comment")!;
    const run = fakeRun(c.id, '{"price_usd": 84}', [opened("/sites/shop-b/")], "rendered_text");
    expect(custodyStations(c, run)[1]).toMatchObject({ state: "stopped", label: "Filtered out" });
  });
});
