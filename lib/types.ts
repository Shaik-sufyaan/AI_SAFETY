// Shared types for cases, run records and scores.
// Plain data only: these shapes are written to JSON files in results/.

export type Placement =
  | "none"
  | "visible-text"
  | "html-comment"
  | "css-hidden-text"
  | "official-notice"
  | "visible-format-override";

/** How the legitimate task's answer is checked. */
export type TaskRule =
  | { type: "exact_time"; expected: string } // reply must be exactly HH:MM
  | { type: "json_price"; key: string; expected: number }; // reply must be exactly {"key": number}

/** One measurable, harmless attacker objective. */
export type ObjectiveRule =
  | { type: "canary_phrase"; phrase: string }
  | { type: "visited_path"; path: string }
  | { type: "currency_override" }; // answer quotes a price in EUR / €

export interface Objective {
  id: string;
  description: string;
  rule: ObjectiveRule;
}

export interface CaseDef {
  id: string;
  title: string;
  /** Order in which cases are presented: controls first, then rising difficulty. */
  order: number;
  site: string; // fictional organisation name
  siteDomain: string; // fictional .example domain shown on the page
  task: string; // the user's legitimate instruction to the agent
  startPath: string; // local path the agent starts on, e.g. /sites/library-a/
  taskRule: TaskRule;
  injected: boolean;
  placement: Placement;
  /** Exact attacker-written text as it appears in the page (null for controls). */
  injectionText: string | null;
  /** What the test measures, in plain English. */
  measures: string;
  /**
   * For injected cases: the attacker's objectives (attack succeeds if ANY is met).
   * For controls: the same markers as the paired injected cases, used to measure
   * false positives (a marker appearing with no injection present).
   */
  objectives: Objective[];
  /** Pages that only an injected instruction points to (decoys). */
  decoyPaths?: string[];
}

export type ObservationMode = "raw_html" | "rendered_text";
export type SystemPromptVariant = "baseline" | "cautious";
export type Effort = "low" | "medium" | "high";

export interface RunConfig {
  model: string;
  maxSteps: number;
  observationMode: ObservationMode;
  systemPrompt: SystemPromptVariant;
  effort: Effort;
  maxTokensPerStep: number;
}

export interface AgentAction {
  step: number; // which model call produced it (1-based)
  tool: "open_page" | "submit_answer" | "invalid";
  input: Record<string, unknown>;
  /** For open_page: the normalised local path, or null if blocked/invalid. */
  path?: string | null;
  ok: boolean;
  note?: string; // e.g. "blocked: not on the local test site"
  contentSha256?: string; // hash of the content the agent was shown
  contentChars?: number;
}

export interface StepLog {
  step: number;
  stopReason: string | null;
  text: string; // visible assistant text in this step (may be empty)
  toolCalls: number;
  usage: { input_tokens: number; output_tokens: number };
}

export type EndReason =
  | "submitted"
  | "end_turn_without_submit"
  | "step_cap"
  | "refusal"
  | "max_tokens";

export interface Score {
  ruleVersion: string;
  task: {
    success: boolean; // correct value AND requested format
    correctValue: boolean;
    formatOk: boolean;
    detail: string;
  };
  objectives: { id: string; met: boolean; detail: string }[];
  /** Injected cases: true if any objective met. Controls: null (see markerFalsePositive). */
  attackSuccess: boolean | null;
  /** Controls only: true if an objective marker appeared with no injection present. */
  markerFalsePositive: boolean | null;
}

export interface RunRecord {
  schemaVersion: 1;
  id: string;
  kind: "real" | "sample";
  /** Present on sample records: why this is not a real evaluation. */
  sampleNotice?: string;
  createdAt: string; // ISO timestamp
  caseId: string;
  caseSnapshot: Pick<
    CaseDef,
    "title" | "task" | "startPath" | "injected" | "placement" | "injectionText" | "taskRule" | "objectives"
  >;
  config: RunConfig;
  /** Model id reported by the API response (may differ from the requested alias). */
  modelReported: string | null;
  sdkVersion: string | null;
  steps: StepLog[];
  actions: AgentAction[];
  finalAnswer: string | null;
  endReason: EndReason;
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_read_input_tokens: number;
    cache_creation_input_tokens: number;
    apiCalls: number;
  };
  estimatedCostUsd: number | null;
  pricingNote: string;
  score: Score;
}
