"use client";

import type { TooltipProps } from "recharts";
import { cn } from "@/lib/utils";

interface CustomTooltipContent {
  title?: string;
  items?: { label: string; value: string; color?: string }[];
}

export function CustomTooltip({
  active,
  payload,
  label,
  title,
  items,
}: TooltipProps<number, string> & CustomTooltipContent) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className={cn(
        "rounded-lg border border-[#2A3A5C] bg-[#111B33] px-3 py-2 text-xs shadow-lg"
      )}
    >
      {title && <div className="mb-1.5 font-semibold text-[#F1F5F9]">{title}</div>}
      {label && <div className="mb-1 text-[#94A3B8]">{label}</div>}
      {items
        ? items.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="text-[#94A3B8]">{item.label}:</span>
              <span
                className="font-mono font-medium text-[#F1F5F9]"
                style={item.color ? { color: item.color } : undefined}
              >
                {item.value}
              </span>
            </div>
          ))
        : payload.map((p) => (
            <div key={String(p.name)} className="flex items-center gap-2">
              {p.color && (
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
              )}
              <span className="text-[#94A3B8]">{p.name}:</span>
              <span className="font-mono font-medium text-[#F1F5F9]">{String(p.value)}</span>
            </div>
          ))}
    </div>
  );
}
