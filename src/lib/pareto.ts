import type { ProcessedModel } from "@/types/model";

export function calculateParetoFrontier(models: ProcessedModel[]): ProcessedModel[] {
  const sorted = [...models].sort((a, b) => a.price - b.price);
  const frontier: ProcessedModel[] = [];
  let maxRatingSoFar = -Infinity;

  for (const model of sorted) {
    if (model.rating > maxRatingSoFar) {
      frontier.push(model);
      maxRatingSoFar = model.rating;
    }
  }
  return frontier;
}
