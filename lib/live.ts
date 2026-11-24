// Server-only gate for live runs from the website.
//
// Local (localhost):  ENABLE_LIVE_RUNS=true + ANTHROPIC_API_KEY.
// Remote (e.g. Vercel): additionally LIVE_RUNS_ALLOW_REMOTE=true and a
//   LIVE_RUN_PASSWORD of at least 12 characters, which the run form must send.
// Every live run must also be a same-origin request.

import { timingSafeEqual } from "node:crypto";

const LOCAL = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);
export const MIN_PASSWORD_LENGTH = 12;

export function hostnameOf(hostHeader: string | null): string | null {
  if (!hostHeader) return null;
  try {
    return new URL(`http://${hostHeader}`).hostname;
  } catch {
    return null;
  }
}

export function isLocalHost(hostHeader: string | null): boolean {
  const host = hostnameOf(hostHeader);
  return host !== null && LOCAL.has(host);
}

export interface LiveStatus {
  liveRuns: boolean;
  /** True when the run form must ask for LIVE_RUN_PASSWORD (remote host). */
  needsPassword: boolean;
  reason: string;
}

export function liveRunStatus(hostHeader: string | null): LiveStatus {
  const off = (reason: string): LiveStatus => ({ liveRuns: false, needsPassword: false, reason });
  if (process.env.ENABLE_LIVE_RUNS !== "true") {
    return off("No live evaluation can be started from this site: ENABLE_LIVE_RUNS is not set to true on the server.");
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return off("No ANTHROPIC_API_KEY is configured on the server, so no live evaluation can run.");
  }
  // The Host header is client-controlled, so it is never the only reason to
  // waive the password. Password-free runs require ALL of: remote mode off,
  // not a hosted platform, the development server (`npm run dev`, which this
  // project binds to 127.0.0.1 so nothing off this machine can reach it), and
  // a localhost Host. Everything else needs LIVE_RUNS_ALLOW_REMOTE + password.
  const remoteMode = process.env.LIVE_RUNS_ALLOW_REMOTE === "true";
  const hosted = Boolean(process.env.VERCEL);
  const devServer = process.env.NODE_ENV === "development";
  if (!remoteMode) {
    if (!hosted && devServer && isLocalHost(hostHeader)) {
      return { liveRuns: true, needsPassword: false, reason: "Live runs are enabled on this local development server." };
    }
    return off(
      "Password-free live runs only work under `npm run dev` on your own machine. Elsewhere, set LIVE_RUNS_ALLOW_REMOTE=true and a LIVE_RUN_PASSWORD.",
    );
  }
  if ((process.env.LIVE_RUN_PASSWORD ?? "").length < MIN_PASSWORD_LENGTH) {
    return off(`Remote live runs need a LIVE_RUN_PASSWORD of at least ${MIN_PASSWORD_LENGTH} characters on the server.`);
  }
  return { liveRuns: true, needsPassword: true, reason: "Live runs are enabled on this deployment and require the run password." };
}

/** Constant-time comparison of the supplied password with LIVE_RUN_PASSWORD. */
export function passwordMatches(supplied: unknown): boolean {
  const expected = process.env.LIVE_RUN_PASSWORD ?? "";
  if (typeof supplied !== "string" || expected.length < MIN_PASSWORD_LENGTH) return false;
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Same-origin check to stop other websites from triggering paid runs via the user's browser. */
export function isSameOrigin(originHeader: string | null, hostHeader: string | null): boolean {
  if (!originHeader || !hostHeader) return false;
  try {
    return new URL(originHeader).host === hostHeader;
  } catch {
    return false;
  }
}
