"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
  ReferenceLine,
} from "recharts";
import waterfallData from "@/data/waterfall.json";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Card } from "@/components/ui/Card";

const STEP_COLORS: Record<string, string> = {
  positive: "#22C55E",
  negative: "#EF4444",
  subtotal: "#22C55E",
  allocation: "#F59E0B",
  total: "#00D4FF",
};

export function MarginWaterfall() {
  const { steps, summary } = waterfallData;

  // Waterfall: bridge (transparent base) + segment (visible)
  const chartData = steps.map((s) => ({
    name: s.name,
    bridge: s.base,
    segment: Math.abs(s.value),
    type: s.type,
  }));

  return (
    <Card padding="large">
      <SectionHeader>Margin Waterfall</SectionHeader>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 20, left: 90, bottom: 10 }}
          >
            <XAxis type="number" tick={{ fill: "#64748B" }} tickFormatter={(v) => `$${v}K`} domain={[0, 1300]} />
            <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10, fill: "#64748B" }} />
            <Tooltip
              formatter={(v: number, name: string) => (name === "segment" ? [`$${v}K`, ""] : ["", ""])}
              contentStyle={{ fontSize: 12, backgroundColor: "#111B33", border: "1px solid #2A3A5C", color: "#F1F5F9" }}
            />
            <ReferenceLine x={0} stroke="#1E2D4D" />
            <Bar dataKey="bridge" stackId="wf" fill="transparent" barSize={20} />
            <Bar dataKey="segment" stackId="wf" barSize={20} radius={[0, 2, 2, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={STEP_COLORS[entry.type] || "#64748B"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-8 border-t border-[#1E2D4D] pt-6">
        <div className="text-center">
          <div className="text-xs text-[#64748B]">Gross Profit</div>
          <div className="font-mono text-[22px] font-bold text-[#22C55E]">
            ${summary.gross_profit_k}K ({summary.gross_profit_pct}%)
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="h-12 w-px bg-[#1E2D4D]" />
          <div className="mt-1 text-xs font-bold text-[#F59E0B]">
            Payroll costs {(summary.gross_profit_pct - summary.net_margin_pct).toFixed(1)}pp of margin
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-[#64748B]">Net Margin</div>
          <div className="font-mono text-[22px] font-bold text-[#00D4FF]">
            ${summary.net_margin_k}K ({summary.net_margin_pct}%)
          </div>
        </div>
      </div>
    </Card>
  );
}
