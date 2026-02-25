export interface EloMeta {
  seedWrittenAt: string | null;
  eloRefreshedAt: string | null;
}

export type RatingSource = "arena" | "unranked";

export interface ModelData {
  openRouterSlug: string;
  lmArenaDisplayName?: string;
  author: string;
  pricingPrompt: string; // price per token (string)
  pricingCompletion: string; // price per token (string)
  rating: number; // LMArena ELO (0 for unranked)
  createdAt: string; // ISO date
  contextLength: number;
  license: string; // "unknown" for unranked
  rank: number; // 0 for unranked
  ratingSource?: RatingSource; // undefined treated as "arena" for backwards-compat
}

export interface ProcessedModel extends ModelData {
  price: number; // blended price per million tokens
  name: string;
}

export interface ChartPoint {
  x: number;
  y: number;
  model: ProcessedModel;
}
