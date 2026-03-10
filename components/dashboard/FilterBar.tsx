"use client";

import { useDashboardStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ChevronDown, Download } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Papa from "papaparse";
import pipelinesData from "@/data/pipelines.json";

function ExportDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePDFExport = async () => {
    setOpen(false);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const el = document.querySelector("main");
      if (!el) return;
      const canvas = await html2canvas(el, { scale: 2, useCORS: true });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      pdf.addImage(img, "PNG", 0, 0, pdfW, pdfH);
      pdf.save("databahn-dashboard.pdf");
    } catch (err) {
      console.error("PDF export failed:", err);
    }
  };

  const handleCSVExport = () => {
    setOpen(false);
    try {
      const pipelines = pipelinesData.pipelines;
      const csv = Papa.unparse(
        pipelines.map((p: Record<string, unknown>) => ({
          name: p.name,
          source: p.source,
          destination: p.destination,
          data_plane: p.data_plane,
          volume_gb: p.volume_gb,
          cost_per_gb: p.cost_per_gb,
          revenue_k: p.revenue_k,
          cost_k: p.cost_k,
          gm_pct_vol: p.gm_pct_by_volume,
          gm_pct_count: p.gm_pct_by_count,
        }))
      );
      const blob = new Blob([csv], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "databahn-pipelines.csv";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) {
      console.error("CSV export failed:", err);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg bg-[#00D4FF] px-4 py-2 text-sm font-medium text-[#050A18] hover:bg-[#33DDFF]"
      >
        <Download className="h-4 w-4" />
        Export
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-lg border border-[#1E2D4D] bg-[#020617] py-1 shadow-lg">
          <button
            type="button"
            className="w-full px-3 py-2 text-left text-sm text-[#F1F5F9] hover:bg-[#111827]"
            onClick={handlePDFExport}
          >
            PDF Report
          </button>
          <button
            type="button"
            className="w-full px-3 py-2 text-left text-sm text-[#F1F5F9] hover:bg-[#111827]"
            onClick={handleCSVExport}
          >
            CSV Data
          </button>
        </div>
      )}
    </div>
  );
}

export function FilterBar() {
  const {
    activeView,
    setActiveView,
    dateRange,
    setDateRange,
    filterPanelOpen,
    toggleFilterPanel,
    selectedPlanes,
    selectedSources,
    selectedDestinations,
    selectedPipelines,
    anomalyOnly,
    resetAllFilters,
  } = useDashboardStore();

  const activeFilterCount =
    (selectedPlanes.length ? 1 : 0) +
    (selectedSources.length ? 1 : 0) +
    (selectedDestinations.length ? 1 : 0) +
    (selectedPipelines.length ? 1 : 0) +
    (anomalyOnly ? 1 : 0);

  return (
    <header className="sticky top-0 z-50 border-b border-[#1E2D4D] bg-[#020617]/95 backdrop-blur">
      <div className="flex h-[60px] items-center justify-between px-6">
        {/* Left: Logo + title */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#00D4FF] to-[#7C3AED] text-lg font-bold text-white">
            D
          </div>
          <div>
            <div className="text-[15px] font-bold text-[#F1F5F9]">DataBahn.ai</div>
            <div className="text-[11px] text-[#64748B]">
              Internal Cost &amp; Margin Dashboard
            </div>
          </div>
        </div>

        {/* Right: view, date, filters, export */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View switcher */}
          <div className="flex rounded-lg border border-[#1E2D4D] p-0.5">
            {([
              { value: "engineering", label: "Engineering" },
              { value: "finance", label: "Finance" },
              { value: "board", label: "Board" },
            ] as const).map((v) => (
              <button
                key={v.value}
                type="button"
                onClick={() => setActiveView(v.value)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium",
                  activeView === v.value
                    ? "bg-[#00D4FF] text-[#050A18]"
                    : "text-[#94A3B8] hover:text-[#F1F5F9]"
                )}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Date range */}
          <div className="flex rounded-lg border border-[#1E2D4D] p-0.5">
            {(["30d", "90d", "6mo", "12mo"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setDateRange(r)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium",
                  dateRange === r
                    ? "bg-[#00D4FF] text-[#050A18]"
                    : "text-[#94A3B8] hover:text-[#F1F5F9]"
                )}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Filters badge */}
          <button
            type="button"
            onClick={toggleFilterPanel}
            className={cn(
              "flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm",
              filterPanelOpen ? "border-[#00D4FF] bg-[#1E293B]" : "border-[#1E2D4D] bg-[#020617]",
              activeFilterCount > 0 ? "text-[#00D4FF]" : "text-[#94A3B8]"
            )}
          >
            <span>Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {/* Export */}
          <ExportDropdown />
        </div>
      </div>

      {/* Active filters row */}
      {activeFilterCount > 0 && (
        <div className="border-t border-[#1E2D4D] bg-[#020617] px-6 py-1.5 text-[11px] text-[#94A3B8]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#64748B]">Active filters:</span>
            {selectedPlanes.map((p) => (
              <span
                key={`plane-${p}`}
                className="rounded-full bg-[#1E293B] px-2 py-0.5 text-[10px] text-[#E5E7EB]"
              >
                {p}
              </span>
            ))}
            {selectedSources.length > 0 && (
              <span className="rounded-full bg-[#1E293B] px-2 py-0.5 text-[10px] text-[#E5E7EB]">
                Sources ({selectedSources.length})
              </span>
            )}
            {selectedDestinations.length > 0 && (
              <span className="rounded-full bg-[#1E293B] px-2 py-0.5 text-[10px] text-[#E5E7EB]">
                Destinations ({selectedDestinations.length})
              </span>
            )}
            {selectedPipelines.length > 0 && (
              <span className="rounded-full bg-[#1E293B] px-2 py-0.5 text-[10px] text-[#E5E7EB]">
                Pipelines ({selectedPipelines.length})
              </span>
            )}
            {anomalyOnly && (
              <span className="rounded-full bg-[#1E293B] px-2 py-0.5 text-[10px] text-[#F97316]">
                Anomalies only
              </span>
            )}
            <button
              type="button"
              onClick={resetAllFilters}
              className="ml-auto text-[10px] font-medium text-[#00D4FF] hover:underline"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
