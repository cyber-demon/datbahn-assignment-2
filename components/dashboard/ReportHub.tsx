"use client";

import { useState } from "react";
import notificationsData from "@/data/notifications.json";
import kpisData from "@/data/kpis.json";
import dataPlanesData from "@/data/data_planes.json";
import pipelinesData from "@/data/pipelines.json";
import { useDashboardStore } from "@/lib/store";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Card } from "@/components/ui/Card";
import { NotificationCard, type NotificationConfig } from "./NotificationCard";
import { SlackPreview } from "./SlackPreview";
import { EmailPreview } from "./EmailPreview";
import { PDFPreview } from "./PDFPreview";
import { cn } from "@/lib/utils";

type PreviewFormat = "slack" | "email" | "pdf";

export function ReportHub() {
  const [selectedNotif, setSelectedNotif] = useState(notificationsData.notifications[0]?.id ?? "notif-weekly");
  const [previewFormat, setPreviewFormat] = useState<PreviewFormat>("slack");
  const { dataPlaneFilter } = useDashboardStore();

  const notifications = notificationsData.notifications as NotificationConfig[];
  const selected = notifications.find((n) => n.id === selectedNotif) ?? notifications[0];

  let planes = [...dataPlanesData.planes];
  if (dataPlaneFilter !== "all") {
    planes = planes.filter((p) => p.id === dataPlaneFilter);
  }
  const latestPlaneData = planes.map((p) => ({
    ...p,
    current: p.monthly[p.monthly.length - 1],
  }));

  const topMovers = [...pipelinesData.pipelines]
    .sort((a, b) => Math.abs((b as { divergence_pp?: number }).divergence_pp ?? 0) - Math.abs((a as { divergence_pp?: number }).divergence_pp ?? 0))
    .slice(0, 5)
    .map((p) => ({
      name: p.name,
      cost_per_gb: p.cost_per_gb,
      gm_pct_by_volume: p.gm_pct_by_volume,
      gm_pct_by_count: p.gm_pct_by_count,
      divergence_pp: (p as { divergence_pp?: number }).divergence_pp,
    }));

  const previewData = {
    kpis: kpisData,
    planes: latestPlaneData,
    anomalies: pipelinesData.anomalies_summary,
    topMovers,
  };

  const setFormatFromNotification = (n: (typeof notifications)[0]) => {
    setSelectedNotif(n.id);
    setPreviewFormat(n.channelType === "slack" ? "slack" : "email");
  };

  return (
    <Card padding="large">
      <div className="mb-4 flex items-center justify-between">
        <SectionHeader>Reports & Notifications</SectionHeader>
        <button
          type="button"
          className="rounded-lg border border-[#1E2D4D] bg-[#1A2542] px-3 py-1.5 text-xs font-medium text-[#F1F5F9] hover:bg-[#111B33]"
        >
          Configure
        </button>
      </div>
      <div className="flex gap-6">
        <div className="w-[280px] flex-shrink-0 space-y-2 overflow-y-auto">
          {notifications.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              selected={selectedNotif === n.id}
              onClick={() => setFormatFromNotification(n)}
            />
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex gap-1">
            {(["slack", "email", "pdf"] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setPreviewFormat(fmt)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium",
                  previewFormat === fmt ? "bg-[#00D4FF] text-[#050A18]" : "border border-[#1E2D4D] text-[#94A3B8] hover:bg-[#111B33]"
                )}
              >
                {fmt === "slack" ? "Slack" : fmt === "email" ? "Email" : "PDF"}
              </button>
            ))}
          </div>
          <div className="rounded-lg border border-[#1E2D4D] bg-[#0B1224] p-4">
            {previewFormat === "slack" && <SlackPreview data={previewData} />}
            {previewFormat === "email" && <EmailPreview data={previewData} />}
            {previewFormat === "pdf" && <PDFPreview data={previewData} />}
          </div>
        </div>
      </div>
    </Card>
  );
}
