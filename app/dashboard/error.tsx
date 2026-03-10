"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-[#F1F5F9]">
      <h2 className="text-lg font-bold text-[#EF4444]">Something went wrong</h2>
      <pre className="max-w-2xl overflow-auto rounded-lg border border-[#1E2D4D] bg-[#0B1224] p-4 text-sm text-[#94A3B8]">
        {error.message}
      </pre>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-[#00D4FF] px-4 py-2 text-sm font-medium text-[#050A18] hover:bg-[#33DDFF]"
      >
        Try again
      </button>
    </div>
  );
}
