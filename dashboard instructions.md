# DataBahn.ai — Internal Cost & Margin Dashboard: Build Instructions

> **Purpose:** This document is the single source of truth for building DataBahn.ai's internal cost and margin dashboard. It contains all context, design decisions, data models, component specs, interaction patterns, and visual references needed to build the complete UI. Read this entire document before writing any code.

---

## TABLE OF CONTENTS

1. [Company Context](#1-company-context)
2. [Dashboard Purpose & Users](#2-dashboard-purpose--users)
3. [Tech Stack](#3-tech-stack)
4. [Design System](#4-design-system)
5. [Core Concepts — How This Dashboard Thinks](#5-core-concepts--how-this-dashboard-thinks)
6. [Global Layout & Navigation](#6-global-layout--navigation)
7. [Component Specifications](#7-component-specifications)
8. [Data Models & Mock Data](#8-data-models--mock-data)
9. [Interaction Patterns](#9-interaction-patterns)
10. [State Management](#10-state-management)
11. [File Structure](#11-file-structure)
12. [Implementation Sequence](#12-implementation-sequence)
13. [Acceptance Criteria](#13-acceptance-criteria)

---

## 1. COMPANY CONTEXT

**DataBahn.ai** is a Series A security data pipeline platform ($17M raised, led by Forgepoint Capital). They process enterprise telemetry data — security logs, observability metrics, IoT/OT signals — through pipelines that route data from sources to destinations.

### DataBahn's Four Products (= "Data Planes")

| Product | Code Name | What It Does |
|---|---|---|
| **Smart Edge** | `smart_edge` | Collects data from cloud, on-prem, and vendor sources using agentless technology and edge analytics |
| **Highway** | `highway` | Routes, transforms, and delivers data across destinations — the core pipeline engine |
| **Cruz** | `cruz` | Agentic AI that automates data engineering tasks — connector building, pipeline orchestration, self-healing |
| **Reef** | `reef` | Turns raw data into contextual insights using graph-database technology and AI agents |

### What a "Pipeline" Means at DataBahn

A pipeline is a **data path from source to destination** — e.g., "AWS CloudTrail → Splunk" or "Palo Alto Networks → S3 Data Lake". Each pipeline:
- Belongs to one Data Plane
- Processes a measurable volume of data (in GB)
- Processes a measurable count of events
- Has associated costs (cloud infra, licenses, support, payroll)
- Generates revenue
- Therefore has a calculable **gross margin**

This pipeline-level economics visibility is what makes this dashboard unique. No competitor (Cribl, CloudZero, Datadog, Vantage) shows cost and margin at this granularity.

---

## 2. DASHBOARD PURPOSE & USERS

### What This Dashboard Answers

1. **Where does DataBahn make money?** → GM by Data Plane, GM by Pipeline
2. **Where does it leak?** → Low-margin pipelines, high cost/GB outliers, unallocated shared costs
3. **How efficiently does it scale?** → Cost/GB trend, unit economics (rising volume + falling unit cost = healthy)
4. **Are we on budget?** → Budget vs. actual by Data Plane
5. **What just changed?** → Anomaly detection, Cost of Change indicators

### User Phases

| Phase | Users | What They See |
|---|---|---|
| Phase 1 (Now) | Internal — Finance, Product, Eng Leadership | Everything |
| Phase 2 | Engineering teams | Pipeline economics, cost/GB, anomalies for their pipelines |
| Phase 3 | Board / Investors | Summary GM, unit economics, SaaS benchmark comparison |

### Deliverable Format
- **Interactive dashboard** — live, filterable, drill-down capable
- **Downloadable reports** — PDF (branded) and CSV (raw data) exports
- **Slack digests** — weekly and monthly summaries (design the format; actual Slack integration is out of scope for now)

---

## 3. TECH STACK

```
Framework:        Next.js 14+ (App Router)
UI Library:       shadcn/ui + Tailwind CSS
Charts:           Recharts (all charts EXCEPT Sankey)
Sankey Diagram:   D3.js (d3-sankey)
State:            Zustand (global filter state)
Data:             Static JSON files in /data directory
PDF Export:       html2canvas + jsPDF
CSV Export:       papaparse
Icons:            lucide-react
Fonts:            Inter (UI) + JetBrains Mono (numbers/metrics)
```

**Do NOT use:**
- localStorage or sessionStorage (not supported in artifact environment)
- Any chart library other than Recharts + D3
- Any UI library other than shadcn/ui
- Server-side data fetching (all data is static JSON for this build)

---

## 4. DESIGN SYSTEM

### 4.1 Color Tokens

```typescript
// /lib/colors.ts

export const colors = {
  // Core
  bg: "#F8FAFC",           // Page background (slate-50)
  surface: "#FFFFFF",       // Card background
  surfaceDark: "#1E293B",  // Dark mode card
  border: "#E2E8F0",       // Card borders (slate-200)
  borderDark: "#334155",   // Dark mode borders

  // Brand
  accent: "#3B82F6",       // DataBahn blue (blue-500)
  accentLight: "#3B82F610", // Blue tint for backgrounds

  // Text
  textPrimary: "#0F172A",  // Headings, primary text (slate-900)
  textSecondary: "#64748B", // Body text (slate-500)
  textMuted: "#94A3B8",    // Labels, captions (slate-400)

  // Margin Health (used everywhere margins are displayed)
  marginGreen: "#22C55E",  // GM > 75% — "Healthy"
  marginYellow: "#EAB308", // GM 60-75% — "Watch"
  marginRed: "#EF4444",    // GM < 60% — "At Risk"

  // COGS Categories (stacked bar colors)
  cogsCloud: "#3B82F6",    // Cloud Infrastructure (blue-500)
  cogsLicenses: "#8B5CF6", // Third-Party Licenses (violet-500)
  cogsSupport: "#F59E0B",  // Support Labor (amber-500)
  cogsDevops: "#10B981",   // DevOps (emerald-500)

  // Data Planes (consistent across all views)
  planeSmartEdge: "#06B6D4", // cyan-500
  planeHighway: "#3B82F6",   // blue-500
  planeCruz: "#8B5CF6",      // violet-500
  planeReef: "#F59E0B",      // amber-500

  // Budget
  budgetOnTrack: "#22C55E",
  budgetWarning: "#F59E0B",  // >80% of budget
  budgetOver: "#EF4444",     // >100% of budget

  // Anomaly
  anomalyDot: "#EF4444",
  anomalyBg: "#FEF2F2",
};

// Helper function — use this everywhere margins are displayed
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
```

### 4.2 Typography

```css
/* In globals.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

/* Usage rules:
   - ALL UI text: font-family: 'Inter', sans-serif
   - ALL numbers, metrics, percentages, dollar amounts: font-family: 'JetBrains Mono', monospace
   - This separation makes metrics scannable at a glance
*/
```

### 4.3 Card Component

Every panel on the dashboard is a Card. Use this exact styling:

```
Background:     white (#FFFFFF)
Border:         1px solid #E2E8F0
Border-radius:  12px
Shadow:         0 1px 3px rgba(0,0,0,0.04)
Padding:        20px (inner content), 24px (for larger panels)
```

### 4.4 Section Headers

Inside each card, section headers look like this:

```
Font-size:      11px
Font-weight:    700
Text-transform: uppercase
Letter-spacing: 1.2px
Color:          #94A3B8 (textMuted)
Margin-bottom:  12px
```

### 4.5 Badges

Used to label margin health status:

```
Font-size:      10px
Font-weight:    700
Padding:        2px 8px
Border-radius:  99px
Background:     {marginColor}18  (color at 18% opacity)
Color:          {marginColor}
```

---

## 5. CORE CONCEPTS — HOW THIS DASHBOARD THINKS

These are the design principles extracted from studying CloudZero, Datadog, Vantage, and Cribl. Every component you build must follow these.

### Concept 1: Cost of Change — Always Lead With What Changed

**Source:** CloudZero Explorer shows "Cost of Change" (absolute $ and %) as the first thing in every view.

**Rule:** Every KPI card, every chart panel header, every table row MUST show the delta vs. prior period alongside the absolute value. The delta gets a color (green = good direction, red = bad direction) and an arrow (▲/▼).

**Example:**
```
Gross Margin: 72.4%  ▲ 3.3pp vs prior    (green — up is good for margin)
Cost/GB:      $0.085 ▼ 8.2% vs prior     (green — down is good for cost)
```

**Important:** "Good direction" depends on the metric. For margins and revenue, up = green. For costs and cost/GB, down = green.

### Concept 2: Dimensions — One Dashboard, Multiple Lenses

**Source:** CloudZero's Dimensions model — every cost view can be pivoted by a different grouping.

**Rule:** The dashboard has a global "Group By" control. When changed, it re-renders the main panels to group by the selected Dimension:
- **Group by Data Plane** (default) — panels show Smart Edge, Highway, Cruz, Reef
- **Group by Pipeline** — panels show individual source→destination paths
- **Group by Cost Category** — panels show Cloud, Licenses, Support, DevOps
- **Group by Destination** — panels show Splunk, Sentinel, S3, Snowflake, etc.

Not every panel needs to re-render for every Group By. The KPI cards stay the same. The COGS chart stays the same. The margin chart and pipeline economics re-group.

### Concept 3: Unit Economics Narrative

**Source:** CloudZero's unit cost analytics and "cost per widget" philosophy.

**Rule:** Never show total cost in isolation. Always pair it with a unit cost (cost/GB, cost/pipeline, cost/event) and a demand metric (volume processed). The key narrative to surface:

```
Total costs ▲ 12%  |  Volume ▲ 18%  |  Cost/GB ▼ 8.2%
→ "Costs are rising, but unit costs are falling. This is healthy scaling."
```

Show this narrative explicitly in the KPI section as a one-line summary.

### Concept 4: Anomalies Are First-Class Citizens

**Source:** CloudZero puts anomalies on the homepage, overlays them on Explorer charts, and sends them to Slack.

**Rule:** Anomalies are NOT a separate page. They appear:
1. As **red dot indicators** on any chart data point that has an active anomaly
2. As a **top-of-dashboard alert strip** when any anomaly is active in the last 7 days
3. As **red row highlights** in the pipeline table for pipelines with cost anomalies
4. In the **Slack digest format** (design the message template even though actual Slack integration is out of scope)

### Concept 5: Views for Different Audiences

**Source:** CloudZero's Views system — pre-configured filtered views connected to specific teams.

**Rule:** Build a "View Switcher" in the header with 3 pre-built views:
- **Engineering View** — Shows all panels, defaults to Group by Pipeline, includes anomaly detail
- **Finance View** — Shows KPIs + COGS + Margin + Budget panels, defaults to Group by Data Plane
- **Board View** — Shows only KPIs + GM trend + Unit Economics + Benchmark comparison, simplified layout

### Concept 6: Progressive Drill-Down

**Source:** CloudZero's Explorer lets you click any Dimension element to drill into its constituents.

**Rule:** Every bar, every dot, every table row is clickable. Clicking opens a **slide-over detail panel** (right side, 400px wide) showing:
- Full cost breakdown for the clicked element
- Time-series chart for that element's cost/margin history
- Related anomalies
- Budget vs. actual (if a budget is set)

### Concept 7: Budget Guardrails

**Source:** CloudZero Budgets with Slack alerts when trending over.

**Rule:** Each Data Plane has a COGS budget. Show budget utilization as:
- A thin progress bar at the bottom of each Data Plane's margin bar
- Color-coded: green (<80%), amber (80-100%), red (>100%)
- Label: "$130K of $135K (96.3%)"

---

## 6. GLOBAL LAYOUT & NAVIGATION

### 6.1 Page Structure

```
┌─────────────────────────────────────────────────────────┐
│  STICKY HEADER (z-50, white bg, bottom border)          │
│  Logo | Title | View Switcher | Group By | Filters      │
├─────────────────────────────────────────────────────────┤
│  ANOMALY ALERT STRIP (conditional — only if active)     │
├─────────────────────────────────────────────────────────┤
│  SCALING NARRATIVE (one-line summary)                    │
├───────────────────────┬─────────────────────────────────┤
│  KPI CARDS (4 cards   │  (KPI cards span full width     │
│  in a row)            │   in a single flex row)         │
├───────────────────────┼─────────────────────────────────┤
│  COGS BREAKDOWN       │  MARGIN BY DATA PLANE           │
│  (stacked bar +       │  (bar chart + heatmap +         │
│   allocation)         │   budget progress)              │
├───────────────────────┴─────────────────────────────────┤
│  PIPELINE ECONOMICS (full width)                        │
│  Tabs: Scatter | Rankings Table | Data Flow             │
├─────────────────────────────────────────────────────────┤
│  MARGIN WATERFALL (full width)                          │
│  Revenue → COGS → Shared → Payroll → Net Margin        │
├─────────────────────────────────────────────────────────┤
│  SLACK DIGEST PREVIEW (design template)                 │
└─────────────────────────────────────────────────────────┘
│  SLIDE-OVER PANEL (400px, right side, on drill-down)    │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Sticky Header Spec

```
Height:          60px
Background:      white
Border-bottom:   1px solid #E2E8F0
Padding:         14px 24px
Position:        sticky, top: 0, z-index: 50
Layout:          flex, space-between, align-center
```

**Left side:**
- DataBahn logo (32x32 rounded square, gradient blue→violet, white "D" in center)
- Title: "DataBahn.ai" (15px, bold) + subtitle: "Internal Cost & Margin Dashboard" (11px, muted)

**Right side (flex row, 8px gap):**
1. **View Switcher** — 3 pill buttons: `Engineering` | `Finance` | `Board` — active state = accent bg + white text
2. **Group By dropdown** — `<select>`: Data Plane | Pipeline | Cost Category | Destination
3. **Date Range pills** — `30d` | `90d` | `6mo` | `12mo` — active state = accent bg + white text
4. **Data Plane Filter** — `<select>`: All | Smart Edge | Highway | Cruz | Reef
5. **Export button** — accent bg, white text, "↓ Export" — dropdown on click: PDF Report | CSV Data

### 6.3 Anomaly Alert Strip

Shown only when there are active anomalies in the last 7 days. Full width, positioned below header.

```
Background:      #FEF2F2 (red-50)
Border:          1px solid #FECACA (red-200)
Padding:         10px 24px
Layout:          flex, space-between
Left:            🔴 icon + "2 cost anomalies detected in the last 7 days — $4,200 impact"
Right:           "View Details →" link button
```

### 6.4 Scaling Narrative Line

A single-line summary below the alert strip (or below header if no alerts):

```
Background:      #F0F9FF (sky-50) or accent at 5% opacity
Padding:         8px 24px
Font-size:       13px
Content example: "Mar 2026: Total costs ▲12% · Volume ▲18% · Cost/GB ▼8.2% — Scaling efficiently"
```

Color the arrows: cost ▲ = red text, volume ▲ = green text, cost/GB ▼ = green text.

---

## 7. COMPONENT SPECIFICATIONS

### 7.1 KPI Cards — `KPICards.tsx`

**Layout:** 4 cards in a single row (grid-cols-4). On mobile, 2x2 grid.

**Each card contains:**

```
┌──────────────────────────────────┐
│  LABEL (11px, uppercase, muted)  │
│                                  │
│  VALUE (28px, bold, mono)  SPARK │
│  ▲ 3.3pp vs prior (12px, green) │
│                                  │
│  "vs prior period" (11px, muted) │
└──────────────────────────────────┘
```

**The 4 KPI cards:**

| # | Label | Value Format | Good Direction | Sparkline Color |
|---|---|---|---|---|
| 1 | Gross Margin | `72.4%` | ▲ up | marginGreen |
| 2 | Cost per GB (Normalized) | `$0.0847` | ▼ down | accent |
| 3 | Volume Processed | `284.6 TB` | ▲ up | planeSmartEdge |
| 4 | Monthly Revenue | `$1.25M` | ▲ up | marginGreen |

**Sparkline spec:**
- Recharts `<LineChart>` with NO axes, NO grid, NO labels, NO dot
- Width: 80px, Height: 28px
- Stroke: 2px, color from table above
- Data: 6 points (last 6 months)
- Positioned: absolute right within the card, vertically centered with the VALUE

**Delta calculation:**
- For percentage metrics (GM%): show difference in percentage points → "▲ 3.3pp"
- For dollar/volume metrics: show percentage change → "▲ 15.7%"
- Color: green if moving in "good direction", red if moving in "bad direction"

---

### 7.2 COGS Breakdown — `COGSBreakdown.tsx`

**Card contains two sections stacked vertically, separated by a border-top.**

#### Section A: Stacked Bar Chart — Monthly COGS by Category

```
Chart type:     Recharts <ComposedChart>
X-axis:         Months (Oct, Nov, Dec, Jan, Feb, Mar)
Y-axis (left):  Dollar amount ($K) — for stacked bars
Y-axis (right): Percentage (%) — for the overlay line
Bars:           Stacked, in this order bottom→top:
                  1. Cloud Infra (blue-500)
                  2. Licenses (violet-500)
                  3. Support (amber-500)
                  4. DevOps (emerald-500)
                Top bar gets radius: [4, 4, 0, 0]
Line overlay:   COGS as % of Revenue — dashed red line with dots (right Y-axis)
```

**Legend:** Below the chart, centered, using colored squares + labels. 5 items.

**Anomaly overlay:** If any month has a COGS anomaly, show a small red dot above that month's bar.

#### Section B: Shared Cost Allocation

```
Header:         "Shared Cost Allocation — $98K"
Controls:       3 tab buttons: Volume-Weighted | Even Split | Usage-Based
                Active tab = accent bg with white text
Visualization:  Horizontal bar chart for each Data Plane showing allocated amount
                Each bar = Data Plane color, width proportional to allocation
                Label inside bar: "$31.4K" (white, bold, 10px)
Unallocated:    Small card on the right showing "12.4% UNALLOCATED" in red
```

**Behavior:** Clicking a different allocation method tab immediately re-renders the bars with the new allocation values. Use animation/transition on bar widths (0.4s ease).

---

### 7.3 Margin by Data Plane — `MarginByPlane.tsx`

**Card with two toggleable views and a payroll checkbox.**

#### Controls Bar (top of card):
```
Left:    Section header "GROSS MARGIN BY DATA PLANE"
Right:   [Bar] [Heatmap] toggle  |  ☐ Include Payroll  checkbox
```

#### View A: Bar Chart (default)

For each Data Plane (sorted by GM% descending):

```
┌─────────────────────────────────────────────┐
│  [■] Smart Edge               76.8%  HEALTHY│
│  ████████████████████████████░░░░░░│░░░░░░░░│
│                               ↑ 75% benchmark│
│                                              │
│  [■] Highway                  74.0%  WATCH   │
│  ███████████████████████████░░░░░░│░░░░░░░░░│
│                                              │
│  ... etc for Cruz and Reef                   │
└─────────────────────────────────────────────┘
```

**Bar implementation:**
- Full-width bar container: background #F1F5F9, border-radius 6px, height 28px
- Filled bar: width = GM%, background = linear-gradient of Data Plane color, border-radius 6px, height 28px
- When "Include Payroll" is checked: show a second, lighter bar behind the main bar (payroll-loaded GM), and animate the main bar to shrink to payroll-loaded GM% width
- **Benchmark line**: vertical dashed line at 75% position, with tiny label "75% SaaS" above it

**Budget progress (below each bar):**
```
Thin bar (4px height): shows budget utilization
Label: "$130K of $135K budget (96.3%)"
Color: green <80%, amber 80-100%, red >100%
```

#### View B: Heatmap

```
Grid: Rows = Data Planes, Columns = 6 months (Oct-Mar)
Each cell:
  - Background: margin color at 20% opacity
  - Border: 1px solid margin color at 40% opacity
  - Border-radius: 6px
  - Content: GM% in bold monospace, colored by margin health
  - Padding: 8px 4px
```

#### Sub-section: Payroll Allocation Detail

Below the chart/heatmap, separated by border-top:

```
Header:  "PAYROLL ALLOCATION DETAIL"
Table:   Role | FTE | Monthly Cost | Allocation Method
Rows:
  DevOps Engineers    | 4 FTE | $34K/mo | Volume-weighted
  SRE                | 2 FTE | $22K/mo | Even-split
  Support Engineers   | 3 FTE | $30K/mo | Ticket-based
```

---

### 7.4 Pipeline Economics — `PipelineEconomics.tsx`

**Full-width card with 3 tabs.**

#### Tab Bar:
```
[Scatter Plot]  [Rankings Table]  [Data Flow]
Active tab = accent background + white text
```

#### Tab 1: Scatter Plot

```
Chart type:     Recharts <ScatterChart>
X-axis:         Volume (GB processed) — formatted as "3.8K GB"
Y-axis:         Cost per GB ($) — formatted as "$0.037"
Each dot:       = one pipeline
Dot size:       proportional to revenue (min 6px, max = revenue / 6)
Dot color:      margin health color (green >75%, yellow 60-75%, red <60%)
Dot opacity:    0.8
```

**Quadrant labels (positioned at corners of the chart):**
- Bottom-right: "High Volume, Low Cost — IDEAL" (green badge)
- Top-left: "Low Volume, High Cost — REVIEW" (red badge)

**Tooltip on hover:**
```
Pipeline name (bold)
Source → Destination
Volume: 3,842 GB
Cost/GB: $0.037
GM: 75.5% (colored)
Revenue: $58K
```

#### Tab 2: Rankings Table

```
Columns (all sortable by clicking header):
  Pipeline Name | Source | Destination | Volume (GB) | Cost/GB | Revenue ($) | GM%

Default sort: GM% ascending (worst margins first = shows problems first)
Sort indicator: ▲/▼ arrow next to active sort column header

Row styling:
  - GM < 50%: background #FEF2F2 (light red)
  - GM 50-75%: background #FFFBEB (light yellow)
  - GM > 75%: background white

  - GM column gets a colored badge: HEALTHY/WATCH/AT RISK

Row expandable: clicking a row expands it to show cost breakdown:
  ┌─────────────────────────────────────────────┐
  │  Cloud: $8,200  |  Licenses: $2,100  |       │
  │  Support: $2,400  |  Payroll: $1,500         │
  │  [View Full Details →]                        │
  └─────────────────────────────────────────────┘

Top filter bar: [Bottom 10] [Top 10] [All] toggle
```

#### Tab 3: Data Flow (Sankey-style)

Since a true Sankey requires D3 and is complex, build a **simplified flow visualization using SVG:**

```
Left column:    Source nodes (rounded rect, accent-tint background)
Center:         "DataBahn — Transform + Route" label (rounded rect, accent background)
Right column:   Destination nodes (rounded rect, green-tint background)
Connections:    Curved SVG paths from source → center → destination
                Path thickness = proportional to volume
                Path color = margin health color at 50% opacity
```

**Legend below:**
```
[green line] GM >75%  |  [yellow line] GM 60-75%  |  [red line] GM <60%  |  Line thickness = volume
```

---

### 7.5 Margin Waterfall — `MarginWaterfall.tsx`

**Full-width card below the main grid.**

```
Chart type:     Recharts <BarChart> with stacked bars (invisible base + visible segment)
Bars:           Each bar = invisible base (transparent) + visible segment (colored)

Steps (left to right):
  1. Revenue        | base: 0,    value: 1250  | green
  2. Cloud Infra    | base: 1068, value: -182  | red
  3. Licenses       | base: 1025, value: -43   | red
  4. Support        | base: 965,  value: -60   | red
  5. DevOps         | base: 915,  value: -50   | red
  6. Gross Profit   | base: 0,    value: 915   | green
  7. Shared Costs   | base: 817,  value: -98   | orange
  8. Payroll Alloc  | base: 731,  value: -86   | orange
  9. Net Margin     | base: 0,    value: 731   | accent blue

X-axis:  Step labels (rotated if needed for mobile)
Y-axis:  $K format
```

**Summary below chart:**
```
Two metric blocks, centered, separated by a divider:
  Gross Profit: $915K (73.2%)    |    Net Margin: $731K (58.5%)
  Font-size: 22px, bold, monospace
  Gross Profit = green, Net Margin = accent blue
```

**Behavior:** This waterfall re-calculates when a Data Plane or Pipeline filter is applied (scoped to filtered data).

---

### 7.6 Slack Digest Preview — `SlackDigestPreview.tsx`

**A card at the bottom showing what the weekly Slack digest would look like.**

Design it as a mock Slack message with:
```
┌──────────────────────────────────────────────────────┐
│  📊 DataBahn Weekly Cost Digest — Mar 3, 2026        │
│                                                       │
│  Overall GM: 72.4% (▲ 3.3pp)                         │
│  Cost/GB: $0.085 (▼ 8.2%)                            │
│  Volume: 284.6 TB (▲ 18.0%)                          │
│                                                       │
│  Top Movers This Week:                                │
│  🟢 Smart Edge: GM 76.8% (+1.2pp) — $375K revenue    │
│  🟡 Highway: GM 74.0% (+1.2pp) — $500K revenue       │
│  🔴 Cruz: GM 68.0% (+2.6pp) — needs review           │
│                                                       │
│  ⚠️ Anomalies: 2 detected ($4.2K impact)             │
│  • Okta → Exabeam: cost/GB spiked 142%               │
│  • GCP Audit → BigQuery: volume dropped 38%           │
│                                                       │
│  Budget Status: Highway at 96.3% of monthly budget    │
│                                                       │
│  [View Dashboard →]                                    │
└──────────────────────────────────────────────────────┘
```

Style this to look like an actual Slack message (white bg, left accent border, rounded corners, monospace for numbers).

---

### 7.7 Slide-Over Panel — `SlideOverPanel.tsx`

**Right-side panel, 420px wide, slides in from the right when a pipeline or data plane is clicked.**

```
Background:    white
Border-left:   1px solid #E2E8F0
Shadow:        -4px 0 20px rgba(0,0,0,0.08)
Padding:       24px
Z-index:       40
Transition:    transform 0.3s ease (slide from right)
Overlay:       semi-transparent black overlay on rest of page
```

**Content (for a pipeline drill-down):**
```
Header:        Pipeline name (bold, 18px) + close X button
Badges:        Data Plane badge + Margin health badge

Metrics grid (2x2):
  Volume: 3,842 GB    | Events: 48.2M
  Revenue: $58K       | Total Cost: $14.2K

GM bar:        Full-width bar showing GM% with benchmark line

Cost breakdown (stacked horizontal bar):
  Cloud $8.2K | Licenses $2.1K | Support $2.4K | Payroll $1.5K

Trend chart:   6-month line chart of this pipeline's cost/GB trend

Anomaly section (if any):
  Red alert box: "Cost/GB spiked 42% on Feb 18"

Budget section (if budget set):
  Progress bar with utilization %

Actions:
  [Create JIRA Ticket]  [Export CSV]  [View in Explorer]
```

---

## 8. DATA MODELS & MOCK DATA

### 8.1 `/data/kpis.json`

```json
{
  "current_period": {
    "gross_margin_pct": 72.4,
    "cost_per_gb_normalized": 0.0847,
    "total_volume_tb": 284.6,
    "monthly_revenue": 1250000
  },
  "prior_period": {
    "gross_margin_pct": 69.1,
    "cost_per_gb_normalized": 0.0923,
    "total_volume_tb": 241.2,
    "monthly_revenue": 1080000
  },
  "sparkline_6mo": {
    "gross_margin": [65.2, 67.8, 68.5, 69.1, 71.0, 72.4],
    "cost_per_gb": [0.112, 0.104, 0.098, 0.092, 0.089, 0.085],
    "volume_tb": [180, 195, 212, 241, 262, 285],
    "revenue": [820000, 890000, 960000, 1080000, 1160000, 1250000]
  },
  "scaling_narrative": {
    "cost_change_pct": 12.0,
    "volume_change_pct": 18.0,
    "unit_cost_change_pct": -8.2,
    "assessment": "healthy"
  }
}
```

### 8.2 `/data/cogs.json`

```json
{
  "monthly": [
    { "month": "2025-10", "label": "Oct", "cloud": 142, "licenses": 38, "support": 52, "devops": 44, "total": 276, "revenue": 820, "cogs_pct": 33.7 },
    { "month": "2025-11", "label": "Nov", "cloud": 151, "licenses": 39, "support": 54, "devops": 45, "total": 289, "revenue": 890, "cogs_pct": 32.5 },
    { "month": "2025-12", "label": "Dec", "cloud": 158, "licenses": 40, "support": 55, "devops": 47, "total": 300, "revenue": 960, "cogs_pct": 31.3 },
    { "month": "2026-01", "label": "Jan", "cloud": 168, "licenses": 41, "support": 57, "devops": 48, "total": 314, "revenue": 1080, "cogs_pct": 29.1 },
    { "month": "2026-02", "label": "Feb", "cloud": 175, "licenses": 42, "support": 58, "devops": 49, "total": 324, "revenue": 1160, "cogs_pct": 27.9 },
    { "month": "2026-03", "label": "Mar", "cloud": 182, "licenses": 43, "support": 60, "devops": 50, "total": 335, "revenue": 1250, "cogs_pct": 26.8, "anomaly": true }
  ],
  "shared_costs": {
    "total_k": 98,
    "methods": {
      "volume_weighted": { "smart_edge": 31.4, "highway": 39.2, "cruz": 11.7, "reef": 15.7 },
      "even_split": { "smart_edge": 24.5, "highway": 24.5, "cruz": 24.5, "reef": 24.5 },
      "usage_based": { "smart_edge": 28.4, "highway": 42.1, "cruz": 9.8, "reef": 17.6 }
    },
    "unallocated_pct": 12.4
  }
}
```

### 8.3 `/data/data_planes.json`

```json
{
  "planes": [
    {
      "id": "smart_edge",
      "name": "Smart Edge",
      "color": "#06B6D4",
      "budget_k": 100,
      "budget_used_k": 87,
      "monthly": [
        { "month": "Oct", "revenue": 246, "cogs": 72, "shared": 9.4, "payroll": 18, "gm_pct": 70.7, "gm_payroll_pct": 59.6 },
        { "month": "Nov", "revenue": 267, "cogs": 74, "shared": 9.6, "payroll": 18.5, "gm_pct": 72.3, "gm_payroll_pct": 61.8 },
        { "month": "Dec", "revenue": 288, "cogs": 76, "shared": 9.8, "payroll": 19, "gm_pct": 73.6, "gm_payroll_pct": 63.7 },
        { "month": "Jan", "revenue": 324, "cogs": 82, "shared": 10.2, "payroll": 19.5, "gm_pct": 74.7, "gm_payroll_pct": 65.5 },
        { "month": "Feb", "revenue": 348, "cogs": 84, "shared": 10.4, "payroll": 20, "gm_pct": 75.9, "gm_payroll_pct": 67.1 },
        { "month": "Mar", "revenue": 375, "cogs": 87, "shared": 10.6, "payroll": 20.5, "gm_pct": 76.8, "gm_payroll_pct": 68.5 }
      ]
    },
    {
      "id": "highway",
      "name": "Highway",
      "color": "#3B82F6",
      "budget_k": 135,
      "budget_used_k": 130,
      "monthly": [
        { "month": "Oct", "revenue": 328, "cogs": 105, "shared": 11.8, "payroll": 24, "gm_pct": 68.0, "gm_payroll_pct": 57.1 },
        { "month": "Nov", "revenue": 356, "cogs": 109, "shared": 12, "payroll": 24.5, "gm_pct": 69.4, "gm_payroll_pct": 59.1 },
        { "month": "Dec", "revenue": 384, "cogs": 114, "shared": 12.4, "payroll": 25, "gm_pct": 70.3, "gm_payroll_pct": 60.8 },
        { "month": "Jan", "revenue": 432, "cogs": 122, "shared": 12.8, "payroll": 25.5, "gm_pct": 71.8, "gm_payroll_pct": 62.9 },
        { "month": "Feb", "revenue": 464, "cogs": 126, "shared": 13.2, "payroll": 26, "gm_pct": 72.8, "gm_payroll_pct": 64.4 },
        { "month": "Mar", "revenue": 500, "cogs": 130, "shared": 13.6, "payroll": 26.5, "gm_pct": 74.0, "gm_payroll_pct": 66.0 }
      ]
    },
    {
      "id": "cruz",
      "name": "Cruz",
      "color": "#8B5CF6",
      "budget_k": 65,
      "budget_used_k": 60,
      "monthly": [
        { "month": "Oct", "revenue": 123, "cogs": 48, "shared": 3.5, "payroll": 15, "gm_pct": 61.0, "gm_payroll_pct": 45.9 },
        { "month": "Nov", "revenue": 133.5, "cogs": 50, "shared": 3.6, "payroll": 15.2, "gm_pct": 62.5, "gm_payroll_pct": 47.8 },
        { "month": "Dec", "revenue": 144, "cogs": 52, "shared": 3.7, "payroll": 15.5, "gm_pct": 63.9, "gm_payroll_pct": 49.8 },
        { "month": "Jan", "revenue": 162, "cogs": 56, "shared": 3.85, "payroll": 15.8, "gm_pct": 65.4, "gm_payroll_pct": 55.8 },
        { "month": "Feb", "revenue": 174, "cogs": 58, "shared": 3.95, "payroll": 16, "gm_pct": 66.7, "gm_payroll_pct": 55.2 },
        { "month": "Mar", "revenue": 187.5, "cogs": 60, "shared": 4.1, "payroll": 16.2, "gm_pct": 68.0, "gm_payroll_pct": 57.2 }
      ]
    },
    {
      "id": "reef",
      "name": "Reef",
      "color": "#F59E0B",
      "budget_k": 45,
      "budget_used_k": 38,
      "monthly": [
        { "month": "Oct", "revenue": 123, "cogs": 32, "shared": 4.7, "payroll": 12, "gm_pct": 74.0, "gm_payroll_pct": 60.4 },
        { "month": "Nov", "revenue": 133.5, "cogs": 33, "shared": 4.8, "payroll": 12.2, "gm_pct": 75.3, "gm_payroll_pct": 62.5 },
        { "month": "Dec", "revenue": 144, "cogs": 34, "shared": 4.9, "payroll": 12.5, "gm_pct": 76.4, "gm_payroll_pct": 64.3 },
        { "month": "Jan", "revenue": 162, "cogs": 36, "shared": 5.1, "payroll": 12.8, "gm_pct": 77.8, "gm_payroll_pct": 66.8 },
        { "month": "Feb", "revenue": 174, "cogs": 37, "shared": 5.25, "payroll": 13, "gm_pct": 78.7, "gm_payroll_pct": 68.2 },
        { "month": "Mar", "revenue": 187.5, "cogs": 38, "shared": 5.4, "payroll": 13.2, "gm_pct": 79.7, "gm_payroll_pct": 69.8 }
      ]
    }
  ]
}
```

### 8.4 `/data/pipelines.json`

```json
{
  "pipelines": [
    { "id": "pipe-001", "name": "CloudTrail → Splunk", "source": "AWS CloudTrail", "destination": "Splunk", "data_plane": "highway", "events_m": 48.2, "volume_gb": 3842, "revenue_k": 58, "cost_k": 14.2, "cost_per_gb": 0.037, "gm_pct": 75.5, "cost_breakdown": { "cloud": 8.2, "licenses": 2.1, "support": 2.4, "payroll": 1.5 }, "anomaly": false, "budget_k": 16, "budget_used_k": 14.2 },
    { "id": "pipe-002", "name": "CrowdStrike → Sentinel", "source": "CrowdStrike", "destination": "Microsoft Sentinel", "data_plane": "highway", "events_m": 35.6, "volume_gb": 2890, "revenue_k": 44, "cost_k": 11.8, "cost_per_gb": 0.041, "gm_pct": 73.2, "cost_breakdown": { "cloud": 6.8, "licenses": 1.8, "support": 1.9, "payroll": 1.3 }, "anomaly": false, "budget_k": 14, "budget_used_k": 11.8 },
    { "id": "pipe-003", "name": "Palo Alto → S3 Data Lake", "source": "Palo Alto Networks", "destination": "S3 Data Lake", "data_plane": "smart_edge", "events_m": 62.4, "volume_gb": 5120, "revenue_k": 72, "cost_k": 16.8, "cost_per_gb": 0.033, "gm_pct": 76.7, "cost_breakdown": { "cloud": 9.8, "licenses": 2.4, "support": 2.8, "payroll": 1.8 }, "anomaly": false, "budget_k": 18, "budget_used_k": 16.8 },
    { "id": "pipe-004", "name": "Azure AD → Snowflake", "source": "Azure AD", "destination": "Snowflake", "data_plane": "highway", "events_m": 18.9, "volume_gb": 1540, "revenue_k": 28, "cost_k": 9.2, "cost_per_gb": 0.060, "gm_pct": 67.1, "cost_breakdown": { "cloud": 5.1, "licenses": 1.5, "support": 1.4, "payroll": 1.2 }, "anomaly": false, "budget_k": 10, "budget_used_k": 9.2 },
    { "id": "pipe-005", "name": "Custom Apps → Databricks", "source": "Custom Applications", "destination": "Databricks", "data_plane": "cruz", "events_m": 8.2, "volume_gb": 680, "revenue_k": 15, "cost_k": 6.8, "cost_per_gb": 0.100, "gm_pct": 54.7, "cost_breakdown": { "cloud": 3.2, "licenses": 1.2, "support": 1.1, "payroll": 1.3 }, "anomaly": false, "budget_k": 7, "budget_used_k": 6.8 },
    { "id": "pipe-006", "name": "IoT Sensors → S3 Archive", "source": "IoT/OT Sensors", "destination": "S3 Data Lake", "data_plane": "smart_edge", "events_m": 124, "volume_gb": 8200, "revenue_k": 95, "cost_k": 22.4, "cost_per_gb": 0.027, "gm_pct": 76.4, "cost_breakdown": { "cloud": 13.2, "licenses": 3.0, "support": 3.4, "payroll": 2.8 }, "anomaly": false, "budget_k": 25, "budget_used_k": 22.4 },
    { "id": "pipe-007", "name": "Okta → Exabeam", "source": "Okta", "destination": "Exabeam", "data_plane": "highway", "events_m": 5.4, "volume_gb": 420, "revenue_k": 9.5, "cost_k": 4.8, "cost_per_gb": 0.114, "gm_pct": 49.5, "cost_breakdown": { "cloud": 2.2, "licenses": 0.9, "support": 0.8, "payroll": 0.9 }, "anomaly": true, "anomaly_detail": "Cost/GB spiked 142% above 30-day average", "budget_k": 4, "budget_used_k": 4.8 },
    { "id": "pipe-008", "name": "Windows Events → Splunk", "source": "Windows Endpoints", "destination": "Splunk", "data_plane": "smart_edge", "events_m": 82, "volume_gb": 6400, "revenue_k": 82, "cost_k": 19.6, "cost_per_gb": 0.031, "gm_pct": 76.1, "cost_breakdown": { "cloud": 11.4, "licenses": 2.8, "support": 3.1, "payroll": 2.3 }, "anomaly": false, "budget_k": 22, "budget_used_k": 19.6 },
    { "id": "pipe-009", "name": "GCP Audit → BigQuery", "source": "GCP Audit Logs", "destination": "BigQuery", "data_plane": "cruz", "events_m": 3.1, "volume_gb": 245, "revenue_k": 6.2, "cost_k": 3.4, "cost_per_gb": 0.139, "gm_pct": 45.2, "cost_breakdown": { "cloud": 1.6, "licenses": 0.65, "support": 0.55, "payroll": 0.6 }, "anomaly": true, "anomaly_detail": "Volume dropped 38% — possible source misconfiguration", "budget_k": 3, "budget_used_k": 3.4 },
    { "id": "pipe-010", "name": "Firewall Logs → Sentinel", "source": "Firewall (Multi-vendor)", "destination": "Microsoft Sentinel", "data_plane": "highway", "events_m": 42, "volume_gb": 3400, "revenue_k": 52, "cost_k": 13.2, "cost_per_gb": 0.039, "gm_pct": 74.6, "cost_breakdown": { "cloud": 7.6, "licenses": 2.0, "support": 2.1, "payroll": 1.5 }, "anomaly": false, "budget_k": 15, "budget_used_k": 13.2 },
    { "id": "pipe-011", "name": "DNS Logs → Anomali", "source": "DNS Resolvers", "destination": "Anomali", "data_plane": "reef", "events_m": 28, "volume_gb": 1800, "revenue_k": 32, "cost_k": 7.2, "cost_per_gb": 0.040, "gm_pct": 77.5, "cost_breakdown": { "cloud": 4.1, "licenses": 1.1, "support": 1.2, "payroll": 0.8 }, "anomaly": false, "budget_k": 8, "budget_used_k": 7.2 },
    { "id": "pipe-012", "name": "EDR → Data Lake", "source": "EDR Agents", "destination": "S3 Data Lake", "data_plane": "smart_edge", "events_m": 56, "volume_gb": 4500, "revenue_k": 64, "cost_k": 15, "cost_per_gb": 0.033, "gm_pct": 76.6, "cost_breakdown": { "cloud": 8.8, "licenses": 2.1, "support": 2.4, "payroll": 1.7 }, "anomaly": false, "budget_k": 17, "budget_used_k": 15 }
  ],
  "anomalies_summary": {
    "count_30d": 2,
    "total_impact_k": 4.2,
    "active": [
      { "pipeline_id": "pipe-007", "message": "Okta → Exabeam: cost/GB spiked 142% above 30-day average", "detected": "2026-02-28" },
      { "pipeline_id": "pipe-009", "message": "GCP Audit → BigQuery: volume dropped 38%", "detected": "2026-03-02" }
    ]
  }
}
```

### 8.5 `/data/waterfall.json`

```json
{
  "steps": [
    { "name": "Revenue", "value": 1250, "base": 0, "type": "positive" },
    { "name": "Cloud Infra", "value": -182, "base": 1068, "type": "negative" },
    { "name": "Licenses", "value": -43, "base": 1025, "type": "negative" },
    { "name": "Support", "value": -60, "base": 965, "type": "negative" },
    { "name": "DevOps", "value": -50, "base": 915, "type": "negative" },
    { "name": "Gross Profit", "value": 915, "base": 0, "type": "subtotal" },
    { "name": "Shared Costs", "value": -98, "base": 817, "type": "allocation" },
    { "name": "Payroll", "value": -86, "base": 731, "type": "allocation" },
    { "name": "Net Margin", "value": 731, "base": 0, "type": "total" }
  ],
  "summary": {
    "gross_profit_k": 915,
    "gross_profit_pct": 73.2,
    "net_margin_k": 731,
    "net_margin_pct": 58.5
  }
}
```

---

## 9. INTERACTION PATTERNS

### 9.1 Global Filter Behavior

When any global filter changes, ALL panels that are affected must re-render:

| Filter | What Re-renders |
|---|---|
| Date Range | All charts update data range. KPI cards update values and deltas. |
| Data Plane | All panels filter to selected plane. KPI cards scope to that plane. Pipeline table shows only pipelines in that plane. |
| Group By | Margin panel and pipeline panel re-group. COGS panel stays the same. KPI cards stay the same. |
| View Switcher | Changes which panels are visible and the default Group By. |

### 9.2 Click/Drill-Down Map

| Click Target | Action |
|---|---|
| Data Plane bar (Panel 3) | Opens SlideOverPanel with that plane's details. Also sets Data Plane filter to that plane. |
| Scatter dot (Panel 4) | Opens SlideOverPanel with that pipeline's details. |
| Table row (Panel 4) | Expands row to show cost breakdown. Double-click opens SlideOverPanel. |
| Data Flow path (Panel 4) | Opens SlideOverPanel with that pipeline's details. |
| Anomaly alert strip "View Details" | Scrolls to Pipeline Economics tab and switches to Rankings Table, sorted by anomaly pipelines first. |
| Waterfall bar | Tooltip only (no drill-down). |

### 9.3 Tooltip Standard

Every chart data point must have a hover tooltip. Tooltips use this format:

```
┌─────────────────────────────┐
│  [Title] (bold)             │
│  Metric 1: Value            │
│  Metric 2: Value            │
│  Metric 3: Value (colored)  │
└─────────────────────────────┘

Background: white
Border: 1px solid #E2E8F0
Border-radius: 8px
Padding: 8px 12px
Shadow: 0 4px 12px rgba(0,0,0,0.06)
Font-size: 12px
```

### 9.4 Transitions & Animations

- Bar width changes: `transition: width 0.4s ease`
- SlideOverPanel: `transition: transform 0.3s ease` (slide from right)
- Tab content: no animation (instant swap)
- Number changes: no animation (instant update — animated numbers look gimmicky)

---

## 10. STATE MANAGEMENT

### Zustand Store — `/lib/store.ts`

```typescript
import { create } from 'zustand';

interface DashboardState {
  // Global Filters
  dateRange: '30d' | '90d' | '6mo' | '12mo';
  dataPlaneFilter: 'all' | 'smart_edge' | 'highway' | 'cruz' | 'reef';
  groupBy: 'data_plane' | 'pipeline' | 'cost_category' | 'destination';
  activeView: 'engineering' | 'finance' | 'board';

  // Panel-specific state
  allocMethod: 'volume_weighted' | 'even_split' | 'usage_based';
  showPayroll: boolean;
  marginView: 'bar' | 'heatmap';
  pipelineTab: 'scatter' | 'table' | 'flow';
  tableSortCol: string;
  tableSortDir: 'asc' | 'desc';

  // Drill-down
  slideOverOpen: boolean;
  slideOverType: 'pipeline' | 'data_plane' | null;
  slideOverId: string | null;

  // Actions
  setDateRange: (range: DashboardState['dateRange']) => void;
  setDataPlaneFilter: (filter: DashboardState['dataPlaneFilter']) => void;
  setGroupBy: (groupBy: DashboardState['groupBy']) => void;
  setActiveView: (view: DashboardState['activeView']) => void;
  setAllocMethod: (method: DashboardState['allocMethod']) => void;
  togglePayroll: () => void;
  setMarginView: (view: DashboardState['marginView']) => void;
  setPipelineTab: (tab: DashboardState['pipelineTab']) => void;
  setTableSort: (col: string) => void;
  openSlideOver: (type: 'pipeline' | 'data_plane', id: string) => void;
  closeSlideOver: () => void;
}
```

---

## 11. FILE STRUCTURE

```
/app
  /dashboard
    page.tsx                    # Main dashboard page — composes all components
    layout.tsx                  # Dashboard layout wrapper

/components
  /dashboard
    Header.tsx                  # Sticky header with all controls
    AnomalyStrip.tsx            # Conditional anomaly alert banner
    ScalingNarrative.tsx        # One-line scaling summary
    KPICards.tsx                # 4 KPI metric cards
    COGSBreakdown.tsx           # Stacked bar + allocation section
    MarginByPlane.tsx           # Bar/Heatmap + payroll toggle + budget bars
    PipelineEconomics.tsx       # Tabs: scatter, table, flow
    PipelineScatter.tsx         # Scatter plot sub-component
    PipelineTable.tsx           # Rankings table sub-component
    PipelineFlow.tsx            # SVG data flow sub-component
    MarginWaterfall.tsx         # Full-width waterfall chart
    SlackDigestPreview.tsx      # Mock Slack message template
    SlideOverPanel.tsx          # Right-side drill-down panel
  /ui                           # shadcn/ui components (Button, Card, Badge, etc.)
  /shared
    Sparkline.tsx               # Reusable tiny line chart
    MetricBadge.tsx             # Reusable margin health badge
    SectionHeader.tsx           # Reusable uppercase section label
    CustomTooltip.tsx           # Reusable Recharts tooltip

/data
  kpis.json
  cogs.json
  data_planes.json
  pipelines.json
  waterfall.json

/lib
  store.ts                      # Zustand store
  colors.ts                     # Color tokens + helper functions
  utils.ts                      # Formatting: currency, %, volume, deltas
  types.ts                      # TypeScript interfaces for all data models

/styles
  globals.css                   # Tailwind config + font imports + base styles
```

---

## 12. IMPLEMENTATION SEQUENCE

Build in this exact order. Each step should result in a working, visible state.

### Step 1: Foundation
- Set up Next.js project with App Router
- Install dependencies: shadcn/ui, recharts, d3-sankey, zustand, papaparse, jspdf, html2canvas, lucide-react
- Create `/lib/colors.ts`, `/lib/utils.ts`, `/lib/types.ts`, `/lib/store.ts`
- Create all 5 JSON files in `/data`
- Set up globals.css with Tailwind + font imports
- Create shared components: Sparkline, MetricBadge, SectionHeader, CustomTooltip

### Step 2: Layout + Header
- Create `layout.tsx` with page background and max-width container
- Build `Header.tsx` with logo, title, view switcher, group by, date range, data plane filter, export button
- Wire up all controls to Zustand store

### Step 3: KPI Cards + Narrative
- Build `AnomalyStrip.tsx` (reads from pipelines.json anomalies_summary)
- Build `ScalingNarrative.tsx` (reads from kpis.json scaling_narrative)
- Build `KPICards.tsx` with all 4 cards, sparklines, and delta indicators

### Step 4: COGS Breakdown
- Build `COGSBreakdown.tsx` Section A (stacked bar chart)
- Build Section B (shared cost allocation with method toggle)
- Wire allocation method to Zustand store

### Step 5: Margin by Data Plane
- Build `MarginByPlane.tsx` bar view with payroll toggle and benchmark line
- Build heatmap view
- Add budget progress bars
- Add payroll detail sub-section

### Step 6: Pipeline Economics
- Build `PipelineScatter.tsx` with quadrant labels
- Build `PipelineTable.tsx` with sorting, expandable rows, and row coloring
- Build `PipelineFlow.tsx` SVG visualization
- Compose into `PipelineEconomics.tsx` with tab switching

### Step 7: Waterfall + Extras
- Build `MarginWaterfall.tsx`
- Build `SlackDigestPreview.tsx`
- Build `SlideOverPanel.tsx` with pipeline and data plane detail views

### Step 8: Interactivity + Polish
- Wire all drill-down click handlers to open SlideOverPanel
- Wire global filters to re-render affected panels
- Implement View Switcher logic (show/hide panels per view)
- Add PDF export (html2canvas the dashboard container)
- Add CSV export (papaparse the pipelines data)
- Add dark mode support
- Responsive testing: desktop (>1280px), tablet (768-1280px), mobile (<768px)

---

## 13. ACCEPTANCE CRITERIA

### Must Have (P0)
- [ ] All 5 JSON data files load and render correctly
- [ ] 4 KPI cards with sparklines, deltas, and correct color coding
- [ ] COGS stacked bar chart with all 4 categories + COGS% overlay line
- [ ] Shared cost allocation toggles between 3 methods with animated bars
- [ ] Margin by Data Plane bar chart with 75% benchmark line
- [ ] Margin by Data Plane heatmap view with correct color gradients
- [ ] "Include Payroll" toggle changes margin values across all views
- [ ] Pipeline scatter plot with sized/colored dots and quadrant labels
- [ ] Pipeline rankings table with sorting, expandable rows, and color-coded GM
- [ ] Pipeline data flow SVG with colored/sized paths
- [ ] Margin waterfall chart with correct base/value stacking
- [ ] Global date range and data plane filters update all panels
- [ ] Anomaly alert strip shows when anomalies are active
- [ ] Scaling narrative line shows correct assessment

### Should Have (P1)
- [ ] SlideOverPanel opens on pipeline/plane click with full detail
- [ ] View Switcher changes visible panels (Engineering/Finance/Board)
- [ ] Group By dropdown re-groups margin and pipeline panels
- [ ] Budget progress bars on Data Plane margin view
- [ ] Slack digest preview with realistic formatting
- [ ] PDF export captures current dashboard state
- [ ] CSV export dumps pipeline data

### Nice to Have (P2)
- [ ] Dark mode support
- [ ] Responsive layout (tablet + mobile)
- [ ] Anomaly overlay dots on COGS chart
- [ ] Period-over-period comparison toggle
- [ ] Custom dashboard tile builder (drag-and-drop)

---

## DESIGN REFERENCES

Study these for visual inspiration and interaction patterns:

| Reference | What to Study | URL |
|---|---|---|
| CloudZero Explorer | Cost of Change indicator, Group By, drill-down, stacked area charts | https://docs.cloudzero.com/docs/explorer |
| CloudZero Dimensions | How they organize costs into business-relevant groupings | https://docs.cloudzero.com/docs/dimensions |
| CloudZero Analytics | Tile-based dashboard layout, filter bars, scheduled delivery | https://docs.cloudzero.com/docs/analytics |
| CloudZero Anomalies | Homepage anomaly summary, anomaly detail page, Jira integration | https://docs.cloudzero.com/docs/anomaly-detection |
| CloudZero Budgets | Budget vs. actual visualization, Slack alerts when trending over | https://www.cloudzero.com/blog/cloudzero-budgets/ |
| CloudZero Unit Economics | Cost per unit dashboards, CSV telemetry import, scaling narrative | https://www.cloudzero.com/guide/cloud-unit-economics/ |
| CloudZero Views | Pre-configured filtered views for different teams | https://docs.cloudzero.com/docs/views |
| CloudZero Notifications | Weekly/monthly digest format, Slack integration | https://docs.cloudzero.com/docs/notifications |
| Cribl Monitoring | Top Talkers view, data flow Sankey, pipeline metrics | https://docs.cribl.io/stream/monitoring/ |
| Datadog CCM | Tag-based cost allocation, cost monitors, Notebooks | https://docs.datadoghq.com/cloud_cost_management/ |
| Vantage Unit Costs | Business metric overlay on cost reports | https://docs.vantage.sh/per_unit_costs |

---

> **END OF INSTRUCTIONS.** Build this dashboard following the specifications above. Start with Step 1 and proceed sequentially. Every component must match the specs described in Section 7. Every interaction must follow the patterns in Section 9. Use the exact color tokens from Section 4 and the exact data structures from Section 8.
