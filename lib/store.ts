// /lib/store.ts — Zustand store for global filter + view state

import { create } from "zustand";

export type DateRange = "30d" | "90d" | "6mo" | "12mo" | "custom";
export type DataPlaneFilter = "all" | "security" | "observability" | "application" | "iot_ot";
export type GroupBy = "data_plane" | "product" | "pipeline" | "cost_category" | "destination";
export type ActiveView = "engineering" | "finance" | "board";
export type AllocMethod = "volume_weighted" | "even_split" | "usage_based";
export type MarginView = "bar" | "heatmap";
export type MarginPlaneView = "ranked_bars" | "bubble_map" | "trend_lines";
export type PipelineTab = "scatter" | "table" | "divergence" | "flow";
export type GmMode = "volume" | "count" | "both";
export type Normalization = "raw" | "complexity" | "time_smoothed";

export interface SavedView {
  id: string;
  name: string;
  description: string;
  // We only persist filter-related fields here
  filters: Partial<Pick<DashboardState,
    | "dateRange"
    | "selectedPlanes"
    | "selectedSources"
    | "selectedDestinations"
    | "selectedPipelines"
    | "selectedProducts"
    | "selectedMarginHealth"
    | "selectedBudgetStatus"
    | "anomalyOnly"
    | "gmMode"
    | "normalization"
  >>;
}

export interface DashboardState {
  // View
  activeView: ActiveView;

  // Date
  dateRange: DateRange;
  customDateStart?: string;
  customDateEnd?: string;

  // Legacy single-select plane filter (used by some panels)
  dataPlaneFilter: DataPlaneFilter;

  // Multi-select filters
  selectedPlanes: string[];
  selectedSources: string[];
  selectedDestinations: string[];
  selectedPipelines: string[];
  selectedProducts: string[];
  selectedMarginHealth: string[]; // ["healthy", "watch", "at_risk"]
  selectedBudgetStatus: string[]; // ["over", "near_limit", "on_track"]
  anomalyOnly: boolean;

  // Display / modes
  groupBy: GroupBy;
  allocMethod: AllocMethod;
  showPayroll: boolean;
  marginView: MarginView;
  marginPlaneView: MarginPlaneView;
  pipelineTab: PipelineTab;
  tableSortCol: string;
  tableSortDir: "asc" | "desc";
  gmMode: GmMode;
  normalization: Normalization;

  // Filter panel
  filterPanelOpen: boolean;

  // Drill-down
  slideOverOpen: boolean;
  slideOverType: "pipeline" | "data_plane" | null;
  slideOverId: string | null;

  // Saved views
  savedViews: SavedView[];

  // Actions
  setActiveView: (view: ActiveView) => void;
  setDateRange: (range: DateRange) => void;
  setCustomDates: (start?: string, end?: string) => void;
  setDataPlaneFilter: (filter: DataPlaneFilter) => void;
  setGroupBy: (groupBy: GroupBy) => void;
  setAllocMethod: (method: AllocMethod) => void;
  togglePayroll: () => void;
  setMarginView: (view: MarginView) => void;
  setMarginPlaneView: (view: MarginPlaneView) => void;
  setPipelineTab: (tab: PipelineTab) => void;
  setTableSort: (col: string) => void;
  setGmMode: (mode: GmMode) => void;
  setNormalization: (method: Normalization) => void;

  togglePlane: (planeId: string) => void;
  toggleSource: (source: string) => void;
  toggleDestination: (dest: string) => void;
  togglePipeline: (id: string) => void;
  toggleProduct: (product: string) => void;
  toggleMarginHealth: (status: string) => void;
  toggleBudgetStatus: (status: string) => void;
  setAnomalyOnly: (on: boolean) => void;

  resetAllFilters: () => void;
  toggleFilterPanel: () => void;

  saveView: (name: string, description: string) => void;
  loadView: (viewId: string) => void;

  openSlideOver: (type: "pipeline" | "data_plane", id: string) => void;
  closeSlideOver: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  activeView: "engineering",

  dateRange: "6mo",
  customDateStart: undefined,
  customDateEnd: undefined,

  dataPlaneFilter: "all",

  selectedPlanes: [],
  selectedSources: [],
  selectedDestinations: [],
  selectedPipelines: [],
  selectedProducts: [],
  selectedMarginHealth: [],
  selectedBudgetStatus: [],
  anomalyOnly: false,

  groupBy: "data_plane",
  allocMethod: "volume_weighted",
  showPayroll: false,
  marginView: "bar",
  marginPlaneView: "ranked_bars",
  pipelineTab: "scatter",
  tableSortCol: "gm_pct_by_volume",
  tableSortDir: "asc",
  gmMode: "volume",
  normalization: "raw",

  filterPanelOpen: false,

  slideOverOpen: false,
  slideOverType: null,
  slideOverId: null,

  savedViews: [],

  setActiveView: (activeView) => set({ activeView }),
  setDateRange: (dateRange) => set({ dateRange }),
  setCustomDates: (start, end) => set({ customDateStart: start, customDateEnd: end }),
  setDataPlaneFilter: (dataPlaneFilter) => set({ dataPlaneFilter }),
  setGroupBy: (groupBy) => set({ groupBy }),
  setAllocMethod: (allocMethod) => set({ allocMethod }),
  togglePayroll: () => set((s) => ({ showPayroll: !s.showPayroll })),
  setMarginView: (marginView) => set({ marginView }),
  setMarginPlaneView: (marginPlaneView) => set({ marginPlaneView }),
  setPipelineTab: (pipelineTab) => set({ pipelineTab }),
  setTableSort: (col) =>
    set((s) => ({
      tableSortCol: col,
      tableSortDir: s.tableSortCol === col && s.tableSortDir === "asc" ? "desc" : "asc",
    })),
  setGmMode: (gmMode) => set({ gmMode }),
  setNormalization: (normalization) => set({ normalization }),

  togglePlane: (planeId) =>
    set((s) => {
      const exists = s.selectedPlanes.includes(planeId);
      const selectedPlanes = exists
        ? s.selectedPlanes.filter((id) => id !== planeId)
        : [...s.selectedPlanes, planeId];
      // keep legacy single-select dataPlaneFilter roughly in sync
      const dataPlaneFilter: DataPlaneFilter =
        selectedPlanes.length === 1
          ? (selectedPlanes[0] as DataPlaneFilter)
          : "all";
      return { selectedPlanes, dataPlaneFilter };
    }),

  toggleSource: (source) =>
    set((s) => ({
      selectedSources: s.selectedSources.includes(source)
        ? s.selectedSources.filter((v) => v !== source)
        : [...s.selectedSources, source],
    })),

  toggleDestination: (dest) =>
    set((s) => ({
      selectedDestinations: s.selectedDestinations.includes(dest)
        ? s.selectedDestinations.filter((v) => v !== dest)
        : [...s.selectedDestinations, dest],
    })),

  togglePipeline: (id) =>
    set((s) => ({
      selectedPipelines: s.selectedPipelines.includes(id)
        ? s.selectedPipelines.filter((v) => v !== id)
        : [...s.selectedPipelines, id],
    })),

  toggleProduct: (product) =>
    set((s) => ({
      selectedProducts: s.selectedProducts.includes(product)
        ? s.selectedProducts.filter((v) => v !== product)
        : [...s.selectedProducts, product],
    })),

  toggleMarginHealth: (status) =>
    set((s) => ({
      selectedMarginHealth: s.selectedMarginHealth.includes(status)
        ? s.selectedMarginHealth.filter((v) => v !== status)
        : [...s.selectedMarginHealth, status],
    })),

  toggleBudgetStatus: (status) =>
    set((s) => ({
      selectedBudgetStatus: s.selectedBudgetStatus.includes(status)
        ? s.selectedBudgetStatus.filter((v) => v !== status)
        : [...s.selectedBudgetStatus, status],
    })),

  setAnomalyOnly: (on) => set({ anomalyOnly: on }),

  resetAllFilters: () =>
    set({
      selectedPlanes: [],
      selectedSources: [],
      selectedDestinations: [],
      selectedPipelines: [],
      selectedProducts: [],
      selectedMarginHealth: [],
      selectedBudgetStatus: [],
      anomalyOnly: false,
      dataPlaneFilter: "all",
    }),

  toggleFilterPanel: () => set((s) => ({ filterPanelOpen: !s.filterPanelOpen })),

  saveView: (name, description) => {
    const state = get();
    const id = `${Date.now()}`;
    const filters: SavedView["filters"] = {
      dateRange: state.dateRange,
      selectedPlanes: state.selectedPlanes,
      selectedSources: state.selectedSources,
      selectedDestinations: state.selectedDestinations,
      selectedPipelines: state.selectedPipelines,
      selectedProducts: state.selectedProducts,
      selectedMarginHealth: state.selectedMarginHealth,
      selectedBudgetStatus: state.selectedBudgetStatus,
      anomalyOnly: state.anomalyOnly,
      gmMode: state.gmMode,
      normalization: state.normalization,
    };
    set((s) => ({ savedViews: [...s.savedViews, { id, name, description, filters }] }));
  },

  loadView: (viewId) => {
    const { savedViews } = get();
    const view = savedViews.find((v) => v.id === viewId);
    if (!view) return;
    const filters = view.filters;
    set((s) => ({
      ...s,
      ...filters,
      dataPlaneFilter:
        filters.selectedPlanes && filters.selectedPlanes.length === 1
          ? (filters.selectedPlanes[0] as DataPlaneFilter)
          : s.dataPlaneFilter,
    }));
  },

  openSlideOver: (slideOverType, slideOverId) =>
    set({ slideOverOpen: true, slideOverType, slideOverId }),
  closeSlideOver: () =>
    set({ slideOverOpen: false, slideOverType: null, slideOverId: null }),
}));
