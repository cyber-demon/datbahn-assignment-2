"use client";

import kpisData from "@/data/kpis.json";
import { Sparkline } from "@/components/shared/Sparkline";
import { formatDelta } from "@/lib/utils";
import { colors } from "@/lib/colors";
import { Card } from "@/components/ui/Card";

const KPI_CONFIG = [
  {
    label: "Gross Margin",
    valueKey: "gross_margin_pct" as const,
    format: (v: number) => `${v.toFixed(1)}%`,
    goodDirection: "up" as const,
    sparklineKey: "gross_margin" as const,
    color: colors.marginGreen,
    deltaType: "pp" as const,
    scalingNarrative: false,
  },
  {
    label: "Cost per GB Processed",
    valueKey: "cost_per_gb_normalized" as const,
    format: (v: number) => `$${v.toFixed(4)}`,
    goodDirection: "down" as const,
    sparklineKey: "cost_per_gb" as const,
    color: colors.accent,
    deltaType: "percent" as const,
    scalingNarrative: true,
  },
  {
    label: "Volume Processed",
    valueKey: "total_volume_tb" as const,
    format: (v: number) => `${v.toFixed(1)} TB`,
    goodDirection: "up" as const,
    sparklineKey: "volume_tb" as const,
    color: colors.planeSecurity,
    deltaType: "percent" as const,
    scalingNarrative: false,
  },
  {
    label: "Monthly Revenue",
    valueKey: "monthly_revenue" as const,
    format: (v: number) =>
      v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(2)}M` : `$${(v / 1000).toFixed(0)}K`,
    goodDirection: "up" as const,
    sparklineKey: "revenue" as const,
    color: colors.marginGreen,
    deltaType: "percent" as const,
    scalingNarrative: false,
  },
];

export function KPICards() {
  const { current_period, prior_period, sparkline_6mo, scaling_narrative } = kpisData;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {KPI_CONFIG.map((config) => {
        const current = current_period[config.valueKey];
        const prior = prior_period[config.valueKey];
        const delta = formatDelta(current, prior, config.deltaType);
        const isGood =
          config.goodDirection === "up"
            ? delta.isPositive
            : !delta.isPositive;
        const narrative = config.scalingNarrative ? scaling_narrative : null;
        const costUp = narrative && "cost_change_pct" in narrative ? narrative.cost_change_pct : 0;
        const volUp = narrative && "volume_change_pct" in narrative ? narrative.volume_change_pct : 0;
        const unitDown = narrative && "unit_cost_change_pct" in narrative ? narrative.unit_cost_change_pct : 0;
        const isHealthy = unitDown < 0 && volUp > Math.abs((costUp - volUp));

        return (
          <Card key={config.label}>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              {config.label}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono text-[28px] font-bold text-[#F1F5F9]">
                {config.format(current)}
              </span>
              <div style={{ filter: `drop-shadow(0 0 3px ${config.color}40)` }}>
                <Sparkline
                  data={sparkline_6mo[config.sparklineKey]}
                  color={config.color}
                />
              </div>
            </div>
            <div
              className={`mt-1 text-xs font-medium ${
                isGood ? "text-[#22C55E]" : "text-[#EF4444]"
              }`}
            >
              {delta.formatted} vs prior
            </div>
            {config.scalingNarrative && narrative && (
              <>
                <div className="mt-1 text-[10px]">
                  <span style={{ color: colors.marginRed }}>Costs ▲{costUp}%</span>
                  <span className="mx-1 text-[#64748B]">·</span>
                  <span style={{ color: colors.marginGreen }}>Volume ▲{volUp}%</span>
                </div>
                <div
                  className="text-[10px]"
                  style={{ color: isHealthy ? colors.marginGreen : colors.marginRed }}
                >
                  → Unit cost {unitDown < 0 ? "falling" : "rising"}: {isHealthy ? "healthy scaling" : "efficiency declining"}
                </div>
              </>
            )}
            {!config.scalingNarrative && (
              <div className="mt-0.5 text-[11px] text-[#64748B]">vs prior period</div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
