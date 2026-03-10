"use client";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export function Sparkline({
  data,
  color = "#3B82F6",
  width = 80,
  height = 28,
}: SparklineProps) {
  const chartData = data.map((value, i) => ({ value, index: i }));

  return (
    <div style={{ width, height }} className="flex-shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="index" hide />
          <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
          <Tooltip
            content={<div style={{ display: "none" }} />}
            cursor={false}
            wrapperStyle={{ display: "none" }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
