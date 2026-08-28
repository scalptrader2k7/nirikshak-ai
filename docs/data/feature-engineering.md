# NIRIKSHAK AI - Feature Engineering Layer

This document outlines the design, transformations, and properties of the features engineered in Step 2 of the NIRIKSHAK AI project.

The feature engineering layer takes the cleaned MPLADS dataset as its input and appends engineered features designed to support downstream anomaly detection. The output row count (742) is identical to the cleaned input dataset.

---

## Feature Groups

### 1. TEXT FEATURES
Extracts structural and semantic keyword characteristics from the `work` column:
* **Metrics**:
  * `work_text_length`: Character count of the work description.
  * `work_word_count`: Total word count.
  * `work_unique_word_count`: Count of unique words (useful to identify repetitive templates).
* **Independent Keyword Flags** (Boolean):
  * Check for independent case-insensitive keyword matches:
    * `work_has_road_keyword`: Match on `road`, `pathway`, `culvert`, `bridge`, `ghat`, `stair` (and plurals).
    * `work_has_building_keyword`: Match on `building`, `hall`, `community center`, `shed`, `room`, `crematorium`, `structure`, `anganwadi`, `crèche`, `cremation`.
    * `work_has_water_keyword`: Match on `water`, `drinking`, `pump`, `well`, `tube`, `borewell`, `tank`, `pond`, `lake`.
    * `work_has_electrical_keyword`: Match on `light`, `lighting`, `electricity`, `energy`, `solar`.
    * `work_has_school_keyword`: Match on `school`, `college`, `educational`, `smart board`, `projector`, `furniture`, `it system`, `library`.
    * `work_has_health_keyword`: Match on `health`, `hospital`, `prosthetic`, `wheel chair`, `tricycle`, `ambulance`, `aid`, `disabled`, `abled`.
    * `work_has_drainage_keyword`: Match on `drain`, `drainage`, `gutter`.
    * `work_has_repair_keyword`: Match on `repair`, `renovation`, `improvement`.
* **Primary Work Type**:
  * `work_type`: A convenience classification grouping the work. Assigned via a priority list (`water > road > building > drainage > electrical > school > health > repair`). Default is `other` if no keywords are matched.

---

### 2. AMOUNT FEATURES
Normalizes monetary information and flags relative deviation values:
* **Log-Transform**:
  * `allocation_amount_log`: Computed as \(\ln(1 + \text{allocation\_amount})\). Safely handles missing/zero values.
* **Global Percentile**:
  * `allocation_amount_percentile_global`: The global rank of the allocation amount (scale: 0.0 to 1.0).
* **Peer Group Benchmarks**:
  * Benchmarked across peer groups: `state`, `house`, `mp_name`, `constituency`, `ida`, and `work_type`.
  * > [!IMPORTANT]
    > **Group Size Constraint**: To ensure statistical relevance and prevent noisy comparisons, a minimum group size of **5** is strictly enforced. Groups with fewer than 5 records will output `NaN` for all benchmark statistics.
  * > [!NOTE]
    > **Descriptive Nature**: These benchmarks represent descriptive statistical properties calculated across the current dataset, not leakage-safe historical scores. Downstream modeling steps will calculate historical-only rolling scores separately.
  * For groups matching the minimum size:
    * `peer_[dim]_median_amount`: Median amount.
    * `peer_[dim]_mean_amount`: Mean amount.
    * `peer_[dim]_std_amount`: Standard deviation of amounts.
    * `amount_vs_peer_[dim]_median`: Ratio computed as \(\frac{\text{amount}}{\text{peer\_median}}\).
    * `amount_zscore_peer_[dim]`: Z-score computed as \(\frac{\text{amount} - \text{peer\_mean}}{\text{peer\_std}}\). If standard deviation is 0.0, the Z-score is set to 0.0 to prevent division by zero.

---

### 3. TEMPORAL FEATURES
Extracts time-based features and burst metrics from `recommended_date`:
* **Datetime Parts**: `recommendation_year`, `recommendation_month`, `recommendation_quarter`, `recommendation_day_of_week`, `recommendation_day_of_month`.
* **Descriptive Calendar Aggregates**:
  * `mp_recommendations_in_month`: Total count of recommendations by the same MP in that calendar month.
  * `constituency_recommendations_in_month`: Total count of recommendations in the same constituency in that calendar month.
* **Leakage-Safe Rolling Burst Signals**:
  * `mp_recommendations_rolling_30d`: Count of works recommended by the same MP within a rolling 30-day window.
  * `constituency_recommendations_rolling_30d`: Count of works in the same constituency within a rolling 30-day window.
  * > [!IMPORTANT]
    > **No Data Leakage**: Computed strictly chronologically (i.e. only counting past recommendations up to and including the current record's timestamp) to prevent lookahead bias.

---

### 4. LOCATION FEATURES
Identifies location completeness and builds candidate grouping keys:
* **Flags** (Boolean): `has_city`, `has_ward`, `has_block`, `has_village` based on non-null/non-empty values.
* **Completeness**:
  * `location_completeness_score`: Fraction of filled location fields out of the 6 location dimensions (state, constituency, city, ward, block, village).
* **Location Key**:
  * `location_key`: Pipe-separated string (`state|constituency|city|ward|block|village`) representing the filled coordinates of the project.

---

### 5. ENTITY FEATURES
Aggregates occurrence volume across different project entities:
* `mp_work_count`: Count of projects associated with this MP.
* `constituency_work_count`: Count of projects in this constituency.
* `state_work_count`: Count of projects in this state.
* `ida_work_count`: Count of projects assigned to this Implementing District Authority (IDA).

---

### 6. DUPLICATE FEATURES
Retains Step 1 fields and creates candidate keys for near-duplicate analysis:
* `is_exact_duplicate`: Boolean indicating if `duplicate_occurrence_count > 1`.
* **Blocking/Candidate Keys**:
  * `blocking_key_work_type_state`: `work_type` + `state`.
  * `blocking_key_work_type_constituency`: `work_type` + `constituency`.
