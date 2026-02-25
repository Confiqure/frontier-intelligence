"use client";

import { calculateParetoFrontier } from "@/lib/pareto";
import { BRAND_COLORS } from "@/lib/providers";
import { getSvgImage } from "@/lib/svgs";
import type { ChartPoint, EloMeta, ModelData, ProcessedModel } from "@/types/model";
import {
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  LogarithmicScale,
  PointElement,
  Tooltip,
  type ChartDataset,
  type Plugin,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Scatter } from "react-chartjs-2";

ChartJS.register(
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartDataLabels
);

const FALLBACK_COLORS = [
  "255, 55, 95",
  "50, 215, 75",
  "100, 210, 255",
  "191, 90, 242",
  "255, 214, 10",
  "255, 159, 10",
  "94, 92, 230",
  "255, 204, 0",
  "172, 142, 104",
  "255, 69, 58",
  "48, 209, 88",
  "90, 200, 250",
  "175, 82, 222",
  "255, 127, 80",
  "123, 97, 255",
  "0, 191, 255",
];

type GroupingKey = "author" | "half" | "license_type";

type AugmentedDataset = ChartDataset<"scatter", ChartPoint[]> & {
  _origBg?: string;
  _origRadius?: number | number[];
  _origHoverRadius?: number | number[];
};

// Adds 30px of space below the legend
const legendMargin: Plugin<"scatter"> = {
  id: "legendMargin",
  beforeInit(chart) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const legend = (chart as any).legend;
    const originalFit = legend.fit.bind(legend);
    legend.fit = function () {
      originalFit();
      this.height += 30;
    };
  },
};

function processModels(rawData: ModelData[], ratio: number, openOnly: boolean): ProcessedModel[] {
  return rawData
    .filter(
      (d) =>
        d.ratingSource !== "unranked" && // exclude unranked; treat undefined as arena
        d.pricingPrompt &&
        d.pricingCompletion &&
        parseFloat(d.pricingPrompt) > 0 &&
        parseFloat(d.pricingCompletion) > 0
    )
    .filter((d) => {
      if (!openOnly) return true;
      return d.license && d.license.toLowerCase() !== "proprietary";
    })
    .map((d) => {
      const blended =
        parseFloat(d.pricingPrompt) * ratio + parseFloat(d.pricingCompletion) * (1 - ratio);
      return {
        ...d,
        price: blended * 1_000_000,
        name: d.lmArenaDisplayName || d.openRouterSlug,
      };
    });
}

function processUnranked(rawData: ModelData[], ratio: number): ProcessedModel[] {
  return rawData
    .filter(
      (d) =>
        d.ratingSource === "unranked" &&
        d.pricingPrompt &&
        d.pricingCompletion &&
        parseFloat(d.pricingPrompt) > 0 &&
        parseFloat(d.pricingCompletion) > 0
    )
    .map((d) => {
      const blended =
        parseFloat(d.pricingPrompt) * ratio + parseFloat(d.pricingCompletion) * (1 - ratio);
      return {
        ...d,
        price: blended * 1_000_000,
        name: d.openRouterSlug, // no display name for unranked
      };
    });
}

function buildDatasets(
  models: ProcessedModel[],
  groupBy: GroupingKey,
  useLogos: boolean
): ChartDataset<"scatter", ChartPoint[]>[] {
  const grouped: Record<string, ProcessedModel[]> = {};

  for (const m of models) {
    let key = "Unknown";
    if (groupBy === "author") {
      key = m.author || "Unknown";
    } else if (groupBy === "half") {
      if (m.createdAt) {
        const d = new Date(m.createdAt);
        const half = Math.floor(d.getMonth() / 6) + 1;
        key = `${d.getFullYear()} H${half}`;
      }
    } else {
      key = m.license && m.license.toLowerCase() !== "proprietary" ? "Open" : "Proprietary";
    }
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(m);
  }

  const keys = Object.keys(grouped).sort();
  let colorIdx = 0;

  return keys.map((key) => {
    let color: string;
    if (groupBy === "author") {
      color =
        BRAND_COLORS[key.toLowerCase()] ?? FALLBACK_COLORS[colorIdx++ % FALLBACK_COLORS.length];
    } else if (groupBy === "license_type") {
      color = key === "Open" ? "50, 215, 75" : "255, 55, 95";
    } else {
      color = FALLBACK_COLORS[colorIdx++ % FALLBACK_COLORS.length];
    }

    const data: ChartPoint[] = grouped[key].map((m) => ({
      x: m.price,
      y: m.rating,
      model: m,
    }));

    const svgImages = useLogos
      ? grouped[key].map((m) => getSvgImage(m.author, `rgb(${color})`))
      : null;

    const pointStyles = svgImages ?? ("circle" as const);

    const pointRadius = svgImages ? svgImages.map((s) => (s === "circle" ? 5 : 4)) : 5;

    const pointHoverRadius = svgImages ? svgImages.map((s) => (s === "circle" ? 7 : 8)) : 10;

    return {
      label: key,
      data,
      backgroundColor: `rgba(${color}, 0.75)`,
      borderColor: `rgba(${color}, 0.95)`,
      pointStyle: pointStyles as never,
      pointRadius: pointRadius as never,
      pointHoverRadius: pointHoverRadius as never,
    } as ChartDataset<"scatter", ChartPoint[]>;
  });
}

interface ParetoChartProps {
  rawData: ModelData[];
  eloMeta: EloMeta;
}

export default function ParetoChart({ rawData, eloMeta }: ParetoChartProps) {
  const [inputRatio, setInputRatio] = useState(75);
  const [openOnly, setOpenOnly] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [useLogos, setUseLogos] = useState(true);
  const [groupBy, setGroupBy] = useState<GroupingKey>("author");
  const [showUnranked, setShowUnranked] = useState(false);
  const chartRef = useRef<ChartJS<"scatter", ChartPoint[]> | null>(null);
  const unrankedSepYRef = useRef(0);

  const models = useMemo(
    () => processModels(rawData, inputRatio / 100, openOnly),
    [rawData, inputRatio, openOnly]
  );

  const unrankedModels = useMemo(
    () => processUnranked(rawData, inputRatio / 100),
    [rawData, inputRatio]
  );

  const minRankedElo = useMemo(
    () => (models.length > 0 ? Math.min(...models.map((m) => m.rating)) : 1200),
    [models]
  );
  const unrankedY = minRankedElo - 80;

  const frontier = useMemo(() => {
    const f = calculateParetoFrontier(models);
    return f.map((m) => ({ x: m.price, y: m.rating, model: m })).sort((a, b) => a.x - b.x);
  }, [models]);

  const modelDatasets = useMemo(
    () => buildDatasets(models, groupBy, useLogos),
    [models, groupBy, useLogos]
  );

  const frontierDataset: ChartDataset<"scatter", ChartPoint[]> = useMemo(
    () => ({
      label: "Pareto Frontier",
      data: frontier,
      showLine: true,
      borderColor: "#32D74B",
      backgroundColor: "rgba(50, 215, 75, 0.1)",
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 0,
      fill: false,
      tension: 0,
      order: 0,
    }),
    [frontier]
  );

  // Update separator Y ref so the plugin reads the latest value at draw time
  unrankedSepYRef.current = minRankedElo - 40;

  const unrankedDataset: ChartDataset<"scatter", ChartPoint[]> = useMemo(
    () => ({
      label: "Unranked (price only)",
      data: unrankedModels.map((m) => ({ x: m.price, y: unrankedY, model: m })),
      backgroundColor: "rgba(161, 161, 166, 0.08)",
      borderColor: "rgba(161, 161, 166, 0.65)",
      borderWidth: 1.5,
      pointStyle: "circle",
      pointRadius: 5,
      pointHoverRadius: 7,
    }),
    [unrankedModels, unrankedY]
  );

  const unrankedSeparatorPlugin = useMemo<Plugin<"scatter">>(
    () => ({
      id: "unrankedSeparator",
      afterDraw(chart) {
        const lineY = unrankedSepYRef.current;
        if (!lineY) return;
        const yPx = chart.scales.y?.getPixelForValue(lineY);
        if (yPx === undefined) return;
        const { left, right } = chart.chartArea;
        const ctx = chart.ctx;
        ctx.save();
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(left, yPx);
        ctx.lineTo(right, yPx);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(161, 161, 166, 0.55)";
        ctx.font = "11px -apple-system, system-ui, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("not yet on Arena leaderboard ↓", left + 8, yPx - 5);
        ctx.restore();
      },
    }),
    [] // stable — reads unrankedSepYRef by ref at draw time
  );

  const chartDatasets = useMemo<ChartDataset<"scatter", ChartPoint[]>[]>(
    () => [frontierDataset, ...modelDatasets, ...(showUnranked ? [unrankedDataset] : [])],
    [frontierDataset, modelDatasets, showUnranked, unrankedDataset]
  );

  const chartPlugins = useMemo(
    () => [legendMargin, ...(showUnranked ? [unrankedSeparatorPlugin] : [])] as const,
    [showUnranked, unrankedSeparatorPlugin]
  );

  const toggleAll = useCallback((visible: boolean) => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.data.datasets.forEach((_, i) => {
      if (i === 0) return;
      chart.setDatasetVisibility(i, visible);
    });
    chart.update();
  }, []);

  // Re-trigger logo loading after mount (SVGs load async)
  useEffect(() => {
    const timer = setTimeout(() => {
      chartRef.current?.update("none");
    }, 500);
    return () => clearTimeout(timer);
  }, [useLogos, groupBy]);

  const eloFreshness = useMemo(() => {
    const date = eloMeta.eloRefreshedAt ?? eloMeta.seedWrittenAt;
    if (!date) return { text: "unknown freshness", color: "#ff9f0a" };
    const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
    const color = days < 30 ? "#32D74B" : days < 60 ? "#ff9f0a" : "#ff453a";
    const source = eloMeta.eloRefreshedAt ? "refreshed" : "seeded";
    return { text: `${source} ${date.slice(0, 10)}`, color };
  }, [eloMeta]);

  return (
    <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <h1 className="text-center text-2xl sm:text-3xl font-semibold tracking-tight text-[#f5f5f7] mb-3">
        LLM Pareto Efficiency (Price vs Performance)
      </h1>
      <p className="text-center text-sm text-[#a1a1a6] mb-8">
        Visualizing the balance between performance and cost for{" "}
        <span className="text-[#f5f5f7] font-medium">{models.length}</span> ranked LLM models
        {showUnranked && unrankedModels.length > 0 && (
          <>
            {" "}
            + <span className="text-[#f5f5f7] font-medium">{unrankedModels.length}</span> unranked
          </>
        )}
        . <span className="italic">Pricing via OpenRouter · ELO via arena.ai.</span>
      </p>

      {/* Controls row 1 */}
      <div className="flex flex-wrap items-center gap-4 mb-5 pb-5 border-b border-[#2c2c2e]">
        <label className="flex items-center gap-2 text-sm text-[#a1a1a6] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showLabels}
            onChange={(e) => setShowLabels(e.target.checked)}
            className="accent-[#007aff]"
          />
          Show Labels
        </label>

        <label className="flex items-center gap-2 text-sm text-[#a1a1a6] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={openOnly}
            onChange={(e) => setOpenOnly(e.target.checked)}
            className="accent-[#007aff]"
          />
          Open Models Only
        </label>

        <label className="flex items-center gap-2 text-sm text-[#a1a1a6] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showUnranked}
            onChange={(e) => setShowUnranked(e.target.checked)}
            className="accent-[#007aff]"
          />
          Show Unranked
          {unrankedModels.length > 0 && (
            <span className="text-xs text-[#636366]">({unrankedModels.length})</span>
          )}
        </label>

        <label className="flex items-center gap-2 text-sm text-[#a1a1a6] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={useLogos}
            onChange={(e) => setUseLogos(e.target.checked)}
            className="accent-[#007aff]"
          />
          Use Logos
        </label>

        <div className="ml-auto flex items-center gap-3 text-sm text-[#a1a1a6]">
          <span>Input : Output Token Ratio:</span>
          <input
            type="range"
            min={0}
            max={100}
            value={inputRatio}
            onChange={(e) => setInputRatio(Number(e.target.value))}
            className="accent-[#007aff] cursor-pointer w-28"
          />
          <span className="font-mono text-[#f5f5f7] min-w-[3ch]">{inputRatio}%</span>
        </div>
      </div>

      {/* Controls row 2 */}
      <div className="flex flex-wrap items-center gap-3 mb-6 pb-5 border-b border-[#2c2c2e]">
        <label className="text-sm text-[#a1a1a6]" htmlFor="group-by">
          Group By:
        </label>
        <select
          id="group-by"
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value as GroupingKey)}
          className="bg-[#2c2c2e] text-[#f5f5f7] border border-[#2c2c2e] rounded-lg px-3 py-2 text-sm outline-none cursor-pointer"
        >
          <option value="author">Author</option>
          <option value="half">Created At</option>
          <option value="license_type">Open vs Proprietary</option>
        </select>

        <button
          onClick={() => toggleAll(false)}
          className="ml-2 bg-[#2c2c2e] hover:bg-[#3a3a3c] border border-[#2c2c2e] hover:border-[#48484a] text-[#f5f5f7] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Deselect All
        </button>
        <button
          onClick={() => toggleAll(true)}
          className="bg-[#2c2c2e] hover:bg-[#3a3a3c] border border-[#2c2c2e] hover:border-[#48484a] text-[#f5f5f7] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Select All
        </button>
      </div>

      {/* Chart */}
      <div className="w-full h-[650px]">
        <Scatter
          ref={chartRef as never}
          plugins={chartPlugins as never}
          data={{ datasets: chartDatasets }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: "nearest",
              axis: "xy",
              intersect: true,
            },
            scales: {
              x: {
                type: "logarithmic",
                grid: { color: "rgba(255, 255, 255, 0.08)" },
                ticks: { color: "#a1a1a6" },
                title: {
                  display: true,
                  text: "Price ($ / Million Tokens) [Log Scale]",
                  color: "#f5f5f7",
                  font: { size: 13, weight: 500 },
                },
              },
              y: {
                grid: { color: "rgba(255, 255, 255, 0.08)" },
                ticks: { color: "#a1a1a6" },
                title: {
                  display: true,
                  text: "Arena ELO",
                  color: "#f5f5f7",
                  font: { size: 13, weight: 500 },
                },
              },
            },
            plugins: {
              datalabels: {
                display: (ctx) =>
                  ctx.datasetIndex !== 0 &&
                  showLabels &&
                  ctx.dataset.label !== "Unranked (price only)",
                formatter: (value: ChartPoint) => value.model.name,
                align: "top",
                anchor: "end",
                offset: 4,
                font: { size: 10, weight: 500 },
                color: "#f5f5f7",
                clip: false,
              },
              legend: {
                labels: {
                  color: "#f5f5f7",
                  usePointStyle: true,
                  padding: 18,
                  font: { size: 12 },
                },
                onHover: (_e, legendItem, legend) => {
                  const idx = legendItem.datasetIndex!;
                  const ci = legend.chart;
                  ci.data.datasets.forEach((ds, i) => {
                    if (i === 0) return;
                    const d = ds as AugmentedDataset;
                    if (!d._origBg) d._origBg = d.backgroundColor as string;
                    if (!d._origRadius) d._origRadius = d.pointRadius as number | number[];
                    if (!d._origHoverRadius)
                      d._origHoverRadius = d.pointHoverRadius as number | number[];

                    if (i === idx) {
                      d.pointRadius = Array.isArray(d._origRadius)
                        ? (d._origRadius as number[]).map((r) => r * 1.5)
                        : (d._origRadius as number) * 1.5;
                      d.pointHoverRadius = Array.isArray(d._origHoverRadius)
                        ? (d._origHoverRadius as number[]).map((r) => r * 1.5)
                        : (d._origHoverRadius as number) * 1.5;
                      d.backgroundColor = d._origBg;
                    } else {
                      d.pointRadius = 2;
                      d.pointHoverRadius = 2;
                      d.backgroundColor = (d._origBg ?? "").replace(/[\d.]+\)$/, "0.15)");
                    }
                  });
                  ci.update("none");
                },
                onLeave: (_e, _item, legend) => {
                  const ci = legend.chart;
                  ci.data.datasets.forEach((ds, i) => {
                    if (i === 0) return;
                    const d = ds as AugmentedDataset;
                    if (d._origRadius !== undefined) d.pointRadius = d._origRadius as never;
                    if (d._origHoverRadius !== undefined)
                      d.pointHoverRadius = d._origHoverRadius as never;
                    if (d._origBg !== undefined) d.backgroundColor = d._origBg;
                  });
                  ci.update("none");
                },
              },
              tooltip: {
                filter: (item) => item.datasetIndex !== 0,
                backgroundColor: "rgba(18, 18, 20, 0.95)",
                titleColor: "#f5f5f7",
                bodyColor: "#a1a1a6",
                borderColor: "rgba(255,255,255,0.1)",
                borderWidth: 1,
                padding: 12,
                cornerRadius: 10,
                callbacks: {
                  title: (ctx) => {
                    const p = ctx[0]?.raw as ChartPoint;
                    return p?.model?.name ?? "";
                  },
                  label: (ctx) => {
                    const p = ctx.raw as ChartPoint;
                    const m = p.model;
                    if (m.ratingSource === "unranked") {
                      return [
                        `Blended Price: $${p.x.toFixed(3)}/M tokens`,
                        `Input: $${(parseFloat(m.pricingPrompt) * 1_000_000).toFixed(3)}/M`,
                        `Output: $${(parseFloat(m.pricingCompletion) * 1_000_000).toFixed(3)}/M`,
                        `Created: ${new Date(m.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`,
                        `Context: ${m.contextLength.toLocaleString()} tokens`,
                        `Arena ELO: not yet ranked`,
                      ];
                    }
                    return [
                      `Arena ELO: ${m.rating}`,
                      `Blended Price: $${p.x.toFixed(3)}/M tokens`,
                      `Input: $${(parseFloat(m.pricingPrompt) * 1_000_000).toFixed(3)}/M`,
                      `Output: $${(parseFloat(m.pricingCompletion) * 1_000_000).toFixed(3)}/M`,
                      `Created: ${new Date(m.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`,
                      `Context: ${m.contextLength.toLocaleString()} tokens`,
                      `Author: ${m.author}`,
                      `Arena Rank: ${m.rank}`,
                      `License: ${m.license || "Unknown"}`,
                    ];
                  },
                },
              },
            },
          }}
        />
      </div>

      {/* Footer */}
      <div className="mt-8 pt-5 border-t border-[#2c2c2e] flex flex-wrap justify-between items-center gap-4 text-sm text-[#a1a1a6]">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: eloFreshness.color }}
          />
          <span>
            ELO ratings:{" "}
            <a
              href="https://arena.ai/leaderboard/text"
              target="_blank"
              rel="noopener noreferrer"
              className="underline opacity-80 hover:opacity-100 transition-opacity"
            >
              arena.ai
            </a>{" "}
            &middot; {eloFreshness.text}
          </span>
        </div>
        <div>
          Pricing:{" "}
          <a
            href="https://openrouter.ai/models"
            target="_blank"
            rel="noopener noreferrer"
            className="underline opacity-80 hover:opacity-100 transition-opacity"
          >
            OpenRouter
          </a>{" "}
          &middot; live (cached 1h)
        </div>
      </div>
    </div>
  );
}
