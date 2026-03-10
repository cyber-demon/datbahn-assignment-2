"use client";

import { useDashboardStore } from "@/lib/store";
import pipelinesData from "@/data/pipelines.json";
import dataPlanesData from "@/data/data_planes.json";
import { MetricBadge } from "@/components/shared/MetricBadge";
import { getMarginColor } from "@/lib/colors";
import { formatVolumeGB, formatCostPerGB, formatCurrencyCompact } from "@/lib/utils";
import { X } from "lucide-react";

export function SlideOverPanel() {
  const { slideOverOpen, slideOverType, slideOverId, closeSlideOver } = useDashboardStore();

  if (!slideOverOpen || !slideOverType || !slideOverId) return null;

  const getPlaneName = (id: string) => dataPlanesData.planes.find((p) => p.id === id)?.name ?? id;
  const getPlaneColor = (id: string) => dataPlanesData.planes.find((p) => p.id === id)?.color ?? "#00D4FF";

  if (slideOverType === "pipeline") {
    const pipeline = pipelinesData.pipelines.find((p) => p.id === slideOverId);
    if (!pipeline) return null;

    const gmVol = pipeline.gm_pct_by_volume;
    const gmCount = pipeline.gm_pct_by_count;
    const deltaVolCount = (gmVol - gmCount).toFixed(1);
    const budgetPct = pipeline.budget_k > 0 ? (pipeline.budget_used_k / pipeline.budget_k) * 100 : 0;

    return (
      <>
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={closeSlideOver}
          aria-hidden
        />
        <div
          className="fixed right-0 top-0 z-40 h-full w-[420px] overflow-y-auto border-l border-[#1E2D4D] bg-[#0B1224] p-6 text-[#F1F5F9] shadow-[-4px_0_20px_rgba(0,0,0,0.4)]"
          role="dialog"
          aria-label="Pipeline details"
        >
          <div className="flex items-start justify-between">
            <h2 className="text-lg font-bold text-[#F1F5F9]">{pipeline.name}</h2>
            <button
              type="button"
              onClick={closeSlideOver}
              className="rounded p-1 text-[#94A3B8] hover:bg-[#111B33]"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            <span
              className="rounded px-2 py-0.5 text-[10px] font-bold"
              style={{
                backgroundColor: `${getPlaneColor(pipeline.data_plane)}20`,
                color: getPlaneColor(pipeline.data_plane),
              }}
            >
              {getPlaneName(pipeline.data_plane)}
            </span>
            <MetricBadge gm={gmVol} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-[11px] text-[#64748B]">Volume</div>
              <div className="font-mono font-medium text-[#F1F5F9]">{formatVolumeGB(pipeline.volume_gb)}</div>
            </div>
            <div>
              <div className="text-[11px] text-[#64748B]">Events</div>
              <div className="font-mono font-medium text-[#F1F5F9]">{pipeline.events_m}M</div>
            </div>
            <div>
              <div className="text-[11px] text-[#64748B]">Revenue</div>
              <div className="font-mono font-medium text-[#F1F5F9]">{formatCurrencyCompact(pipeline.revenue_k * 1000)}</div>
            </div>
            <div>
              <div className="text-[11px] text-[#64748B]">Total Cost</div>
              <div className="font-mono font-medium text-[#F1F5F9]">{formatCurrencyCompact(pipeline.cost_k * 1000)}</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-2 text-[11px] text-[#64748B]">Gross Margin</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="mb-0.5 text-[10px] text-[#94A3B8]">By Volume (GB)</div>
                <div className="relative h-5 overflow-hidden rounded-md bg-[#1A2542]">
                  <div
                    className="h-full rounded-md"
                    style={{ width: `${gmVol}%`, backgroundColor: getMarginColor(gmVol) }}
                  />
                </div>
                <div className="mt-0.5 flex items-center gap-1">
                  <span className="font-mono text-xs text-[#F1F5F9]">{gmVol.toFixed(1)}%</span>
                  <MetricBadge gm={gmVol} />
                </div>
              </div>
              <div>
                <div className="mb-0.5 text-[10px] text-[#94A3B8]">By Count (Events)</div>
                <div className="relative h-5 overflow-hidden rounded-md bg-[#1A2542]">
                  <div
                    className="h-full rounded-md"
                    style={{ width: `${gmCount}%`, backgroundColor: getMarginColor(gmCount) }}
                  />
                </div>
                <div className="mt-0.5 flex items-center gap-1">
                  <span className="font-mono text-xs text-[#F1F5F9]">{gmCount.toFixed(1)}%</span>
                  <MetricBadge gm={gmCount} />
                </div>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-[#94A3B8]">
              Δ Volume vs Count: {Number(deltaVolCount) >= 0 ? "+" : ""}{deltaVolCount}pp
            </p>
          </div>
          <div className="mt-4">
            <div className="mb-2 text-[11px] text-[#64748B]">Cost breakdown</div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(pipeline.cost_breakdown).map(([k, v]) => (
                <span
                  key={k}
                  className="rounded bg-[#1A2542] px-2 py-0.5 font-mono text-xs text-[#F1F5F9]"
                >
                  {k}: ${v}K
                </span>
              ))}
            </div>
          </div>
          {pipeline.anomaly_detail && (
            <div className="mt-4 rounded-lg border border-[#EF444430] bg-[#EF444415] p-3 text-sm text-[#EF4444]">
              ⚠️ {pipeline.anomaly_detail}
            </div>
          )}
          {pipeline.budget_k > 0 && (
            <div className="mt-4">
              <div className="mb-1 text-[11px] text-[#64748B]">Budget</div>
              <div className="h-2 overflow-hidden rounded bg-[#1A2542]">
                <div
                  className="h-full rounded bg-[#00D4FF]"
                  style={{ width: `${Math.min(budgetPct, 100)}%` }}
                />
              </div>
              <p className="mt-0.5 text-xs text-[#94A3B8]">
                ${pipeline.budget_used_k}K of ${pipeline.budget_k}K ({budgetPct.toFixed(0)}%)
              </p>
            </div>
          )}
          <div className="mt-6 flex gap-2">
            <button className="rounded-lg border border-[#1E2D4D] px-3 py-1.5 text-sm text-[#F1F5F9] hover:bg-[#111B33]">
              Create JIRA
            </button>
            <button className="rounded-lg border border-[#1E2D4D] px-3 py-1.5 text-sm text-[#F1F5F9] hover:bg-[#111B33]">
              Export CSV
            </button>
          </div>
        </div>
      </>
    );
  }

  const plane = dataPlanesData.planes.find((p) => p.id === slideOverId);
  if (!plane) return null;

  const latest = plane.monthly[plane.monthly.length - 1];
  const gm = latest?.gm_pct ?? 0;
  const color = getMarginColor(gm);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={closeSlideOver}
        aria-hidden
      />
      <div
        className="fixed right-0 top-0 z-40 h-full w-[420px] overflow-y-auto border-l border-[#1E2D4D] bg-[#0B1224] p-6 text-[#F1F5F9] shadow-[-4px_0_20px_rgba(0,0,0,0.4)]"
        role="dialog"
        aria-label="Data plane details"
      >
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-bold text-[#F1F5F9]">{plane.name}</h2>
          <button
            type="button"
            onClick={closeSlideOver}
            className="rounded p-1 text-[#94A3B8] hover:bg-[#111B33]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-3">
          <MetricBadge gm={gm} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-[11px] text-[#64748B]">Revenue (Mar)</div>
            <div className="font-mono font-medium text-[#F1F5F9]">${latest?.revenue ?? 0}K</div>
          </div>
          <div>
            <div className="text-[11px] text-[#64748B]">COGS (Mar)</div>
            <div className="font-mono font-medium text-[#F1F5F9]">${latest?.cogs ?? 0}K</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1 text-[11px] text-[#64748B]">Gross Margin</div>
          <div className="relative h-6 overflow-hidden rounded-md bg-[#1A2542]">
            <div
              className="h-full rounded-md"
              style={{ width: `${gm}%`, backgroundColor: color }}
            />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-[11px] text-[#64748B]">Budget</div>
          <p className="font-mono text-sm text-[#F1F5F9]">
            ${plane.budget_used_k}K of ${plane.budget_k}K (
            {((plane.budget_used_k / plane.budget_k) * 100).toFixed(1)}%)
          </p>
        </div>
      </div>
    </>
  );
}
