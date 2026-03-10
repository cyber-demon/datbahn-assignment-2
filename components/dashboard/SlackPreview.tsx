"use client";

import kpisData from "@/data/kpis.json";
import dataPlanesData from "@/data/data_planes.json";
import pipelinesData from "@/data/pipelines.json";
import { useDashboardStore } from "@/lib/store";
import { formatDelta } from "@/lib/utils";
import { getMarginColor } from "@/lib/colors";

interface SlackPreviewData {
  kpis: typeof kpisData;
  planes: Array<{
    id: string;
    name: string;
    color: string;
    monthly: Array<{ gm_pct?: number; gm_payroll_pct?: number; revenue?: number }>;
    budget_used_k: number;
    budget_k: number;
  }>;
  anomalies: typeof pipelinesData.anomalies_summary;
  topMovers: Array<{ name: string; cost_per_gb: number; gm_pct_by_volume: number; gm_pct_by_count: number; divergence_pp?: number }>;
}

export function SlackPreview({ data }: { data: SlackPreviewData }) {
  const { dataPlaneFilter } = useDashboardStore();
  const { current_period, prior_period, scaling_narrative } = data.kpis;
  const gmDelta = formatDelta(current_period.gross_margin_pct, prior_period.gross_margin_pct, "pp");
  const costDelta = formatDelta(current_period.cost_per_gb_normalized, prior_period.cost_per_gb_normalized, "percent");
  const volDelta = formatDelta(current_period.total_volume_tb, prior_period.total_volume_tb, "percent");
  const revDelta = formatDelta(current_period.monthly_revenue, prior_period.monthly_revenue, "percent");

  let planes = data.planes;
  if (dataPlaneFilter !== "all") {
    planes = planes.filter((p) => p.id === dataPlaneFilter);
  }
  const latestByPlane = planes.map((p) => {
    const latest = p.monthly[p.monthly.length - 1];
    return {
      ...p,
      gmVol: latest?.gm_pct ?? 0,
      gmCnt: latest?.gm_payroll_pct ?? latest?.gm_pct ?? 0,
      revenue: latest?.revenue ?? 0,
      budgetPct: (p.budget_used_k / p.budget_k) * 100,
    };
  });

  const alphaPlane = data.planes.find((p) => p.id === "security");
  const budgetPct = alphaPlane ? ((alphaPlane.budget_used_k / alphaPlane.budget_k) * 100).toFixed(1) : "0";

  return (
    <div className="rounded-lg bg-[#0B1224] p-6">
      <div
        className="rounded border border-[#1E2D4D] bg-[#111B33] p-4 shadow-sm"
        style={{ borderLeftWidth: "4px", borderLeftColor: "#00D4FF" }}
      >
        <div className="border-b border-[#2A3A5C] pb-2 text-[11px] font-bold uppercase text-[#64748B]">
          ━━━ HEADLINE ━━━
        </div>
        <div className="mt-3 space-y-2 text-sm text-[#F1F5F9]">
          <div className="flex items-center gap-2">
            <span>Gross Margin</span>
            <span className="font-mono font-bold" style={{ color: getMarginColor(current_period.gross_margin_pct) }}>
              {current_period.gross_margin_pct.toFixed(1)}%
            </span>
            <span className="text-[#22C55E]">{gmDelta.formatted}</span>
            <div className="ml-2 h-2 w-20 overflow-hidden rounded bg-[#1A2542]">
              <div
                className="h-full rounded bg-[#22C55E]"
                style={{ width: `${Math.min(current_period.gross_margin_pct, 100)}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span>Cost/GB</span>
            <span className="font-mono font-bold">${current_period.cost_per_gb_normalized.toFixed(3)}</span>
            <span className="text-[#22C55E]">{costDelta.formatted}</span>
            <div className="ml-2 h-2 w-20 overflow-hidden rounded bg-[#1A2542]">
              <div className="h-full w-4/5 rounded bg-[#00D4FF]" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span>Volume</span>
            <span className="font-mono font-bold">{current_period.total_volume_tb.toFixed(1)} TB</span>
            <span className="text-[#22C55E]">{volDelta.formatted}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Revenue</span>
            <span className="font-mono font-bold">
              ${(current_period.monthly_revenue / 1e6).toFixed(2)}M
            </span>
            <span className="text-[#22C55E]">{revDelta.formatted}</span>
          </div>
        </div>
        {scaling_narrative && (
          <p className="mt-2 text-[11px] text-[#94A3B8]">
            Costs ▲{scaling_narrative.cost_change_pct}% · Volume ▲{scaling_narrative.volume_change_pct}% · Unit cost {scaling_narrative.unit_cost_change_pct < 0 ? "▼" : "▲"}
            {Math.abs(scaling_narrative.unit_cost_change_pct)}% → {scaling_narrative.assessment === "healthy" ? "Scaling efficiently ✓" : "Efficiency declining"}
          </p>
        )}
        <div className="mt-4 border-b border-[#2A3A5C] pb-2 text-[11px] font-bold uppercase text-[#64748B]">
          ━━━ DATA PLANES ━━━
        </div>
        <div className="mt-2 space-y-2 text-sm">
          {latestByPlane.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-2 text-[#F1F5F9]">
              <span className="font-medium">{p.name}</span>
              <span className="font-mono">
                {p.gmVol.toFixed(1)}% (vol) / {p.gmCnt.toFixed(1)}% (cnt)
              </span>
              <span className="font-mono text-[#94A3B8]">${p.revenue}K</span>
              <span className="text-[#64748B]">{p.budgetPct.toFixed(0)}% budget</span>
            </div>
          ))}
        </div>
        {data.anomalies.count_30d > 0 && (
          <>
            <div className="mt-4 border-b border-[#2A3A5C] pb-2 text-[11px] font-bold uppercase text-[#EF4444]">
              ━━━ ATTENTION ━━━
            </div>
            <div className="mt-2 rounded border border-[#EF444430] bg-[#EF444410] p-3 text-sm">
              <span className="font-semibold text-[#F1F5F9]">
                🔴 {data.anomalies.count_30d} anomalies detected (${(data.anomalies.total_impact_k * 1000).toLocaleString()} impact)
              </span>
              {data.anomalies.active.map((a) => (
                <div key={a.pipeline_id} className="mt-1 text-xs text-[#94A3B8]">
                  • {a.message}
                </div>
              ))}
            </div>
          </>
        )}
        <p className="mt-2 text-[11px] text-[#F59E0B]">
          ⚠️ Budget watch: Alpha at {budgetPct}% of monthly COGS budget
        </p>
        {data.topMovers.length > 0 && (
          <>
            <div className="mt-4 border-b border-[#2A3A5C] pb-2 text-[11px] font-bold uppercase text-[#64748B]">
              ━━━ TOP 3 PIPELINE MOVERS ━━━
            </div>
            <div className="mt-2 space-y-1 text-xs text-[#F1F5F9]">
              {data.topMovers.slice(0, 3).map((m, i) => (
                <div key={i}>
                  {m.divergence_pp && m.divergence_pp > 0 ? "▲" : "▼"} {m.name} — GM {m.gm_pct_by_volume.toFixed(1)}% (vol) / {m.gm_pct_by_count.toFixed(1)}% (cnt)
                </div>
              ))}
            </div>
          </>
        )}
        <div className="mt-4 border-t border-[#2A3A5C] pt-2 text-xs text-[#00D4FF] underline">
          View full dashboard →
        </div>
      </div>
    </div>
  );
}
