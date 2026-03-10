"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import pipelinesData from "@/data/pipelines.json";
import { useDashboardStore } from "@/lib/store";
import { colors } from "@/lib/colors";

const BUCKETS = [
  { range: "$0.02-0.04", min: 0.02, max: 0.04 },
  { range: "$0.04-0.06", min: 0.04, max: 0.06 },
  { range: "$0.06-0.10", min: 0.06, max: 0.1 },
  { range: "$0.10-0.15", min: 0.1, max: 0.15 },
];

export function CostDistribution() {
  const { dataPlaneFilter } = useDashboardStore();
  let pipelines = pipelinesData.pipelines;
  if (dataPlaneFilter !== "all") {
    pipelines = pipelines.filter((p) => p.data_plane === dataPlaneFilter);
  }

  const bucketedData = BUCKETS.map((b) => ({
    range: b.range,
    count: pipelines.filter((p) => p.cost_per_gb >= b.min && p.cost_per_gb < b.max).length,
  }));

  return (
    <div className="mt-4">
      <div className="mb-2 text-[11px] font-bold uppercase text-[#64748B]">Cost/GB distribution</div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bucketedData} layout="vertical" margin={{ top: 4, right: 16, left: 70, bottom: 4 }}>
            <XAxis type="number" tick={{ fill: "#64748B", fontSize: 10 }} />
            <YAxis type="category" dataKey="range" width={65} tick={{ fontSize: 10, fill: "#64748B" }} />
            <Bar dataKey="count" name="Pipelines" barSize={16} radius={[0, 2, 2, 0]} label={{ position: "right", fill: "#94A3B8", fontSize: 10, formatter: (v: number) => (v > 0 ? `${v} pipelines` : "") }}>
              {bucketedData.map((_, i) => (
                <Cell key={i} fill={i === bucketedData.length - 1 ? colors.marginRed : colors.accent} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
