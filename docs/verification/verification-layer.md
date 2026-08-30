# Evidence & Verification Intelligence Layer

This document outlines the architecture, specifications, and execution instructions for the **Evidence & Verification Intelligence Layer** of the NIRIKSHAK AI platform.

---

## 1. Purpose

The Evidence & Verification Intelligence Layer is designed as an **investigation-support and verification-assistance system**. Its primary objective is to enrich raw anomaly detection outputs and investigation priority scores into structured, explainable **Verification Packages** (Briefs) for human auditors.

This layer is strictly analytic and advisory:
* It compiles positive signals, risk signals, and data limitations.
* It recommends which documents to request next for verification.
* **IMPORTANT**: It does NOT establish wrongdoing, fraud, or corruption. The presence of indicators justifies increased human verification, but does not constitute a determination of guilt.

---

## 2. Input Datasets

The layer processes only existing outputs from preceding stages of the pipeline:
1. `data/processed/mplads_clean.csv`: Cleaned record fields including state, MP names, recommended dates, and allocation amounts.
2. `data/processed/duplicate_pairs.csv`: Relational near-duplicate scoring maps.
3. `data/processed/investigation_cases.csv` & `data/reports/investigation_cases.json`: Priority-ranked cases containing primary detector and severity scores.
4. `data/processed/mplads_features.csv`: Engineered work categories (`work_type`).

---

## 3. Output Schema

The layer generates two deterministic artifacts:
1. **JSON Report**: `data/reports/verification_cases.json`
   - Nested structure containing detailed Pydantic-validated sub-models suitable for direct REST API routing and frontend parsing.
2. **Tabular CSV**: `data/processed/verification_cases.csv`
   - Flat schema suitable for tabular review (nested collections such as evidence logs and next-action checklists are flattened into JSON strings).

---

## 4. Components & Intelligence Models

### A. Evidence Service (`evidence_service.py`)
Classifies evidence relevant to each case into:
* **Available**: Concrete values extracted directly from the records (e.g. allocation amount, recommended date).
* **Derived**: Secondary values calculated by the platform (e.g. peer count, duplicate occurrences).
* **Missing**: Placeholders for documents not available in the current dataset (e.g. site photographs, Measurement Book extracts). Missing fields are explicitly tagged as `not_available_in_current_dataset`.

### B. Evidence Freshness (`calculate_freshness`)
Computes date gaps relative to a centralized audit reference date (default: `2024-03-15`):
$$\text{evidence\_age\_days} = \text{reference\_date} - \text{recommended\_date}$$
Classification:
* `fresh`: $\le 7$ days
* `aging`: $> 7$ and $\le 30$ days
* `stale`: $> 30$ days
* `not_available`: Date value is empty or missing.

### C. Peer Benchmarking (`peer_benchmark.py`)
Computes spending benchmarks by identifying similar project groups:
* **Primary Group**: Projects sharing same `(work_type, state)`.
* **Fallback Group**: National fallback matching `work_type` if local group size $< 3$.
* **Insufficient Data**: Status set to `insufficient_data` if national peer group size $< 3$ (returns null statistics).

Calculated metrics (excluding the target project itself to avoid skewing median/mean):
* `project_amount`: Allocation amount of current project.
* `peer_median` / `peer_mean`: Comparative averages.
* `amount_deviation_percent`: $\frac{\text{project\_amount} - \text{peer\_median}}{\text{peer\_median}} \times 100$
* `amount_ratio_to_median`: $\frac{\text{project\_amount}}{\text{peer\_median}}$

### D. Reality Gap Analysis (`reality_gap.py`)
Checks the difference between reported fund utilization and actual physical progress:
$$\text{reality\_gap} = \text{fund\_utilization} - \text{physical\_progress}$$
* Since neither column is available in the current MPLADS dataset, this returns `reality_gap_status = "not_available"`.
* Configurable bounds are ready for future integration.

### E. Integrity Passport (`integrity_passport.py`)
Synthesizes all triggered risk indicators into a deterministic overview:
* **Status**: Maps investigation priority level:
  - `LOW` $\rightarrow$ `GREEN`
  - `MEDIUM` $\rightarrow$ `AMBER`
  - `HIGH` / `CRITICAL` $\rightarrow$ `RED` (RED indicates available indicators justify increased human verification).
* **Score**: $\text{integrity\_score} = 100.0 - \text{investigation\_priority\_score}$ (clamped between $0.0$ and $100.0$).
* **Risk & Positive Signals**: Exposes active detectors (e.g. Cost Outlier, Repeated Records) and positive indicators (e.g. Unique Work Description).

### F. Payment Gate Advisory (`payment_gate.py`)
Provides an advisory status to guide auditor workflows:
* `HOLD_AND_INSPECT`: For `HIGH` / `CRITICAL` priorities.
* `VERIFY`: For `MEDIUM` priorities.
* `PROCEED`: For `LOW` priorities.
* **Next Evidence Checklist**: Checklist of documents to request (e.g. detailed estimates for cost anomalies, sanction documents for duplicates).

---

## 5. Disclaimer Requirement
Every verification brief must contain the following text exactly:
> Risk indicators identify records that may warrant further review. They do not establish wrongdoing or corruption.

---

## 6. Pipeline Execution

The verification pipeline is deterministic and idempotent. Run the following command from the project root:

```powershell
python -m src.verification.build_verification
```

---

## 7. Testing

To run the verification test suite:

```powershell
py -m pytest tests/verification/ -v
```

To run the complete repository suite ensuring no regressions:

```powershell
py -m pytest -v
```
