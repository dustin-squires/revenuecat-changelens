# RevenueCat ChangeLens — Codex Handoff

## Goal
Build a polished, small prototype for RevenueCat called **ChangeLens**.

The core idea: RevenueCat already shows business metrics in Charts and configuration history in audit logs. ChangeLens overlays meaningful monetization/configuration changes directly onto a RevenueCat-style chart so a user can quickly answer:

> **“What changed around the time this metric moved?”**

This is intentionally **not** an AI chatbot and **not** a production integration. It is a 2–4 hour product-engineering prototype using synthetic data that demonstrates a plausible RevenueCat feature.

---

## Product Hypothesis
When a subscription metric suddenly changes, RevenueCat users often need to correlate that movement with recent product/configuration changes:

- paywall published
- experiment started/stopped
- offering changed
- product/package changed
- app version released

Today those facts conceptually live in different places. ChangeLens puts the context directly on the chart timeline.

The feature should feel like an observability layer for monetization changes.

---

## Demo Story
The seeded chart shows **Conversion to Paying** over ~30 days.

Around **Sep 3**, conversion falls from roughly **5.4% → 4.7%**.

A small event marker appears on the chart timeline at Sep 3.

Clicking it opens a right-side drawer titled:

**Monetization changes near this date**

The drawer shows two events:

### 11:42 AM — Paywall published
`Onboarding Annual Test`

Changes:
- Trial: `7 days → none`
- Hero copy changed
- Annual package became default

### 1:08 PM — Offering updated
`default_offering`

Changes:
- Removed `premium_monthly` from onboarding placement

Below the events, show a lightweight metric summary:

**Observed after change**
- Conversion to paying: `5.4% → 4.7% (-13.0%)`
- Annual selection: `41% → 62%`
- Realized revenue/customer: `$3.21 → $3.45`

At the bottom, include a secondary CTA:

**Ask Rico about this change →**

The button does not need to work. It exists to show awareness that RevenueCat already has an AI growth advisor; this feature complements Rico rather than replacing it.

---

## Scope
### Must Have
Build only this:

1. RevenueCat-inspired app shell
2. One analytics chart
3. Timeline event markers
4. Clickable event marker
5. Right-side event drawer
6. Semantic before/after diffs
7. Small post-change metrics summary
8. Simple event-type filtering
9. Responsive enough to look correct on a laptop
10. Clean README explaining the hypothesis and deliberate scope cuts

### Explicitly Do NOT Build
- authentication
- backend
- database
- real RevenueCat API calls
- real Rico integration
- LLM calls
- persistence
- full routing architecture
- real audit log import
- real charting infrastructure
- exhaustive RevenueCat dashboard clone

If time is running out, cut features rather than leaving them half-finished.

---

## Tech Stack — Use This Unless Blocked
Optimize for speed, polish, and a stack that feels natural for a product-engineering prototype.

- **Next.js (App Router)**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** for primitives such as the drawer/sheet, tooltip, buttons, badges, and segmented controls
- **Recharts** for the time-series chart
- **Lucide React** for icons
- **pnpm** for package management
- **Static typed fixtures** for all product data
- **Render** for deployment

### Important implementation rule
Do **not** add a backend, database, authentication, external API, global state library, or server-side persistence. This prototype should be a small client-side product experience with typed local data.

Use React state for selection/filter state. Avoid abstractions that only make sense for a production application.

### Chart technical spike
The chart/event-marker interaction is the main technical risk. Build it before polishing the dashboard shell.

First prove that Recharts can cleanly support:
1. the conversion line,
2. date-aligned change markers,
3. subtle vertical guide lines,
4. hover tooltips,
5. clicking a marker to select a date/event and open the drawer.

Time-box this spike to roughly 10–15 minutes. If Recharts makes the marker interaction unreasonably awkward, use **Visx** instead. Do not switch libraries merely for aesthetic reasons.

### Render deployment
Deploy the finished prototype on **Render**.

Prefer a **Render Static Site** because this prototype has no server-side behavior. Configure Next.js for static export (`output: 'export'`) so the production build emits an `out/` directory.

Suggested Render setup:
- Service type: `Static Site`
- Build command: `pnpm install --frozen-lockfile && pnpm build`
- Publish directory: `out`
- Auto-deploy from the repository's `main` branch

If static export becomes a genuine blocker, deploy the same Next.js app as a Render Node web service instead. Do not spend prototype time fighting deployment architecture.

Before calling the project complete, verify the deployed `onrender.com` URL in a clean browser session.

---

## Visual Direction
The app should look **inspired by RevenueCat's dashboard**, not like a generic SaaS template.

Aim for:
- restrained white / very light gray surfaces
- thin borders
- dense but readable information layout
- compact typography
- subtle radius
- minimal decorative color
- chart-focused layout
- polished hover states
- professional developer-tool aesthetic

Do not copy branding assets or logos directly if inconvenient. A simple text logo reading **RevenueCat / ChangeLens** is fine.

---

## Layout
### Left Sidebar
Compact navigation:
- Overview
- Charts **(active)**
- Customers
- Paywalls
- Experiments
- Products
- Integrations

Bottom:
- Project settings

### Main Header
Breadcrumb / title area:

**Charts / Conversion to Paying**

Top-right controls:
- Last 30 days
- All platforms
- Segment

These controls can be non-functional unless easy to implement.

### Chart Card
Title:
**Conversion to Paying**

Subtitle:
`Percent of newly eligible customers who become paying subscribers`

Top metric:
**4.9%**
`-8.2% vs previous period`

Chart:
- line chart
- 30 days
- visible drop around Sep 3
- faint grid
- hover tooltip with date + percentage

Timeline markers should be visually distinct from data points.

Suggested marker styles:
- diamond / circle icon at top or bottom of plot
- tiny vertical dotted guide line
- tooltip with event type and title

---

## Event Filters
Above the chart or directly below the title, add a compact control:

**Show changes:**
- All
- Paywalls
- Offerings
- Experiments
- Releases

This can be a segmented control or dropdown.

Filtering should actually hide/show markers if easy.

---

## Event Drawer
Open from the right and occupy ~360–440px width.

Header:
**Changes near Sep 3**

Subtext:
`2 monetization changes within 6 hours of this metric movement`

Each event card should show:
- icon
- event type
- timestamp
- object name
- actor, e.g. `Dustin S.` or `Growth Team`
- semantic diff

### Semantic Diff Style
Avoid generic JSON diff output.

Use RevenueCat/domain wording:

**Paywall published**
- Trial duration: `7 days` → `None`
- Default package: `Monthly` → `Annual`
- Hero copy: `Start your free trial` → `Unlock Premium`

**Offering updated**
- Removed package: `premium_monthly`
- Affected placement: `onboarding`

Use subtle +/- indicators or old/new chips.

---

## Mock Data
Create static typed fixtures.

### Chart Point
```ts
export type ChartPoint = {
  date: string;
  conversionRate: number;
};
```

Use about 30 daily points. Keep values around 5.2–5.6% before Sep 3, then around 4.6–5.0% after.

Example:
```ts
[
  { date: '2026-08-24', conversionRate: 5.31 },
  { date: '2026-08-25', conversionRate: 5.42 },
  { date: '2026-08-26', conversionRate: 5.36 },
  { date: '2026-08-27', conversionRate: 5.48 },
  { date: '2026-08-28', conversionRate: 5.39 },
  { date: '2026-08-29', conversionRate: 5.51 },
  { date: '2026-08-30', conversionRate: 5.44 },
  { date: '2026-08-31', conversionRate: 5.36 },
  { date: '2026-09-01', conversionRate: 5.41 },
  { date: '2026-09-02', conversionRate: 5.38 },
  { date: '2026-09-03', conversionRate: 4.89 },
  { date: '2026-09-04', conversionRate: 4.72 },
  { date: '2026-09-05', conversionRate: 4.81 },
  { date: '2026-09-06', conversionRate: 4.76 }
]
```
Continue enough points to fill the chart naturally.

### Change Event
```ts
export type ChangeEvent = {
  id: string;
  timestamp: string;
  type: 'paywall' | 'offering' | 'experiment' | 'release';
  title: string;
  actor: string;
  summary: string;
  diffs: Array<{
    label: string;
    before?: string;
    after?: string;
  }>;
};
```

Seed at least 5 events across the date range so the chart looks realistic:

1. Aug 28 — Experiment started
2. Sep 3 — Paywall published
3. Sep 3 — Offering updated
4. Sep 8 — App version 4.8 released
5. Sep 14 — Experiment winner rolled out

The Sep 3 events are the primary demo moment.

---

## Suggested Project Structure
Keep the repository intentionally small.

```txt
app/
  page.tsx
  globals.css

components/
  app-sidebar.tsx
  chart-header.tsx
  conversion-chart.tsx
  change-marker.tsx
  change-filters.tsx
  change-drawer.tsx
  change-event-card.tsx
  semantic-diff.tsx
  metric-impact-summary.tsx
  ui/                         # only shadcn primitives actually used

data/
  demo-data.ts

lib/
  types.ts
  metrics.ts
  change-utils.ts

next.config.ts
render.yaml                   # optional; useful if quick to add
README.md
```

Do not create API routes, services, repositories, persistence layers, or a state-management layer. `useState` is sufficient.

### Core domain types
Keep the domain model explicit and readable:

```ts
export type ChangeEventType =
  | 'paywall'
  | 'offering'
  | 'experiment'
  | 'release';

export type ChangeDetail = {
  label: string;
  before?: string;
  after?: string;
};

export type ChangeEvent = {
  id: string;
  timestamp: string;
  type: ChangeEventType;
  title: string;
  actor: string;
  summary: string;
  diffs: ChangeDetail[];
};

export type ChartPoint = {
  date: string;
  conversionRate: number;
};
```

Prefer one coherent `demo-data.ts` fixture if splitting fixtures into multiple files adds friction.

---

## Interaction Details
### Marker Hover
Tooltip:

**Paywall published**  
Onboarding Annual Test  
Sep 3, 11:42 AM

### Marker Click
- select event/date
- open drawer
- show all events on or very near that date

### Drawer Close
- X button
- Escape key if easy
- clicking outside if easy

### Filter
Changing event type filters visible markers.

---

## Nice-to-Have Features
Only implement these if the must-haves are complete.

### 1. Correlation disclaimer
Small text near the impact summary:

`ChangeLens surfaces temporal context, not causal conclusions.`

This is a good product detail because a metric move occurring after a config change does not prove causality.

### 2. “Compare period” highlight
When selecting Sep 3, shade ~3 days before and after the event.

### 3. Deep link affordances
Non-functional links:
- View audit entry
- Open paywall
- Open offering

### 4. Toggle marker density
`Important changes only` toggle.

### 5. Tiny keyboard shortcut hint
`⌘K` or `/` is unnecessary unless trivial.

---

## UX Principles
1. **The chart remains primary.** Markers should add context, not overwhelm it.
2. **Avoid claiming causation.** Say “observed after change” rather than “caused by.”
3. **Make diffs semantic.** Human-readable product concepts, not JSON.
4. **Keep information density high.** This is a professional analytics dashboard.
5. **One obvious demo moment.** Sep 3 should tell the story within ~15 seconds.

---

## Acceptance Criteria
The project is done when:

- [ ] `pnpm dev` launches it locally
- [ ] `pnpm build` succeeds with no TypeScript/build errors
- [ ] The production build is compatible with the chosen Render deployment
- [ ] A public `onrender.com` deployment works in a clean browser session
- [ ] It looks intentional and close to a real production SaaS dashboard
- [ ] The chart clearly shows a meaningful metric change
- [ ] At least 5 change events appear on the timeline
- [ ] Clicking a marker opens a drawer
- [ ] Sep 3 displays both the paywall and offering changes
- [ ] Semantic before/after changes are visible
- [ ] Post-change metric summary is visible
- [ ] Event filtering works
- [ ] “Ask Rico about this change” appears as a non-functional secondary CTA
- [ ] No broken controls or obviously unfinished UI are visible
- [ ] README clearly explains product hypothesis, scope, and what was intentionally omitted

---

## README Content
Use something close to this:

### RevenueCat ChangeLens
A small product prototype exploring how RevenueCat could surface monetization configuration changes directly inside Charts.

### Problem
RevenueCat gives teams rich visibility into subscription performance and separately tracks changes to monetization configuration. When a metric moves unexpectedly, teams still need to reconstruct what changed around that moment.

### Hypothesis
Overlaying meaningful configuration events directly on Charts could shorten the “what changed?” investigation loop and give users immediate context before deeper analysis.

### Prototype
This prototype uses synthetic RevenueCat-style data and focuses on a single workflow: clicking a chart event to inspect semantic configuration changes and nearby business impact.

### Why it complements Rico
Rico is well suited for deeper investigation and reasoning. ChangeLens provides deterministic, ambient context directly where a user first notices a metric movement, then offers Rico as a next step.

### Intentionally out of scope
- live RevenueCat API integration
- persistence
- authentication
- causal inference
- AI-generated explanations
- production-grade analytics infrastructure

### What I would validate next
- How often customers inspect audit history after noticing metric changes
- Which event classes matter enough to display on Charts
- Whether markers create visual noise for high-change projects
- Whether app release events should be first-party or integration-driven
- Whether users prefer event-level inspection or grouped “change windows”

---

## Implementation Priority
If time-boxed to 3 hours:

### First 45 minutes
- scaffold Next.js + TypeScript + Tailwind
- install only the shadcn primitives, Recharts, and Lucide pieces actually needed
- create typed fixture data
- **build the chart first and prove clickable timeline markers work**
- once that interaction works, add the sidebar/header shell

### Next 45 minutes
- event markers
- marker tooltips
- selection state

### Next 45 minutes
- drawer
- event cards
- semantic diffs
- impact summary

### Final 45 minutes
- filters
- spacing/typography polish
- responsive cleanup
- README
- configure Next.js static export for Render
- deploy to Render and smoke-test the public URL
- remove dead UI / broken interactions

If time slips, skip filters before cutting core polish.

---

## Product Framing for the Application
The project should communicate:

> I noticed a small seam between RevenueCat's analytics and configuration history, reduced it to a specific product hypothesis, and built the smallest useful prototype to test it.

Do not frame it as:

> I rebuilt part of RevenueCat.

The strongest signal is judgment and scope discipline, not code volume.

---

## Codex Execution Instruction
Work autonomously and make reasonable product/design decisions without asking questions unless something blocks implementation.

Optimize for:
1. a convincing demo
2. polished UX
3. simple, readable code
4. finishing within the timebox

Prefer deleting scope over adding architecture.

Before finishing:
- run `pnpm dev` and inspect the main interaction end-to-end
- run `pnpm build` and fix all TypeScript/build/runtime errors
- deploy the finished build to Render
- smoke-test the public Render URL
- verify marker hover → marker click → drawer → semantic diff → metric summary
- verify event filtering
- remove placeholder-looking content and dead controls
- ensure README accurately describes what exists
- do not add features simply because there is time left; spend remaining time on polish

