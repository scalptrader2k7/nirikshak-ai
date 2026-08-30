# Configuration parameters for NIRIKSHAK AI Anomaly Detection Engine

# 1. Group Constraints
PEER_MIN_GROUP_SIZE = 5  # Minimum group size to calculate peer statistics (excluding current)

# 2. Cost Anomaly Thresholds
GLOBAL_PERCENTILE_THRESHOLD = 0.95  # Global percentile rank cutoff (top 5%)
PEER_MEDIAN_RATIO_THRESHOLD = 2.0   # Ratio vs peer median (e.g. 2x peer median)
PEER_ZSCORE_THRESHOLD = 2.5          # Z-score cutoff for peer group (descriptive / leave-one-out)

# 3. Exact Duplicate Severity Thresholds (Grided evidence)
# occurrence count >= threshold
DUP_SEVERITY_WEAK_THRESHOLD = 2      # 2 occurrences = low/weak evidence
DUP_SEVERITY_MEDIUM_THRESHOLD = 3    # 3-4 occurrences = medium
DUP_SEVERITY_HIGH_THRESHOLD = 5      # 5-9 occurrences = high
DUP_SEVERITY_CRITICAL_THRESHOLD = 10  # 10+ occurrences = critical

# 4. Near-Duplicate Thresholds and Weights
SIMILARITY_THRESHOLD = 0.85  # TF-IDF cosine similarity threshold (candidate generation)
NEAR_DUPLICATE_CONTEXT_SCORE_THRESHOLD = 0.70  # Contextual score cutoff to trigger anomaly

# Context Score weights (must sum to 1.0)
WEIGHT_ND_TEXT = 0.30
WEIGHT_ND_LOCATION = 0.20
WEIGHT_ND_CONSTITUENCY = 0.20
WEIGHT_ND_AMOUNT = 0.15
WEIGHT_ND_WORK_TYPE = 0.05
WEIGHT_ND_DATE = 0.05
WEIGHT_ND_CROSS_MP = 0.05

# 5. Pattern Anomaly Thresholds
PATTERN_PERCENTILE_THRESHOLD = 0.95  # Percentile cutoff for rolling count anomalies
PATTERN_MIN_COUNT_THRESHOLD = 10     # Minimum absolute rolling count to trigger an anomaly

# 6. Risk Aggregator Weights (Must sum to 1.0)
WEIGHT_COST = 0.25
WEIGHT_EXACT_DUPLICATE = 0.35
WEIGHT_NEAR_DUPLICATE = 0.20
WEIGHT_PATTERN = 0.20
