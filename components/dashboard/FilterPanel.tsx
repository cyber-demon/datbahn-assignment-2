"use client";

import pipelinesData from "@/data/pipelines.json";
import { useDashboardStore } from "@/lib/store";
import { getAvailableSources, getAvailableDestinations } from "@/lib/filters";

export function FilterPanel() {
  const state = useDashboardStore();
  const {
    selectedPlanes,
    selectedSources,
    selectedDestinations,
    selectedMarginHealth,
    anomalyOnly,
    gmMode,
    normalization,
    togglePlane,
    toggleSource,
    toggleDestination,
    toggleMarginHealth,
    setAnomalyOnly,
    setGmMode,
    setNormalization,
    resetAllFilters,
  } = state;

  const pipelines = pipelinesData.pipelines as any[];
  const availableSources = getAvailableSources(pipelines as any, selectedPlanes);
  const availableDestinations = getAvailableDestinations(pipelines as any, selectedPlanes);

  if (!state.filterPanelOpen) return null;

  return (
    <div className="border-b border-[#1E2D4D] bg-[#020617] px-6 py-4 text-xs text-[#F1F5F9]">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">
          Filters
        </div>
        <button
          type="button"
          onClick={resetAllFilters}
          className="text-[11px] font-medium text-[#00D4FF] hover:underline"
        >
          Reset all
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {/* Data Plane */}
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase text-[#94A3B8]">
            Data Plane
          </div>
          <div className="space-y-1">
            {[
              { id: "security", label: "Security" },
              { id: "observability", label: "Observability" },
              { id: "application", label: "Application" },
              { id: "iot_ot", label: "IoT/OT" },
            ].map((p) => (
              <label key={p.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-[#1E2D4D] bg-transparent"
                  checked={selectedPlanes.includes(p.id)}
                  onChange={() => togglePlane(p.id)}
                />
                <span>{p.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sources */}
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase text-[#94A3B8]">
            Sources
          </div>
          <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
            {availableSources.map((s) => (
              <label key={s} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-[#1E2D4D] bg-transparent"
                  checked={selectedSources.includes(s)}
                  onChange={() => toggleSource(s)}
                />
                <span>{s}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Destinations */}
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase text-[#94A3B8]">
            Destinations
          </div>
          <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
            {availableDestinations.map((d) => (
              <label key={d} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-[#1E2D4D] bg-transparent"
                  checked={selectedDestinations.includes(d)}
                  onChange={() => toggleDestination(d)}
                />
                <span>{d}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Modes / health */}
        <div className="space-y-3">
          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase text-[#94A3B8]">
              GM Mode
            </div>
            <div className="flex flex-wrap gap-1">
              {[
                { id: "volume", label: "Volume" },
                { id: "count", label: "Count" },
                { id: "both", label: "Both" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setGmMode(m.id as any)}
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    gmMode === m.id ? "bg-[#00D4FF] text-[#050A18]" : "border border-[#1E2D4D] text-[#94A3B8]"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase text-[#94A3B8]">
              Normalization
            </div>
            <div className="flex flex-wrap gap-1">
              {[
                { id: "raw", label: "Raw" },
                { id: "complexity", label: "Complexity-Wtd" },
                { id: "time_smoothed", label: "Time-Smoothed" },
              ].map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => setNormalization(n.id as any)}
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    normalization === n.id
                      ? "bg-[#00D4FF] text-[#050A18]"
                      : "border border-[#1E2D4D] text-[#94A3B8]"
                  }`}
                >
                  {n.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase text-[#94A3B8]">
              Margin Health
            </div>
            <div className="space-y-1">
              {[
                { id: "healthy", label: "Healthy (>75%)" },
                { id: "watch", label: "Watch (60-75%)" },
                { id: "at_risk", label: "At Risk (<60%)" },
              ].map((h) => (
                <label key={h.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-[#1E2D4D] bg-transparent"
                    checked={selectedMarginHealth.includes(h.id)}
                    onChange={() => toggleMarginHealth(h.id)}
                  />
                  <span>{h.label}</span>
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-[#1E2D4D] bg-transparent"
              checked={anomalyOnly}
              onChange={(e) => setAnomalyOnly(e.target.checked)}
            />
            <span>Only show pipelines with active anomalies</span>
          </label>
        </div>
      </div>
    </div>
  );
}
