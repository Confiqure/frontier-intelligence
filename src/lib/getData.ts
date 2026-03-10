import eloScores from "@/data/eloScores.json";
import excludedSlugsData from "@/data/excludedSlugs.json";
import { AUTHOR_DISPLAY_NAMES, TRACKED_SLUG_PREFIXES } from "@/lib/providers";
import type { EloMeta, ModelData } from "@/types/model";

interface OpenRouterModel {
  id: string;
  created: number;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
}

interface OpenRouterResponse {
  data: OpenRouterModel[];
}

type EloEntry = {
  lmArenaDisplayName?: string;
  arenaSlug?: string;
  license: string;
  discoveryDate?: string;
  isDeprecated?: boolean;
  lastActiveDate?: string;
  history?: Array<{
    date: string;
    rating: number;
    rank: number;
  }>;
  // Legacy fields for transition
  rating?: number;
  rank?: number;
};

const rawScores = eloScores as unknown as Record<
  string,
  EloEntry | { seedWrittenAt?: string; eloRefreshedAt?: string }
>;
const metaRaw = rawScores["_meta"] as
  | { seedWrittenAt?: string; eloRefreshedAt?: string }
  | undefined;
const ELO_META: EloMeta = {
  seedWrittenAt: metaRaw?.seedWrittenAt ?? null,
  eloRefreshedAt: metaRaw?.eloRefreshedAt ?? null,
};
const ELO_MAP = Object.fromEntries(
  Object.entries(rawScores).filter(([k]) => k !== "_meta")
) as Record<string, EloEntry>;

const EXCLUDED_SLUGS = new Set<string>(excludedSlugsData);

export async function getLiveModels(): Promise<{
  models: ModelData[];
  eloMeta: EloMeta;
}> {
  let orModels: OpenRouterModel[] = [];
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      next: { revalidate: 3600 }, // cache for 1 hour
    });
    if (!res.ok) throw new Error(`OpenRouter API error: ${res.status}`);
    const json: OpenRouterResponse = await res.json();
    orModels = json.data;
  } catch (err) {
    console.error("Failed to fetch OpenRouter models:", err);
    return { models: [], eloMeta: ELO_META };
  }

  // Join: iterate OR paid models, annotate with ELO data where available
  const results: ModelData[] = [];

  for (const or of orModels) {
    const promptPrice = parseFloat(or.pricing.prompt);
    const completionPrice = parseFloat(or.pricing.completion);

    // Skip free or invalid pricing
    if (!isFinite(promptPrice) || !isFinite(completionPrice)) continue;
    if (promptPrice <= 0 || completionPrice <= 0) continue;

    const slug = or.id;
    const elo = ELO_MAP[slug];
    const author = slug.split("/")[0];

    if (elo && (elo.rating || elo.history?.length)) {
      // Ranked model — full arena ELO data available
      const authorDisplay = AUTHOR_DISPLAY_NAMES[author] ?? author;
      const latestHistory = elo.history?.[elo.history.length - 1];
      const rating = latestHistory?.rating ?? elo.rating ?? 0;
      const rank = latestHistory?.rank ?? elo.rank ?? 0;

      results.push({
        openRouterSlug: slug,
        lmArenaDisplayName: elo.lmArenaDisplayName,
        author: authorDisplay,
        pricingPrompt: or.pricing.prompt,
        pricingCompletion: or.pricing.completion,
        rating,
        createdAt: new Date(or.created * 1000).toISOString(),
        contextLength: or.context_length,
        license: elo.license,
        rank,
        ratingSource: "arena",
      });
    } else if (TRACKED_SLUG_PREFIXES.some((p) => slug.startsWith(p)) && !EXCLUDED_SLUGS.has(slug)) {
      // Price data only — not yet on Arena leaderboard
      const authorDisplay = AUTHOR_DISPLAY_NAMES[author] ?? author;
      results.push({
        openRouterSlug: slug,
        author: authorDisplay,
        pricingPrompt: or.pricing.prompt,
        pricingCompletion: or.pricing.completion,
        rating: 0,
        createdAt: new Date(or.created * 1000).toISOString(),
        contextLength: or.context_length,
        license: "unknown",
        rank: 0,
        ratingSource: "unranked",
      });
    }
  }

  return { models: results, eloMeta: ELO_META };
}
