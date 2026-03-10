/**
 * Validates OR slugs and optionally refreshes arena.ai ELO ratings.
 *
 * Usage:
 *   npm run update-elo                          # OR validation only
 *   npm run update-elo -- --arena <file.txt>    # + arena ELO refresh
 *
 * ── What is fully automated ─────────────────────────────────────────────────
 *  1. Fetches live OpenRouter paid model list
 *  2. Validates every slug in eloScores.json still exists on OR (paid tier)
 *  3. Reports new high-value OR models not yet in eloScores.json
 *
 * ── Arena ELO refresh (requires --arena <file>) ─────────────────────────────
 *  arena.ai is client-side rendered — a bare Node.js fetch returns a JS shell
 *  with no leaderboard data. Two ways to get the data file:
 *
 *  Option A — GitHub Copilot (fastest):
 *    Ask Copilot: "fetch https://arena.ai/leaderboard/text, save the
 *    full table text to scripts/arena-data.txt"
 *    Then: npm run update-elo -- --arena scripts/arena-data.txt
 *
 *  Option B — Browser copy-paste:
 *    1. Open arena.ai/leaderboard/text in your browser
 *    2. Select All (Cmd+A), Copy (Cmd+C)
 *    3. pbpaste > scripts/arena-data.txt   (macOS)
 *    4. npm run update-elo -- --arena scripts/arena-data.txt
 *
 * ── Adding an entirely new model ────────────────────────────────────────────
 *  1. Add entry to scripts/seed-elo.mjs (include the arenaSlug field)
 *  2. npm run seed-elo       → regenerate eloScores.json from seed-elo.mjs
 *  3. npm run update-elo     → validate OR slugs & optionally refresh ELOs
 */

import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { EXCLUDED_SLUGS } from "./seed-elo.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCORES_PATH = path.resolve(__dirname, "../src/data/eloScores.json");

// ── Parse CLI args ───────────────────────────────────────────────────────────
const arenaFileIdx = process.argv.indexOf("--arena");
const arenaFile = arenaFileIdx !== -1 ? process.argv[arenaFileIdx + 1] : null;

// ── Load current eloScores.json ──────────────────────────────────────────────
const eloScores = JSON.parse(readFileSync(SCORES_PATH, "utf8"));
const existingMeta = eloScores._meta ?? {};

const fmtDate = (iso) => {
  if (!iso) return "never";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return `${iso.slice(0, 10)}  (${days === 0 ? "today" : `${days}d ago`})`;
};
console.log("── Data freshness ──────────────────────────────────────────────────");
console.log(`  seed written  : ${fmtDate(existingMeta.seedWrittenAt)}`);
console.log(`  elo refreshed : ${fmtDate(existingMeta.eloRefreshedAt)}\n`);

// ── 1. Fetch OpenRouter paid models ─────────────────────────────────────────
console.log("Fetching OpenRouter model list…");
const orRes = await fetch("https://openrouter.ai/api/v1/models");
if (!orRes.ok) throw new Error(`OpenRouter HTTP error: ${orRes.status}`);
const { data: orModels } = await orRes.json();

const orPaid = new Set(
  orModels
    .filter((m) => parseFloat(m.pricing?.prompt) > 0 && parseFloat(m.pricing?.completion) > 0)
    .map((m) => m.id)
);
console.log(`  Found ${orPaid.size} paid models on OpenRouter\n`);

// ── 2. Validate slugs ────────────────────────────────────────────────────────
const ourSlugs = Object.keys(eloScores).filter((s) => s !== "_meta");
const stale = ourSlugs.filter((s) => !orPaid.has(s));
const valid = ourSlugs.filter((s) => orPaid.has(s));

console.log("── OR slug validation ──────────────────────────────────────────────");
console.log(`  Total entries    : ${ourSlugs.length}`);
console.log(`  Valid on OR      : ${valid.length}`);
console.log(`  Stale (not on OR): ${stale.length}`);

if (stale.length > 0) {
  console.log(
    "⚠️  Slugs not found on OpenRouter paid tier — remove or fix in scripts/seed-elo.mjs:"
  );
  for (const s of stale) {
    console.log(`   • ${s}  (ELO ${eloScores[s].rating})`);
  }
  console.log();
}

// ── 3. Report new high-value OR models not yet tracked ───────────────────────
// Keep in sync with the trackedPrefixes fields in src/lib/providers.ts.
const TRACKED_PREFIXES = [
  "anthropic/",
  "google/gemini",
  "google/gemma", // gemma-3-*, gemma-2-*
  "openai/",
  "x-ai/",
  "deepseek/deepseek",
  "meta-llama/llama-4",
  "meta-llama/llama-3", // llama-3.x still active; catches future 3.5/3.6
  "mistralai/mistral",
  "qwen/qwen3.",
  "qwen/qwq", // qwq reasoning line
];

const uncovered = [...orPaid].filter(
  (s) => TRACKED_PREFIXES.some((p) => s.startsWith(p)) && !eloScores[s] && !EXCLUDED_SLUGS.has(s)
);

if (uncovered.length > 0) {
  console.log(
    `ℹ️  ${uncovered.length} new OR paid model${uncovered.length === 1 ? "" : "s"} in tracked namespaces not yet in eloScores.json:`
  );
  for (const s of uncovered.sort()) {
    console.log(`   + ${s}`);
  }
  console.log(
    "   → Add to scripts/seed-elo.mjs (with arenaSlug), then:\n" +
      "     npm run seed-elo && npm run update-elo\n"
  );
} else {
  console.log("✓ No untracked models in watched namespaces\n");
}

// ── 4. Arena ELO refresh (only when --arena flag is provided) ────────────────
if (!arenaFile) {
  console.log(
    "── Arena ELO refresh ───────────────────────────────────────────────\n" +
      "  Skipped — supply a data file to refresh ratings:\n" +
      "    npm run update-elo -- --arena scripts/arena-data.txt\n" +
      "  See script header for instructions on generating arena-data.txt.\n"
  );
  process.exit(stale.length > 0 ? 1 : 0);
}

console.log(`\n── Arena ELO refresh from: ${arenaFile} ──────────────────────────`);
let arenaText;
try {
  arenaText = readFileSync(arenaFile, "utf8");
} catch (e) {
  console.error(`  ✗ Could not read file: ${e.message}`);
  process.exit(1);
}

// Parser supports two formats:
//
//  A) Markdown table (output of Copilot fetch_webpage):
//     | 1 | 1 3 | Anthropic claude-opus-4-6 Anthropic · Proprietary | 1505 ±8 | ...
//
//  B) Plain text (browser Cmd+A copy-paste):
//     1   claude-opus-4-6   1505 ±8   6,212

/** @type {Map<string, {rank: number, rating: number}>} */
const arenaMap = new Map();

// Format A
const TABLE_ROW = /(?:^|\|)\s*(\d+)\s*\|[^|]+\|([^|]+)\|\s*(\d{4})\s*±/gm;
let m;
while ((m = TABLE_ROW.exec(arenaText)) !== null) {
  const rank = parseInt(m[1], 10);
  const rating = parseInt(m[3], 10);
  const cell = m[2].replace(/·.*/g, "").trim();
  const tokens = cell.split(/\s+/);
  for (let i = 0; i < tokens.length; i++) {
    for (let j = i + 1; j <= tokens.length; j++) {
      const candidate = tokens.slice(i, j).join(" ");
      if ((candidate.includes("-") || candidate.includes(".")) && candidate.length > 4) {
        if (!arenaMap.has(candidate)) arenaMap.set(candidate, { rank, rating });
      }
    }
  }
}

// Format B fallback
if (arenaMap.size === 0) {
  const PLAIN_ROW = /^(\d{1,3})\s+(\S[\w.-]+)\s.*?(\d{4})\s*±/gm;
  while ((m = PLAIN_ROW.exec(arenaText)) !== null) {
    const rank = parseInt(m[1], 10);
    const slug = m[2];
    const rating = parseInt(m[3], 10);
    if (!arenaMap.has(slug)) arenaMap.set(slug, { rank, rating });
  }
}

console.log(`  Parsed ${arenaMap.size} model entries from input file`);

if (arenaMap.size === 0) {
  console.error(
    "  ✗ No leaderboard rows found. Ensure the file contains arena.ai table data.\n" +
      "    Expected: | 1 | ... | claude-opus-4-6 ... | 1505 ±8 | ...\n" +
      "    Or plain: 1  claude-opus-4-6  ...  1505 ±"
  );
  process.exit(1);
}

let updated = 0;
let unchanged = 0;
const notFound = [];

for (const [slug, entry] of Object.entries(eloScores)) {
  if (slug === "_meta") continue;
  const arenaSlug = entry.arenaSlug;
  if (!arenaSlug) {
    unchanged++;
    continue;
  }

  const live = arenaMap.get(arenaSlug);
  if (!live) {
    notFound.push({ slug, arenaSlug, oldRating: entry.rating });
    unchanged++;
    continue;
  }

  if (live.rating !== entry.rating || live.rank !== entry.rank) {
    console.log(
      `  ✦ ${slug.padEnd(50)} ELO ${entry.rating} → ${live.rating}  rank ${entry.rank} → ${live.rank}`
    );
    entry.rating = live.rating;
    entry.rank = live.rank;
    updated++;
  } else {
    unchanged++;
  }
}

if (updated > 0) {
  const refreshedAt = new Date().toISOString();
  eloScores._meta = { ...existingMeta, eloRefreshedAt: refreshedAt };
  writeFileSync(SCORES_PATH, JSON.stringify(eloScores, null, 2) + "\n");
  console.log(`\n✅ Updated ${updated} entries — wrote eloScores.json`);
  console.log(`   elo refreshed : ${refreshedAt.slice(0, 10)}`);
} else {
  console.log(`\n✓ All ratings already up to date (${unchanged} entries unchanged)`);
}

if (notFound.length > 0) {
  console.log("\n⚠️  arenaSlug not matched in provided data (may have been renamed):");
  for (const { slug, arenaSlug, oldRating } of notFound) {
    console.log(`   • ${slug}  (arenaSlug="${arenaSlug}", last ELO ${oldRating})`);
  }
  console.log("   → Fix arenaSlug in seed-elo.mjs → npm run seed-elo → npm run update-elo");
}

process.exit(stale.length > 0 ? 1 : 0);
