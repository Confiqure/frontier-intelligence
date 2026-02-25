# Frontier Intelligence

An interactive scatter chart showing the **Pareto frontier of LLM capability vs. cost**. Every paid model available on OpenRouter is plotted with its LM Arena ELO rating on the Y-axis and blended price per million tokens on the X-axis — making it immediately clear which models offer the best quality for a given budget, and which are simply expensive.

---

## What it does

The chart answers a simple question: _for any spending level, which model gives you the most intelligence?_

The **Pareto frontier** (highlighted line) traces the optimal models — any model below and to the right is strictly dominated by something cheaper and smarter. Models above the line don't exist yet. Models that fall well below the frontier are overpriced for their capability tier.

### Interactive controls

| Control                                | What it does                                                                                                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Prompt ratio slider** (default 75 %) | Adjusts the blended price: `price = prompt × ratio + completion × (1 − ratio)`. Slide toward 100 % for read-heavy workloads, toward 0 % for write-heavy ones. |
| **Open weights only** toggle           | Filters out all proprietary models, isolating the frontier of publicly available weights.                                                                     |
| **Group by**                           | Colour-codes points by provider, release cohort (H1/H2 by year), or open vs. proprietary.                                                                     |
| **Logos toggle**                       | Switches between provider logo icons and plain coloured dots.                                                                                                 |

Hovering any point shows a tooltip with the model name, ELO rating, blended price, context length, and release date.

---

## Why this matters

Pricing tables tell you what a model costs. Leaderboards tell you how smart a model is. Neither one alone helps you make a purchasing decision.

This chart puts both dimensions together. A model with an ELO of 1350 at \$0.50/M tokens is a very different proposition from one with the same ELO at \$15/M tokens. The frontier makes those trade-offs visible at a glance across the entire market, updated hourly.

---

## Tech stack

| Layer        | Technology                                                           |
| ------------ | -------------------------------------------------------------------- |
| Framework    | Next.js 16 (App Router, async Server Components)                     |
| Language     | TypeScript (strict)                                                  |
| Styling      | Tailwind CSS v4                                                      |
| Chart        | Chart.js 4, react-chartjs-2, chartjs-plugin-datalabels               |
| Pricing data | OpenRouter API — fetched live, ISR-cached for 1 hour                 |
| ELO data     | `src/data/eloScores.json` — maintained manually via pipeline scripts |

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Data pipeline

Pricing data is fetched live from OpenRouter on each request (cached for 1 hour via Next.js ISR). ELO ratings come from [arena.ai](https://arena.ai/leaderboard/text) and are stored in a static JSON file that you update manually whenever ratings meaningfully change.

```text
OpenRouter API  ──live fetch──▶  getLiveModels()
                                        │
eloScores.json  ──inner join───▶  (filter paid-only)
                                        │
                                  ModelData[]  ──▶  ParetoChart
```

### `src/data/eloScores.json`

The canonical local store. Each entry is keyed by the OpenRouter model slug and contains:

```json
"openai/o3": {
  "lmArenaDisplayName": "o3",
  "arenaSlug": "o3-2025-04-16",
  "rating": 1432,
  "rank": 33,
  "license": "proprietary"
}
```

| Field                | Purpose                                                                            |
| -------------------- | ---------------------------------------------------------------------------------- |
| `lmArenaDisplayName` | Human-readable label shown in chart tooltips                                       |
| `arenaSlug`          | Identifier used on the arena.ai leaderboard; used by `update-elo` to match ratings |
| `rating`             | LM Arena ELO score                                                                 |
| `rank`               | Arena leaderboard rank                                                             |
| `license`            | `"open"` or `"proprietary"`                                                        |

**This file is never edited directly.** It is always regenerated from `scripts/seed-elo.mjs`.

---

## Maintenance scripts

### `npm run seed-elo`

Regenerates `eloScores.json` from the source-of-truth data defined in `scripts/seed-elo.mjs`. Runs self-validation before writing — exits with an error if any entry is missing required fields.

```bash
npm run seed-elo
# ✓ Wrote 79 entries to eloScores.json
```

### `npm run update-elo` (alias: `npm run validate`)

Does three things in one pass:

1. **Slug validation** — fetches the live OpenRouter paid model list and checks every entry in `eloScores.json` is still valid. Prints a warning for any stale slugs that have been retired.
2. **Coverage check** — reports new models on OpenRouter in tracked namespaces (Anthropic, OpenAI, Google Gemini/Gemma, xAI, DeepSeek, Meta Llama 3/4, Mistral, Qwen3, QwQ) that aren't in `eloScores.json` yet.
3. **ELO refresh** _(optional)_ — when a data file is provided via `--arena`, parses arena.ai leaderboard data and updates ratings/ranks in `eloScores.json`.

```bash
npm run update-elo
# Fetching OpenRouter model list…
#   Found 305 paid models on OpenRouter
#
# ── OR slug validation ──────────────────────────────────────────────
#   Total entries    : 79
#   Valid on OR      : 79
#   Stale (not on OR): 0
# ✓ No untracked models in watched namespaces
```

---

## Adding a new model

1. **Find the arenaSlug** — open [arena.ai/leaderboard/text](https://arena.ai/leaderboard/text), find the model, note the slug shown in the table (e.g. `o3-2025-04-16`).

2. **Add an entry to `scripts/seed-elo.mjs`** in the appropriate section:

   ```js
   "openai/o3": {
     lmArenaDisplayName: "o3",
     arenaSlug: "o3-2025-04-16",
     rating: 1432,
     rank: 33,
     license: "proprietary"
   },
   ```

3. **Regenerate and validate:**

   ```bash
   npm run seed-elo && npm run update-elo
   ```

---

## Refreshing ELO ratings

Arena.ai is client-side rendered, so ratings can't be fetched programmatically. Two ways to get the data file:

**Option A — GitHub Copilot (fastest):**

Ask Copilot in agent mode:

> "Fetch <https://arena.ai/leaderboard/text> and save the full leaderboard table text to scripts/arena-data.txt"

**Option B — Browser copy-paste:**

1. Open [arena.ai/leaderboard/text](https://arena.ai/leaderboard/text)
2. Select All (`Cmd+A`), Copy (`Cmd+C`)
3. `pbpaste > scripts/arena-data.txt`

Then run:

```bash
npm run update-elo -- --arena scripts/arena-data.txt
```

This prints every rating change detected and writes the updated `eloScores.json`. The `scripts/arena-data.txt` file is gitignored — don't commit it.

After the refresh, propagate the new ratings back into the source of truth by updating the matching entries in `scripts/seed-elo.mjs`, then verify it round-trips cleanly:

```bash
npm run seed-elo && npm run update-elo
```

---

## Removing a stale model

If `npm run update-elo` reports stale slugs (models no longer on OpenRouter's paid tier):

1. Remove the entry from `scripts/seed-elo.mjs`
2. `npm run seed-elo`

---

## Silencing a noisy alert

If `npm run update-elo` keeps reporting a model you've reviewed and decided not to track (wrong modality, too small, pricing variant, legacy snapshot, etc.), add it to `src/data/excludedSlugs.json` with a comment if you like:

```json
["openai/gpt-5-codex"]
```

`seed-elo.mjs` reads this file and exports `EXCLUDED_SLUGS`; `update-elo.mjs` imports that set and filters it from the coverage report.

---

## Project structure

```text
frontier-intelligence/
├── src/
│   ├── app/
│   │   └── page.tsx                # Root page — fetches data, renders chart
│   ├── components/
│   │   └── ParetoChart.tsx         # Full interactive chart (client component)
│   ├── lib/
│   │   ├── providers.ts            # Single source of truth for provider config
│   │   ├── getData.ts              # Joins OpenRouter live data with eloScores.json
│   │   ├── svgs.ts                 # Renders provider SVG icons as chart markers
│   │   └── pareto.ts               # Calculates the Pareto frontier
│   ├── data/
│   │   ├── eloScores.json          # Generated — do not edit directly
│   │   └── excludedSlugs.json      # OR slugs to skip in update-elo coverage report
│   └── types/
│       └── model.ts                # ModelData, ProcessedModel, ChartPoint types
└── scripts/
    ├── seed-elo.mjs                # Source of truth for eloScores.json
    └── update-elo.mjs              # Slug validation + ELO refresh tool
```

---

## Ongoing maintenance

The work is low-volume but periodic:

| Trigger                          | Action                                                            |
| -------------------------------- | ----------------------------------------------------------------- |
| New frontier model released      | Add entry to `seed-elo.mjs` → `npm run seed-elo`                  |
| Monthly ELO drift check          | `npm run update-elo -- --arena scripts/arena-data.txt`            |
| `update-elo` reports stale slugs | Remove from `seed-elo.mjs` → `npm run seed-elo`                   |
| `update-elo` reports new models  | Triage: add to `seed-elo.mjs` DATA or add to `excludedSlugs.json` |

A practical cadence is to check `npm run update-elo` whenever a major new model ships, and do a full ELO refresh with `--arena` once a month or after a significant leaderboard reshuffle.
