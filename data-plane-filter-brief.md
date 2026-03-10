# Data Plane Definition & Filter System — DataBahn Dashboard

---

## 1. What "Data Plane" Means at DataBahn

After studying DataBahn's architecture, product pages, Beacon multi-tenant architecture blog, and customer use cases, I believe "data plane" maps to **the telemetry domain that data belongs to** — the type of workload being processed through DataBahn's pipeline. DataBahn explicitly organizes its platform around four data fabrics:

| Data Plane | What Flows Through It | Typical Sources | Typical Destinations |
|---|---|---|---|
| **Security** | Security telemetry — SIEM logs, threat feeds, identity events, firewall/EDR/endpoint data | CrowdStrike, Palo Alto, Okta, Azure AD, Firewall logs | Splunk, Sentinel, Exabeam, Anomali |
| **Observability** | Infrastructure and application monitoring — metrics, traces, logs for uptime and performance | CloudWatch, Datadog agents, custom app logs, APM data | Datadog, Splunk, New Relic, Elastic |
| **Application** | Business transaction data — application-level events, user activity, API transactions | Custom applications, SaaS platforms, API gateways | Snowflake, Databricks, BigQuery, data lakes |
| **IoT/OT** | Operational technology and sensor data — PLCs, SCADA, remote IoT sensors, industrial systems | IoT sensors, SCADA systems, OT endpoints, edge devices | S3 Data Lake, time-series DBs, historian systems |

This interpretation is supported by:
- DataBahn's website explicitly lists four "Data Fabrics" — Security, Application, IoT/OT, and Observability
- Their product pages describe collecting data "from cloud, on-prem, or vendor sources" across these domains
- The Beacon architecture blog discusses per-tenant data planes for MSSPs, where each customer's telemetry flows through isolated processing paths — but the domain segmentation (security vs observability vs application) applies within each tenant
- Their Series A announcement says they started security-first and are "rapidly expanding into IT and application transaction data"

### Why this matters for the dashboard

"GM by data plane" then answers: **"Which telemetry domain is most profitable? Are we making more money on security data than observability? Is IoT/OT dragging our margins down because of edge processing costs?"**

This is a strategic question for a Series A company expanding from one domain (security) to four. Leadership needs to know whether the expansion into observability, application, and IoT/OT is economically viable, or whether they should double down on security where they have the deepest margins.

---

## 2. Updated Mock Data — `/data/data_planes.json`

```json
{
  "planes": [
    {
      "id": "security",
      "name": "Security",
      "description": "SIEM, threat, identity, endpoint, and firewall telemetry",
      "color": "#00D4FF",
      "icon": "shield",
      "revenue_share_pct": 48,
      "pipeline_count": 5,
      "budget_k": 175,
      "budget_used_k": 168,
      "monthly": [
        { "month": "Oct", "revenue": 394, "cogs": 118, "shared": 15.6, "payroll": 24, "gm_pct": 70.1, "gm_payroll_pct": 60.2, "volume_tb": 116, "events_b": 18.4 },
        { "month": "Nov", "revenue": 427, "cogs": 123, "shared": 16.0, "payroll": 24.5, "gm_pct": 71.2, "gm_payroll_pct": 61.5, "volume_tb": 124, "events_b": 19.8 },
        { "month": "Dec", "revenue": 461, "cogs": 128, "shared": 16.4, "payroll": 25, "gm_pct": 72.2, "gm_payroll_pct": 62.8, "volume_tb": 132, "events_b": 21.1 },
        { "month": "Jan", "revenue": 518, "cogs": 138, "shared": 17.0, "payroll": 25.5, "gm_pct": 73.4, "gm_payroll_pct": 64.2, "volume_tb": 145, "events_b": 23.2 },
        { "month": "Feb", "revenue": 557, "cogs": 143, "shared": 17.4, "payroll": 26, "gm_pct": 74.3, "gm_payroll_pct": 65.4, "volume_tb": 153, "events_b": 24.5 },
        { "month": "Mar", "revenue": 600, "cogs": 148, "shared": 17.8, "payroll": 26.5, "gm_pct": 75.3, "gm_payroll_pct": 66.9, "volume_tb": 162, "events_b": 25.9 }
      ]
    },
    {
      "id": "observability",
      "name": "Observability",
      "description": "Infrastructure monitoring, APM, metrics, traces, and operational logs",
      "color": "#38BDF8",
      "icon": "activity",
      "revenue_share_pct": 22,
      "pipeline_count": 3,
      "budget_k": 78,
      "budget_used_k": 72,
      "monthly": [
        { "month": "Oct", "revenue": 180, "cogs": 55, "shared": 7.2, "payroll": 12, "gm_pct": 69.4, "gm_payroll_pct": 58.8, "volume_tb": 48, "events_b": 6.2 },
        { "month": "Nov", "revenue": 196, "cogs": 58, "shared": 7.4, "payroll": 12.2, "gm_pct": 70.4, "gm_payroll_pct": 60.2, "volume_tb": 52, "events_b": 6.7 },
        { "month": "Dec", "revenue": 211, "cogs": 61, "shared": 7.6, "payroll": 12.5, "gm_pct": 71.1, "gm_payroll_pct": 61.2, "volume_tb": 55, "events_b": 7.1 },
        { "month": "Jan", "revenue": 238, "cogs": 66, "shared": 7.9, "payroll": 12.8, "gm_pct": 72.3, "gm_payroll_pct": 63.5, "volume_tb": 61, "events_b": 7.9 },
        { "month": "Feb", "revenue": 255, "cogs": 69, "shared": 8.1, "payroll": 13, "gm_pct": 72.9, "gm_payroll_pct": 64.7, "volume_tb": 65, "events_b": 8.4 },
        { "month": "Mar", "revenue": 275, "cogs": 72, "shared": 8.4, "payroll": 13.2, "gm_pct": 73.8, "gm_payroll_pct": 65.9, "volume_tb": 69, "events_b": 8.9 }
      ]
    },
    {
      "id": "application",
      "name": "Application",
      "description": "Business transaction data, user activity, API events, SaaS telemetry",
      "color": "#A78BFA",
      "icon": "layers",
      "revenue_share_pct": 14,
      "pipeline_count": 2,
      "budget_k": 48,
      "budget_used_k": 45,
      "monthly": [
        { "month": "Oct", "revenue": 115, "cogs": 40, "shared": 4.6, "payroll": 10, "gm_pct": 65.2, "gm_payroll_pct": 52.5, "volume_tb": 22, "events_b": 2.8 },
        { "month": "Nov", "revenue": 125, "cogs": 42, "shared": 4.7, "payroll": 10.2, "gm_pct": 66.4, "gm_payroll_pct": 54.5, "volume_tb": 24, "events_b": 3.1 },
        { "month": "Dec", "revenue": 134, "cogs": 44, "shared": 4.9, "payroll": 10.5, "gm_pct": 67.2, "gm_payroll_pct": 55.7, "volume_tb": 26, "events_b": 3.3 },
        { "month": "Jan", "revenue": 151, "cogs": 48, "shared": 5.1, "payroll": 10.8, "gm_pct": 68.2, "gm_payroll_pct": 57.7, "volume_tb": 29, "events_b": 3.7 },
        { "month": "Feb", "revenue": 162, "cogs": 50, "shared": 5.2, "payroll": 11, "gm_pct": 69.1, "gm_payroll_pct": 59.1, "volume_tb": 31, "events_b": 4.0 },
        { "month": "Mar", "revenue": 175, "cogs": 53, "shared": 5.4, "payroll": 11.2, "gm_pct": 69.7, "gm_payroll_pct": 60.3, "volume_tb": 33, "events_b": 4.3 }
      ]
    },
    {
      "id": "iot_ot",
      "name": "IoT/OT",
      "description": "Sensor data, PLCs, SCADA systems, industrial OT, edge device telemetry",
      "color": "#F59E0B",
      "icon": "cpu",
      "revenue_share_pct": 16,
      "pipeline_count": 2,
      "budget_k": 55,
      "budget_used_k": 50,
      "monthly": [
        { "month": "Oct", "revenue": 131, "cogs": 47, "shared": 4.6, "payroll": 12, "gm_pct": 64.1, "gm_payroll_pct": 51.5, "volume_tb": 54, "events_b": 34.2 },
        { "month": "Nov", "revenue": 142, "cogs": 50, "shared": 4.7, "payroll": 12.2, "gm_pct": 64.8, "gm_payroll_pct": 52.9, "volume_tb": 59, "events_b": 37.4 },
        { "month": "Dec", "revenue": 154, "cogs": 53, "shared": 4.9, "payroll": 12.5, "gm_pct": 65.6, "gm_payroll_pct": 54.3, "volume_tb": 64, "events_b": 40.6 },
        { "month": "Jan", "revenue": 173, "cogs": 58, "shared": 5.0, "payroll": 12.8, "gm_pct": 66.5, "gm_payroll_pct": 56.2, "volume_tb": 70, "events_b": 44.4 },
        { "month": "Feb", "revenue": 186, "cogs": 62, "shared": 5.2, "payroll": 13, "gm_pct": 66.7, "gm_payroll_pct": 56.8, "volume_tb": 74, "events_b": 46.9 },
        { "month": "Mar", "revenue": 200, "cogs": 65, "shared": 5.4, "payroll": 13.2, "gm_pct": 67.5, "gm_payroll_pct": 58.2, "volume_tb": 78, "events_b": 49.5 }
      ]
    }
  ]
}
```

Note: IoT/OT has the **highest event count but relatively lower revenue** — this is because IoT generates massive volumes of tiny sensor readings (high count-to-volume ratio) but is priced lower per event. Security has the **highest revenue but moderate volume** — because security telemetry commands premium pricing. This creates interesting divergence between volume-weighted and count-weighted GM.

### Updated pipeline-to-data-plane mapping

```
pipe-001  CloudTrail → Splunk           data_plane: "security"
pipe-002  CrowdStrike → Sentinel        data_plane: "security"
pipe-003  Palo Alto → S3 Data Lake      data_plane: "security"
pipe-004  Azure AD → Snowflake          data_plane: "application"
pipe-005  Custom Apps → Databricks      data_plane: "application"
pipe-006  IoT Sensors → S3 Archive      data_plane: "iot_ot"
pipe-007  Okta → Exabeam                data_plane: "security"
pipe-008  Windows Events → Splunk       data_plane: "observability"
pipe-009  GCP Audit → BigQuery          data_plane: "observability"
pipe-010  Firewall Logs → Sentinel      data_plane: "security"
pipe-011  DNS Logs → Anomali            data_plane: "observability"
pipe-012  EDR → Data Lake               data_plane: "iot_ot"
```

### Updated shared cost allocation keys

```json
"methods": {
  "volume_weighted": { "security": 43.8, "observability": 19.2, "application": 12.5, "iot_ot": 22.5 },
  "even_split": { "security": 24.5, "observability": 24.5, "application": 24.5, "iot_ot": 24.5 },
  "usage_based": { "security": 46.2, "observability": 18.5, "application": 11.0, "iot_ot": 22.3 }
}
```

### Updated color tokens

```typescript
planeSecurity: "#00D4FF",      // Brand cyan — primary revenue driver
planeObservability: "#38BDF8", // Sky blue — monitoring domain
planeApplication: "#A78BFA",   // Light purple — business data
planeIoTOT: "#F59E0B",        // Amber — physical/industrial
```

---

## 3. Filter & Interaction System

The original dashboard had basic single-select dropdowns. That's not enough for real analytical workflows. Here's a comprehensive filter system designed around how internal teams will actually explore this data.

### 3.1 Filter Bar Architecture

Replace the simple header controls with a **two-tier filter system**:

**Tier 1 — Persistent Header Bar (always visible, sticky)**
Core filters that define what the dashboard shows. These are the highest-level scoping controls.

**Tier 2 — Expandable Filter Panel (collapsible, below header)**
Advanced filters for deeper slicing. Opens when user clicks "More Filters" or the filter count badge. Collapses to save space during general viewing.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  TIER 1 — HEADER BAR (sticky)                                           │
│                                                                          │
│  [Logo] DataBahn   [Eng ▼ View]   [6mo ▼ Date]   [Filters (3) ▼]   [↓] │
│                                                                          │
│  Active filters: Security + Observability · Splunk + Sentinel · Mar 2026 │
├──────────────────────────────────────────────────────────────────────────┤
│  TIER 2 — FILTER PANEL (expanded)                                        │
│                                                                          │
│  Data Plane          Source             Destination         Pipeline      │
│  ☑ Security          ☑ CloudTrail       ☑ Splunk            ☐ Select...  │
│  ☑ Observability     ☑ CrowdStrike      ☑ Sentinel          ☐ Select...  │
│  ☐ Application       ☑ Palo Alto        ☐ S3 Data Lake                   │
│  ☐ IoT/OT           ☐ Okta             ☐ Snowflake                      │
│                      ☐ IoT Sensors      ☐ Databricks                     │
│                                         ☐ Exabeam                        │
│                                                                          │
│  Product             Margin Health      Budget Status       Anomaly      │
│  ☑ All Products      ☑ Healthy (>75%)   ☑ All              ☐ Has anomaly│
│  ☐ Smart Edge        ☑ Watch (60-75%)   ☐ Over budget                    │
│  ☐ Highway           ☑ At Risk (<60%)   ☐ >90% used                     │
│  ☐ Cruz                                                                  │
│  ☐ Reef              GM Mode            Normalization                    │
│                      ○ Volume (GB)      ○ Raw                            │
│                      ● Count (Events)   ● Complexity-Wtd                 │
│                      ○ Both (compare)   ○ Time-Smoothed                  │
│                                                                          │
│  [Reset All Filters]                    [Apply]    [Save as View ▼]      │
├──────────────────────────────────────────────────────────────────────────┤
```

### 3.2 Tier 1 — Header Bar Controls

#### View Switcher (single-select dropdown)
```
Options: Engineering | Finance | Board
Default: Engineering
Behavior: Changes which panels are visible and sets default filters for that audience
```

#### Date Range (single-select pills)
```
Options: 30d | 90d | 6mo | 12mo | Custom
Default: 6mo
Custom: Opens a date picker with start/end date
Behavior: All charts and KPIs update to the selected time range
```

#### Filter Count Badge + Expand Toggle
```
Shows: "Filters (3)" where 3 = number of active non-default filters
Click: Expands/collapses Tier 2 filter panel
Color: Cyan badge if any filters are active, muted if defaults only
```

#### Export Button
```
Dropdown: PDF Report | CSV Data | Copy Dashboard Link
```

#### Active Filter Tags (below header, inline)
When any non-default filter is active, show a horizontal row of removable tags:
```
[Security ×]  [Observability ×]  [Splunk ×]  [Sentinel ×]  [Mar 2026 ×]  [Clear all]
```
Each tag has an × to remove that filter. "Clear all" resets everything.

### 3.3 Tier 2 — Expanded Filter Panel

Eight filter groups organized in a 4-column grid:

#### Column 1: Data Plane (multi-select checkboxes)
```
☑ Security         (5 pipelines, 162 TB, $600K rev)
☑ Observability    (3 pipelines, 69 TB, $275K rev)
☐ Application      (2 pipelines, 33 TB, $175K rev)
☐ IoT/OT           (2 pipelines, 78 TB, $200K rev)
```
Each option shows a summary stat (pipeline count, volume, revenue) so users can gauge impact before filtering. Multi-select: selecting multiple data planes shows combined data.

#### Column 2: Source (multi-select checkboxes, searchable)
```
Search: [🔍 Search sources...]
☑ All Sources
☐ AWS CloudTrail
☐ CrowdStrike
☐ Palo Alto Networks
☐ Azure AD
☐ Custom Applications
☐ IoT/OT Sensors
☐ Okta
☐ Windows Endpoints
☐ GCP Audit Logs
☐ Firewall (Multi-vendor)
☐ DNS Resolvers
☐ EDR Agents
```
Searchable because the list will grow as DataBahn adds more integrations. When sources are filtered, only pipelines from those sources appear in all panels.

#### Column 3: Destination (multi-select checkboxes, searchable)
```
Search: [🔍 Search destinations...]
☑ All Destinations
☐ Splunk
☐ Microsoft Sentinel
☐ S3 Data Lake
☐ Snowflake
☐ Databricks
☐ Exabeam
☐ Anomali
☐ BigQuery
```

#### Column 4: Pipeline (multi-select dropdown/search)
```
Search: [🔍 Search pipelines...]
Shows: List of all pipelines with source → destination format
Multi-select: Can select specific pipelines to focus on
```

#### Row 2, Column 1: Product (multi-select checkboxes)
```
☑ All Products
☐ Smart Edge
☐ Highway
☐ Cruz
☐ Reef
```
This filters by which DataBahn product processes the pipeline.

#### Row 2, Column 2: Margin Health (multi-select checkboxes)
```
☑ Healthy (>75%)    [green dot]
☑ Watch (60-75%)    [yellow dot]
☑ At Risk (<60%)    [red dot]
```
This is a smart filter — it filters pipelines by their current margin status. Selecting only "At Risk" instantly shows a dashboard focused on problem pipelines.

#### Row 2, Column 3: Budget Status (multi-select checkboxes)
```
☑ All
☐ Over budget (>100%)
☐ Near limit (>90%)
☐ On track (<90%)
```

#### Row 2, Column 4: Anomaly (toggle)
```
☐ Show only pipelines with active anomalies
```
When toggled ON, the entire dashboard filters to only show data for pipelines that have anomalies. This is a "crisis mode" view.

#### Row 3: GM Mode + Normalization (radio buttons)
```
GM Mode:           ○ Volume (GB)   ● Count (Events)   ○ Both (side-by-side)
Normalization:     ● Raw           ○ Complexity-Weighted   ○ Time-Smoothed
```

The **"Both (side-by-side)"** option for GM Mode is new — when selected, every chart that shows GM will display both volume and count values simultaneously rather than toggling between them.

### 3.4 Filter Interaction Rules

| Filter | Affects |
|---|---|
| Data Plane | ALL panels — KPIs scope to selected planes, COGS filters to selected planes, margin chart shows only selected planes, pipeline table shows only pipelines in selected planes |
| Source | Pipeline panels only — scatter, table, flow, and waterfall filter to pipelines from selected sources. KPIs and COGS recalculate based on filtered pipelines. Data plane margin panel is unaffected (shows full plane data) |
| Destination | Same as Source |
| Pipeline | All panels — when specific pipelines are selected, the entire dashboard scopes to those pipelines. This is the most granular filter. |
| Product | Pipeline panels + COGS — filters to pipelines processed by selected products |
| Margin Health | Pipeline panels only — filters pipeline table/scatter/flow to show only pipelines matching the selected health status |
| Budget Status | Data plane margin panel + pipeline table — highlights/filters to data planes and pipelines matching the budget status |
| Anomaly toggle | All panels — switches the entire dashboard to "anomaly investigation mode" showing only entities with active anomalies |
| GM Mode | Pipeline panels + data plane margin panel — changes which GM value is displayed/used for coloring |
| Normalization | Cost/GB KPI card + scatter plot — changes Y-axis calculation |

### 3.5 Cross-Filter Behavior (cascading)

Filters cascade — selecting a data plane automatically narrows the available options in Source, Destination, and Pipeline dropdowns:

```
User selects: Data Plane = "Security"
→ Source filter now only shows sources that feed into Security pipelines
→ Destination filter now only shows destinations that receive from Security pipelines  
→ Pipeline filter now only shows Security pipelines
→ Other filters unchanged
```

This prevents users from creating impossible filter combinations (e.g., selecting "Security" data plane + "IoT Sensors" source when no Security pipeline has IoT Sensors as a source).

### 3.6 "Save as View" Feature

After setting a filter combination, users can click "Save as View" to create a named, reusable filter preset:

```
[Save as View ▼]
  → Save current filters as...
    Name: [Security Deep Dive    ]
    Description: [Security data plane, at-risk pipelines only]
    [Save]
  → Saved Views:
    ● Engineering Default
    ● Finance Default
    ● Security Deep Dive
    ● Anomaly Investigation
    ● IoT Cost Review
```

This maps to CloudZero's Views concept — each saved view is a filter preset that can also be connected to a notification schedule in the Report Hub.

### 3.7 URL State Sync

All filter selections should be reflected in the URL as query parameters so views can be shared via link:

```
/dashboard?planes=security,observability&destinations=splunk,sentinel&gm_mode=count&date=6mo
```

---

## 4. Updated Zustand Store

```typescript
interface DashboardState {
  // View
  activeView: 'engineering' | 'finance' | 'board';
  
  // Date
  dateRange: '30d' | '90d' | '6mo' | '12mo' | 'custom';
  customDateStart?: string;
  customDateEnd?: string;
  
  // Multi-select filters
  selectedPlanes: string[];         // ["security", "observability"] — empty = all
  selectedSources: string[];        // ["AWS CloudTrail", "CrowdStrike"] — empty = all
  selectedDestinations: string[];   // ["Splunk", "Sentinel"] — empty = all
  selectedPipelines: string[];      // ["pipe-001", "pipe-002"] — empty = all
  selectedProducts: string[];       // ["highway", "smart_edge"] — empty = all
  selectedMarginHealth: string[];   // ["healthy", "watch", "at_risk"] — empty = all
  selectedBudgetStatus: string[];   // ["over", "near_limit", "on_track"] — empty = all
  anomalyOnly: boolean;             // false = show all, true = only anomaly pipelines
  
  // Display modes
  gmMode: 'volume' | 'count' | 'both';
  normalization: 'raw' | 'complexity' | 'time_smoothed';
  
  // Panel-specific
  groupBy: 'data_plane' | 'product' | 'pipeline' | 'cost_category' | 'destination';
  allocMethod: 'volume_weighted' | 'even_split' | 'usage_based';
  showPayroll: boolean;
  marginPlaneView: 'ranked_bars' | 'bubble_map' | 'trend_lines';
  pipelineTab: 'scatter' | 'table' | 'divergence' | 'flow';
  
  // Filter panel
  filterPanelOpen: boolean;
  
  // Drill-down
  slideOverOpen: boolean;
  slideOverType: 'pipeline' | 'data_plane' | null;
  slideOverId: string | null;
  
  // Saved views
  savedViews: SavedView[];
  
  // Actions
  setActiveView: (view: DashboardState['activeView']) => void;
  setDateRange: (range: DashboardState['dateRange']) => void;
  togglePlane: (planeId: string) => void;
  toggleSource: (source: string) => void;
  toggleDestination: (dest: string) => void;
  togglePipeline: (pipeId: string) => void;
  toggleProduct: (product: string) => void;
  toggleMarginHealth: (status: string) => void;
  toggleBudgetStatus: (status: string) => void;
  setAnomalyOnly: (on: boolean) => void;
  setGmMode: (mode: DashboardState['gmMode']) => void;
  setNormalization: (method: DashboardState['normalization']) => void;
  resetAllFilters: () => void;
  toggleFilterPanel: () => void;
  saveView: (name: string, description: string) => void;
  loadView: (viewId: string) => void;
  // ... other actions from previous files
}

interface SavedView {
  id: string;
  name: string;
  description: string;
  filters: Partial<DashboardState>;
}
```

---

## 5. Computed Filter Helper — `/lib/filters.ts`

Create a utility file that applies all active filters to the raw data:

```typescript
// This function takes raw data + current filter state and returns filtered data
// Every panel should use this to get its data instead of reading JSON directly

export function getFilteredPipelines(
  allPipelines: Pipeline[],
  state: DashboardState
): Pipeline[] {
  let filtered = [...allPipelines];
  
  if (state.selectedPlanes.length > 0) {
    filtered = filtered.filter(p => state.selectedPlanes.includes(p.data_plane));
  }
  if (state.selectedSources.length > 0) {
    filtered = filtered.filter(p => state.selectedSources.includes(p.source));
  }
  if (state.selectedDestinations.length > 0) {
    filtered = filtered.filter(p => state.selectedDestinations.includes(p.destination));
  }
  if (state.selectedPipelines.length > 0) {
    filtered = filtered.filter(p => state.selectedPipelines.includes(p.id));
  }
  if (state.selectedProducts.length > 0) {
    filtered = filtered.filter(p => state.selectedProducts.includes(p.product));
  }
  if (state.selectedMarginHealth.length > 0) {
    filtered = filtered.filter(p => {
      const gm = state.gmMode === 'count' ? p.gm_pct_by_count : p.gm_pct_by_volume;
      if (state.selectedMarginHealth.includes('healthy') && gm > 75) return true;
      if (state.selectedMarginHealth.includes('watch') && gm > 60 && gm <= 75) return true;
      if (state.selectedMarginHealth.includes('at_risk') && gm <= 60) return true;
      return false;
    });
  }
  if (state.anomalyOnly) {
    filtered = filtered.filter(p => p.anomaly === true);
  }
  
  return filtered;
}

// Returns available options for cascading filters
export function getAvailableSources(pipelines: Pipeline[], selectedPlanes: string[]): string[] {
  if (selectedPlanes.length === 0) return [...new Set(pipelines.map(p => p.source))];
  return [...new Set(pipelines.filter(p => selectedPlanes.includes(p.data_plane)).map(p => p.source))];
}

export function getAvailableDestinations(pipelines: Pipeline[], selectedPlanes: string[]): string[] {
  if (selectedPlanes.length === 0) return [...new Set(pipelines.map(p => p.destination))];
  return [...new Set(pipelines.filter(p => selectedPlanes.includes(p.data_plane)).map(p => p.destination))];
}
```

---

## 6. New Components to Create

| Component | File | Description |
|---|---|---|
| `FilterBar.tsx` | `/components/dashboard/` | Tier 1 header bar — view switcher, date range, filter badge, export |
| `FilterPanel.tsx` | `/components/dashboard/` | Tier 2 expandable panel — all 8 filter groups in 4-column grid |
| `FilterCheckboxGroup.tsx` | `/components/shared/` | Reusable multi-select checkbox group with search |
| `FilterTag.tsx` | `/components/shared/` | Removable active filter tag pill |
| `FilterTagBar.tsx` | `/components/shared/` | Horizontal row of active filter tags with "Clear all" |
| `SaveViewModal.tsx` | `/components/dashboard/` | Modal for saving current filters as a named view |

Replace old `Header.tsx` and `GlobalFilters.tsx` with `FilterBar.tsx` + `FilterPanel.tsx`.

---

## 7. Summary

| Change | Details |
|---|---|
| **Data Plane definition** | Generic Alpha/Beta/Gamma/Delta → Domain-specific: Security, Observability, Application, IoT/OT |
| **Mock data** | New data_planes.json with telemetry-domain-based planes. Includes volume_tb and events_b. Security has highest revenue, IoT/OT has highest event count. |
| **Pipeline mapping** | All 12 pipelines assigned to correct telemetry domains |
| **Color tokens** | planeAlpha/Beta/Gamma/Delta → planeSecurity/Observability/Application/IoTOT |
| **Filter system** | Single-select dropdowns → Two-tier filter architecture with multi-select, cascading, search, and saved views |
| **New state fields** | 8 multi-select arrays, anomalyOnly toggle, gmMode "both" option, filterPanelOpen, savedViews |
| **New utility** | `/lib/filters.ts` — centralized filter computation for all panels |
| **New components** | FilterBar, FilterPanel, FilterCheckboxGroup, FilterTag, FilterTagBar, SaveViewModal |
| **Removed components** | Old Header.tsx and GlobalFilters.tsx (replaced) |
