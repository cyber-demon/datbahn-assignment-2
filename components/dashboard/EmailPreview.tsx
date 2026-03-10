"use client";

import kpisData from "@/data/kpis.json";
import dataPlanesData from "@/data/data_planes.json";
import pipelinesData from "@/data/pipelines.json";
import { useDashboardStore } from "@/lib/store";
import { getMarginColor } from "@/lib/colors";

interface EmailPreviewData {
  kpis: typeof kpisData;
  planes: Array<{
    id: string;
    name: string;
    monthly: Array<{ gm_pct?: number; gm_payroll_pct?: number; revenue?: number }>;
    budget_used_k: number;
    budget_k: number;
  }>;
  anomalies: typeof pipelinesData.anomalies_summary;
  topMovers: Array<{ name: string; gm_pct_by_volume: number; gm_pct_by_count: number }>;
}

export function EmailPreview({ data }: { data: EmailPreviewData }) {
  const { dataPlaneFilter } = useDashboardStore();
  const { current_period } = data.kpis;
  let planes = data.planes;
  if (dataPlaneFilter !== "all") {
    planes = planes.filter((p) => p.id === dataPlaneFilter);
  }
  const latestByPlane = planes.map((p) => {
    const latest = p.monthly[p.monthly.length - 1];
    return {
      name: p.name,
      gmVol: latest?.gm_pct ?? 0,
      gmCnt: latest?.gm_payroll_pct ?? latest?.gm_pct ?? 0,
      revenue: latest?.revenue ?? 0,
      budgetPct: (p.budget_used_k / p.budget_k) * 100,
    };
  });

  return (
    <div className="max-w-[600px] rounded-lg bg-white p-6 shadow-lg" style={{ color: "#0F172A" }}>
      <div
        className="mb-6 h-2 w-full rounded"
        style={{ background: "linear-gradient(90deg, #00D4FF, #7C3AED)" }}
      />
      <h2 className="text-lg font-bold">DataBahn Cost Intelligence</h2>
      <p className="text-sm text-[#64748B]">Weekly digest — March 2026</p>
      <hr className="my-4 border-[#E2E8F0]" />
      <h3 className="text-sm font-bold uppercase text-[#64748B]">KPI Summary</h3>
      <div className="mt-2 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-[#E2E8F0] p-3">
          <div className="text-[10px] uppercase text-[#64748B]">Gross Margin</div>
          <div className="font-mono text-xl font-bold" style={{ color: getMarginColor(current_period.gross_margin_pct) }}>
            {current_period.gross_margin_pct.toFixed(1)}%
          </div>
        </div>
        <div className="rounded-lg border border-[#E2E8F0] p-3">
          <div className="text-[10px] uppercase text-[#64748B]">Cost/GB</div>
          <div className="font-mono text-xl font-bold text-[#0F172A]">
            ${current_period.cost_per_gb_normalized.toFixed(3)}
          </div>
        </div>
        <div className="rounded-lg border border-[#E2E8F0] p-3">
          <div className="text-[10px] uppercase text-[#64748B]">Volume</div>
          <div className="font-mono text-xl font-bold text-[#0F172A]">
            {current_period.total_volume_tb.toFixed(1)} TB
          </div>
        </div>
        <div className="rounded-lg border border-[#E2E8F0] p-3">
          <div className="text-[10px] uppercase text-[#64748B]">Revenue</div>
          <div className="font-mono text-xl font-bold text-[#0F172A]">
            ${(current_period.monthly_revenue / 1e6).toFixed(2)}M
          </div>
        </div>
      </div>
      <hr className="my-4 border-[#E2E8F0]" />
      <h3 className="text-sm font-bold uppercase text-[#64748B]">Data Planes</h3>
      <table className="mt-2 w-full text-sm">
        <thead>
          <tr className="border-b border-[#E2E8F0] text-left text-[10px] uppercase text-[#64748B]">
            <th className="pb-2">Plane</th>
            <th className="pb-2 text-right">GM% (vol)</th>
            <th className="pb-2 text-right">GM% (cnt)</th>
            <th className="pb-2 text-right">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {latestByPlane.map((p) => (
            <tr key={p.name} className="border-b border-[#E2E8F0]">
              <td className="py-2 font-medium">{p.name}</td>
              <td className="py-2 text-right font-mono" style={{ color: getMarginColor(p.gmVol) }}>
                {p.gmVol.toFixed(1)}%
              </td>
              <td className="py-2 text-right font-mono">{p.gmCnt.toFixed(1)}%</td>
              <td className="py-2 text-right font-mono">${p.revenue}K</td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.anomalies.count_30d > 0 && (
        <div className="mt-4 rounded-lg border border-[#EF4444] bg-[#FEF2F2] p-3 text-sm">
          <span className="font-semibold text-[#991B1B]">
            ⚠️ {data.anomalies.count_30d} anomalies detected
          </span>
          {data.anomalies.active.map((a) => (
            <div key={a.pipeline_id} className="mt-1 text-xs text-[#64748B]">
              • {a.message}
            </div>
          ))}
        </div>
      )}
      <div className="mt-6">
        <a
          href="#"
          className="inline-block rounded-lg bg-[#00D4FF] px-4 py-2 text-sm font-medium text-white no-underline"
        >
          View in dashboard
        </a>
      </div>
      <p className="mt-4 text-[10px] text-[#94A3B8]">Generated from DataBahn Cost Dashboard</p>
    </div>
  );
}
