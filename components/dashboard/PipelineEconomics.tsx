"use client";

import { useDashboardStore } from "@/lib/store";
import { PipelineScatter } from "./PipelineScatter";
import { PipelineTable } from "./PipelineTable";
import { PipelineDivergence } from "./PipelineDivergence";
import { PipelineFlow } from "./PipelineFlow";
import { CostDistribution } from "./CostDistribution";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export function PipelineEconomics() {
  const { pipelineTab, setPipelineTab, gmMode, setGmMode } = useDashboardStore();

  return (
    <Card id="pipeline-economics" padding="large">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <SectionHeader>Pipeline Economics</SectionHeader>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-[#1E2D4D] p-0.5">
            {(["scatter", "table", "divergence", "flow"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setPipelineTab(tab)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium",
                  pipelineTab === tab ? "bg-[#00D4FF] text-[#050A18]" : "text-[#94A3B8]"
                )}
              >
                {tab === "scatter" ? "Scatter" : tab === "table" ? "Rankings" : tab === "divergence" ? "Divergence" : "Data Flow"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#64748B]">GM by:</span>
            <div className="flex rounded-lg border border-[#1E2D4D] p-0.5">
              <button
                type="button"
                onClick={() => setGmMode("volume")}
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium",
                  gmMode === "volume" ? "bg-[#00D4FF] text-[#050A18]" : "text-[#94A3B8]"
                )}
              >
                Volume
              </button>
              <button
                type="button"
                onClick={() => setGmMode("count")}
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium",
                  gmMode === "count" ? "bg-[#00D4FF] text-[#050A18]" : "text-[#94A3B8]"
                )}
              >
                Count
              </button>
            </div>
          </div>
        </div>
      </div>
      {pipelineTab === "scatter" && (
        <>
          <PipelineScatter />
          <CostDistribution />
        </>
      )}
      {pipelineTab === "table" && <PipelineTable />}
      {pipelineTab === "divergence" && <PipelineDivergence />}
      {pipelineTab === "flow" && <PipelineFlow />}
    </Card>
  );
}
