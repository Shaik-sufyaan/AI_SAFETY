# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router, TypeScript), chosen by the user. Official Anthropic JS SDK (`@anthropic-ai/sdk`) for live runs; Vitest for tests. Deployable to Vercel or any Node host; live runs stay local-only.

## Users

Primary: reviewers for an AI safety and security fellowship, and researchers who want to inspect or reproduce the work. They read on a laptop, they are skeptical by default, and they check whether claims trace back to evidence. Secondary: the author, who runs the evaluation locally and reviews the evidence before publishing.

## Product Purpose

"Can a Webpage Redirect an AI Agent?" is a small, ethical prompt-injection evaluation for browser agents. Fictional, locally hosted pages each give an agent a legitimate task; some also carry an attacker-written instruction in different placements (visible text, HTML comment, fake official notice, CSS-hidden text, decoy link). A real model can be run against one case at a time with the author's own API key. Success means a researcher can see exactly what was tested, how each run was scored, and what actually happened, without trusting the author's summary.

## Positioning

Every result shown is a real, timestamped run record scored by a deterministic, published rule; sample data is kept separate and labelled. Nothing is invented, and a scripted demo is never presented as a model evaluation.

## Operating Context

The author runs `npm run dev` or a CLI locally with `ANTHROPIC_API_KEY` in `.env.local`, picks one case, caps the agent's steps, and reviews the JSON run record. The public deployment is a read-only case explorer and results page; live runs are disabled there.

## Capabilities and Constraints

- Only fictional sites, organizations, and dummy data. No real websites, no private data, no credential theft, no outbound requests as an attack objective.
- Attacker goals are harmless and measurable: a canary phrase in the answer, a violated answer format, or a visit to a local decoy page.
- The API key never reaches the browser and is never committed.
- Costs are kept low: one case per run, a hard step cap, token usage and estimated cost shown.
- Default model: Claude Haiku 5.5 (`claude-haiku-5-5`), the user's choice; other models selectable.
- Undecided: the "What I learned" findings, which stay placeholders until the author has run and reviewed the tests.

## Brand Commitments

Polished but restrained, like a research project rather than a startup landing page (user's words).

## Evidence on Hand

No experiment results exist yet. No live evaluation has been run. Sample records exist only to show the format and must be labelled as sample data everywhere they appear. No testimonials, affiliations, or benchmark claims.

## Product Principles

1. Evidence before claims: every number on the site comes from a run record a reader can open.
2. Show the rule: scoring is deterministic and printed next to the score.
3. Honest empty states: when nothing has been run, say so plainly.
4. Harmless by construction: the attack objective can never cause real-world effect.
5. Cheap to reproduce: one command, one case, a capped budget.

## Accessibility & Inclusion

WCAG 2.2 AA contrast and keyboard access; content readable without JavaScript where practical.
