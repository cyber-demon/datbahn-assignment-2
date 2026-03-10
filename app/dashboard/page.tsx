"use client";

import { useDashboardStore } from "@/lib/store";
import { KPICards } from "@/components/dashboard/KPICards";
import { COGSBreakdown } from "@/components/dashboard/COGSBreakdown";
import { MarginByPlane } from "@/components/dashboard/MarginByPlane";
import { PipelineEconomics } from "@/components/dashboard/PipelineEconomics";
import { MarginWaterfall } from "@/components/dashboard/MarginWaterfall";
import { ReportHub } from "@/components/dashboard/ReportHub";
import { GMTrendCard } from "@/components/dashboard/GMTrendCard";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { activeView } = useDashboardStore();

  const showEngineering = activeView === "engineering";
  const showFinance = activeView === "finance" || activeView === "engineering";
  const showBoard = activeView === "board";

  return (
    <div className="space-y-6">
      {/* KPI Cards - always visible */}
      <KPICards />

      {/* Board view: GM trend + Margin by Plane */}
      {showBoard && (
        <div className="grid gap-6 lg:grid-cols-2">
          <GMTrendCard />
          <MarginByPlane />
        </div>
      )}

      {/* Main grid: COGS + Margin by Plane (Engineering / Finance) */}
      <div
        className={cn(
          "grid gap-6",
          showBoard ? "hidden" : "lg:grid-cols-2"
        )}
      >
        {showFinance && <COGSBreakdown />}
        {(showFinance || showEngineering) && <MarginByPlane />}
      </div>

      {/* Pipeline Economics - Engineering & Finance */}
      {(showEngineering || showFinance) && <PipelineEconomics />}

      {/* Margin Waterfall - Finance & Board */}
      {(showFinance || showBoard) && <MarginWaterfall />}

      {/* Reports & Notifications - all views */}
      <ReportHub />
    </div>
  );
}
