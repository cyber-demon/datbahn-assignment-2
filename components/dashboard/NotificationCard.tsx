"use client";

import { MessageSquare, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NotificationConfig {
  id: string;
  name: string;
  frequency: string;
  schedule: string;
  channel: string;
  channelType: "slack" | "email";
  status: "active" | "draft";
  audience?: string;
  view?: string;
  lastSent?: string;
  nextSend?: string;
}

export function NotificationCard({
  notification,
  selected,
  onClick,
}: {
  notification: NotificationConfig;
  selected: boolean;
  onClick: () => void;
}) {
  const channelColor = notification.channelType === "slack" ? "#00D4FF" : "#7C3AED";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border px-3 py-3 text-left transition-colors",
        selected
          ? "border-[#00D4FF] bg-[#1A2542]"
          : "border-[#1E2D4D] bg-[#111B33] hover:bg-[#1A2542]"
      )}
      style={{ borderLeftWidth: "3px", borderLeftColor: channelColor }}
    >
      <div className="flex items-center gap-2">
        {notification.channelType === "slack" ? (
          <MessageSquare className="h-4 w-4 text-[#00D4FF]" />
        ) : (
          <Mail className="h-4 w-4 text-[#7C3AED]" />
        )}
        <span className="text-sm font-semibold text-[#F1F5F9]">{notification.name}</span>
        <span
          className={cn(
            "ml-auto h-2 w-2 rounded-full",
            notification.status === "active" ? "bg-[#22C55E]" : "bg-[#F59E0B]"
          )}
        />
      </div>
      <div className="mt-1 text-[11px] text-[#94A3B8]">
        {notification.schedule} → {notification.channel}
      </div>
      <div className="mt-0.5 text-[10px] text-[#64748B]">
        Last: {notification.lastSent ?? "—"} · Next: {notification.nextSend ?? "—"}
      </div>
    </button>
  );
}
