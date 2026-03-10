"use client";

import kpisData from "@/data/kpis.json";

export function ScalingNarrative() {
  const {
    cost_change_pct,
    volume_change_pct,
    unit_cost_change_pct,
    assessment,
  } = kpisData.scaling_narrative;

  const costDir = cost_change_pct >= 0 ? "▲" : "▼";
  const volDir = volume_change_pct >= 0 ? "▲" : "▼";
  const unitDir = unit_cost_change_pct >= 0 ? "▲" : "▼";

  return (
    <div className="border-b border-[#00D4FF15] bg-[#00D4FF08] px-6 py-2">
      <p className="text-[13px] text-[#F1F5F9]">
        <span className="capitalize">Mar 2026: </span>
        Total costs{" "}
        <span className="font-mono font-medium text-[#EF4444]">
          {costDir} {Math.abs(cost_change_pct).toFixed(1)}%
        </span>{" "}
        · Volume{" "}
        <span className="font-mono font-medium text-[#22C55E]">
          {volDir} {Math.abs(volume_change_pct).toFixed(1)}%
        </span>{" "}
        · Cost/GB{" "}
        <span className="font-mono font-medium text-[#22C55E]">
          {unitDir} {Math.abs(unit_cost_change_pct).toFixed(1)}%
        </span>{" "}
        — {assessment === "healthy" ? "Scaling efficiently" : "Review needed"}
      </p>
    </div>
  );
}
