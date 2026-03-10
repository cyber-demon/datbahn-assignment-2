"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import pipelinesData from "@/data/pipelines.json";
import { getFilteredPipelines } from "@/lib/filters";
import { useDashboardStore } from "@/lib/store";
import { colors } from "@/lib/colors";

export function PipelineDivergence() {
  const state = useDashboardStore();
  let pipelinesAll = [...pipelinesData.pipelines] as any[];
  let pipelines = getFilteredPipelines(pipelinesAll as any, state as any);
  

  const withDiv = pipelines.map((p) => ({
    name: p.name,
    gm_pct_by_volume: p.gm_pct_by_volume,
    gm_pct_by_count: p.gm_pct_by_count,
    divergence_pp: (p as { divergence_pp?: number }).divergence_pp ?? p.gm_pct_by_volume - p.gm_pct_by_count,
  }));

  const sortedByDivergence = [...withDiv].sort(
    (a, b) => Math.abs(b.divergence_pp) - Math.abs(a.divergence_pp)
  );

  if (sortedByDivergence.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-lg border border-[#1E2D4D] bg-[#0B1224] text-[#94A3B8]">
        No pipelines match the selected filter.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-3 text-[10px] text-[#64748B]">
        <span style={{ color: colors.accent }}>■ GM by Volume (GB)</span>
        <span style={{ color: colors.purple }}>■ GM by Count (Events)</span>
        <span className="text-yellow-500">⚠️ = divergence &gt; 5pp</span>
      </div>
      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={sortedByDivergence}
            margin={{ top: 8, right: 30, left: 120, bottom: 8 }}
          >
            <XAxis type="number" domain={[0, 100]} tick={{ fill: "#64748B" }} tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="name" width={115} tick={{ fontSize: 10, fill: "#64748B" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#111B33", border: "1px solid #2A3A5C", borderRadius: 8, color: "#F1F5F9" }}
              formatter={(value: number, name: string) => [
                `${value.toFixed(1)}%`,
                name === "gm_pct_by_volume" ? "GM% (Volume)" : "GM% (Count)",
              ]}
              labelFormatter={(label) => label}
            />
            <Legend wrapperStyle={{ color: "#94A3B8" }} />
            <Bar dataKey="gm_pct_by_volume" name="GM% (Volume)" fill={colors.accent} barSize={14} radius={[0, 2, 2, 0]} />
            <Bar dataKey="gm_pct_by_count" name="GM% (Count)" fill={colors.purple} barSize={14} radius={[0, 2, 2, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
