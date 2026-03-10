// /lib/types.ts — TypeScript interfaces for all data models

export interface KPIData {
  current_period: {
    gross_margin_pct: number;
    cost_per_gb_normalized: number;
    total_volume_tb: number;
    monthly_revenue: number;
  };
  prior_period: {
    gross_margin_pct: number;
    cost_per_gb_normalized: number;
    total_volume_tb: number;
    monthly_revenue: number;
  };
  sparkline_6mo: {
    gross_margin: number[];
    cost_per_gb: number[];
    volume_tb: number[];
    revenue: number[];
  };
  scaling_narrative: {
    cost_change_pct: number;
    volume_change_pct: number;
    unit_cost_change_pct: number;
    assessment: string;
  };
}

export interface COGSMonthly {
  month: string;
  label: string;
  cloud: number;
  licenses: number;
  support: number;
  devops: number;
  total: number;
  revenue: number;
  cogs_pct: number;
  anomaly?: boolean;
}

export interface SharedCostsMethods {
  volume_weighted: Record<string, number>;
  even_split: Record<string, number>;
  usage_based: Record<string, number>;
}

export interface COGSData {
  monthly: COGSMonthly[];
  shared_costs: {
    total_k: number;
    methods: SharedCostsMethods;
    unallocated_pct: number;
  };
}

export interface DataPlaneMonthly {
  month: string;
  revenue: number;
  cogs: number;
  shared: number;
  payroll: number;
  gm_pct: number;
  gm_payroll_pct: number;
}

export interface DataPlane {
  id: string;
  name: string;
  description?: string;
  color: string;
  budget_k: number;
  budget_used_k: number;
  monthly: DataPlaneMonthly[];
}

export interface DataPlanesData {
  planes: DataPlane[];
}

export interface PipelineCostBreakdown {
  cloud: number;
  licenses: number;
  support: number;
  payroll: number;
}

export interface Pipeline {
  id: string;
  name: string;
  source: string;
  destination: string;
  data_plane: string;
  product?: string;
  events_m: number;
  volume_gb: number;
  revenue_k: number;
  cost_k: number;
  cost_per_gb: number;
  gm_pct_by_volume: number;
  gm_pct_by_count: number;
  cost_breakdown: PipelineCostBreakdown;
  anomaly?: boolean;
  anomaly_detail?: string;
  budget_k: number;
  budget_used_k: number;
  complexity_steps?: number;
}

export interface AnomalyActive {
  pipeline_id: string;
  message: string;
  detected: string;
}

export interface PipelinesData {
  pipelines: Pipeline[];
  anomalies_summary: {
    count_30d: number;
    total_impact_k: number;
    active: AnomalyActive[];
  };
}

export interface WaterfallStep {
  name: string;
  value: number;
  base: number;
  type: "positive" | "negative" | "subtotal" | "allocation" | "total";
}

export interface WaterfallData {
  steps: WaterfallStep[];
  summary: {
    gross_profit_k: number;
    gross_profit_pct: number;
    net_margin_k: number;
    net_margin_pct: number;
  };
}
