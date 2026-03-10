"use client";

import kpisData from "@/data/kpis.json";
import dataPlanesData from "@/data/data_planes.json";
import pipelinesData from "@/data/pipelines.json";
import { useDashboardStore } from "@/lib/store";
import { getMarginColor } from "@/lib/colors";

interface PDFPreviewData {
  kpis: typeof kpisData;
  planes: Array<{
    id: string;
    name: string;
    monthly: Array<{ gm_pct?: number; revenue?: number }>;
  }>;
  anomalies: typeof pipelinesData.anomalies_summary;
  topMovers: Array<{ name: string }>;
}

export function PDFPreview({ data }: { data: PDFPreviewData }) {
  const { dataPlaneFilter } = useDashboardStore();
  const { current_period } = data.kpis;
  let planes = data.planes;
  if (dataPlaneFilter !== "all") {
    planes = planes.filter((p) => p.id === dataPlaneFilter);
  }
  const latestByPlane = planes.map((p) => {
    const latest = p.monthly[p.monthly.length - 1];
    return { name: p.name, gm: latest?.gm_pct ?? 0, revenue: latest?.revenue ?? 0 };
  });

  return (
    <div
      className="mx-auto overflow-hidden rounded-lg bg-white shadow-lg"
      style={{
        maxWidth: "60%",
        aspectRatio: "210/297",
        color: "#0F172A",
        fontSize: "10px",
      }}
    >
      <div className="flex h-12 items-center border-b border-[#E2E8F0] px-4" style={{ background: "linear-gradient(90deg, #00D4FF20, #7C3AED20)" }}>
        <span className="font-bold">DataBahn</span>
        <span className="ml-4 text-[#64748B]">Cost & Margin Report — March 2026</span>
      </div>
      <div className="space-y-4 p-4">
        <section>
          <h3 className="border-b border-[#E2E8F0] pb-1 font-bold uppercase text-[#64748B]">KPI Summary</h3>
          <div className="mt-2 flex gap-4">
            <span>GM: {current_period.gross_margin_pct.toFixed(1)}%</span>
            <span>Cost/GB: ${current_period.cost_per_gb_normalized.toFixed(3)}</span>
            <span>Volume: {current_period.total_volume_tb.toFixed(1)} TB</span>
          </div>
        </section>
        <section>
          <h3 className="border-b border-[#E2E8F0] pb-1 font-bold uppercase text-[#64748B]">Data Plane GM</h3>
          <table className="mt-2 w-full">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-left">
                <th className="pb-1">Plane</th>
                <th className="pb-1 text-right">GM%</th>
                <th className="pb-1 text-right">Revenue ($K)</th>
              </tr>
            </thead>
            <tbody>
              {latestByPlane.map((p) => (
                <tr key={p.name} className="border-b border-[#E2E8F0]" style={{ color: getMarginColor(p.gm) }}>
                  <td className="py-0.5">{p.name}</td>
                  <td className="py-0.5 text-right">{p.gm.toFixed(1)}%</td>
                  <td className="py-0.5 text-right">{p.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        {data.anomalies.count_30d > 0 && (
          <section>
            <h3 className="border-b border-[#E2E8F0] pb-1 font-bold uppercase text-[#EF4444]">Anomalies</h3>
            <p className="mt-1">{data.anomalies.count_30d} detected</p>
          </section>
        )}
      </div>
      <div className="border-t border-[#E2E8F0] px-4 py-2 text-[9px] text-[#94A3B8]">
        Generated from DataBahn Cost Dashboard
      </div>
    </div>
  );
}
