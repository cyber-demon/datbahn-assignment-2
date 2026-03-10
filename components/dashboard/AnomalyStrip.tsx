"use client";

import pipelinesData from "@/data/pipelines.json";
import { useDashboardStore } from "@/lib/store";

export function AnomalyStrip() {
  const { count_30d, total_impact_k, active } = pipelinesData.anomalies_summary;
  const { setPipelineTab } = useDashboardStore();

  if (count_30d === 0 || !active?.length) return null;

  const handleViewDetails = () => {
    setPipelineTab("table");
    const pipelineSection = document.getElementById("pipeline-economics");
    if (pipelineSection) pipelineSection.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex items-center justify-between border-b border-[#EF444430] bg-[#EF444410] px-6 py-2.5">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[#EF4444]" aria-hidden />
        <span className="text-sm text-[#F1F5F9]">
          {count_30d} cost anomaly{count_30d !== 1 ? "s" : ""} detected in the last 7 days — ${(total_impact_k * 1000).toLocaleString()} impact
        </span>
      </div>
      <button
        type="button"
        onClick={handleViewDetails}
        className="text-sm font-medium text-[#00D4FF] hover:underline"
      >
        View Details →
      </button>
    </div>
  );
}
