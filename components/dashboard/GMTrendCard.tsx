"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from "recharts";
import kpisData from "@/data/kpis.json";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Card } from "@/components/ui/Card";
import { colors } from "@/lib/colors";

const MONTHS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

export function GMTrendCard() {
  const data = kpisData.sparkline_6mo.gross_margin.map((value, i) => ({
    month: MONTHS[i],
    gm: value,
  }));

  return (
    <Card padding="large">
      <SectionHeader>GM Trend (6 months)</SectionHeader>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748B" }} />
            <YAxis
              domain={[50, 85]}
              tick={{ fontSize: 10, fill: "#64748B" }}
              tickFormatter={(v) => `${v}%`}
            />
            <ReferenceLine y={75} stroke="#64748B" strokeDasharray="4 4" strokeOpacity={0.6} />
            <Tooltip
              contentStyle={{ backgroundColor: "#111B33", border: "1px solid #2A3A5C", borderRadius: 8, color: "#F1F5F9" }}
              labelStyle={{ color: "#94A3B8" }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, "GM"]}
              labelFormatter={(label) => label}
            />
            <Line
              type="monotone"
              dataKey="gm"
              stroke={colors.accent}
              strokeWidth={2}
              dot={{ fill: colors.accent, r: 3 }}
              name="Gross Margin %"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-[11px] text-[#64748B]">Dashed line: 75% SaaS benchmark</p>
    </Card>
  );
}
