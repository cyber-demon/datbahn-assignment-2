"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts";
import dataPlanesData from "@/data/data_planes.json";
import { useDashboardStore } from "@/lib/store";
import { getMarginColor } from "@/lib/colors";

export function MarginTrendChart() {
  const { dataPlaneFilter, showPayroll } = useDashboardStore();
  let planes = [...dataPlanesData.planes];
  if (dataPlaneFilter !== "all") {
    planes = planes.filter((p) => p.id === dataPlaneFilter);
  }

  const months = planes[0]?.monthly.map((m) => m.month) ?? [];
  const chartData = months.map((month, i) => {
    const point: Record<string, string | number> = { month };
    planes.forEach((p) => {
      const m = p.monthly[i];
      point[`${p.id}_gm`] = m?.gm_pct ?? 0;
      point[`${p.id}_payroll`] = m?.gm_payroll_pct ?? 0;
    });
    return point;
  });

  if (planes.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-lg border border-[#1E2D4D] bg-[#0B1224] text-[#94A3B8]">
        No data planes match the selected filter.
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fill: "#64748B", fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
          <ReferenceLine y={75} stroke="#64748B" strokeDasharray="3 3" />
          <Tooltip
            contentStyle={{ backgroundColor: "#111B33", border: "1px solid #2A3A5C", borderRadius: 8, color: "#F1F5F9" }}
            labelStyle={{ color: "#94A3B8" }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, ""]}
            labelFormatter={(label) => `Month: ${label}`}
          />
          {showPayroll &&
            planes.map((p) => (
              <Area
                key={`${p.id}-area`}
                type="monotone"
                dataKey={`${p.id}_payroll`}
                stroke="none"
                fill={p.color}
                fillOpacity={0.15}
                isAnimationActive={false}
              />
            ))}
          {planes.map((p) => (
            <Line
              key={p.id}
              type="monotone"
              dataKey={`${p.id}_gm`}
              name={p.name}
              stroke={p.color}
              strokeWidth={2}
              dot={{ r: 3, fill: p.color }}
              isAnimationActive={true}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
