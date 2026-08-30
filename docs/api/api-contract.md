# REST API Frontend-Backend Contract Guide

This document defines the REST API contract for the NIRIKSHAK AI system. It serves as the single source of truth for integration between the backend service and the frontend dashboard web application.

---

## 1. Base API URL
All endpoints are versioned and live under the following base path:
```text
http://localhost:8000/api/v1
```

---

## 2. API Value Contracts

### Severity Values
Evidence objects nested within cases use strictly these lowercase severity levels:
* `low`
* `medium`
* `high`
* `critical`

### Priority Level Values
Investigation priority levels use strictly these uppercase labels:
* `LOW`
* `MEDIUM`
* `HIGH`
* `CRITICAL`

### Detector Names
Categorical filters and keys mapping to specific algorithms use strictly these lowercase names:
* `cost` (Cost Anomaly Detector)
* `exact_duplicate` (Exact Duplicate Detector)
* `near_duplicate` (Near-Duplicate Detector)
* `pattern` (Temporal Pattern Burst Detector)

---

## 3. Endpoint Specifications

### A. Health Check
Checks service operational status and cached files load state.

* **Method**: `GET`
* **Path**: `/health`
* **Response Schema (200 OK)**:
  ```json
  {
    "status": "ok",
    "service": "NIRIKSHAK AI API",
    "version": "1.0.0",
    "data_loaded": true
  }
  ```

---

### B. List Investigation Cases
Exposes the core ranked and paginated list of cases.

* **Method**: `GET`
* **Path**: `/cases`
* **Query Parameters (All Optional)**:
  * `page` (integer, default: `1`, minimum: `1`) - Page number.
  * `page_size` (integer, default: `20`, range: `1` to `100`) - Number of cases per page.
  * `priority` (string: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) - Filter by priority level.
  * `detector` (string: `cost`, `exact_duplicate`, `near_duplicate`, `pattern`) - Filter by primary detector.
  * `severity` (string: `low`, `medium`, `high`, `critical`) - Filter by highest severity.
  * `state` (string) - Exact match filter on state name.
  * `constituency` (string) - Exact match filter on constituency.
  * `mp_name` (string) - Exact match filter on MP name.
  * `work_type` (string) - Exact match filter on work type.
  * `min_score` (float, range: `0.0` to `100.0`) - Lower bound priority score.
  * `max_score` (float, range: `0.0` to `100.0`) - Upper bound priority score.
  * `search` (string) - Case-insensitive partial string search on text fields.
  * `sort_by` (string, default: `"rank"`) - Whitelisted fields: `rank`, `investigation_priority_score`, `allocation_amount`, `record_id`.
  * `sort_order` (string: `asc`, `desc`, default: `"asc"`) - Sort direction.

* **Response Schema (200 OK)**:
  ```json
  {
    "data": [
      {
        "rank": 1,
        "record_id": 117,
        "mp_name": "SHRI Rajeev Chandrashekhar",
        "house": "Rajya Sabha",
        "state": "Karnataka",
        "constituency": "Sitting Rajya Sabha",
        "city": null,
        "ward": null,
        "block": null,
        "village": null,
        "recommended_date": "2024-03-01",
        "work": "NA - Construction of roads, link roads, pathways or any other road with or without drainage system",
        "work_type": "road",
        "allocation_amount": 500000.0,
        "investigation_priority_score": 61.0,
        "investigation_priority_level": "HIGH",
        "case_status": "OPEN",
        "cost_anomaly": true,
        "exact_duplicate_anomaly": true,
        "near_duplicate_anomaly": true,
        "pattern_anomaly": true,
        "primary_detector": "exact_duplicate",
        "primary_signal": "exact_duplicate_check",
        "highest_severity": "high",
        "highest_severity_score": 3,
        "title": "Repeated Project Record Requires Review",
        "summary": "This project was flagged for review because this exact project record appears 10 times in the dataset. It triggered 4 total indicator(s).",
        "disclaimer": "Risk indicators identify records that may warrant further review. They do not establish wrongdoing or corruption.",
        "evidence_count": 4,
        "evidence": [
          {
            "detector": "exact_duplicate",
            "signal": "exact_duplicate_check",
            "severity": "high",
            "message": "Exact duplicate entry: occurs 10 times in dataset.",
            "value": 10.0,
            "reference_value": null,
            "unit": "count",
            "formatted_message": "This exact project record appears 10 times in the dataset."
          }
        ],
        "related_exact_duplicates": [],
        "related_potentially_suspicious": [],
        "related_contextual_near_duplicates": []
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total_records": 718,
      "total_pages": 36
    },
    "filters": {
      "priority": null,
      "detector": null,
      "severity": null,
      "state": null,
      "constituency": null,
      "mp_name": null,
      "work_type": null,
      "min_score": null,
      "max_score": null,
      "search": null
    }
  }
  ```

---

### C. Single Case Lookup
Retrieves complete details and linkages for a specific case.

* **Method**: `GET`
* **Path**: `/cases/{record_id}`
* **Response Schema (200 OK)**:
  ```json
  {
    "data": {
      "rank": 1,
      "record_id": 117,
      "mp_name": "SHRI Rajeev Chandrashekhar",
      "house": "Rajya Sabha",
      "state": "Karnataka",
      ...
    }
  }
  ```
* **Response Schema (404 Not Found)**:
  Returned if the `record_id` is invalid or does not have `priority_score > 0`.
  ```json
  {
    "detail": "Investigation case not found"
  }
  ```

---

### D. Detailed Case Workspace Aggregator
Retrieves the complete investigation workspace payload for an individual case. Used by the case detail view.

* **Method**: `GET`
* **Path**: `/cases/{record_id}/detail`
* **Response Schema (200 OK)**:
  ```json
  {
    "case": {
      "rank": 1,
      "record_id": 117,
      "mp_name": "SHRI Rajeev Chandrashekhar",
      "house": "Rajya Sabha",
      "state": "Karnataka",
      "constituency": "Sitting Rajya Sabha",
      "recommended_date": "2024-03-01",
      "work": "NA - Construction of roads...",
      "work_type": "road",
      "allocation_amount": 500000.0,
      "investigation_priority_score": 61.0,
      "investigation_priority_level": "HIGH",
      "highest_severity": "high",
      "primary_detector": "cost",
      "primary_signal": "high_deviation",
      "title": "Cost Outlier in road work (allocation: INR 500,000)",
      "summary": "This project allocation is flagged due to an elevated budget deviation relative to peer projects of category road in Karnataka.",
      "evidence": []
    },
    "project": {
      "record_id": 117,
      "work": "NA - Construction of roads...",
      "work_type": "road",
      "mp_name": "SHRI Rajeev Chandrashekhar",
      "state": "Karnataka",
      "constituency": "Sitting Rajya Sabha",
      "block": null,
      "village": null,
      "city": null,
      "ward": null,
      "recommended_date": "2024-03-01",
      "allocation_amount": 500000.0
    },
    "risk_summary": {
      "priority_level": "HIGH",
      "priority_score": 61.0,
      "severity": "high",
      "primary_detector": "cost",
      "evidence_count": 2,
      "related_record_count": 0
    },
    "primary_evidence": {
      "detector": "cost",
      "signal": "high_deviation",
      "severity": "high",
      "message": "Cost outlier: budget is 140.0% higher than peer median",
      "reference_value": 208333.33
    },
    "evidence": {
      "available": [],
      "derived": [],
      "missing": [],
      "stale": []
    },
    "verification": {
      "record_id": 117,
      "rank": 1,
      "peer_benchmark": {
        "status": "success",
        "project_amount": 500000.0,
        "peer_count": 24,
        "peer_median": 208333.33,
        "peer_mean": 215000.00,
        "amount_deviation_percent": 140.0,
        "amount_ratio_to_median": 2.4,
        "peer_group_level": "local",
        "peer_scope": "local"
      },
      "reality_gap": {
        "reality_gap_status": "not_available",
        "explanation": "Reality Gap analysis requires both physical progress and fund utilization..."
      },
      "integrity_passport": {
        "integrity_status": "RED",
        "integrity_score": 39.0,
        "signal_count": 1,
        "positive_signals": ["Record description is unique (no exact duplicates)"],
        "risk_signals": ["Cost outlier detected (+140.0% deviation from peer median)"],
        "data_limitations": ["Physical progress percentage is unavailable..."],
        "explanation": "Integrity Passport status is RED..."
      },
      "payment_gate": {
        "recommendation": "HOLD_AND_INSPECT",
        "reason": "Case exhibits high/critical investigation priority...",
        "required_next_evidence": [
          "Official administrative sanction order copy",
          "Latest geo-tagged site photographs validating physical construction"
        ]
      }
    },
    "peer_benchmark": {
      "status": "success",
      "project_amount": 500000.0,
      "peer_count": 24,
      "peer_median": 208333.33,
      "peer_mean": 215000.00,
      "amount_deviation_percent": 140.0,
      "amount_ratio_to_median": 2.4,
      "peer_group_level": "local",
      "peer_scope": "local"
    },
    "integrity_passport": {
      "integrity_status": "RED",
      "integrity_score": 39.0,
      "signal_count": 1,
      "positive_signals": ["Record description is unique (no exact duplicates)"],
      "risk_signals": ["Cost outlier detected (+140.0% deviation from peer median)"],
      "data_limitations": ["Physical progress percentage is unavailable..."],
      "explanation": "Integrity Passport status is RED..."
    },
    "payment_gate": {
      "recommendation": "HOLD_AND_INSPECT",
      "reason": "Case exhibits high/critical investigation priority...",
      "required_next_evidence": [
        "Official administrative sanction order copy",
        "Latest geo-tagged site photographs validating physical construction"
      ]
    },
    "related_records": {
      "exact_duplicates": [],
      "potentially_suspicious": [],
      "contextual": []
    },
    "available_information": ["allocation_amount", "mp_name", "location", "recommended_date"],
    "missing_information": ["vendor_name", "site_photograph", "measurement_book_extract"],
    "disclaimer": "Risk indicators identify records that may warrant further review. They do not establish wrongdoing or corruption."
  }
  ```
* **Response Schema (404 Not Found)**:
  Returned if the `record_id` is invalid or does not have `priority_score > 0`.
  ```json
  {
    "detail": "Investigation case not found"
  }
  ```

---

### E. Dynamic Aggregate Statistics
Exposes overall counts, priority distributions, and score stats for metric cards and visualizations.

* **Method**: `GET`
* **Path**: `/statistics`
* **Query Parameters (All Optional)**:
  * `state` (string) - Filter stats by state.
  * `constituency` (string) - Filter stats by constituency.
  * `mp_name` (string) - Filter stats by MP name.
  * `work_type` (string) - Filter stats by work type.
  * `priority` (string: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) - Filter stats by priority level.

* **Response Schema (200 OK)**:
  ```json
  {
    "total_records": 742,
    "investigation_cases": 718,
    "priority_distribution": {
      "LOW": 521,
      "MEDIUM": 187,
      "HIGH": 10,
      "CRITICAL": 0
    },
    "detector_distribution": {
      "cost": 160,
      "exact_duplicate": 122,
      "near_duplicate": 436,
      "pattern": 0
    },
    "score": {
      "min": 0.0,
      "max": 61.0,
      "mean": 15.4,
      "median": 8.0
    }
  }
  ```

---

## 4. Error Responses

### HTTP 400 Bad Request
Returned for invalid filter category values, range mismatches, or unsanctioned sorting criteria.
```json
{
  "detail": "Invalid priority level. Must be one of: LOW, MEDIUM, HIGH, CRITICAL"
}
```

### HTTP 422 Unprocessable Entity
FastAPI/Pydantic schema validation failures (e.g. `page_size > 100` or alphabetic letters in `page` number query).
```json
{
  "detail": [
    {
      "loc": ["query", "page_size"],
      "msg": "Input should be less than or equal to 100",
      "type": "less_than_equal"
    }
  ]
}
```
