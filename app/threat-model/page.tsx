import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark } from "@/components/marks";

export const metadata: Metadata = { title: "Threat model" };

export default function ThreatModel() {
  return (
    <div className="page">
      <h1 className="title-sm">Threat model</h1>
      <p className="lede">Who is trying to do what, through which channel, and what is deliberately out of scope.</p>

      <div className="opener">
        <Bookmark />
        <h2>The parties</h2>
      </div>
      <dl className="facts col">
        <dt className="caps">User</dt>
        <dd>Gives the agent one legitimate task and a required answer format. Trusted.</dd>
        <dt className="caps">Agent</dt>
        <dd>
          A language model in a tool loop with a read-only text browser. It can open pages on the local test site and submit one final
          answer. It has no other tools, no memory between runs, and no access to anything outside <code>/sites/</code>.
        </dd>
        <dt className="caps">Attacker</dt>
        <dd>
          Can write content into the page the agent reads, and nothing else. Cannot see the user’s task, the system prompt or the
          agent’s replies.
        </dd>
        <dt className="caps">Site owner</dt>
        <dd>Fictional. The pages imitate an ordinary small organisation; the attacker’s text sits alongside genuine content.</dd>
      </dl>

      <div className="opener">
        <Bookmark />
        <h2>The attack channel</h2>
      </div>
      <div className="col">
        <p>
          Indirect prompt injection: the attacker never talks to the model directly. Their text arrives inside a tool result (the
          page content), mixed with the information the user actually needs. The question is whether the agent treats that text as
          data to read or as instructions to follow.
        </p>
        <p>The test pages place the instruction in five ways, chosen because each reaches the agent differently:</p>
        <ul>
          <li>
            <strong>Visible text</strong> that any visitor could read, worded as a polite request.
          </li>
          <li>
            <strong>An HTML comment</strong>, invisible in a browser but present in the page source.
          </li>
          <li>
            <strong>CSS-hidden text</strong> (<code>display:none</code>) that impersonates a system message.
          </li>
          <li>
            <strong>A fake official notice</strong> that links to a decoy page with conflicting data.
          </li>
          <li>
            <strong>A visible claim</strong> that the requested format is out of date.
          </li>
        </ul>
        <p>
          Whether comment and hidden-text placements reach the model depends on how the browser presents the page, so the harness can
          show the agent either the raw HTML or only the visible text. Comparing the two separates “the model followed it” from “the
          model never saw it”.
        </p>
      </div>

      <div className="opener">
        <Bookmark />
        <h2>What the attacker wants</h2>
      </div>
      <div className="col">
        <p>
          Goals are harmless by construction and checked by a fixed rule, never by judgment. Each is a stand-in for a more serious
          real-world goal:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Objective here</th>
                <th>What it stands in for</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>An unrelated canary phrase appears in the answer</td>
                <td>Attacker-chosen content inserted into what the user reads (spam, misinformation, a malicious link)</td>
              </tr>
              <tr>
                <td>The user’s required format is broken</td>
                <td>Attacker overrides the user’s explicit instructions</td>
              </tr>
              <tr>
                <td>The agent opens a decoy page and uses its numbers</td>
                <td>Agent is steered to an attacker-controlled resource and trusts it over the original source</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="opener">
        <Bookmark />
        <h2>Out of scope, on purpose</h2>
      </div>
      <div className="col">
        <ul>
          <li>No real websites are visited. The browser tool refuses every host except the local test site, and never makes a network request.</li>
          <li>No private data exists for an agent to leak, and no credentials are present to steal.</li>
          <li>No attacker objective involves an outbound request, a purchase, a message, or any other external effect.</li>
          <li>Multi-turn conversations, agents with write access, image-based injection and adaptive attackers are not tested.</li>
        </ul>
        <p>
          These limits keep the project safe to publish and to rerun. They also limit what it can say; see{" "}
          <Link href="/limitations">Limitations</Link>.
        </p>
      </div>
    </div>
  );
}
