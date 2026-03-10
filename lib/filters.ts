import type { DashboardState } from "./store";

export interface Pipeline {
  id: string;
  name: string;
  source: string;
  destination: string;
  data_plane: string;
  product: string;
  events_m: number;
  volume_gb: number;
  revenue_k: number;
  cost_k: number;
  cost_per_gb: number;
  gm_pct_by_volume: number;
  gm_pct_by_count: number;
  anomaly?: boolean;
  complexity_steps?: number;
}

export function getFilteredPipelines(
  allPipelines: Pipeline[],
  state: DashboardState
): Pipeline[] {
  let filtered = [...allPipelines];

  if (state.selectedPlanes.length > 0) {
    filtered = filtered.filter((p) => state.selectedPlanes.includes(p.data_plane));
  }

  if (state.selectedSources.length > 0) {
    filtered = filtered.filter((p) => state.selectedSources.includes(p.source));
  }

  if (state.selectedDestinations.length > 0) {
    filtered = filtered.filter((p) => state.selectedDestinations.includes(p.destination));
  }

  if (state.selectedPipelines.length > 0) {
    filtered = filtered.filter((p) => state.selectedPipelines.includes(p.id));
  }

  if (state.selectedProducts.length > 0) {
    filtered = filtered.filter((p) => state.selectedProducts.includes(p.product));
  }

  if (state.selectedMarginHealth.length > 0) {
    filtered = filtered.filter((p) => {
      const gm = state.gmMode === "count" ? p.gm_pct_by_count : p.gm_pct_by_volume;
      if (state.selectedMarginHealth.includes("healthy") && gm > 75) return true;
      if (state.selectedMarginHealth.includes("watch") && gm > 60 && gm <= 75) return true;
      if (state.selectedMarginHealth.includes("at_risk") && gm <= 60) return true;
      return false;
    });
  }

  if (state.anomalyOnly) {
    filtered = filtered.filter((p) => p.anomaly === true);
  }

  return filtered;
}

export function getAvailableSources(
  pipelines: Pipeline[],
  selectedPlanes: string[]
): string[] {
  if (selectedPlanes.length === 0) {
    return Array.from(new Set(pipelines.map((p) => p.source))).sort();
  }
  return Array.from(new Set(pipelines.filter((p) => selectedPlanes.includes(p.data_plane)).map((p) => p.source))).sort();
}

export function getAvailableDestinations(
  pipelines: Pipeline[],
  selectedPlanes: string[]
): string[] {
  if (selectedPlanes.length === 0) {
    return Array.from(new Set(pipelines.map((p) => p.destination))).sort();
  }
  return Array.from(new Set(pipelines.filter((p) => selectedPlanes.includes(p.data_plane)).map((p) => p.destination))).sort();
}
