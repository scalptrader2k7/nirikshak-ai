# NIRIKSHAK AI — Final Product Capability Matrix

This document provides the authoritative capability matrix for the NIRIKSHAK AI platform, classifying all product and backend capabilities against their exact data sources and implementation status.

---

## 1. Classification Categories

- **`IMPLEMENTED_OFFICIAL_DATA`**: Implemented using the official, canonical 742-record MPLADS public spending snapshot.
- **`IMPLEMENTED_DERIVED`**: Derived analytically via statistical modeling, NLP vectorization, or algorithmic heuristics from official data.
- **`IMPLEMENTED_DEMONSTRATION`**: Implemented exclusively on an isolated 12-project synthetic demonstration cohort. Never represented as official government execution records.
- **`DATA_UNAVAILABLE`**: Required for full production monitoring but entirely absent from current public spending datasets.
- **`NOT_IMPLEMENTED`**: Planned capabilities not currently built in the prototype backend.

---

## 2. Product Capability Matrix

| Feature / Domain | Capability Description | Implementation Classification | Data Provenance & Notes |
| :--- | :--- | :--- | :--- |
| **Recommendation Stage** | Official project recommendation tracking, MP identity, constituency, allocation amount, house, recommendation date. | `IMPLEMENTED_OFFICIAL_DATA` | 742 official MPLADS records. |
| **Sanction Stage** | Sanction status and IDA approval tracking. | `IMPLEMENTED_OFFICIAL_DATA` | Status text and IDA approval flags present in official dataset. |
| **Sanctioned Amount & Estimates** | Detailed engineering estimates, technical sanction orders, approved estimate amounts. | `DATA_UNAVAILABLE` | Absent from public MPLADS recommendation snapshot; synthetic demonstration model available. |
| **Financial Execution** | Actual expenditure, fund releases, disbursement tracking. | `DATA_UNAVAILABLE` | Source-wide unavailable in public dataset. Implemented as `IMPLEMENTED_DEMONSTRATION` for 12 cohort records. |
| **Physical Progress Tracking** | Construction milestone percentages, physical completion metrics. | `DATA_UNAVAILABLE` | Absent in official data. Implemented as `IMPLEMENTED_DEMONSTRATION` for 12 cohort records. |
| **Reality Gap Analysis** | Comparison between fund disbursement and physical construction progress. | `IMPLEMENTED_DERIVED` | Evaluates availability; outputs fallback explanation for official data, computes numerical gap for demo records. |
| **Delay Tracking** | Scheduled completion vs. actual progress and delay day calculations. | `DATA_UNAVAILABLE` | Implemented as `IMPLEMENTED_DEMONSTRATION` for 12 cohort records. |
| **Completion Prediction** | ML/heuristic projected completion date estimation. | `IMPLEMENTED_DEMONSTRATION` | Available exclusively on the 12 synthetic demonstration projects. |
| **Payment Gate & Vouchers** | Individual payment disbursements, voucher counts, sequential payment anomaly detection. | `IMPLEMENTED_DEMONSTRATION` | Available exclusively on the 12 synthetic demonstration projects. |
| **Asset Register** | Physical asset ID, handover recipient, asset verification status. | `IMPLEMENTED_DEMONSTRATION` | Available exclusively on the 12 synthetic demonstration projects. |
| **GIS & Geospatial Mapping** | Micro-location geo-coordinates (latitude/longitude), cluster proximity. | `DATA_UNAVAILABLE` | Canonical coordinates absent from public dataset; demonstration coordinates available for cohort. |
| **Peer Benchmarking** | Statistical allocation dispersion relative to local (state + category) or national category peers. | `IMPLEMENTED_DERIVED` | Stable statistical peer dispersion across 742 official records with national fallback. |
| **Exact Duplicate Detection** | Deterministic clustering of projects with identical work descriptions, amounts, and locations. | `IMPLEMENTED_DERIVED` | Grouped via normalized matching across official records. |
| **Near-Duplicate Intelligence** | NLP vectorization (TF-IDF cosine similarity) and administrative context weighting. | `IMPLEMENTED_DERIVED` | Contextual pairs classified into template, contextual, or potential duplicate categories. |
| **Pattern & Surge Detection** | Rolling 30-day recommendation bunching per constituency and per MP. | `IMPLEMENTED_DERIVED` | Time-series rolling aggregations across official recommendation dates. |
| **IDA Analytics** | Implementing District Authority aggregated project counts, allocations, and risk signal distributions. | `IMPLEMENTED_DERIVED` | IDAs evaluated strictly as government administrative authorities, not contractors/vendors. |
| **Concentration Analytics** | Top category shares, IDA concentrations, constituency shares, and temporal recommendation bursts. | `IMPLEMENTED_DERIVED` | Evaluated across official records as administrative concentration indicators. |
| **Investigation Priority Score (IPS)**| Multi-detector synthesis into 0-100 triage score and priority tiers (LOW, MEDIUM, HIGH, CRITICAL). | `IMPLEMENTED_DERIVED` | Normalized heuristic score to guide review triage. |
| **Operational Workflow** | Strict 9-state case lifecycle (`DETECTED` -> `PRIORITIZED` -> `ASSIGNED` -> `UNDER_REVIEW` -> ... -> `CLOSED`). | `IMPLEMENTED_OFFICIAL_DATA` | Server-side SQLite persistence with state transition validation; `CLOSED` is terminal. Only `DISTRICT_AUTHORITY` within scope can mutate. |
| **Evidence-Item Workflow** | Separate 5-state evidence verification lifecycle (`REQUESTED` -> `RECEIVED` -> `UNDER_VERIFICATION` -> `VERIFIED` / `REJECTED`). | `IMPLEMENTED_OFFICIAL_DATA` | Strict transition graph; skipping `UNDER_VERIFICATION` is prohibited. Rejection applies to evidence item, not case. Only `DISTRICT_AUTHORITY` within scope can mutate. |
| **Human Reviews & Decisions** | Official review outcomes, rationale recording, evidence verification requests, workflow audit log. | `IMPLEMENTED_OFFICIAL_DATA` | Persisted with session actor identity; State Nodal, MoSPI, MP, and Citizen are blocked from mutating district cases. |
| **Citizen Public Access** | Unauthenticated, read-only browsing of projects, search, aggregate statistics, and public metadata. | `IMPLEMENTED_OFFICIAL_DATA` | Public-safe schemas strictly sanitize internal notes, reviewer IDs, and audit events. |
| **Role-Based Scope Enforcement** | Deterministic access control for 4 official roles (MP: Monitor, District Authority: Act, State Nodal: Coordinate, MoSPI: Oversee). | `IMPLEMENTED_OFFICIAL_DATA` | Backend session identity overrides client parameters; zero fuzzy matching on districts. |
| **Compliance Screening** | Administrative rule compliance checklist (guideline adherence, approvals). | `IMPLEMENTED_DEMONSTRATION` | Synthetic compliance checklists for demonstration cohort. |
| **System Provenance** | Centralized metadata distinguishing official, derived, and demonstration data layers. | `IMPLEMENTED_OFFICIAL_DATA` | Public provenance endpoint exposing pipeline facts without fabricating dates. |
| **Detector Governance** | Formal registry describing versions, inputs, thresholds, limitations, and interpretations. | `IMPLEMENTED_OFFICIAL_DATA` | Centralized registry for all 5 detectors beginning with Release 1.0. |
| **Citizen Observations** | Citizen ground-level submission of observations, complaints, or feedback. | `NOT_IMPLEMENTED` | Intentionally deferred; no citizen mutation routes exist in backend. |
| **Report Generation & Export** | Automated PDF / Excel dossier compilation and scheduled dispatch. | `NOT_IMPLEMENTED` | Intentionally deferred; analytics and project endpoints serve raw JSON. |
| **Physical File / Photo Storage** | Direct blob storage / S3 / disk storage for uploaded inspection photos or documents. | `NOT_IMPLEMENTED` | Intentionally deferred; evidence requests track structured references and metadata only. |

---

## 3. Provenance Integrity Safeguards

1. **Isolation of Demonstration Data**: Demonstration lifecycle data is marked with `data_source = "DEMONSTRATION_LIFECYCLE_DATA"` and `is_demo_enrichment = true`. It is never merged into official CSV files or analytical outputs.
2. **Responsible Language**: Anomaly signals are described as "risk indicators" or "statistical dispersion". They never assert legal wrongdoing, corruption, or fraud.
3. **No Unsubstantiated Inference**: The backend forbids fuzzy guessing of districts. In the absence of an independent gazetteer reference, unmapped records return `HTTP 403 Forbidden` to District Authorities.
