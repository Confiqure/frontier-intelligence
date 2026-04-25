/**
 * Canonical source of truth for eloScores.json.
 * Run this to regenerate the file from scratch.
 *
 * Usage:  npm run seed-elo
 *
 * This file also exports DATA and EXCLUDED_SLUGS so update-elo.mjs can
 * import them without re-running the write side-effect.
 *
 * Fields per entry:
 *   lmArenaDisplayName  — human-readable label shown in the chart tooltip
 *   arenaSlug           — model identifier on arena.ai/leaderboard/text;
 *                         used by `npm run update-elo` to refresh ratings
 *   rating              — arena.ai ELO score (integer)
 *   rank                — arena.ai leaderboard rank (integer)
 *   license             — "open" | "proprietary"
 *
 * To add a new model:
 *   1. Add an entry to DATA below (OR slug as key, arenaSlug from the leaderboard)
 *   2. npm run seed-elo    — writes eloScores.json
 *   3. npm run update-elo  — validates OR slugs & reports any missed models
 *
 * To silence a noisy "uncovered" alert permanently, add the OR slug to
 * src/data/excludedSlugs.json.
 */

import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const OUT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/data/eloScores.json"
);

/**
 * OR slugs we have reviewed and deliberately do NOT track.
 * Edit src/data/excludedSlugs.json — this is derived from that file.
 * update-elo.mjs imports this to suppress slugs from the "uncovered" list.
 */
const _excludedSlugsPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/data/excludedSlugs.json"
);
export const EXCLUDED_SLUGS = new Set(JSON.parse(readFileSync(_excludedSlugsPath, "utf8")));

// prettier-ignore
export const DATA = {
  // ── OpenAI ────────────────────────────────────────────────────────────────
  "openai/gpt-4o":            { lmArenaDisplayName: "GPT-4o",                 arenaSlug: "gpt-4o-2024-05-13",                    rating: 1346, rank: 129, license: "proprietary" },
  "openai/gpt-4o-2024-08-06": { lmArenaDisplayName: "GPT-4o (Aug 2024)",      arenaSlug: "gpt-4o-2024-08-06",                    rating: 1335, rank: 141, license: "proprietary" },
  "openai/gpt-4o-2024-11-20": { lmArenaDisplayName: "GPT-4o (Nov 2024)",      arenaSlug: "gpt-4o-2024-08-06",                    rating: 1335, rank: 141, license: "proprietary" },
  "openai/gpt-4o-mini":       { lmArenaDisplayName: "GPT-4o mini",            arenaSlug: "gpt-4o-mini-2024-07-18",               rating: 1318, rank: 165, license: "proprietary" },
  // "openai/gpt-5.3-chat":      { lmArenaDisplayName: "GPT-5.3 Chat",           arenaSlug: "gpt-5.3-chat",                         rating: 1450, rank: 25,  license: "proprietary" },
  // "openai/gpt-5.3-codex":     { lmArenaDisplayName: "GPT-5.3 Codex",          arenaSlug: "gpt-5.3-codex",                        rating: 1450, rank: 25,  license: "proprietary" },
  "openai/gpt-5.4":           { lmArenaDisplayName: "GPT-5.4",                arenaSlug: "gpt-5.4",                              rating: 1460, rank: 15,  license: "proprietary" },
  "openai/gpt-5.4-pro":       { lmArenaDisplayName: "GPT-5.4 Pro",            arenaSlug: "gpt-5.4-high",                         rating: 1480, rank: 5,   license: "proprietary" },
  // "openai/o1-pro":            { lmArenaDisplayName: "o1 Pro",                 arenaSlug: "o1-pro",                               rating: 1420, rank: 40,  license: "proprietary" },
  // "openai/o3-pro":            { lmArenaDisplayName: "o3 Pro",                 arenaSlug: "o3-pro",                               rating: 1440, rank: 25,  license: "proprietary" },
  // "openai/o4-mini-high":      { lmArenaDisplayName: "o4 Mini High",           arenaSlug: "o4-mini-high",                         rating: 1400, rank: 80,  license: "proprietary" },
  "openai/gpt-4.1":           { lmArenaDisplayName: "GPT-4.1",                arenaSlug: "gpt-4.1-2025-04-14",                   rating: 1413, rank:  56, license: "proprietary" },
  "openai/gpt-4.1-mini":      { lmArenaDisplayName: "GPT-4.1 mini",           arenaSlug: "gpt-4.1-mini-2025-04-14",              rating: 1382, rank:  93, license: "proprietary" },
  "openai/gpt-4.1-nano":      { lmArenaDisplayName: "GPT-4.1 nano",           arenaSlug: "gpt-4.1-nano-2025-04-14",              rating: 1322, rank: 158, license: "proprietary" },
  "openai/o1":                { lmArenaDisplayName: "o1",                      arenaSlug: "o1-2024-12-17",                        rating: 1402, rank:  66, license: "proprietary" },
  "openai/o3-mini":           { lmArenaDisplayName: "o3-mini",                arenaSlug: "o3-mini",                              rating: 1348, rank: 124, license: "proprietary" },
  "openai/o3-mini-high":      { lmArenaDisplayName: "o3-mini (high)",         arenaSlug: "o3-mini-high",                         rating: 1364, rank: 110, license: "proprietary" },
  "openai/o3":                { lmArenaDisplayName: "o3",                      arenaSlug: "o3-2025-04-16",                        rating: 1433, rank:  34, license: "proprietary" },
  "openai/o4-mini":           { lmArenaDisplayName: "o4-mini",                arenaSlug: "o4-mini-2025-04-16",                   rating: 1391, rank:  81, license: "proprietary" },
  "openai/gpt-5":             { lmArenaDisplayName: "GPT-5",                  arenaSlug: "gpt-5-chat",                           rating: 1426, rank:  36, license: "proprietary" },
  "openai/gpt-5.1":           { lmArenaDisplayName: "GPT-5.1",                arenaSlug: "gpt-5.1",                              rating: 1438, rank:  29, license: "proprietary" },
  "openai/gpt-5.2":           { lmArenaDisplayName: "GPT-5.2",                arenaSlug: "gpt-5.2",                              rating: 1438, rank:  28, license: "proprietary" },
  "openai/gpt-5-mini":        { lmArenaDisplayName: "GPT-5 mini",             arenaSlug: "gpt-5-mini-high",                      rating: 1390, rank:  80, license: "proprietary" },
  "openai/gpt-5-nano":        { lmArenaDisplayName: "GPT-5 nano",             arenaSlug: "gpt-5-nano-high",                      rating: 1338, rank: 135, license: "proprietary" },  "openai/gpt-5-pro":         { lmArenaDisplayName: "GPT-5 Pro",            arenaSlug: "gpt-5-high",                           rating: 1434, rank:  31, license: "proprietary" },
  "openai/gpt-5.2-pro":       { lmArenaDisplayName: "GPT-5.2 Pro",          arenaSlug: "gpt-5.2-high",                         rating: 1441, rank:  27, license: "proprietary" },
  "openai/gpt-5.4-mini":     { lmArenaDisplayName: "GPT-5.4 mini",            arenaSlug: "gpt-5.4-mini-high", rating: 1430, rank:  90, license: "proprietary" },
  "openai/gpt-5.4-nano":     { lmArenaDisplayName: "GPT-5.4 nano",            arenaSlug: "gpt-5.4-nano-high", rating: 1380, rank: 115, license: "proprietary" },
  "openai/gpt-5.4-image-2":  { lmArenaDisplayName: "GPT-5.4 Image 2",         arenaSlug: "gpt-5.4-image-2",     rating: 1450, rank:  30, license: "proprietary" },
  "openai/gpt-5.5":          { lmArenaDisplayName: "GPT-5.5",                 arenaSlug: "gpt-5.5",             rating: 1490, rank:  10, license: "proprietary" },
  "openai/gpt-5.5-pro":      { lmArenaDisplayName: "GPT-5.5 Pro",             arenaSlug: "gpt-5.5-pro",         rating: 1500, rank:   5, license: "proprietary" },
  "openai/gpt-oss-120b":      { lmArenaDisplayName: "GPT-OSS 120B",         arenaSlug: "gpt-oss-120b",                         rating: 1354, rank: 114, license: "open"        },  "openai/gpt-4-turbo":       { lmArenaDisplayName: "GPT-4 Turbo (Apr 2024)", arenaSlug: "gpt-4-turbo-2024-04-09",               rating: 1324, rank: 152, license: "proprietary" },

  // ── Anthropic ─────────────────────────────────────────────────────────────
  // "anthropic/claude-3.5-sonnet":          { lmArenaDisplayName: "Claude 3.5 Sonnet (Oct 2024)",  arenaSlug: "claude-3-5-sonnet-20241022",              rating: 1373, rank:  99, license: "proprietary" },
  "anthropic/claude-3.5-haiku":           { lmArenaDisplayName: "Claude 3.5 Haiku",              arenaSlug: "claude-3-5-haiku-20241022",               rating: 1324, rank: 153, license: "proprietary" },
  "anthropic/claude-3-haiku":             { lmArenaDisplayName: "Claude 3 Haiku",                arenaSlug: "claude-3-haiku-20240307",                 rating: 1261, rank: 213, license: "proprietary" },
  "anthropic/claude-3.7-sonnet":          { lmArenaDisplayName: "Claude 3.7 Sonnet",             arenaSlug: "claude-3-7-sonnet-20250219",              rating: 1372, rank: 100, license: "proprietary" },
  "anthropic/claude-3.7-sonnet:thinking": { lmArenaDisplayName: "Claude 3.7 Sonnet (thinking)",  arenaSlug: "claude-3-7-sonnet-20250219-thinking-32k", rating: 1388, rank:  84, license: "proprietary" },
  "anthropic/claude-opus-4":              { lmArenaDisplayName: "Claude Opus 4 (May 2025)",      arenaSlug: "claude-opus-4-20250514",                  rating: 1413, rank:  57, license: "proprietary" },
  "anthropic/claude-opus-4.1":            { lmArenaDisplayName: "Claude Opus 4.1 (Aug 2025)",    arenaSlug: "claude-opus-4-1-20250805",                rating: 1446, rank:  23, license: "proprietary" },
  "anthropic/claude-opus-4.5":            { lmArenaDisplayName: "Claude Opus 4.5 (Nov 2025)",    arenaSlug: "claude-opus-4-5-20251101",                rating: 1467, rank:   9, license: "proprietary" },
  "anthropic/claude-opus-4.6":            { lmArenaDisplayName: "Claude Opus 4.6",               arenaSlug: "claude-opus-4-6",                         rating: 1505, rank:   1, license: "proprietary" },
  "anthropic/claude-opus-4.7":            { lmArenaDisplayName: "Claude Opus 4.7",               arenaSlug: "claude-opus-4-7",       rating: 1494, rank:   4, license: "proprietary" },
  "anthropic/claude-opus-4.6-fast":       { lmArenaDisplayName: "Claude Opus 4.6 (fast)",         arenaSlug: "claude-opus-4-6-fast",  rating: 1490, rank:   6, license: "proprietary" },
  "anthropic/claude-sonnet-4":            { lmArenaDisplayName: "Claude Sonnet 4 (May 2025)",    arenaSlug: "claude-sonnet-4-20250514",                rating: 1390, rank:  82, license: "proprietary" },
  "anthropic/claude-sonnet-4.5":          { lmArenaDisplayName: "Claude Sonnet 4.5 (Sep 2025)",  arenaSlug: "claude-sonnet-4-5-20250929",              rating: 1450, rank:  16, license: "proprietary" },
  "anthropic/claude-sonnet-4.6":          { lmArenaDisplayName: "Claude Sonnet 4.6",             arenaSlug: "claude-sonnet-4-6",                       rating: 1457, rank:  13, license: "proprietary" },
  "anthropic/claude-haiku-4.5":           { lmArenaDisplayName: "Claude Haiku 4.5",              arenaSlug: "claude-haiku-4-5-20251001",               rating: 1405, rank:  63, license: "proprietary" },

  // ── Google ────────────────────────────────────────────────────────────────
  "google/gemini-3.1-pro-preview": { lmArenaDisplayName: "Gemini 3.1 Pro Preview", arenaSlug: "gemini-3.1-pro-preview", rating: 1500, rank:   3, license: "proprietary" },
  // "google/gemini-3.1-pro-preview-customtools": { lmArenaDisplayName: "Gemini 3.1 Pro CustomTools", arenaSlug: "gemini-3.1-pro-preview-customtools", rating: 1500, rank: 3, license: "proprietary" },
  // "google/gemini-3.1-flash-image-preview": { lmArenaDisplayName: "Gemini 3.1 Flash Image", arenaSlug: "gemini-3.1-flash-image-preview", rating: 1475, rank: 5, license: "proprietary" },
  "google/gemini-3.1-flash-lite-preview": { lmArenaDisplayName: "Gemini 3.1 Flash Lite", arenaSlug: "gemini-3.1-flash-lite-preview", rating: 1380, rank: 90, license: "proprietary" },
  // "google/gemini-3-pro-preview":   { lmArenaDisplayName: "Gemini 3 Pro Preview",   arenaSlug: "gemini-3-pro",           rating: 1486, rank:   4, license: "proprietary" },
  "google/gemini-3-flash-preview": { lmArenaDisplayName: "Gemini 3 Flash Preview", arenaSlug: "gemini-3-flash",         rating: 1474, rank:   6, license: "proprietary" },
  "google/gemini-2.5-pro":         { lmArenaDisplayName: "Gemini 2.5 Pro",         arenaSlug: "gemini-2.5-pro",         rating: 1449, rank:  19, license: "proprietary" },
  "google/gemini-2.5-pro-preview": { lmArenaDisplayName: "Gemini 2.5 Pro Preview", arenaSlug: "gemini-2.5-pro",         rating: 1449, rank:  19, license: "proprietary" },
  "google/gemini-2.5-flash":       { lmArenaDisplayName: "Gemini 2.5 Flash",       arenaSlug: "gemini-2.5-flash",       rating: 1411, rank:  60, license: "proprietary" },
  "google/gemini-2.0-flash-001":      { lmArenaDisplayName: "Gemini 2.0 Flash",         arenaSlug: "gemini-2.0-flash-001",                             rating: 1361, rank: 109, license: "proprietary" },
  "google/gemini-2.0-flash-lite-001": { lmArenaDisplayName: "Gemini 2.0 Flash Lite",    arenaSlug: "gemini-2.0-flash-lite-preview-02-05",              rating: 1353, rank: 115, license: "proprietary" },
  "google/gemini-2.5-flash-lite":     { lmArenaDisplayName: "Gemini 2.5 Flash Lite",    arenaSlug: "gemini-2.5-flash-lite-preview-09-2025-no-thinking", rating: 1379, rank:  94, license: "proprietary" },
  "google/gemma-3-27b-it":            { lmArenaDisplayName: "Gemma 3 27B",            arenaSlug: "gemma-3-27b-it",         rating: 1365, rank: 105, license: "open" },
  "google/gemma-3-12b-it":         { lmArenaDisplayName: "Gemma 3 12B",            arenaSlug: "gemma-3-12b-it",         rating: 1342, rank: 132, license: "open" },
  "google/gemma-4-31b-it":          { lmArenaDisplayName: "Gemma 4 31B",            arenaSlug: "gemma-4-31b",            rating: 1451, rank:  32, license: "open" },
  "google/gemma-4-26b-a4b-it":      { lmArenaDisplayName: "Gemma 4 26B A4B",        arenaSlug: "gemma-4-26b-a4b",        rating: 1439, rank:  49, license: "open" },
  "google/gemma-2-27b-it":         { lmArenaDisplayName: "Gemma 2 27B",            arenaSlug: "gemma-2-27b-it",         rating: 1288, rank: 191, license: "open" },
  // "google/gemma-2-9b-it":          { lmArenaDisplayName: "Gemma 2 9B",             arenaSlug: "gemma-2-9b-it",          rating: 1266, rank: 209, license: "open" },

  // ── Meta ──────────────────────────────────────────────────────────────────
  "meta-llama/llama-4-maverick":        { lmArenaDisplayName: "Llama 4 Maverick 17B",   arenaSlug: "llama-4-maverick-17b-128e-instruct", rating: 1328, rank: 149, license: "open" },
  "meta-llama/llama-4-scout":           { lmArenaDisplayName: "Llama 4 Scout 17B",      arenaSlug: "llama-4-scout-17b-16e-instruct",     rating: 1323, rank: 156, license: "open" },
  "meta-llama/llama-3.3-70b-instruct":  { lmArenaDisplayName: "Llama 3.3 70B Instruct", arenaSlug: "llama-3.3-70b-instruct",             rating: 1320, rank: 161, license: "open" },
  // "meta-llama/llama-3.1-405b-instruct": { lmArenaDisplayName: "Llama 3.1 405B Instruct",arenaSlug: "llama-3.1-405b-instruct-bf16",       rating: 1335, rank: 139, license: "open" },
  "meta-llama/llama-3.1-70b-instruct":  { lmArenaDisplayName: "Llama 3.1 70B Instruct", arenaSlug: "llama-3.1-70b-instruct",             rating: 1294, rank: 187, license: "open" },
  "meta-llama/llama-3.1-8b-instruct":   { lmArenaDisplayName: "Llama 3.1 8B Instruct",  arenaSlug: "llama-3.1-8b-instruct",              rating: 1212, rank: 239, license: "open" },

  // ── DeepSeek ──────────────────────────────────────────────────────────────
  "deepseek/deepseek-v3.2":         { lmArenaDisplayName: "DeepSeek V3.2",      arenaSlug: "deepseek-v3.2",      rating: 1419, rank:  45, license: "open" },
  "deepseek/deepseek-v3.2-exp":     { lmArenaDisplayName: "DeepSeek V3.2 Exp",  arenaSlug: "deepseek-v3.2-exp",  rating: 1423, rank:  40, license: "open" },
  "deepseek/deepseek-r1-0528":      { lmArenaDisplayName: "DeepSeek R1 (0528)", arenaSlug: "deepseek-r1-0528",   rating: 1419, rank:  46, license: "open" },
  "deepseek/deepseek-v3.1-terminus": { lmArenaDisplayName: "DeepSeek V3.1 Terminus", arenaSlug: "deepseek-v3.1-terminus", rating: 1416, rank:  52, license: "open" },
  "deepseek/deepseek-chat-v3.1":    { lmArenaDisplayName: "DeepSeek V3.1",      arenaSlug: "deepseek-v3.1",      rating: 1418, rank:  48, license: "open" },
  "deepseek/deepseek-r1":           { lmArenaDisplayName: "DeepSeek R1",        arenaSlug: "deepseek-r1",        rating: 1398, rank:  73, license: "open" },
  "deepseek/deepseek-chat-v3-0324": { lmArenaDisplayName: "DeepSeek V3 (0324)", arenaSlug: "deepseek-v3-0324",   rating: 1394, rank:  76, license: "open" },
  "deepseek/deepseek-chat":         { lmArenaDisplayName: "DeepSeek V3",        arenaSlug: "deepseek-v3",        rating: 1358, rank: 110, license: "open" },
  "deepseek/deepseek-v4-pro":        { lmArenaDisplayName: "DeepSeek V4 Pro",     arenaSlug: "deepseek-v4-pro",    rating: 1463, rank:  20, license: "open" },
  "deepseek/deepseek-v4-flash":      { lmArenaDisplayName: "DeepSeek V4 Flash",   arenaSlug: "deepseek-v4-flash",  rating: 1433, rank:  55, license: "open" },

  // ── Mistral ───────────────────────────────────────────────────────────────
  "mistralai/mistral-large-2512":              { lmArenaDisplayName: "Mistral Large 3",           arenaSlug: "mistral-large-3",                     rating: 1414, rank:  55, license: "open" },
  "mistralai/mistral-medium-3.1":              { lmArenaDisplayName: "Mistral Medium 3.1 (2508)",  arenaSlug: "mistral-medium-2508",                 rating: 1411, rank:  59, license: "proprietary" },
  "mistralai/mistral-medium-3":                { lmArenaDisplayName: "Mistral Medium 3 (2505)",    arenaSlug: "mistral-medium-2505",                 rating: 1385, rank:  90, license: "open" },
  "mistralai/mistral-large-2411":              { lmArenaDisplayName: "Mistral Large (2411)",       arenaSlug: "mistral-large-2411",                  rating: 1305, rank: 180, license: "open" },
  "mistralai/mistral-large-2407":              { lmArenaDisplayName: "Mistral Large (2407)",       arenaSlug: "mistral-large-2407",                  rating: 1314, rank: 170, license: "open" },
  "mistralai/mistral-large":                   { lmArenaDisplayName: "Mistral Large (2402)",       arenaSlug: "mistral-large-2402",                  rating: 1243, rank: 219, license: "open" },
  "mistralai/mistral-small-3.2-24b-instruct":  { lmArenaDisplayName: "Mistral Small 3.2",          arenaSlug: "mistral-small-2506",                  rating: 1356, rank: 113, license: "open" },
  "mistralai/mistral-small-2603":               { lmArenaDisplayName: "Mistral Small 2603",         arenaSlug: "mistral-small-2603",                  rating: 1360, rank: 130, license: "open" },
  "mistralai/mistral-small-3.1-24b-instruct":  { lmArenaDisplayName: "Mistral Small 3.1",          arenaSlug: "mistral-small-3.1-24b-instruct-2503", rating: 1305, rank: 182, license: "open" },
  "mistralai/mistral-small-24b-instruct-2501": { lmArenaDisplayName: "Mistral Small 3 (2501)",     arenaSlug: "mistral-small-24b-instruct-2501",     rating: 1274, rank: 204, license: "open" },
  "mistralai/mixtral-8x22b-instruct":          { lmArenaDisplayName: "Mixtral 8x22B Instruct",     arenaSlug: "mixtral-8x22b-instruct-v0.1",         rating: 1230, rank: 228, license: "open" },

  // ── Qwen ──────────────────────────────────────────────────────────────────
  "qwen/qwen3.5-122b-a10b":    { lmArenaDisplayName: "Qwen3.5 122B A10B",    arenaSlug: "qwen3.5-122b-a10b",    rating: 1420, rank:  40, license: "open" },
  "qwen/qwen3.6-plus":          { lmArenaDisplayName: "Qwen3.6 Plus",          arenaSlug: "qwen3.6-plus",         rating: 1447, rank:  41, license: "proprietary" },
  "qwen/qwen3.5-27b":          { lmArenaDisplayName: "Qwen3.5 27B",          arenaSlug: "qwen3.5-27b",          rating: 1350, rank: 120, license: "open" },
  "qwen/qwen3.5-35b-a3b":      { lmArenaDisplayName: "Qwen3.5 35B A3B",      arenaSlug: "qwen3.5-35b-a3b",      rating: 1360, rank: 110, license: "open" },
  // "qwen/qwen3.5-9b":           { lmArenaDisplayName: "Qwen3.5 9B",           arenaSlug: "qwen3.5-9b",           rating: 1250, rank: 220, license: "open" },
  "qwen/qwen3.5-flash-02-23":  { lmArenaDisplayName: "Qwen3.5 Flash",        arenaSlug: "qwen3.5-flash",        rating: 1300, rank: 180, license: "open" },
  "qwen/qwen3.5-397b-a17b":    { lmArenaDisplayName: "Qwen3.5 397B A17B",    arenaSlug: "qwen3.5-397b-a17b",    rating: 1450, rank:  17, license: "open" },
  "qwen/qwen3.5-plus-02-15":   { lmArenaDisplayName: "Qwen3.5 Plus (Feb 2025)", arenaSlug: "qwen3.5-397b-a17b",    rating: 1450, rank:  17, license: "open" },
  "qwen/qwen3-235b-a22b":      { lmArenaDisplayName: "Qwen3 235B A22B",      arenaSlug: "qwen3-235b-a22b",      rating: 1375, rank:  96, license: "open" },
  "qwen/qwen3-max":            { lmArenaDisplayName: "Qwen3 Max",            arenaSlug: "qwen3-max-preview",    rating: 1434, rank:  32, license: "proprietary" },
  "qwen/qwen3-32b":            { lmArenaDisplayName: "Qwen3 32B",            arenaSlug: "qwen3-32b",            rating: 1347, rank: 126, license: "open" },
  "qwen/qwen3-30b-a3b":        { lmArenaDisplayName: "Qwen3 30B A3B",        arenaSlug: "qwen3-30b-a3b",        rating: 1328, rank: 148, license: "open" },
  "qwen/qwq-32b":              { lmArenaDisplayName: "QwQ-32B",              arenaSlug: "qwq-32b",              rating: 1336, rank: 138, license: "open" },
  "qwen/qwen-max":             { lmArenaDisplayName: "Qwen2.5 Max",          arenaSlug: "qwen2.5-max",          rating: 1374, rank:  98, license: "proprietary" },
  "qwen/qwen-plus":            { lmArenaDisplayName: "Qwen Plus (0125)",      arenaSlug: "qwen-plus-0125",       rating: 1346, rank: 128, license: "proprietary" },
  "qwen/qwen-2.5-72b-instruct":{ lmArenaDisplayName: "Qwen2.5 72B Instruct", arenaSlug: "qwen2.5-72b-instruct", rating: 1303, rank: 184, license: "open" },

  // ── xAI ───────────────────────────────────────────────────────────────────
  "x-ai/grok-4.1-fast": { lmArenaDisplayName: "Grok-4.1",      arenaSlug: "grok-4.1",           rating: 1463, rank:  11, license: "proprietary" },
  "x-ai/grok-4.20":                { lmArenaDisplayName: "Grok-4.20",             arenaSlug: "grok-4.20-beta1",                   rating: 1482, rank:   8, license: "proprietary" },
  "x-ai/grok-4.20-multi-agent":    { lmArenaDisplayName: "Grok-4.20 Multi-Agent", arenaSlug: "grok-4.20-multi-agent-beta-0309",   rating: 1476, rank:  12, license: "proprietary" },
  "x-ai/grok-4-fast":   { lmArenaDisplayName: "Grok-4 Fast",  arenaSlug: "grok-4-fast-chat",   rating: 1422, rank:  44, license: "proprietary" },
  "x-ai/grok-4":        { lmArenaDisplayName: "Grok-4",       arenaSlug: "grok-4-0709",         rating: 1409, rank:  64, license: "proprietary" },
  "x-ai/grok-3":        { lmArenaDisplayName: "Grok-3",      arenaSlug: "grok-3-preview-02-24", rating: 1411, rank:  60, license: "proprietary" },
  "x-ai/grok-3-mini":   { lmArenaDisplayName: "Grok-3 mini", arenaSlug: "grok-3-mini-beta",    rating: 1357, rank: 114, license: "proprietary" },
  // "x-ai/grok-code-fast-1": { lmArenaDisplayName: "Grok Code Fast 1", arenaSlug: "grok-code-fast-1", rating: 1400, rank: 80, license: "proprietary" },

  // ── Others ────────────────────────────────────────────────────────────────
  "microsoft/phi-4":                         { lmArenaDisplayName: "Phi-4",               arenaSlug: "phi-4",                           rating: 1256, rank: 216, license: "open" },
  "nvidia/llama-3.1-nemotron-70b-instruct":  { lmArenaDisplayName: "Nemotron-70B",        arenaSlug: "llama-3.1-nemotron-70b-instruct",  rating: 1299, rank: 185, license: "open" },
  "amazon/nova-pro-v1":                      { lmArenaDisplayName: "Amazon Nova Pro",     arenaSlug: "amazon-nova-pro-v1.0",             rating: 1290, rank: 188, license: "proprietary" },
  "amazon/nova-lite-v1":                     { lmArenaDisplayName: "Amazon Nova Lite",    arenaSlug: "amazon-nova-lite-v1.0",            rating: 1261, rank: 214, license: "proprietary" },
  "cohere/command-a":                        { lmArenaDisplayName: "Command A (03-2025)", arenaSlug: "command-a-03-2025",                rating: 1353, rank: 117, license: "proprietary" },
  "cohere/command-r-plus-08-2024":           { lmArenaDisplayName: "Command R+ (08-2024)",arenaSlug: "command-r-plus-08-2024",           rating: 1277, rank: 201, license: "proprietary" },
};

// ── Run only when invoked directly (not when imported) ──────────────────────
const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  // Self-validate before writing
  const REQUIRED = ["lmArenaDisplayName", "arenaSlug", "rating", "rank", "license"];
  const invalid = Object.entries(DATA).filter(([, v]) =>
    REQUIRED.some((f) => v[f] === undefined || v[f] === null || v[f] === "")
  );

  if (invalid.length > 0) {
    console.error("✗ Validation failed — entries with missing required fields:");
    for (const [slug, entry] of invalid) {
      const missing = REQUIRED.filter((f) => !entry[f]);
      console.error(`  ${slug}: missing ${missing.join(", ")}`);
    }
    process.exit(1);
  }

  // Preserve existing meta and gracefully merge to persist history
  let existing = {};
  let existingEloRefreshedAt = null;
  try {
    existing = JSON.parse(readFileSync(OUT, "utf8"));
    existingEloRefreshedAt = existing._meta?.eloRefreshedAt ?? null;
  } catch {
    // file doesn't exist yet — fine
  }

  const now = new Date().toISOString();
  const output = {
    _meta: { seedWrittenAt: now, eloRefreshedAt: existingEloRefreshedAt },
  };

  const fmtDateOnly = (iso) => (iso ? iso.slice(0, 10) : now.slice(0, 10));

  for (const [slug, newEntry] of Object.entries(DATA)) {
    const prev = existing[slug];

    let history = prev?.history || [];
    if (history.length === 0 && prev?.rating) {
      // Migrated from old flat format
      history = [
        {
          date: fmtDateOnly(existingEloRefreshedAt),
          rating: prev.rating,
          rank: prev.rank,
        },
      ];
    } else if (history.length === 0) {
      // Completely new model initialized from seed
      history = [
        {
          date: fmtDateOnly(now),
          rating: newEntry.rating,
          rank: newEntry.rank,
        },
      ];
    }

    const discoveryDate = prev?.discoveryDate || history[0]?.date || fmtDateOnly(now);
    const lastActiveDate = prev?.lastActiveDate || fmtDateOnly(existingEloRefreshedAt || now);

    output[slug] = {
      lmArenaDisplayName: newEntry.lmArenaDisplayName,
      arenaSlug: newEntry.arenaSlug,
      license: newEntry.license,
      discoveryDate,
      isDeprecated: prev?.isDeprecated || false,
      lastActiveDate,
      history,
    };
  }

  // Preserve deprecated slugs (ones in `existing` but removed from `DATA`)
  for (const [slug, prev] of Object.entries(existing)) {
    if (slug === "_meta" || output[slug]) continue;
    output[slug] = { ...prev, isDeprecated: true };
  }

  writeFileSync(OUT, JSON.stringify(output, null, 2) + "\n");

  const fmtDate = (iso) => {
    if (!iso) return "never refreshed from arena.ai";
    const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
    return `${iso.slice(0, 10)} (${days === 0 ? "today" : `${days}d ago`})`;
  };
  console.log(`✓ Wrote ${Object.keys(DATA).length} entries to eloScores.json`);
  console.log(`  seed written  : ${now.slice(0, 10)}`);
  console.log(`  elo refreshed : ${fmtDate(existingEloRefreshedAt)}`);
}
