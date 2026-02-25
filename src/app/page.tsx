import ParetoChart from "@/components/ParetoChart";
import { getLiveModels } from "@/lib/getData";

export const revalidate = 3600; // re-fetch OpenRouter pricing at most once per hour

export default async function Home() {
  const { models, eloMeta } = await getLiveModels();
  return (
    <main className="flex min-h-screen flex-col items-center bg-[#0a0a0c] py-10">
      {models.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center px-4">
          <p className="text-[#f5f5f7] text-lg font-medium">Unable to load model data</p>
          <p className="text-[#a1a1a6] text-sm">
            Could not reach the OpenRouter API. Please try again later.
          </p>
        </div>
      ) : (
        <ParetoChart rawData={models} eloMeta={eloMeta} />
      )}
    </main>
  );
}
