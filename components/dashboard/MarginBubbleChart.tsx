"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import dataPlanesData from "@/data/data_planes.json";
import { useDashboardStore } from "@/lib/store";
import { getMarginColor } from "@/lib/colors";

export function MarginBubbleChart() {
  const { dataPlaneFilter } = useDashboardStore();
  let planes = [...dataPlanesData.planes];
  if (dataPlaneFilter !== "all") {
    planes = planes.filter((p) => p.id === dataPlaneFilter);
  }

  const latestByPlane = planes.map((p) => {
    const m = p.monthly[p.monthly.length - 1];
    const volumeTb = (m as { volume_tb?: number })?.volume_tb ?? 0;
    return {
      name: p.name,
      id: p.id,
      color: p.color,
      revenue: m?.revenue ?? 0,
      gm_pct: m?.gm_pct ?? 0,
      gm_payroll_pct: m?.gm_payroll_pct ?? 0,
      volume_tb: volumeTb,
      budget_used_k: p.budget_used_k,
      budget_k: p.budget_k,
    };
  });

  const avgRevenue = latestByPlane.length
    ? latestByPlane.reduce((s, p) => s + p.revenue, 0) / latestByPlane.length
    : 0;

  if (latestByPlane.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-lg border border-[#1E2D4D] bg-[#0B1224] text-[#94A3B8]">
        No data planes match the selected filter.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-4 text-[10px]">
        <span className="text-[#22C55E]">Top-right: High Revenue, High Margin — IDEAL</span>
        <span className="text-[#EF4444]">Bottom-right: High Revenue, Low Margin — URGENT</span>
        <span className="text-[#94A3B8]">Top-left: Low Revenue, High Margin — NICHE</span>
        <span className="text-[#EAB308]">Bottom-left: Low Revenue, Low Margin — REVIEW</span>
      </div>
      <div className="relative h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <XAxis
              type="number"
              dataKey="revenue"
              name="Revenue ($K)"
              tick={{ fill: "#64748B" }}
              tickFormatter={(v) => `$${v}K`}
            />
            <YAxis
              type="number"
              dataKey="gm_pct"
              name="GM%"
              domain={[0, 100]}
              tick={{ fill: "#64748B" }}
              tickFormatter={(v) => `${v}%`}
            />
            <ZAxis type="number" dataKey="volume_tb" range={[100, 800]} />
            <ReferenceLine y={75} stroke="#64748B" strokeDasharray="3 3" />
            <ReferenceLine x={avgRevenue} stroke="#64748B" strokeDasharray="3 3" />
            <Tooltip
              cursor={{ stroke: "#1E2D4D", strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const p = payload[0].payload;
                return (
                  <div className="rounded-lg border border-[#2A3A5C] bg-[#111B33] p-3 shadow-lg text-[#F1F5F9]">
                    <div className="font-semibold text-[#F1F5F9]">{p.name}</div>
                    <div className="mt-2 space-y-1 text-xs text-[#F1F5F9]">
                      <div>Revenue: ${p.revenue}K</div>
                      <div style={{ color: getMarginColor(p.gm_pct) }}>GM%: {p.gm_pct.toFixed(1)}%</div>
                      <div>Payroll-loaded GM: {p.gm_payroll_pct.toFixed(1)}%</div>
                      <div>Volume: {p.volume_tb.toFixed(1)} TB</div>
                      <div>Budget: {((p.budget_used_k / p.budget_k) * 100).toFixed(0)}% used</div>
                    </div>
                  </div>
                );
              }}
            />
            <Scatter data={latestByPlane} fillOpacity={0.85}>
              {latestByPlane.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
