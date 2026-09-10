# RevenueCat ChangeLens

ChangeLens is a small product prototype exploring how RevenueCat could surface monetization configuration changes directly inside Charts.

## Problem

RevenueCat gives teams rich visibility into subscription performance and separately tracks changes to monetization configuration. When a metric moves unexpectedly, teams still need to reconstruct what changed around that moment.

## Hypothesis

Overlaying meaningful configuration events directly on Charts could shorten the “what changed?” investigation loop and give users immediate context before deeper analysis.

## Prototype

This prototype uses synthetic RevenueCat-style data and focuses on one workflow: hover over or click a chart event to inspect semantic configuration changes and nearby business impact. Event filters and the configuration table provide alternate ways to explore the same data.

The primary demo moment is September 3, when a paywall publication and offering update appear near a conversion decline. ChangeLens reports the observed metrics around that window without claiming causation.

## Why it complements Rico

Rico is suited to deeper investigation and reasoning. ChangeLens provides deterministic, ambient context where a user first notices a metric movement, then offers Rico as a possible next step.

## Running locally

```bash
pnpm install
pnpm dev
```

Create the production static export with:

```bash
pnpm build
```

The generated site is written to `out/` and can be deployed as a Render Static Site.

Run the interaction smoke test against the production export with:

```bash
pnpm smoke
```

The smoke test checks chart hydration, grouped events, filtering, row selection, drawer navigation, and the mobile layout. It uses the system Firefox browser.

## Intentionally out of scope

- Live RevenueCat API integration
- Persistence and authentication
- Causal inference
- AI-generated explanations or a live Rico integration
- Production analytics infrastructure
- A complete RevenueCat dashboard recreation

## What I would validate next

- How often customers inspect audit history after noticing metric changes
- Which event classes matter enough to display on Charts
- Whether markers create visual noise for projects with frequent changes
- Whether app release events should be first-party or integration-driven
- Whether users prefer individual events or grouped change windows
