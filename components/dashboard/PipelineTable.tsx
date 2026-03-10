"use client";

import React, { useState } from "react";
import pipelinesData from "@/data/pipelines.json";
import { getFilteredPipelines } from "@/lib/filters";
import { useDashboardStore } from "@/lib/store";
import { MetricBadge } from "@/components/shared/MetricBadge";
import { formatVolumeGB, formatCostPerGB, formatCurrencyCompact } from "@/lib/utils";

type TableFilter = "bottom10" | "top10" | "all";

export function PipelineTable() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tableFilter, setTableFilter] = useState<TableFilter>("all");
  const state = useDashboardStore();
  const { tableSortCol, tableSortDir, setTableSort, openSlideOver, gmMode } = state;

  let pipelinesAll = [...pipelinesData.pipelines] as any[];
  let pipelines = getFilteredPipelines(pipelinesAll as any, state as any);
  

  const gmCol = gmMode === "volume" ? "gm_pct_by_volume" : "gm_pct_by_count";

  if (tableFilter === "bottom10") {
    pipelines = pipelines.sort((a, b) => a[gmCol] - b[gmCol]).slice(0, 10);
  } else if (tableFilter === "top10") {
    pipelines = pipelines.sort((a, b) => b[gmCol] - a[gmCol]).slice(0, 10);
  } else {
    pipelines.sort((a, b) => {
      const aVal = (a as any)[tableSortCol];
      const bVal = (b as any)[tableSortCol];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return tableSortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return String(aVal).localeCompare(String(bVal)) * (tableSortDir === "asc" ? 1 : -1);
    });
  }

  const sortArrow = tableSortDir === "asc" ? "▲" : "▼";

  const SortHeader = ({ col, label }: { col: string; label: string }) => (
    <button
      type="button"
      onClick={() => setTableSort(col)}
      className="flex items-center gap-0.5 text-left font-bold uppercase text-[#94A3B8] hover:text-[#F1F5F9]"
    >
      {label} {tableSortCol === col && <span className="text-[10px]">{sortArrow}</span>}
    </button>
  );

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {(["bottom10", "top10", "all"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setTableFilter(f)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              tableFilter === f ? "bg-[#00D4FF] text-[#050A18]" : "border border-[#1E2D4D] text-[#94A3B8]"
            }`}
          >
            {f === "bottom10" ? "Bottom 10" : f === "top10" ? "Top 10" : "All"}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1E2D4D]">
              <th className="pb-2 pr-4 text-left">
                <SortHeader col="name" label="Pipeline" />
              </th>
              <th className="pb-2 pr-4 text-left">
                <SortHeader col="source" label="Source" />
              </th>
              <th className="pb-2 pr-4 text-left">
                <SortHeader col="destination" label="Destination" />
              </th>
              <th className="pb-2 pr-4 text-right">
                <SortHeader col="volume_gb" label="Volume (GB)" />
              </th>
              <th className="pb-2 pr-4 text-right">
                <SortHeader col="events_m" label="Events (M)" />
              </th>
              <th className="pb-2 pr-4 text-right">
                <SortHeader col="revenue_k" label="Revenue" />
              </th>
              <th className="pb-2 pr-4 text-right">
                <SortHeader col="gm_pct_by_volume" label="GM% (Vol)" />
              </th>
              <th className="pb-2 pr-4 text-right">
                <SortHeader col="gm_pct_by_count" label="GM% (Cnt)" />
              </th>
              <th className="pb-2 pr-4 text-right text-[11px] font-bold uppercase text-[#94A3B8]">
                Δ
              </th>
              <th className="pb-2 text-right">
                <SortHeader col="cost_per_gb" label="Cost/GB" />
              </th>
            </tr>
          </thead>
          <tbody>
            {pipelines.map((p) => {
              const gmVol = p.gm_pct_by_volume;
              const gmCount = p.gm_pct_by_count;
              const div = (p as { divergence_pp?: number }).divergence_pp ?? 0;
              const rowBg =
                gmVol < 50 ? "#EF444410" : gmVol < 75 ? "#EAB30810" : "transparent";
              const isExpanded = expandedId === p.id;

              return (
                <React.Fragment key={p.id}>
                  <tr
                    onClick={() => setExpandedId(isExpanded ? null : p.id)}
                    onDoubleClick={() => openSlideOver("pipeline", p.id)}
                    className="cursor-pointer border-b border-[#1E2D4D] transition-colors hover:bg-[#111B33]"
                    style={{ backgroundColor: rowBg }}
                  >
                    <td className="py-2 pr-4 font-medium text-[#F1F5F9]">{p.name}</td>
                    <td className="py-2 pr-4 text-[#94A3B8]">{p.source}</td>
                    <td className="py-2 pr-4 text-[#94A3B8]">{p.destination}</td>
                    <td className="py-2 pr-4 text-right font-mono text-[#F1F5F9]">
                      {formatVolumeGB(p.volume_gb)}
                    </td>
                    <td className="py-2 pr-4 text-right font-mono text-[#F1F5F9]">
                      {p.events_m}M
                    </td>
                    <td className="py-2 pr-4 text-right font-mono text-[#F1F5F9]">
                      {formatCurrencyCompact(p.revenue_k * 1000)}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      <MetricBadge gm={gmVol} />
                    </td>
                    <td className="py-2 pr-4 text-right">
                      <MetricBadge gm={gmCount} />
                    </td>
                    <td className="py-2 pr-4 text-right" title={Math.abs(div) > 5 ? `Volume and Count margins differ by ${div.toFixed(1)}pp — economics change depending on measurement method` : undefined}>
                      {Math.abs(div) > 5 ? (
                        <span className="flex items-center justify-end gap-1">
                          <span className="text-yellow-500">⚠️</span>
                          <span className="font-mono text-xs text-yellow-500">
                            {div > 0 ? "+" : ""}{div.toFixed(1)}pp
                          </span>
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-[#64748B]">
                          {div > 0 ? "+" : ""}{div.toFixed(1)}pp
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-right font-mono text-[#F1F5F9]">
                      {formatCostPerGB(p.cost_per_gb)}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${p.id}-exp`} style={{ backgroundColor: rowBg }}>
                      <td colSpan={10} className="border-b border-[#1E2D4D] py-3 pl-4">
                        <div className="flex flex-wrap items-center gap-4 text-xs text-[#94A3B8]">
                          <span>Cloud: ${((p as any).cost_breakdown.cloud * 1000).toLocaleString()}</span>
                          <span>Licenses: ${((p as any).cost_breakdown.licenses * 1000).toLocaleString()}</span>
                          <span>Support: ${((p as any).cost_breakdown.support * 1000).toLocaleString()}</span>
                          <span>Payroll: ${((p as any).cost_breakdown.payroll * 1000).toLocaleString()}</span>
                          {p.complexity_steps != null && (
                            <span>Complexity: {p.complexity_steps} steps</span>
                          )}
                          <button
                            type="button"
                            className="font-medium text-[#00D4FF] hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              openSlideOver("pipeline", p.id);
                            }}
                          >
                            View Full Details →
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
