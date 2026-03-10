"use client";

import dataPlanesData from "@/data/data_planes.json";
import { useDashboardStore } from "@/lib/store";
import { getMarginColor, colors } from "@/lib/colors";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Sparkline } from "@/components/shared/Sparkline";
import { MarginBubbleChart } from "./MarginBubbleChart";
import { MarginTrendChart } from "./MarginTrendChart";
import { cn } from "@/lib/utils";

const PAYROLL_ROWS = [
  { role: "DevOps Engineers", fte: 4, cost: 34, method: "Volume-weighted" },
  { role: "SRE", fte: 2, cost: 22, method: "Even-split" },
  { role: "Support Engineers", fte: 3, cost: 30, method: "Ticket-based" },
];

const PAYROLL_CONCENTRATION_PCT: Record<string, number> = {
  security: 32,
  observability: 24,
  application: 18,
  iot_ot: 26,
};

export function MarginByPlane() {
  const {
    marginPlaneView,
    setMarginPlaneView,
    showPayroll,
    togglePayroll,
    openSlideOver,
    dataPlaneFilter,
  } = useDashboardStore();

  let planes = [...dataPlanesData.planes];
  if (dataPlaneFilter !== "all") {
    planes = planes.filter((p) => p.id === dataPlaneFilter);
  }
  planes.sort(
    (a, b) =>
      (b.monthly[b.monthly.length - 1]?.gm_pct ?? 0) -
      (a.monthly[a.monthly.length - 1]?.gm_pct ?? 0)
  );

  if (planes.length === 0) {
    return (
      <Card padding="large">
        <SectionHeader>Gross Margin by Data Plane</SectionHeader>
        <p className="text-sm text-[#94A3B8]">No data planes match the selected filter.</p>
      </Card>
    );
  }

  return (
    <Card padding="large">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <SectionHeader>Gross Margin by Data Plane</SectionHeader>
        <div className="flex items-center gap-4">
          <div className="flex rounded-lg border border-[#1E2D4D] p-0.5">
            {(["ranked_bars", "bubble_map", "trend_lines"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMarginPlaneView(tab)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium",
                  marginPlaneView === tab ? "bg-[#00D4FF] text-[#050A18]" : "text-[#94A3B8]"
                )}
              >
                {tab === "ranked_bars" ? "Ranked Bars" : tab === "bubble_map" ? "Bubble Map" : "Trend Lines"}
              </button>
            ))}
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-xs text-[#94A3B8]">
            <input
              type="checkbox"
              checked={showPayroll}
              onChange={togglePayroll}
              className="h-4 w-4 rounded border-[#1E2D4D] bg-[#1A2542]"
            />
            Include Payroll
          </label>
        </div>
      </div>

      {marginPlaneView === "ranked_bars" && (
        <div className="space-y-6">
          <div className="relative">
            {planes.map((plane) => {
              const latest = plane.monthly[plane.monthly.length - 1];
              const gmPct = latest?.gm_pct ?? 0;
              const gmPayrollPct = latest?.gm_payroll_pct ?? 0;
              const displayPct = showPayroll ? gmPayrollPct : gmPct;
              const erosion = gmPct - gmPayrollPct;
              const budgetPct = (plane.budget_used_k / plane.budget_k) * 100;
              const revenue = latest?.revenue ?? 0;

              return (
                <div
                  key={plane.id}
                  className="mb-6 flex flex-wrap items-center gap-4"
                  role="button"
                  tabIndex={0}
                  onClick={() => openSlideOver("data_plane", plane.id)}
                  onKeyDown={(e) => e.key === "Enter" && openSlideOver("data_plane", plane.id)}
                  aria-label={`View ${plane.name} details`}
                >
                  <div className="w-36 flex-shrink-0 flex items-center gap-2">
                    <div
                      className="h-3 w-3 flex-shrink-0 rounded"
                      style={{ backgroundColor: plane.color }}
                    />
                    <span className="text-sm font-semibold text-[#F1F5F9]">{plane.name}</span>
                  </div>
                  <div className="relative min-w-0 flex-1" style={{ maxWidth: 400 }}>
                    <div className="relative h-7 overflow-hidden rounded-md">
                      {showPayroll && (
                        <div
                          className="absolute inset-y-0 left-0 rounded-md"
                          style={{
                            width: `${Math.min(gmPayrollPct, 100)}%`,
                            background: `${plane.color}25`,
                          }}
                        />
                      )}
                      <div
                        className="relative h-7 rounded-md transition-all duration-300"
                        style={{
                          width: `${Math.min(displayPct, 100)}%`,
                          background: `linear-gradient(90deg, ${plane.color}, ${plane.color}CC)`,
                        }}
                      />
                      <div
                        className="absolute top-0 bottom-0 w-0.5 border-l-2 border-dashed border-[#64748B60]"
                        style={{ left: "75%" }}
                      />
                    </div>
                    <div className="mt-1 text-[10px] text-[#64748B]">
                      6mo trend: ╱╱╱
                      <span className="ml-2">┊75% SaaS benchmark</span>
                      {showPayroll && (
                        <span className="ml-2" style={{ color: colors.marginRed }}>
                          Erosion: {erosion.toFixed(1)}pp
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-48 flex-shrink-0 text-right">
                    <div
                      className="font-mono font-bold"
                      style={{ color: getMarginColor(gmPct) }}
                    >
                      {gmPct.toFixed(1)}%
                    </div>
                    <div className="text-xs text-[#64748B]">${revenue}K rev</div>
                    {showPayroll && (
                      <div className="text-xs" style={{ color: colors.marginRed }}>
                        Erosion: {erosion.toFixed(1)}pp
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <Sparkline
                      data={plane.monthly.map((m) => m.gm_pct)}
                      color={plane.color}
                      width={60}
                      height={20}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {marginPlaneView === "bubble_map" && <MarginBubbleChart />}
      {marginPlaneView === "trend_lines" && <MarginTrendChart />}

      <div className="mt-6 border-t border-[#1E2D4D] pt-6">
        <SectionHeader>Payroll Allocation Detail</SectionHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E2D4D]">
                <th className="pb-2 text-left text-[11px] font-bold uppercase text-[#64748B]">Role</th>
                <th className="pb-2 text-right text-[11px] font-bold uppercase text-[#64748B]">FTE</th>
                <th className="pb-2 text-right text-[11px] font-bold uppercase text-[#64748B]">Monthly Cost</th>
                <th className="pb-2 text-left text-[11px] font-bold uppercase text-[#64748B]">Allocation Method</th>
              </tr>
            </thead>
            <tbody>
              {PAYROLL_ROWS.map((r) => (
                <tr key={r.role} className="border-b border-[#1E2D4D] last:border-0">
                  <td className="py-2 text-[#F1F5F9]">{r.role}</td>
                  <td className="py-2 text-right font-mono text-[#F1F5F9]">{r.fte} FTE</td>
                  <td className="py-2 text-right font-mono text-[#F1F5F9]">${r.cost}K/mo</td>
                  <td className="py-2 text-[#94A3B8]">{r.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <div className="mb-2 text-[11px] font-bold uppercase text-[#64748B]">Payroll concentration by data plane</div>
          <div className="flex h-6 overflow-hidden rounded-md">
            {(["security", "observability", "application", "iot_ot"] as const).map((id) => {
              const pct = PAYROLL_CONCENTRATION_PCT[id] ?? 0;
              const plane = dataPlanesData.planes.find((p) => p.id === id);
              const revShare = plane?.revenue_share_pct ?? 0;
              const overIndexed = pct > revShare + 5;
              return (
                <div
                  key={id}
                  style={{
                    width: `${pct}%`,
                    backgroundColor: plane?.color ?? "#64748B",
                  }}
                  title={`${plane?.name ?? id}: ${pct}% of payroll${overIndexed ? " — ⚠️ over-indexed vs revenue share" : ""}`}
                />
              );
            })}
          </div>
          <p className="mt-1 text-[10px] text-[#64748B]">
            Data Plane Delta: 26% of payroll but only 18% of revenue ← ⚠️ over-indexed on support
          </p>
        </div>
      </div>
    </Card>
  );
}
