// /lib/colors.ts — DataBahn Brand Color Scheme (dark-mode-first)

export const colors = {
  // ─── BRAND FOUNDATIONS (from databahn.ai) ───
  bgPrimary: "#0F172A",
  bgSecondary: "#111827",
  bgTertiary: "#1F2937",
  bgSurface: "#1E293B",

  accent: "#00D4FF",
  accentMuted: "#00D4FF20",
  accentHover: "#33DDFF",
  accentDark: "#0099CC",

  purple: "#7C3AED",
  purpleMuted: "#7C3AED20",
  purpleLight: "#A78BFA",

  gradientStart: "#00D4FF",
  gradientEnd: "#7C3AED",

  border: "#1E2D4D",
  borderLight: "#2A3A5C",
  borderAccent: "#00D4FF30",

  textPrimary: "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  textAccent: "#00D4FF",

  // ─── SEMANTIC COLORS ───
  marginGreen: "#22C55E",
  marginYellow: "#EAB308",
  marginRed: "#EF4444",

  cogsCloud: "#00D4FF",
  cogsLicenses: "#7C3AED",
  cogsSupport: "#F59E0B",
  cogsDevops: "#10B981",

  planeSecurity: "#00D4FF",
  planeObservability: "#38BDF8",
  planeApplication: "#A78BFA",
  planeIoTOT: "#F59E0B",

  productSmartEdge: "#06B6D4",
  productHighway: "#00D4FF",
  productCruz: "#7C3AED",
  productReef: "#F59E0B",

  budgetOnTrack: "#22C55E",
  budgetWarning: "#F59E0B",
  budgetOver: "#EF4444",

  anomalyDot: "#EF4444",
  anomalyBg: "#EF444415",
};

export function getMarginColor(gm: number): string {
  if (gm > 75) return colors.marginGreen;
  if (gm > 60) return colors.marginYellow;
  return colors.marginRed;
}

export function getMarginStatus(gm: number): string {
  if (gm > 75) return "HEALTHY";
  if (gm > 60) return "WATCH";
  return "AT RISK";
}
