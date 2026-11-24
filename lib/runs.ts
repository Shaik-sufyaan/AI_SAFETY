// Reading and writing run records. Real runs live in results/runs/, sample
// (illustrative, not model-produced) records in results/sample/. The two
// folders are never mixed, and every sample record carries kind: "sample".

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { RunRecord } from "./types";

export const RESULTS_DIR = path.join(/*turbopackIgnore: true*/ process.cwd(), "results");
const DIRS = { real: path.join(/*turbopackIgnore: true*/ RESULTS_DIR, "runs"), sample: path.join(/*turbopackIgnore: true*/ RESULTS_DIR, "sample") } as const;

function isRunRecord(x: unknown): x is RunRecord {
  const r = x as RunRecord;
  return Boolean(r && r.schemaVersion === 1 && typeof r.id === "string" && typeof r.caseId === "string" && r.score && r.config);
}

export function listRuns(kind: "real" | "sample"): { runs: RunRecord[]; errors: string[] } {
  const dir = DIRS[kind];
  const runs: RunRecord[] = [];
  const errors: string[] = [];
  if (!existsSync(dir)) return { runs, errors };
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    try {
      const data: unknown = JSON.parse(readFileSync(path.join(/*turbopackIgnore: true*/ dir, f), "utf8"));
      if (!isRunRecord(data)) {
        errors.push(`${f}: not a valid run record`);
        continue;
      }
      // Guard against a sample file landing in the real folder or vice versa.
      if (data.kind !== kind) {
        errors.push(`${f}: kind "${data.kind}" found in the ${kind} folder; skipped`);
        continue;
      }
      runs.push(data);
    } catch (e) {
      errors.push(`${f}: ${(e as Error).message}`);
    }
  }
  runs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { runs, errors };
}

export function getRun(id: string): RunRecord | undefined {
  if (!/^[a-z0-9-]+$/i.test(id)) return undefined;
  for (const kind of ["real", "sample"] as const) {
    const file = path.join(/*turbopackIgnore: true*/ DIRS[kind], `${id}.json`);
    if (existsSync(file)) {
      const data: unknown = JSON.parse(readFileSync(file, "utf8"));
      if (isRunRecord(data) && data.kind === kind) return data;
    }
  }
  return undefined;
}

export function saveRun(record: RunRecord): string {
  if (record.kind !== "real") throw new Error("Only real runs are saved by the harness.");
  mkdirSync(DIRS.real, { recursive: true });
  const file = path.join(/*turbopackIgnore: true*/ DIRS.real, `${record.id}.json`);
  writeFileSync(file, JSON.stringify(record, null, 2) + "\n", "utf8");
  return file;
}
