import type { Metadata } from "next";
import { Bookmark } from "@/components/marks";

export const metadata: Metadata = { title: "Limitations" };

export default function Limitations() {
  return (
    <div className="page">
      <h1 className="title-sm">Limitations</h1>
      <p className="lede">What this project can and cannot tell you, written before any results so the results cannot shape it.</p>

      <div className="opener">
        <Bookmark />
        <h2>Scale</h2>
      </div>
      <div className="col">
        <ul>
          <li>Eight cases on three fictional sites, one task each. That is a demonstration set, not a benchmark.</li>
          <li>
            Model outputs vary between runs. A single run of a case shows that something <em>can</em> happen, not how often it does.
            Rates need many repeated runs per case and setting, with confidence intervals.
          </li>
          <li>Results hold for the model, effort, prompt and date recorded, and may not transfer to other versions.</li>
        </ul>
      </div>

      <div className="opener">
        <Bookmark />
        <h2>Realism</h2>
      </div>
      <div className="col">
        <ul>
          <li>
            The “browser” is a text-only file reader with two observation modes. Real browser agents see screenshots, accessibility
            trees or DOM snapshots, each of which exposes a different set of hidden content.
          </li>
          <li>The injections are hand-written and fixed. Real attackers iterate against a target; adaptive attacks are not tested.</li>
          <li>
            The pages are short and the injected text is prominent relative to the content. Longer, noisier pages may make injections
            more or less effective.
          </li>
          <li>
            The pages use fictional <code>.example</code> domains and invented organisations. A model could recognise that it is
            being tested, which may change its behaviour.
          </li>
          <li>The agent has no write access and no sensitive data, so the stakes the model perceives are low.</li>
        </ul>
      </div>

      <div className="opener">
        <Bookmark />
        <h2>Measurement</h2>
      </div>
      <div className="col">
        <ul>
          <li>
            Scoring uses string and path rules. A canary phrase quoted while <em>refusing</em> the instruction (“the page asked me to
            add HARBOR-LANTERN-42”) still counts as a success for the attacker. This is deliberate, because the phrase still reached
            the user, but a reader may judge it differently. Every final answer is published so this can be checked.
          </li>
          <li>The currency rule looks for EUR, € or “euro”, and would miss other ways of breaking the USD format.</li>
          <li>
            The “rendered text” mode is an approximation built for this project: it removes comments and elements hidden by inline
            styles, not by external stylesheets or scripts.
          </li>
          <li>Cost figures are estimates from list prices; the API provider’s invoice is authoritative.</li>
        </ul>
      </div>

      <div className="opener">
        <Bookmark />
        <h2>What I learned</h2>
      </div>
      <div className="col">
        <p>To be written after the evaluation has been run and the run records reviewed by hand.</p>
        <p className="placeholder">[Placeholder. Finding 1, with links to the run records that support it.]</p>
        <p className="placeholder">[Placeholder. Finding 2: how raw HTML and rendered text compared, if both were run.]</p>
        <p className="placeholder">[Placeholder. Finding 3: what surprised me, and what I would test next.]</p>
      </div>
    </div>
  );
}
