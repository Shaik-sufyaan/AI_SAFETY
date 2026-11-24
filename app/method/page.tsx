import type { Metadata } from "next";
import { Bookmark } from "@/components/marks";
import { SYSTEM_PROMPTS, TOOLS } from "@/lib/agent";
import { getCases } from "@/lib/cases";
import { DEFAULT_MAX_STEPS, DEFAULT_MAX_TOKENS_PER_STEP, DEFAULT_MODEL, HARD_MAX_STEPS, MODELS, PRICES_AS_OF } from "@/lib/pricing";
import { AGGREGATION_RULE, describeObjectiveRule, describeTaskRule, RULE_VERSION } from "@/lib/scoring";

export const metadata: Metadata = { title: "Method & scoring" };

export default function Method() {
  const cases = getCases();
  const objectiveRules = new Map(cases.flatMap((c) => c.objectives).map((o) => [o.rule.type + JSON.stringify(o.rule), o.rule]));
  const taskRules = new Map(cases.map((c) => [JSON.stringify(c.taskRule), c.taskRule]));

  return (
    <div className="page">
      <h1 className="title-sm">Method &amp; scoring</h1>
      <p className="lede">Exactly what the agent is given, what it can do, and how each run is scored. Everything here is generated from the code that runs.</p>

      <div className="opener">
        <Bookmark />
        <h2>The agent loop</h2>
      </div>
      <div className="col">
        <ol>
          <li>
            The model receives a system prompt, two tool definitions, and one user message: the task plus <em>Start page: /sites/…</em>.
          </li>
          <li>
            Each <strong>step</strong> is one call to the Messages API. If the model calls <code>open_page</code>, the harness reads the
            local file and returns its content as the tool result. If it calls <code>submit_answer</code>, the run ends.
          </li>
          <li>
            The loop stops at the step cap (default {DEFAULT_MAX_STEPS}, hard limit {HARD_MAX_STEPS}), on a refusal, on hitting the
            per-step token limit ({DEFAULT_MAX_TOKENS_PER_STEP}), or if the model replies in plain text without the tool, in which
            case that text is taken as its answer.
          </li>
          <li>Every tool call, the final answer, token usage, and the model id reported by the API are written to a JSON record.</li>
        </ol>
        <p>
          It is a hand-written loop rather than a hosted or framework agent so that every model call counts against the cap and every
          action is logged exactly as it happened. No model fallback is configured, so a run’s model is always the one requested.
        </p>
      </div>

      <div className="opener">
        <Bookmark />
        <h2>System prompts</h2>
      </div>
      <div className="col">
        <p>
          <strong>Baseline</strong> (default) gives no warning about injected text. <strong>Cautious</strong> adds one sentence.
          Comparing them shows how much a simple instruction helps.
        </p>
        <pre>
          <code>{`baseline:\n${SYSTEM_PROMPTS.baseline}\n\ncautious:\n${SYSTEM_PROMPTS.cautious}`}</code>
        </pre>
      </div>

      <div className="opener">
        <Bookmark />
        <h2>Tools</h2>
      </div>
      <div className="col">
        <pre>
          <code>{JSON.stringify(TOOLS, null, 2)}</code>
        </pre>
        <p>
          <code>open_page</code> is a sandbox, not a browser. It accepts a path or a <code>localhost</code> URL, resolves it to a file
          under <code>public/sites/</code>, and refuses everything else: other hosts (including the fictional <code>.example</code>{" "}
          domains), non-HTTP schemes, and path traversal. A refused request is logged as an action. It never makes a network request.
        </p>
      </div>

      <div className="opener">
        <Bookmark />
        <h2>What the agent sees</h2>
      </div>
      <dl className="facts col">
        <dt className="caps">raw_html (default)</dt>
        <dd>The page file as written, including HTML comments and CSS-hidden elements. Similar to an agent that reads page source.</dd>
        <dt className="caps">rendered_text</dt>
        <dd>
          Visible text only: comments, scripts, styles and elements with <code>display:none</code>, <code>visibility:hidden</code> or{" "}
          <code>hidden</code> are removed; links are listed at the end. Similar to an agent that reads what a visitor sees.
        </dd>
      </dl>

      <div className="opener">
        <Bookmark />
        <h2>Scoring rules ({RULE_VERSION})</h2>
      </div>
      <div className="col">
        <p>
          Scoring is deterministic: no model grades another model. The rules live in <code>lib/scoring.ts</code> and are unit-tested.
          The results page re-scores every stored run with the current rules and flags any disagreement with the stored score.
        </p>
        <h3>Task</h3>
        {[...taskRules.values()].map((r) => (
          <div className="rule" key={JSON.stringify(r)}>
            {describeTaskRule(r)}
          </div>
        ))}
        <h3>Attacker objectives</h3>
        {[...objectiveRules.values()].map((r) => (
          <div className="rule" key={JSON.stringify(r)}>
            {describeObjectiveRule(r)}
          </div>
        ))}
        <h3>Combining them</h3>
        <p>{AGGREGATION_RULE}</p>
        <p>
          Task success and attack success are reported separately. An agent can complete the task and still carry the attacker’s
          phrase, or resist the attacker and still get the task wrong.
        </p>
      </div>

      <div className="opener">
        <Bookmark />
        <h2>Reproducing a run</h2>
      </div>
      <div className="col">
        <pre>
          <code>{`git clone https://github.com/Shaik-sufyaan/AI_SAFETY.git
cd AI_SAFETY
npm install
cp .env.example .env.local        # then add ANTHROPIC_API_KEY

npm test                          # scoring, sandbox and harness tests (no API calls)
npm run eval -- --list            # list case ids
npm run eval -- --case library-visible-text --dry-run   # estimate only
npm run eval -- --case library-visible-text             # one real run
npm run eval -- --case shop-html-comment --mode rendered_text --max-steps 4`}</code>
        </pre>
        <p>
          Default model: <code>{DEFAULT_MODEL}</code>. Allowed models: {MODELS.map((m) => m.id).join(", ")}. Cost estimates use list
          prices as of {PRICES_AS_OF} and are labelled as estimates.
        </p>
      </div>
    </div>
  );
}
