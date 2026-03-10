"use client";

import { useDashboardStore } from "@/lib/store";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import pipelinesData from "@/data/pipelines.json";
import { getFilteredPipelines } from "@/lib/filters";
import { getMarginColor, colors } from "@/lib/colors";
import { formatVolumeGB, formatCostPerGB, formatCurrencyCompact } from "@/lib/utils";

export function PipelineScatter() {
  const state = useDashboardStore();
  const { openSlideOver, gmMode, normalization, setNormalization } = useDashboardStore();
  let pipelinesAll = pipelinesData.pipelines as any[];
  const pipelines = getFilteredPipelines(pipelinesAll as any, state as any);
  
  if (pipelines.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-lg border border-[#1E2D4D] bg-[#0B1224] text-[#94A3B8]">
        No pipelines match the selected data plane filter.
      </div>
    );
  }
  const maxRevenue = Math.max(...pipelines.map((p) => p.revenue_k), 1);
  const avgComplexity =
    pipelines.reduce((s, p) => s + (p.complexity_steps ?? 2), 0) / pipelines.length;

  const getCostPerGb = (p: (typeof pipelines)[0]) => {
    if (normalization === "raw") return p.cost_per_gb;
    if (normalization === "complexity" && p.complexity_steps) {
      return p.cost_per_gb / (p.complexity_steps / avgComplexity);
    }
    if (normalization === "time_smoothed") {
      const meanCost = pipelines.reduce((s, x) => s + x.cost_per_gb, 0) / pipelines.length;
      return p.cost_per_gb * 0.7 + meanCost * 0.3;
    }
    return p.cost_per_gb;
  };

  const data = pipelines.map((p) => {
    const costPerGb = getCostPerGb(p);
    const gm = gmMode === "volume" ? p.gm_pct_by_volume : p.gm_pct_by_count;
    return {
      ...p,
      x: p.volume_gb,
      y: costPerGb,
      z: Math.max(6, Math.min(p.revenue_k / 6, 30)),
      gm,
    };
  });

  const sortedY = data.map((d) => d.y).sort((a, b) => a - b);
  const medianY = sortedY[Math.floor(sortedY.length / 2)] ?? 0;
  const isOutlier = (y: number) => medianY > 0 && y > 2 * medianY;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-[#64748B]">Normalization:</span>
        <div className="flex rounded-lg border border-[#1E2D4D] p-0.5">
          {(["raw", "complexity", "time_smoothed"] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setNormalization(n)}
              className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
                normalization === n ? "bg-[#00D4FF] text-[#050A18]" : "text-[#94A3B8]"
              }`}
            >
              {n === "raw" ? "(Raw)" : n === "complexity" ? "Complexity-Weighted" : "Time-Smoothed"}
            </button>
          ))}
        </div>
      </div>
      <div className="relative h-80">
        <div className="absolute right-2 top-2 z-10 rounded-md border border-[#22C55E40] bg-[#22C55E15] px-2 py-0.5 text-[10px] font-bold text-[#22C55E]">
          High Volume, Low Cost — IDEAL
        </div>
        <div className="absolute bottom-2 left-2 z-10 rounded-md border border-[#EF444440] bg-[#EF444415] px-2 py-0.5 text-[10px] font-bold text-[#EF4444]">
          Low Volume, High Cost — REVIEW
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <XAxis
              type="number"
              dataKey="x"
              name="Volume"
              tick={{ fill: "#64748B" }}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(v))}
              domain={["dataMin", "dataMax"]}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Cost/GB"
              tick={{ fill: "#64748B" }}
              tickFormatter={(v) => `$${v.toFixed(2)}`}
            />
            <ZAxis type="number" dataKey="z" range={[0, 600]} />
            <Tooltip
              cursor={{ stroke: "#1E2D4D", strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const p = payload[0].payload;
                const gm = gmMode === "volume" ? p.gm_pct_by_volume : p.gm_pct_by_count;
                const color = getMarginColor(gm);
                return (
                  <div className="rounded-lg border border-[#2A3A5C] bg-[#111B33] p-3 shadow-lg">
                    <div className="font-semibold text-[#F1F5F9]">{p.name}</div>
                    <div className="text-xs text-[#94A3B8]">{p.source} → {p.destination}</div>
                    <div className="mt-2 space-y-1 text-xs text-[#F1F5F9]">
                      <div>Volume: {formatVolumeGB(p.volume_gb)}</div>
                      <div>Cost/GB: {formatCostPerGB(p.cost_per_gb)}</div>
                      <div style={{ color }}>GM ({gmMode}): {gm.toFixed(1)}%</div>
                      <div>Revenue: {formatCurrencyCompact(p.revenue_k * 1000)}</div>
                    </div>
                  </div>
                );
              }}
            />
            <Scatter
              data={data}
              fillOpacity={0.8}
              isAnimationActive={true}
              animationDuration={400}
              onClick={(_data, index) => {
                const p = data[index];
                if (p?.id) openSlideOver("pipeline", p.id);
              }}
              shape={(props: unknown) => {
                const p = props as { cx: number; cy: number; payload: (typeof data)[0] };
                const { cx, cy, payload } = p;
                const out = isOutlier(payload.y);
                const r = Math.max(6, Math.min(payload.z / 2, 15));
                return (
                  <g>
                    {out && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={r + 4}
                        stroke={colors.anomalyDot}
                        strokeWidth={2}
                        fill="none"
                        className="animate-pulse"
                      />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill={getMarginColor(payload.gm)}
                      cursor="pointer"
                    />
                  </g>
                );
              }}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={getMarginColor(entry.gm)} cursor="pointer" />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
