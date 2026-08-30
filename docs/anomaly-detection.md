# NIRIKSHAK AI - Anomaly Detection Engine

This document outlines the architecture, mathematical formulas, thresholds, and configuration details for the anomaly detection layer in Nirikshak AI.

---

## 1. Core Principles & Terminology
> [!IMPORTANT]
> **"An anomaly indicates deviation from observed patterns and is not proof of fraud or misconduct."**
> 
> The Anomaly Detection Engine is an unsupervised, explainable decision-support tool. It flags records that are statistically unusual or highly redundant for human audit. It does not issue legal or definitive fraud findings.

Key terminology:
* **Anomaly**: A record that deviates significantly from statistical or logical patterns.
* **Investigation Priority Score**: A consolidated relative priority score (0–100) indicating which records require immediate review.
* **Review Priority Level**: Tabular priority labels mapped from the score (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).

---

## 2. Detector Modules

```
                       [ engineered_features.csv ]
                                    │
       ┌────────────────┬───────────┴───────────┬────────────────┐
       ▼                ▼                       ▼                ▼
[ Cost Detector ]  [ Exact Dup ]         [ Near-Dup ]     [ Pattern Burst ]
  ├─ Global Pct      └─ Graded severity    └─ Contextual    └─ Rolling 30d
  ├─ Peer Median        (low to critical)     Scoring          95% Quantiles
  └─ Z-scores (LOO)                          (Blocking)
       │                │                       │                │
       └────────────────┼───────────────────────┼────────────────┘
                        ▼
             [ Risk Aggregator ]
              └─ Weighted Max Severity (mapped to Review Priority level)
                        │
                        ▼
             [ anomaly_results.csv / json ]
```

### A. Cost Anomaly Detector (`cost_detector.py`)
Checks for monetary outliers compared to global patterns and peer dimensions:
* **Global Percentile**: Flagged if `allocation_amount_percentile_global > 0.95` (top 5% globally).
* **Leave-One-Out (LOO) Peer Median**:
  For peer dimensions (`state`, `house`, `mp_name`, `constituency`, `ida`, `work_type`), computes the median of the peer group *excluding the current record*:
  $$\text{loo\_median} = \text{Median}\left(\{ x_j \in \text{Peer Group} \mid j \neq i \}\right)$$
  Flags a `medium` severity anomaly if:
  $$\frac{\text{allocation\_amount}_i}{\text{loo\_median}} > 2.0$$
* **Leave-One-Out (LOO) Z-score**:
  Computes Z-score using mean and standard deviation of peers *excluding the current record*:
  $$\text{z-score}_i = \frac{\text{allocation\_amount}_i - \text{loo\_mean}}{\text{loo\_std}}$$
  Flags a `high` severity anomaly if:
  $$\text{z-score}_i \ge 2.5$$
  *(If standard deviation is 0.0, the Z-score is set to 0.0 to prevent division by zero).*
* **Minimum size**: Both peer checks are suppressed if the group size is $< 5$.

### B. Exact Duplicate Detector (`exact_duplicate_detector.py`)
Checks exact duplicates identified during cleaning. Graded severity thresholds:
* **Low/Weak**: Occurrence count is exactly `2`.
* **Medium**: Occurrence count is `3` or `4`.
* **High**: Occurrence count is between `5` and `9` inclusive.
* **Critical**: Occurrence count is `10` or more.

### C. Near-Duplicate Detector (`near_duplicate_detector.py`)
> [!NOTE]
> **Why Raw TF-IDF Similarity Was Insufficient**: Raw text similarity (TF-IDF + Cosine Similarity) flags standardized template work descriptions (e.g. *"NA - Street lights"*, *"NA - Installing hand pumps"*) as anomalies due to a high text match rate of 1.0, even though these represent legitimate menu choices. The Step 3.1 upgrade introduces contextual scoring to distinguish benign template reuse from suspicious duplicates.
> 
> **"Near-duplicate detection identifies records requiring investigation; it does not establish fraud or duplicate expenditure."**

The upgraded detector generates pairwise candidates using blocking keys and calculates a multi-factor **Contextual Suspicion Score** ($S_{\text{context}}$) ranging from `0.0` to `1.0`:

* **Template-Frequency Discount**:
  To prevent common standardized descriptions from dominating the suspicion score, a gradual discount is applied to text similarity:
  $$\text{frequency\_discount} = \max\left(0.0, \min\left(1.0, 1.0 - \frac{\text{template\_frequency} - 1}{50}\right)\right)$$
  $$\text{TextContribution} = \text{text\_similarity} \times \text{frequency\_discount}$$
  * A template appearing $\ge 51$ times yields a `0.0` text contribution.
* **Location Similarity**: Fraction of populated comparable location fields (state, constituency, city, ward, block, village) that match. Missing-vs-missing is excluded from matches.
* **Date Proximity**:
  $$\text{date\_proximity} = \max\left(0.0, 1.0 - \frac{\text{date\_gap\_days}}{365.0}\right)$$
  (Same day = 1.0, gaps $\ge 1$ year = 0.0). Missing dates yield a 0.0 contribution.
* **Cross-MP Signal**: Set to `1.0` if different MPs recommend similar works in the same constituency with location similarity $\ge 0.5$, amount ratio $\ge 0.8$, or date proximity $\ge 0.8$. Otherwise, `0.0`.
* **Formula & Weights**:
  $$S_{\text{context}} = 0.30 \cdot \text{TextContribution} + 0.20 \cdot \text{LocSim} + 0.20 \cdot \text{Const} + 0.15 \cdot \text{AmtRatio} + 0.05 \cdot \text{WType} + 0.05 \cdot \text{DateProx} + 0.05 \cdot \text{CrossMP}$$
* **Pair Classifications**:
  * **`potentially_suspicious`**: $S_{\text{context}} \ge 0.70$ (severity = `high`). Triggers record-level anomaly flag.
  * **`contextual_near_duplicate`**: $0.40 \le S_{\text{context}} < 0.70$ (severity = `medium`).
  * **`template_match`**: $S_{\text{context}} < 0.40$ (severity = `low`).

### D. Pattern Anomaly Detector (`pattern_detector.py`)
Checks for unusual concentration of recommendation activity:
* **Dynamic Thresholds**: Instead of hard-coding arbitrary thresholds, the detector calculates the **95th percentile** of rolling 30-day recommendation counts from the current dataset:
  * $\text{MP rolling threshold} = \max(\text{Quantile}_{95}(\text{MP counts}), 10)$
  * $\text{Constituency rolling threshold} = \max(\text{Quantile}_{95}(\text{Constituency counts}), 15)$
* Flags a `medium` severity anomaly if the record's rolling count exceeds the dynamic threshold.

---

## 3. Risk Aggregator & Level Mapping
The aggregator combines maximum severities from each detector:

1. **Severity Mapping**:
   * `none` ➔ 0.0
   * `low` ➔ 0.2
   * `medium` ➔ 0.4
   * `high` ➔ 0.7
   * `critical` ➔ 1.0
2. **Formula**:
   $$\text{Priority Score} = 100 \times \left( w_{\text{cost}} \cdot s_{\text{cost}} + w_{\text{exact}} \cdot s_{\text{exact}} + w_{\text{near}} \cdot s_{\text{near}} + w_{\text{pattern}} \cdot s_{\text{pattern}} \right)$$
   *Default weights (defined in `config.py`):*
   * $w_{\text{cost}} = 0.25$
   * $w_{\text{exact}} = 0.35$
   * $w_{\text{near}} = 0.20$
   * $w_{\text{pattern}} = 0.20$
3. **Review Level Classification**:
   * `0.0 - 20.0` ➔ **`LOW`** (Descriptive baseline / minor anomalies)
   * `21.0 - 50.0` ➔ **`MEDIUM`** (Moderate indicators; queue for standard audit)
   * `51.0 - 80.0` ➔ **`HIGH`** (Multiple meaningful outliers; prioritize review)
   * `81.0 - 100.0` ➔ **`CRITICAL`** (Urgent investigation priority)

---

## 4. Pipeline Outputs
Tabular results are written to `data/processed/anomaly_results.csv`, pairwise relationships to `data/processed/duplicate_pairs.csv`, and comprehensive nested evidence items to `data/reports/anomaly_results.json`.

---

## 5. Limitations
1. **Descriptive Peer Benchmarks**: Current peer stats are descriptive characteristics of the full dataset. Leave-one-out parsing was added to avoid self-influence, but rolling deployment requires a sliding window approach.
2. **Imbalance**: Tabular records are heavily skewed towards unsanctioned normal works, limiting machine learning applications.
