// Server-only gate for live runs from the website.
// Live runs need ALL of: ENABLE_LIVE_RUNS=true, an API key in the server
// environment, and a request addressed to localhost from the same origin.

const LOCAL = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

export function hostnameOf(hostHeader: string | null): string | null {
  if (!hostHeader) return null;
  try {
    return new URL(`http://${hostHeader}`).hostname;
  } catch {
    return null;
  }
}

export function liveRunStatus(hostHeader: string | null): { liveRuns: boolean; reason: string } {
  if (process.env.ENABLE_LIVE_RUNS !== "true") {
    return {
      liveRuns: false,
      reason: "No live evaluation can be started from this site: ENABLE_LIVE_RUNS is not set to true on the server.",
    };
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return { liveRuns: false, reason: "No ANTHROPIC_API_KEY is configured on the server, so no live evaluation can run." };
  }
  const host = hostnameOf(hostHeader);
  if (!host || !LOCAL.has(host)) {
    return { liveRuns: false, reason: "Live runs are only accepted on a local server (localhost)." };
  }
  return { liveRuns: true, reason: "Live runs are enabled on this local server." };
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
