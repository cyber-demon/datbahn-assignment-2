"use client";

import { FilterBar } from "@/components/dashboard/FilterBar";
import { AnomalyStrip } from "@/components/dashboard/AnomalyStrip";
import { FilterPanel } from "@/components/dashboard/FilterPanel";
import { ScalingNarrative } from "@/components/dashboard/ScalingNarrative";
import { SlideOverPanel } from "@/components/dashboard/SlideOverPanel";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <FilterBar />
      <AnomalyStrip />
      <FilterPanel />
      <ScalingNarrative />
      <main className="mx-auto max-w-[1600px] px-6 py-6 text-[#F1F5F9]">
        {children}
      </main>
      <SlideOverPanel />
    </div>
  );
}
