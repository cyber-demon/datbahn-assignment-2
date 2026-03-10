"use client";

import { getMarginColor, getMarginStatus } from "@/lib/colors";
import { cn } from "@/lib/utils";

interface MetricBadgeProps {
  gm: number;
  className?: string;
}

export function MetricBadge({ gm, className }: MetricBadgeProps) {
  const color = getMarginColor(gm);
  const status = getMarginStatus(gm);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        className
      )}
      style={{
        backgroundColor: `${color}18`,
        color,
      }}
    >
      {status}
    </span>
  );
}
