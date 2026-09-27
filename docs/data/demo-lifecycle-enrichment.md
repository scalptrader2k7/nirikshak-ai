# NIRIKSHAK AI — Demonstration Lifecycle Enrichment Layer

> **DISCLAIMER**: The data in this enrichment layer is **SYNTHETIC DEMONSTRATION DATA** created exclusively for prototype evaluation, interactive UI walkthroughs, and system capability demonstration. It is stored separately and is **NOT** part of the official MoSPI public spending record.

---

## 1. Executive Summary & Purpose

The official public spending dataset for the NIRIKSHAK AI prototype consists of **742 cleaned MPLADS records** extracted from official Ministry of Statistics and Programme Implementation (MoSPI) publications. While this snapshot is invaluable for detecting recommendation-stage anomalies (e.g., cost deviations, repetitiveness, near-duplicate splitting, and temporal batching), the source records predominantly terminate at the recommendation or initial sanction stage (740 unsanctioned, 1 ongoing), omitting:
- Granular voucher-level expenditure and fund releases
- Stage-by-stage milestone schedules and completion dates
- Verified physical execution percentages
- Formal inspection records and asset register enrollment

To showcase the end-to-end capabilities of the NIRIKSHAK AI analytical platform without falsifying or modifying the canonical official public record, this **Demonstration Lifecycle Enrichment Layer** was designed. It introduces synthetic, realistic downstream execution data for a focused cohort of **exactly 12 real projects** chosen from the official dataset.

---

## 2. Dataset Isolation & Provenance Rules

Strict architectural boundaries separate the official records from synthetic demonstration data:

1. **Physical Isolation**: All demonstration files reside exclusively in `data/enrichment/demo_lifecycle/`:
   - `demo_project_lifecycle.csv`: Primary execution attributes for the 12 demo projects.
   - `demo_payments.csv`: Detailed voucher disbursements and payment dates.
   - `demo_milestones.csv`: Milestone schedules, planned vs. actual dates, and percentages.
   - `demo_assets.csv`: District asset registry entries, categories, and handover recipients.
   - `demo_inspections.csv`: Field inspection reports, progress observed, and quality ratings.
   - `demo_project_lifecycle.json`: Consolidated, validated hierarchical dataset.

2. **Protected Official Datasets**: The following files remain completely untouched:
   - `data/raw/mplads_raw.csv`
   - `data/processed/mplads_clean.csv`
   - `data/processed/mplads_features.csv`
   - `data/processed/anomaly_results.csv`
   - `investigation_cases.json`
   - `verification_cases.json`

3. **Mandatory Metadata & Provenance Tags**: Every demo record and API payload strictly includes:
   ```json
   {
     "data_source": "DEMONSTRATION_LIFECYCLE_DATA",
     "is_demo_enrichment": true,
     "source_classification": "SYNTHETIC_DEMONSTRATION",
     "disclaimer": "DEMONSTRATION ONLY: Synthetic lifecycle data generated for prototype demonstration. Not part of official MoSPI public record."
   }
   ```

4. **Zero Model Contamination**: Anomaly detectors, feature engineering pipelines, and the canonical Investigation Priority Score (IPS) are evaluated strictly on the official dataset. Synthetic data is never mixed into model training or baseline risk calculation.

---

## 3. Demonstration Cohort & Scenario Mapping

The 12 demonstration projects were selected to represent geographical diversity (8 states), diverse work categories (road, building, electrical, water), and realistic operational scenarios. The cohort includes **3 healthy controls** to demonstrate clean, complaint project execution alongside 9 anomalous scenarios:

| Record ID | State | Constituency | Work Category | Allocation / Estimate | Scenario Tag | Classification | Scenario Description |
|:---|:---|:---|:---|:---|:---|:---|:---|
| Record ID | State | Constituency | Category | Sanctioned / Est. | Simulated Condition (Internal Tag) | Classification | Administrative Characteristics |
|:---:|:---|:---|:---:|:---:|:---|:---:|:---|
| **26** | Rajasthan | KARAULI-DHOLPUR | Road | ₹9,87,500 | `HEALTHY_ON_TRACK` | **Healthy Control 1** | Routine on-track road project; 78% progress, ₹7,42,500 released, ₹6,39,340 spent (86.11% utilization), regular satisfactory site inspections. |
| **10** | Bihar | DARBHANGA | Electrical | ₹4,87,000 | `REALITY_GAP_EARLY_WARNING` | Anomaly Scenario | Advanced billing gap: 87.25% fund expenditure (₹3,82,400 of ₹4,38,300) with only 27% verified physical completion (60.25% reality gap). |
| **75** | Telangana | CHELVELLA | Electrical | ₹1,70,000 | `DELAYED_COMPLETION` | Anomaly Scenario | Execution delay: 170 days past expected completion (2023-12-28) due to right-of-way permissions for underground cabling. |
| **208** | Maharashtra | DINDORI | Building | ₹14,94,000 | `COST_OVERRUN` | Anomaly Scenario | Technical cost overrun: Revised estimate ₹19,82,400 exceeds approved estimate ₹14,68,750 by +34.97% (₹5,13,650) due to subsoil stratum. |
| **230** | Karnataka | HAVERI | Building | ₹3,00,000 | `DUPLICATE_PAYMENT` | Anomaly Scenario | Duplicate payment signal: Identical vouchers (₹86,450) issued to contractor within 2 days (2024-05-11 and 2024-05-13) against invoice INV-2024-041. |
| **170** | Tamil Nadu | RAMANATHAPURAM | Building | ₹5,00,000 | `PAYMENT_BEFORE_MILESTONE` | Anomaly Scenario | Premature milestone disbursement: Voucher of ₹1,56,200 issued for roof slab while milestone is still in progress (33% progress). |
| **350** | Odisha | MAYURBHANJ | Electrical | ₹48,900 | `VENDOR_CONCENTRATION` | Anomaly Scenario | Vendor concentration: Awarded contractor holds 67.4% share of municipal electrical works across repeat turnkey contracts in cluster. |
| **205** | J&K | BARAMULLAH | Electrical | ₹98,400 | `HEALTHY_COMPLETED_ASSET` | **Healthy Control 2** | Completed on time (6 days early); completion certificate issued, enrolled in asset register, handed over to Gram Panchayat. |
| **450** | Uttar Pradesh | SITTING RAJYA SABHA | Water | ₹63,275 | `MISSING_INSPECTION` | Anomaly Scenario | Missing inspection gate: Project is at 73% physical progress with zero physical inspections recorded in administrative database. |
| **512** | Uttar Pradesh | SITTING RAJYA SABHA | Water | ₹63,275 | `HEALTHY_HIGH_UTILIZATION` | **Healthy Control 3** | High fund utilization (92.69%) with matching physical execution (92.0%) and two verified site inspections (0.69% variance). |
| **117** | Karnataka | SITTING RAJYA SABHA | Road | ₹5,00,000 | `UNDER_UTILIZATION_STALLED` | Anomaly Scenario | Stalled project: ₹1,95,000 released; 0% expenditure, 0% physical progress; machinery not mobilized. |
| **120** | Karnataka | SITTING RAJYA SABHA | Road | ₹5,00,000 | `PROXIMITY_CLUSTER` | Anomaly Scenario | GIS proximity clustering: Located ~91.5m from Project #117 with identical work category and same executing agency. |

> **Note on Scenario Tags**: Tags like `DUPLICATE_PAYMENT` or `COST_OVERRUN` are internal identifiers used for testing and curation. They are **never** included as raw source data fields in CSVs or exposed as source labels in the public API. Instead, the backend API computes and presents factual derived signals (e.g., `POTENTIAL_DUPLICATE_PAYMENT` in `payment_intelligence.anomaly_signals`, `OVERRUN` in `financial_intelligence.cost_overrun_status`).

---

## 4. Analytical Formulations & Heuristics

### 4.1 Financial Intelligence
- **Remaining Balance**:
  $$\text{remaining\_balance} = \max(0, \text{funds\_released} - \text{expenditure\_amount})$$
- **Fund Utilization Rate**:
  $$\text{utilization\_percent} = \begin{cases} \frac{\text{expenditure\_amount}}{\text{funds\_released}} \times 100 & \text{if } \text{funds\_released} > 0 \\ 0.0 & \text{otherwise} \end{cases}$$
- **Cost Overrun Rate**:
  $$\text{cost\_overrun\_percent} = \begin{cases} \frac{\text{revised\_estimate} - \text{approved\_estimate}}{\text{approved\_estimate}} \times 100 & \text{if } \text{revised\_estimate} > \text{approved\_estimate} > 0 \\ 0.0 & \text{otherwise} \end{cases}$$

### 4.2 Execution Progress & Reality Gap
- **Reality Gap Calculation**:
  $$\text{reality\_gap\_percent} = |\text{utilization\_percent} - \text{physical\_progress\_percent}|$$
- **Early Warning Trigger**: An alert (`reality_gap_alert = true`) is generated when fund expenditure outpaces verified physical execution by $\ge 30\%$, signaling potential fund diversion or unverified contractor claims.

### 4.3 Trajectory Forecasting (`DEMO_LINEAR_TRAJECTORY_V1`)
For ongoing projects with active execution ($0 < \text{physical\_progress\_percent} < 100$):
1. Compute elapsed days: $\Delta t_{\text{elapsed}} = t_{\text{eval}} - t_{\text{start}}$
2. Estimated total project duration: $T_{\text{total}} = \frac{\Delta t_{\text{elapsed}}}{\text{physical\_progress\_percent} / 100}$
3. Remaining execution days: $\Delta t_{\text{remaining}} = \max(1, T_{\text{total}} - \Delta t_{\text{elapsed}})$
4. Forecasted completion date: $t_{\text{forecast}} = t_{\text{eval}} + \Delta t_{\text{remaining}}$

### 4.4 Payment Anomaly Signals
- **Duplicate Payment**: Checks for identical payment amounts issued to the same payee within a window of $\le 3$ calendar days.
- **Premature Milestone Disbursement**: Flags vouchers released for milestones marked as `IN_PROGRESS` or `PENDING`.
- **Vendor Concentration**: Evaluates repeated single-bid or sole-source contracts awarded to the same vendor.

### 4.5 Multi-Stage Compliance Screening
Each project is evaluated across six sequential governance gates:
1. `ADMINISTRATIVE_SANCTION`: Sanction order validity and amount verification.
2. `TECHNICAL_SANCTION_ESTIMATE`: Technical estimate approval and overrun threshold monitoring.
3. `WORK_ORDER_CONTRACTING`: Agency contracting and work order issuance.
4. `PHYSICAL_INSPECTION_GATE`: Site verification frequency (requires inspection before reaching 50% completion).
5. `PAYMENT_MILESTONE_GATE`: Absence of duplicate or premature disbursements.
6. `COMPLETION_AND_HANDOVER`: Completion certificate verification and district asset register enrollment.

---

## 5. API Endpoints & Contract Integration

### 5.1 Dedicated Demonstration Endpoint
`GET /api/v1/projects/{record_id}/demo-lifecycle`

- **For Demo Projects (Records 26, 10, 75, 208, 230, 170, 350, 205, 450, 512, 117, 120)**:
  Returns HTTP 200 with the full, consolidated demonstration package including financial intelligence, execution progress, trajectory prediction, milestones, payments, inspections, asset registry, geospatial clustering, and compliance screening.
- **For Other Official MPLADS Projects (Records 1-742 not in demo cohort)**:
  Returns HTTP 200 with fallback payload:
  ```json
  {
    "record_id": 1,
    "is_demo_enrichment": false,
    "available": false,
    "data_source": "OFFICIAL_MPLADS_SNAPSHOT",
    "source_classification": "OFFICIAL_MOSPI_DATA",
    "message": "Demonstration lifecycle data is only available for the 12 demonstration projects."
  }
  ```
- **For Non-Existent Record IDs (e.g., 99999)**:
  Returns HTTP 404 `Project record not found`.

### 5.2 Consolidated Project Overview Integration
`GET /api/v1/projects/{record_id}/overview`

- Seamlessly incorporates the `demo_enrichment` attribute.
- For the 12 demonstration projects, `demo_enrichment` is populated with the complete demonstration package.
- For all other records, `demo_enrichment` defaults to `null`, ensuring complete backward compatibility with existing frontends and test suites.

---

## 6. Verification & Quality Assurance

The demonstration lifecycle enrichment module is verified by automated test suites in `tests/enrichment/test_demo_lifecycle.py`:
- **12/12 passing tests** confirming dataset isolation, healthy control baselines, financial formulas, reality gap detection, linear trajectory forecasting, payment anomaly signals, asset registration, GIS proximity clustering, compliance checklists, and API contract invariants.
- Full regression testing verifies that all 114 existing Phase B1/B2 tests continue to pass without regression.
