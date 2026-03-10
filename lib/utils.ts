// /lib/utils.ts — Formatting utilities for currency, %, volume, deltas

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, compact = false): string {
  if (compact && Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyCompact(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatVolumeTB(value: number): string {
  return `${value.toFixed(1)} TB`;
}

export function formatVolumeGB(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K GB`;
  }
  return `${value.toFixed(0)} GB`;
}

export function formatCostPerGB(value: number): string {
  return `$${value.toFixed(4)}`;
}

export function formatDelta(
  current: number,
  prior: number,
  type: "percent" | "pp"
): { value: number; formatted: string; isPositive: boolean } {
  let delta: number;
  let formatted: string;

  if (type === "pp") {
    delta = current - prior;
    formatted = `${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta).toFixed(1)}pp`;
  } else {
    if (prior === 0) {
      return { value: 0, formatted: "—", isPositive: false };
    }
    delta = ((current - prior) / prior) * 100;
    formatted = `${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta).toFixed(1)}%`;
  }

  return {
    value: delta,
    formatted,
    isPositive: delta >= 0,
  };
}
