---
name: Can a Webpage Redirect an AI Agent?
description: An archival custody record for a prompt-injection evaluation; every claim traces to a run record.
colors:
  buff: "#ece3cf"
  buff-deep: "#e3d8c1"
  paper: "#f4ecdb"
  ink: "#2a2420"
  ink-soft: "#4a423b"
  taupe: "#675f55"
  rule: "#cbbfac"
  rule-strong: "#a99c87"
  ribbon: "#a3221b"
  ribbon-deep: "#7d1712"
  ruby-tint: "#f2dcd5"
  thread: "#8a8580"
  stamp: "#6f6a64"
  on-ribbon: "#fbf6ee"
typography:
  display:
    fontFamily: "Libre Caslon Display, Georgia, serif"
    fontSize: "clamp(2.4rem, 5vw, 4.3rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Libre Caslon Display, Georgia, serif"
    fontSize: "clamp(2.2rem, 4vw, 3.4rem)"
    fontWeight: 400
    lineHeight: 1.04
  seal:
    fontFamily: "Libre Caslon Display, Georgia, serif"
    fontSize: "1.55rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.06em"
  title:
    fontFamily: "Libre Caslon Display, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.2
  wordmark:
    fontFamily: "Libre Caslon Display, Georgia, serif"
    fontSize: "1.32rem"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "0.01em"
  row-title:
    fontFamily: "Libre Caslon Display, Georgia, serif"
    fontSize: "1.3rem"
    fontWeight: 400
    lineHeight: 1.2
  station-title:
    fontFamily: "Libre Caslon Display, Georgia, serif"
    fontSize: "1.15rem"
    fontWeight: 400
    lineHeight: 1.2
  lede:
    fontFamily: "Libre Caslon Text, Georgia, serif"
    fontSize: "1.24rem"
    fontWeight: 400
    lineHeight: 1.55
  quote:
    fontFamily: "Libre Caslon Text, Georgia, serif"
    fontSize: "1.08rem"
    fontWeight: 400
  lede-compact:
    fontFamily: "Libre Caslon Text, Georgia, serif"
    fontSize: "1.06rem"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Libre Caslon Text, Georgia, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.68
    fontFeature: "\"onum\" 1, \"pnum\" 1"
  body-field:
    fontFamily: "Libre Caslon Text, Georgia, serif"
    fontSize: "0.98rem"
    fontWeight: 400
  body-dense:
    fontFamily: "Libre Caslon Text, Georgia, serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "Libre Caslon Text, Georgia, serif"
    fontSize: "0.9rem"
    fontWeight: 400
  note:
    fontFamily: "Libre Caslon Text, Georgia, serif"
    fontSize: "0.88rem"
    fontWeight: 400
    lineHeight: 1.4
  hint:
    fontFamily: "Libre Caslon Text, Georgia, serif"
    fontSize: "0.85rem"
    fontWeight: 400
  small:
    fontFamily: "Libre Caslon Text, Georgia, serif"
    fontSize: "0.8rem"
    fontWeight: 400
    lineHeight: 1.5
  section-label:
    fontFamily: "Libre Caslon Text, Georgia, serif"
    fontSize: "0.82rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.15em"
  label:
    fontFamily: "Libre Caslon Text, Georgia, serif"
    fontSize: "0.74rem"
    fontWeight: 400
    letterSpacing: "0.14em"
    fontFeature: "\"lnum\" 1"
  label-dense:
    fontFamily: "Libre Caslon Text, Georgia, serif"
    fontSize: "0.68rem"
    fontWeight: 400
    letterSpacing: "0.14em"
    fontFeature: "\"lnum\" 1"
  label-micro:
    fontFamily: "Libre Caslon Text, Georgia, serif"
    fontSize: "0.66rem"
    fontWeight: 400
    letterSpacing: "0.14em"
    fontFeature: "\"lnum\" 1"
  seal-label:
    fontFamily: "Libre Caslon Text, Georgia, serif"
    fontSize: "0.58rem"
    fontWeight: 400
    letterSpacing: "0.2em"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.86em"
    fontWeight: 400
    fontFeature: "\"tnum\" 1, \"lnum\" 1"
  mono-block:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.84rem"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "\"tnum\" 1, \"lnum\" 1"
rounded:
  sm: "3px"
  md: "5px"
spacing:
  xs: "0.6rem"
  sm: "0.85rem"
  md: "1.25rem"
  lg: "1.5rem"
  section: "3.75rem"
components:
  button-primary:
    backgroundColor: "{colors.ribbon}"
    textColor: "{colors.on-ribbon}"
    typography: "{typography.section-label}"
    padding: "0.85rem 2.1rem 0.85rem 1.4rem"
  button-primary-hover:
    backgroundColor: "{colors.ribbon-deep}"
    textColor: "{colors.on-ribbon}"
  button-primary-disabled:
    backgroundColor: "{colors.thread}"
    textColor: "{colors.on-ribbon}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ribbon-deep}"
    typography: "{typography.section-label}"
    padding: "0.85rem 1.4rem"
  button-secondary-hover:
    backgroundColor: "{colors.ruby-tint}"
    textColor: "{colors.ribbon-deep}"
  input-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body-field}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 0.6rem"
  ledger-box:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "1.4rem 1.5rem"
  injection-block:
    backgroundColor: "{colors.ruby-tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "1rem 1.25rem"
  record-block:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "1rem 1.25rem"
---

# Design System: Can a Webpage Redirect an AI Agent?

## Overview

**Creative North Star: "The Provenance Ribbon"**

The site is a museum registrar's custody file for an experiment. Every page sits on a warm archival buff ground, is set in ledger serifs, and carries one ribbon-red line that marks what a run record proves. Wherever the record is silent, the line stays as unwoven gray dashes. The visual system exists to keep proven, stopped, unobserved and not-applicable visibly distinct, so a skeptical reader never confuses "not run" with "safe".

Density is that of a reading room: a sticky left rail with the wordmark, a station-dot nav and a hairline case-ledger box, then a single reading column (42rem measure inside a 62rem page). Structure comes from hairline taupe rules and faint paper boxes, never from shadow or saturated fills. Titles, labels and links speak in ink; red is held back for evidence. Motion is minimal and evidential: the gray thread is present at rest and each carried segment draws over it in red, one after another.

The world refuses the standard ML project page: no centered hero, no pill buttons, no teaser figure. The one confirmed brand commitment is "polished but restrained, like a research project rather than a startup landing page."

**Key Characteristics:**
- Warm archival buff ground with paper-toned boxes and hairline taupe rules.
- Ribbon red is reserved for evidence and the one action: the custody line, carried marks, bookmark marks, injection tint and the ribbon-tab button.
- Titles, section labels, the wordmark, nav and links are ink; links carry a ribbon-tinted underline.
- Gray dashed "thread" means unknown or not run, everywhere.
- Caslon Display titles, Caslon Text reading column, tracked small caps for labels, mono only for records and source.
- Ribbon-bookmark marks and notched ribbon buttons as the recurring silhouette.
- Every state mark is a shape plus a text label, never colour alone.

## Colors

A warm, low-chroma archive palette with a single red voice reserved for evidence, and a faded warm gray reserved for sample stamps.

### Primary
- **Ribbon Red** (ribbon): the custody line where a step is proven, carried station states and marks, the attack-succeeded flag in the action log, bookmark marks beside section openers and the wordmark, the current nav station's ring and dot, the vertical "The instruction" tab, the primary ribbon-tab action, the focus ring and the caret. Mixed at 35-50% it borders injected passages and error notices; at 45% it is the resting link underline.
- **Deep Ribbon** (ribbon-deep): hover colour for links, ledger row titles and linked custody stations; the secondary button's text; footers of injected passages; warnings, error notices and selected text.

### Secondary
- **Stamp Ink** (stamp): a faded warm gray-brown, applied at 0.78 opacity on the stamp itself, used only for SAMPLE DATA stamps and the dashed sample band. Nothing else may be this colour.

### Tertiary
- **Ruby Tint** (ruby-tint): the faint wash behind attacker-written passages, highlighted injection lines in HTML source, error notices, text selection, the secondary button hover and (at 55%) the targeted action-log entry.

### Neutral
- **Archival Buff** (buff): page ground; also the fill inside state dots so the line appears to pass behind them.
- **Deep Buff** (buff-deep): preview bars and the scrollbar track.
- **Paper** (paper): code, record and form surfaces; mixed at 45-70% over buff for ledger boxes, panels and row hovers.
- **Ledger Ink** (ink): body text, all headings and titles, section-opener labels, the wordmark text, the current nav item and link text.
- **Soft Ink** (ink-soft): ledes, secondary text, resting nav links, stopped and not-applicable states, and the thin solid line of a "stopped" custody segment.
- **Taupe** (taupe): labels, metadata, row numbers, legends, hints and unobserved station titles.
- **Hairline** (rule): inner dividers between list rows, table cells and log entries; code borders.
- **Strong Hairline** (rule-strong): box borders, the rail edge, the nav thread, top rules of lists and tables.
- **Unwoven Thread** (thread): the dashed custody thread at rest, dashed empty-state and placeholder borders, the disabled button fill. It is never used for text.
- **On Ribbon** (on-ribbon): the warm off-white text on ribbon-red surfaces.

### Named Rules
**The Evidence Red Rule.** Ribbon red marks evidence and the one primary action: a proven custody step, a carried mark, a bookmark, an injection's tint, the ribbon tab. Titles, labels, navigation and links are ink. It is never used for an unknown, not-run or not-applicable state; those are always thread gray and dashed.

**The Stamp Quarantine Rule.** Stamp ink appears only on sample data. Any surface carrying it is illustrative and must say so in words.

**The Tint, Not Fill Rule.** Attacker text is marked with the ruby tint behind ledger ink, never with red text on a red fill.

## Typography

**Display Font:** Libre Caslon Display (with Georgia, serif)
**Body Font:** Libre Caslon Text (with Georgia, serif)
**Label/Mono Font:** JetBrains Mono (with ui-monospace, monospace)

**Character:** A high-contrast Caslon cut for the catalogue voice over the sturdier text cut for reading, with old-style figures in prose. Mono is kept for evidence: run records, commands and HTML source.

### Hierarchy
The ramp is not a modular scale; it is a set of fixed steps, each tied to a place. All weights are 400.

- **Display** (clamp(2.4rem, 5vw, 4.3rem), 1): the home page question, in ink, capped at 15ch.
- **Headline** (clamp(2.2rem, 4vw, 3.4rem), 1.04): inner page titles, in ink, capped at 20ch.
- **Display face, fixed steps:** seal word on the sample stamp (1.55rem), h3 subsections and ledger row numerals (1.5rem), wordmark (1.32rem), ledger row titles (1.3rem), custody station titles and the mobile wordmark (1.15rem).
- **Lede** (1.24rem, 1.55): the one-paragraph frame under a title, in soft ink, max 38rem. It drops to 1.06rem under 820px.
- **Quote** (1.08rem): the quoted task inside a record block.
- **Body** (1.0625rem, 1.68): the reading column at a 42rem measure, with old-style proportional figures and pretty wrapping.
- **Secondary text steps:** form inputs and rule boxes (0.98rem); row subtitles, table cells, ledger values, log thoughts, run answers and estimates (0.95rem); the custody figcaption (0.9rem); station notes, the page foot and mobile ledger values (0.88rem); field hints (0.85rem); the rail footnote and HTML source (0.8rem).
- **Section label** (0.82rem, 0.15em, uppercase): the ink h2 beside a section's ribbon bookmark, and the text on ribbon-tab buttons.
- **Small caps labels** (uppercase, 0.14em tracking, lining figures), three steps: general labels, definition terms and metadata (0.74rem); a dense step for table heads, field labels, row meta, ledger terms, log step numbers and marks (0.68rem); a micro step for custody states, legends, record footers, preview bars and the custody tab (0.66rem, the tab at 0.18em).
- **Seal label** (0.58rem, 0.2em, uppercase): the two small lines on the sample stamp only.
- **Mono** (0.86em inline; 0.84rem in code blocks, tabular lining figures): code, pre, run answers, HTML source.

### Named Rules
**The Figures Follow Function Rule.** Prose uses old-style figures. Tables, codes, row numbers and labels switch to lining figures (tabular in data).

**The Evidence-Only Mono Rule.** Mono appears only where text is a literal record: commands, model ids, final answers, HTML source. Never use it for decoration or headings.

**The Fixed Step Rule.** A new surface picks an existing step from the hierarchy above for its role. Do not add an in-between size; the three small-caps steps (0.74, 0.68, 0.66rem) are already the densest the ramp goes outside the stamp.

## Layout

A two-column shell. A sticky full-height rail (17rem, narrowing to 14.5rem under 1100px) sits left of a main column padded `2.5rem clamp(1.5rem, 5vw, 5rem) 6rem`. Content sits in a left-aligned 62rem page, and running prose is held to the 42rem measure. Nothing is centered.

Sections open with a bookmark opener spaced 3.75rem above. Blocks (quotes, records, tables, fact grids) take 1.5rem below. Ledger lists use a three-track row (3.5rem number, flexible title, 16rem meta). Under 1100px the meta folds beneath the title. Definition grids use an 11rem term column. The results page sets its scoring rules as a ledger table: hairline rows, a small-caps head and a non-wrapping first column.

Under 820px the rail becomes a top bar. The wordmark sets on one line (1.15rem, smaller bookmark), the nav wraps into rows of inline station dots, and the ledger box becomes an inline strip of term-value pairs (the third entry hidden). The rail footnote hides. The custody line turns vertical, with each station on its own segment (solid ribbon, thin ink for stopped, dashed thread for unobserved or not applicable). Two-column form fields, fact grids and action-log rows collapse to one column. Print hides the rail and the run panel.

## Elevation & Depth

The system is flat. Depth comes from tonal layering (paper mixed 45-70% over buff) and hairline borders. There are no outer drop shadows anywhere. The only `box-shadow` values are inset rings that draw lines.

### Shadow Vocabulary
- **Ribbon outline** (`box-shadow: inset 0 0 0 1px var(--ribbon)`): the secondary ribbon-tab button's border, so it keeps the primary's footprint.
- **Stamp double ring** (`box-shadow: inset 0 0 0 5px var(--buff), inset 0 0 0 6px var(--stamp)`): the inner ring of a sample stamp.

### Named Rules
**The Paper, Not Lift Rule.** A surface is raised by a lighter paper tone and a hairline, never by a cast shadow. Hover changes tone, not elevation.

## Shapes

Corners are barely softened, on two steps only: 3px (the shared radius) on small surfaces (code, inputs, quotes, injections, notices, rule boxes, previews, answers, linked stations and the focus ring) and 5px on large containers (ledger box, custody figure, run panel, sample band, empty state). Circles are reserved for state dots, nav stations and stamps. The signature silhouette is the ribbon. It appears as a bookmark (rectangle with a V notch cut from the foot) beside section openers and the wordmark, an arrow-notched tab for primary buttons (`clip-path` with a 0.7rem notch), and a vertical notched tab, "The instruction", down the left edge of the custody figure. Dashed borders mean "absent": empty states and placeholders use 1px dashed thread, and the sample band uses 2px dashed stamp ink.

## Components

### Buttons
Ribbon-tab actions: a length of ribbon cut to a point.
- **Shape:** square-cornered with an arrow notch on the right (0.7rem), no radius.
- **Primary:** ribbon red with on-ribbon section-label text, padding `0.85rem 2.1rem 0.85rem 1.4rem`. One per view.
- **Hover / Focus:** deepens to ribbon-deep and nudges 2px right (180ms, ease-out `cubic-bezier(0.16, 1, 0.3, 1)`). Focus is the global 2px ribbon outline at 3px offset with the 3px radius.
- **Disabled:** thread gray fill, no movement.
- **Secondary:** transparent, unnotched, with a 1px inset ribbon outline and ribbon-deep text. It fills with ruby tint on hover. Used for Cancel beside a confirm.
- **Text link with arrow:** the companion to a primary action is a plain underlined link with a 14px stroked arrow, not a second button.

### Links
Ink text with a 1px underline in ribbon at 45%, offset 0.22em. On hover the text turns ribbon-deep and the underline goes full ribbon (160ms).

### Cards / Containers
- **Corner Style:** 5px for ledger boxes and panels, 3px for record blocks.
- **Background:** paper mixed 45-70% over buff, or solid paper for record blocks.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** 1px strong hairline.
- **Internal Padding:** 1rem-1.5rem.

### Inputs / Fields
- **Style:** paper fill, 1px strong hairline, 3px radius, 0.98rem text, small-caps taupe label above, taupe hint below.
- **Focus:** the global ribbon outline. The caret and native accents are ribbon red.
- **Hover:** the border darkens to taupe.
- **Error:** the notice turns ruby tint with ribbon-deep text and a half-ribbon border.

### Navigation
A vertical hairline thread with a 9px station circle per link. At rest the circle is invisible (buff on buff) and the link is soft ink. On hover the circle gains a hairline ring and the text goes to ink. The current page is ink text with a ribbon ring and ribbon centre dot. Under 820px the thread is removed and the stations wrap inline.

### Ledger List
Numbered case and run rows between hairlines. The Display numeral is taupe, the Display title turns ribbon-deep on hover over a paper wash, and the subtitle is soft ink. Small-caps meta sits right-aligned.

### Custody Line (signature)
A figure that traces an attacker's instruction across four stations (page, read, act, answer). Each segment between stations is a gentle S-curve. At rest every segment is a 5/5 dashed thread line, so the figure is never empty. A proven step draws over it in solid ribbon (2.6px, round caps) with a 900ms ease-out `stroke-dashoffset` draw, staggered 260ms per carried segment after a 120ms lead. A stopped step is a thin soft-ink line (1.1px). An unobserved or not-applicable step stays dashed thread. Under reduced motion the final state shows with no draw. Station dots carry state by shape: a filled ribbon ring, a cut ring, a dashed ring, or a small hollow point. Each dot sits above a Display title, a small-caps state and a taupe note. A legend repeats all four marks with labels. On run pages the line is drawn from the record, and each proven station is a link to its evidence anchor in the action log: on hover its title turns ribbon-deep with a ribbon underline, and the targeted log entry takes a ruby-tint wash.

### Record Blocks
The task quote is a paper box with a small-caps provenance footer. The injected passage is a ruby-tint box with a half-ribbon border and a ribbon-deep footer naming its placement. In HTML source, injected lines are marked with ruby tint and a faint ribbon outline.

### Action Log
Numbered steps between hairlines in a 4.5rem step column. A step where the attack succeeded carries a ribbon flag mark with its label. A step targeted from the custody line is washed in ruby tint.

### Sample Stamp
An 8.5rem circular stamp in stamp ink with a double ring at 0.78 opacity. It is rotated -9deg, partly masked to read as faded ink, and labelled "Illustrative / Sample / No model". It sits in a 2px dashed stamp-ink band with the words "NOT A MODEL RUN".

### Status Statement
A full-measure line between two strong hairlines, led by a state dot. It states plainly what has and has not been run.

## Do's and Don'ts

### Do:
- **Do** draw every unknown, not-run or not-applicable state as a dashed thread-gray mark, and every proven step as solid ribbon red.
- **Do** pair every state mark with a text label; shape and words carry the meaning, colour only reinforces it.
- **Do** open each section with the ribbon bookmark and an ink small-caps section label.
- **Do** set titles, labels, navigation and links in ink; links take the ribbon-tinted underline.
- **Do** keep prose to the 42rem measure, left-aligned, on the buff ground.
- **Do** mark attacker-written text with the ruby tint behind ledger ink, with a footer naming its placement.
- **Do** stamp every sample record with stamp ink and say "not a model run" in words.
- **Do** keep motion to the carried-segment draw (900ms ease-out, 260ms stagger) and 160-180ms tone changes, all disabled under reduced motion.
- **Do** use the two radius steps only: 3px for small surfaces, 5px for large containers.

### Don't:
- **Don't** use ribbon red for an unknown or empty state; "not observed" must never look like "proven".
- **Don't** set titles, section labels, nav items or link text in ribbon red; red is for evidence and the one action.
- **Don't** use stamp ink anywhere except sample data.
- **Don't** add outer drop shadows, glows or lifted cards; depth is paper tone and hairline.
- **Don't** use pill buttons, centered hero titles or teaser-figure layouts.
- **Don't** set headings or decoration in mono; mono is for literal records.
- **Don't** add icon glyphs; marks are the drawn SVG bookmark, arrow, flag and state dots.
