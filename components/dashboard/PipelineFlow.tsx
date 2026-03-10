"use client";

import pipelinesData from "@/data/pipelines.json";
import { getFilteredPipelines } from "@/lib/filters";
import { useDashboardStore } from "@/lib/store";
import { getMarginColor } from "@/lib/colors";

export function PipelineFlow() {
  const state = useDashboardStore();
  const { gmMode } = state;
  let pipelinesAll = pipelinesData.pipelines as any[];
  let pipelines = getFilteredPipelines(pipelinesAll as any, state as any);
  
  if (pipelines.length === 0) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-lg border border-[#1E2D4D] bg-[#0B1224] text-[#94A3B8]">
        No pipelines match the selected data plane filter.
      </div>
    );
  }
  const sources = Array.from(new Set(pipelines.map((p) => p.source)));
  const destinations = Array.from(new Set(pipelines.map((p) => p.destination)));
  const maxVol = Math.max(...pipelines.map((p) => p.volume_gb), 1);

  const width = 900;
  const height = 420;
  const leftColX = 90;
  const centerLeftX = width / 2 - 70;
  const centerRightX = width / 2 + 70;
  const rightColX = width - 90;
  const nodeWidth = 110;
  const nodeHeight = 26;
  const centerNodeW = 140;
  const centerNodeH = 36;

  // Precompute node positions
  const sourcePositions = sources.slice(0, 8).map((_, i) => {
    const spacing = (height - 80) / (Math.min(sources.length, 8) + 1);
    return 40 + spacing * (i + 1);
  });
  const destPositions = destinations.slice(0, 8).map((_, i) => {
    const spacing = (height - 80) / (Math.min(destinations.length, 8) + 1);
    return 40 + spacing * (i + 1);
  });

  // Aggregate routes: source -> dest with combined volume and avg margin (by volume / count)
  const routeMap = new Map<string, { volume: number; gmSumVol: number; gmSumCount: number; count: number }>();
  pipelines.forEach((p) => {
    const key = `${p.source}::${p.destination}`;
    const existing = routeMap.get(key);
    if (existing) {
      existing.volume += p.volume_gb;
      existing.gmSumVol += p.gm_pct_by_volume;
      existing.gmSumCount += p.gm_pct_by_count;
      existing.count += 1;
    } else {
      routeMap.set(key, {
        volume: p.volume_gb,
        gmSumVol: p.gm_pct_by_volume,
        gmSumCount: p.gm_pct_by_count,
        count: 1,
      });
    }
  });

  const routes = Array.from(routeMap.entries()).map(([key, data]) => {
    const [source, dest] = key.split("::");
    const srcIdx = sources.indexOf(source) % sourcePositions.length;
    const dstIdx = destinations.indexOf(dest) % destPositions.length;
    const gmPct = gmMode === "volume" ? data.gmSumVol / data.count : data.gmSumCount / data.count;
    return {
      source,
      dest,
      volume: data.volume,
      gmPct,
      srcY: sourcePositions[srcIdx] ?? height / 2,
      dstY: destPositions[dstIdx] ?? height / 2,
    };
  });

  // Draw paths - source -> center (fan-in) -> center -> dest (fan-out)
  // Use smooth cubic bezier with orthogonal-style control points
  const pathD = (srcY: number, dstY: number) => {
    const srcOutX = leftColX + nodeWidth / 2 + 4;
    const dstInX = rightColX - nodeWidth / 2 - 4;
    const midY = (srcY + dstY) / 2; // Slight variation per route to reduce overlap
    return [
      `M ${srcOutX} ${srcY}`,
      `C ${srcOutX + 60} ${srcY}, ${centerLeftX - 20} ${midY}, ${centerLeftX} ${height / 2}`,
      `L ${centerRightX} ${height / 2}`,
      `C ${centerRightX + 20} ${midY}, ${dstInX - 60} ${dstY}, ${dstInX} ${dstY}`,
    ].join(" ");
  };

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[600px]">
        {/* Paths - drawn first so they appear behind nodes */}
        {routes.map((r, i) => (
          <path
            key={`${r.source}-${r.dest}-${i}`}
            d={pathD(r.srcY, r.dstY)}
            fill="none"
            stroke={`${getMarginColor(r.gmPct)}99`}
            strokeWidth={Math.max(1.5, Math.min(8, (r.volume / maxVol) * 10))}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Center node */}
        <rect
          x={width / 2 - centerNodeW / 2}
          y={height / 2 - centerNodeH / 2}
          width={centerNodeW}
          height={centerNodeH}
          rx={8}
          fill="#3B82F6"
        />
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs font-medium"
          fill="#FFFFFF"
        >
          Transform + Route
        </text>

        {/* Source nodes */}
        {sources.slice(0, 8).map((s, i) => (
          <g key={s}>
            <rect
              x={leftColX - nodeWidth / 2}
              y={(sourcePositions[i] ?? height / 2) - nodeHeight / 2}
              width={nodeWidth}
              height={nodeHeight}
              rx={6}
              fill="#3B82F610"
              stroke="#3B82F6"
            />
            <text
              x={leftColX}
              y={sourcePositions[i] ?? height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] font-medium"
              fill="#F1F5F9"
            >
              {s.length > 12 ? s.slice(0, 10) + "…" : s}
            </text>
          </g>
        ))}

        {/* Destination nodes */}
        {destinations.slice(0, 8).map((d, i) => (
          <g key={d}>
            <rect
              x={rightColX - nodeWidth / 2}
              y={(destPositions[i] ?? height / 2) - nodeHeight / 2}
              width={nodeWidth}
              height={nodeHeight}
              rx={6}
              fill="#22C55E10"
              stroke="#22C55E"
            />
            <text
              x={rightColX}
              y={destPositions[i] ?? height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] font-medium"
              fill="#F1F5F9"
            >
              {d.length > 12 ? d.slice(0, 10) + "…" : d}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-[10px] text-[#F1F5F9]">
        <span className="flex items-center gap-1">
          <span className="h-0.5 w-6 rounded bg-green-500" />
          GM &gt;75%
        </span>
        <span className="flex items-center gap-1">
          <span className="h-0.5 w-6 rounded bg-yellow-500" />
          GM 60-75%
        </span>
        <span className="flex items-center gap-1">
          <span className="h-0.5 w-6 rounded bg-red-500" />
          GM &lt;60%
        </span>
        <span className="text-[#94A3B8]">Line thickness = volume</span>
      </div>
    </div>
  );
}
