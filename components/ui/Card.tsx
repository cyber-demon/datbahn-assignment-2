"use client";

import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "default" | "large";
  id?: string;
}

export function Card({
  children,
  className,
  padding = "default",
  id,
}: CardProps) {
  return (
    <div
      id={id}
      className={cn(
        "rounded-xl border border-[#1E2D4D] bg-[#111827] text-[#F1F5F9] shadow-[0_1px_3px_rgba(0,0,0,0.3)]",
        padding === "default" ? "p-5" : "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
