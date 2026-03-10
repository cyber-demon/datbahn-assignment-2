"use client";

import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionHeader({ children, className }: SectionHeaderProps) {
  return (
    <h3
      className={cn(
        "mb-3 text-[11px] font-bold uppercase tracking-[1.2px] text-[#64748B]",
        className
      )}
    >
      {children}
    </h3>
  );
}
