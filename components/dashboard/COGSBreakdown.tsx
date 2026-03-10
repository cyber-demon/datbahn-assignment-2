"use client";

import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  Cell,
} from "recharts";
import cogsData from "@/data/cogs.json";
import { useDashboardStore } from "@/lib/store";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Card } from "@/components/ui/Card";
import { colors } from "@/lib/colors";
import { CustomTooltip } from "@/components/shared/CustomTooltip";

const CATEGORIES = [
  { key: "cloud", name: "Cloud Infra", color: colors.cogsCloud },
  { key: "licenses", name: "Licenses", color: colors.cogsLicenses },
  { key: "support", name: "Support", color: colors.cogsSupport },
  { key: "devops", name: "DevOps", color: colors.cogsDevops },
] as const;

const ALLOC_LABELS: Record<string, string> = {
  volume_weighted: "Volume-Weighted",
  even_split: "Even Split",
  usage_based: "Usage-Based",
};

const PLANE_COLORS: Record<string, string> = {
  security: colors.planeSecurity,
  observability: colors.planeObservability,
  application: colors.planeApplication,
  iot_ot: colors.planeIoTOT,
};

const PLANE_NAMES: Record<string, string> = {
  security: "Security",
  observability: "Observability",
  application: "Application",
  iot_ot: "IoT/OT",
};

export function COGSBreakdown() {
  const { allocMethod, setAllocMethod, dataPlaneFilter } = useDashboardStore();
  const { monthly, shared_costs } = cogsData;
  const fullAllocations = shared_costs.methods[allocMethod as keyof typeof shared_costs.methods];
  const allocations: Record<string, number> =
    dataPlaneFilter !== "all"
      ? { [dataPlaneFilter]: fullAllocations[dataPlaneFilter as keyof typeof fullAllocations] ?? 0 }
      : fullAllocations;
  const maxAlloc = Math.max(...Object.values(allocations), 1);

  return (
    <Card padding="large">
      <SectionHeader>COGS BY CATEGORY</SectionHeader>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={monthly} margin={{ top: 5, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4D" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748B" }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#64748B" }} tickFormatter={(v) => `$${v}K`} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#64748B" }} tickFormatter={(v) => `${v}%`} domain={[0, 40]} />
            <Tooltip
              content={<CustomTooltip />}
              formatter={(value: number) => [`$${value}K`, ""]}
            />
            {CATEGORIES.map((cat, i) => (
              <Bar
                key={cat.key}
                yAxisId="left"
                dataKey={cat.key}
                stackId="a"
                fill={cat.color}
                radius={i === CATEGORIES.length - 1 ? [4, 4, 0, 0] : 0}
              />
            ))}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cogs_pct"
              stroke="#EF4444"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ fill: "#EF4444", r: 3 }}
              name="COGS % of Revenue"
            />
            {monthly.map((m, i) =>
              (m as { anomaly?: boolean }).anomaly ? (
                <Cell key={`anomaly-${i}`} />
              ) : null
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-4 text-xs">
        {CATEGORIES.map((c) => (
          <div key={c.key} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded" style={{ backgroundColor: c.color }} />
            <span className="text-[#94A3B8]">{c.name}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 border-t-2 border-dashed border-[#EF4444]" />
          <span className="text-[#94A3B8]">COGS % of Revenue</span>
        </div>
      </div>

      <div className="mt-6 border-t border-[#1E2D4D] pt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <SectionHeader>Shared Cost Allocation — ${shared_costs.total_k}K</SectionHeader>
          <div className="flex rounded-lg border border-[#1E2D4D] p-0.5">
            {(["volume_weighted", "even_split", "usage_based"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setAllocMethod(m)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  allocMethod === m
                    ? "bg-[#00D4FF] text-[#050A18]"
                    : "text-[#94A3B8] hover:text-[#F1F5F9]"
                }`}
              >
                {ALLOC_LABELS[m]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            {Object.entries(allocations).map(([plane, value]) => (
              <div key={plane} className="flex items-center gap-2">
                <span className="w-24 text-xs text-[#94A3B8]">{PLANE_NAMES[plane]}</span>
                <div className="relative h-7 flex-1 overflow-hidden rounded-md bg-[#1A2542]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-md transition-all duration-400 ease-out"
                    style={{
                      width: `${(value / maxAlloc) * 100}%`,
                      backgroundColor: PLANE_COLORS[plane] || colors.accent,
                    }}
                  />
                  <span className="absolute inset-0 flex items-center pl-2 text-[10px] font-bold text-white drop-shadow">
                    ${value}K
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex-shrink-0 rounded-lg border border-[#EF444430] bg-[#EF444415] px-3 py-2 text-center">
            <span className="text-xs font-bold text-[#EF4444]">
              {shared_costs.unallocated_pct}% UNALLOCATED
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
