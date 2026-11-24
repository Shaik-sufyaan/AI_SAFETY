import type { Metadata } from "next";
import Link from "next/link";
import { JetBrains_Mono, Libre_Caslon_Display, Libre_Caslon_Text } from "next/font/google";
import { NavLinks } from "@/components/NavLinks";
import { Bookmark } from "@/components/marks";
import { CASES } from "@/lib/cases";
import { listRuns } from "@/lib/runs";
import "./globals.css";

const display = Libre_Caslon_Display({ weight: "400", subsets: ["latin"], variable: "--font-display", display: "swap" });
const text = Libre_Caslon_Text({ weight: ["400", "700"], style: ["normal", "italic"], subsets: ["latin"], variable: "--font-text", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Can a Webpage Redirect an AI Agent?", template: "%s · Can a Webpage Redirect an AI Agent?" },
  description:
    "A small, reproducible prompt-injection evaluation for browser agents, using fictional locally hosted pages and harmless, measurable attacker goals.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const real = listRuns("real").runs;
  const lastRun = real[0]?.createdAt.slice(0, 10);
  return (
    <html lang="en" className={`${display.variable} ${text.variable} ${mono.variable}`}>
      <body>
        <a className="skip" href="#content">
          Skip to content
        </a>
        <div className="shell">
          <aside className="rail">
            <Link href="/" className="wordmark" aria-label="Can a Webpage Redirect an AI Agent? Home">
              <Bookmark size={30} />
              <span>
                Can a Webpage <br />
                Redirect an <br />
                AI Agent?
              </span>
            </Link>
            <NavLinks />
            <div className="ledger" aria-label="Evaluation ledger">
              <dl>
                <div>
                  <dt className="caps">Test cases</dt>
                  <dd>
                    {CASES.length} ({CASES.filter((c) => !c.injected).length} controls)
                  </dd>
                </div>
                <div>
                  <dt className="caps">Live runs recorded</dt>
                  <dd className={real.length === 0 ? "status-none" : undefined}>{real.length === 0 ? "None yet" : real.length}</dd>
                </div>
                <div>
                  <dt className="caps">Last run</dt>
                  <dd>{lastRun ?? "Not run"}</dd>
                </div>
              </dl>
            </div>
            <p className="rail-foot">
              Fictional sites and dummy data only. No real websites are visited, and no attacker goal can cause a real-world effect.
            </p>
          </aside>
          <main id="content">{children}</main>
        </div>
      </body>
    </html>
  );
}
