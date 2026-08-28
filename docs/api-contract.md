# Nirikshak AI API Contract

This document defines the shared frontend-backend data contract.

## Project summary

```json
{
  "project_id": "MPLAD-001",
  "project_name": "Community Water Tank, Ward 14",
  "state": "Sample State",
  "district": "Sample District",
  "constituency": "Sample Constituency",
  "work_category": "Water Supply",
  "vendor_id": "VND-042",
  "sanctioned_amount": 1800000,
  "released_amount": 1640000,
  "expenditure_amount": 1500000,
  "physical_progress_percent": 38,
  "start_date": "2025-11-15",
  "expected_completion_date": "2026-04-15",
  "current_status": "In Progress",
  "latitude": 19.076,
  "longitude": 72.8777,
  "risk_score": 87,
  "risk_level": "High",
  "data_confidence": 91,
  "delay_days": 135,
  "utilization_percent": 83.33,
  "risk_reasons": [
    "Expenditure is high compared with recorded physical progress.",
    "The project is past its expected completion date.",
    "Cost is above the district peer benchmark."
  ]
}
```

## Dashboard summary

```json
{
  "total_projects": 250,
  "total_sanctioned_amount": 320000000,
  "total_expenditure_amount": 201000000,
  "utilization_percent": 62.81,
  "projects_at_risk": 46,
  "critical_anomalies": 8,
  "delayed_projects": 31,
  "suspicious_cost_variations": 17,
  "duplicate_or_near_duplicate_projects": 9
}
```

## API endpoints

- `GET /api/health`
- `POST /api/auth/signin`
- `POST /api/auth/signout`
- `GET /api/auth/me`
- `POST /api/projects/upload`
- `GET /api/dashboard/summary`
- `GET /api/projects`
- `GET /api/projects/{project_id}`
- `POST /api/projects/{project_id}/reviews`
- `GET /api/projects/{project_id}/reviews`
- `GET /api/reports/summary`

## Risk-level definitions

- `Low`: Few or no unusual indicators.
- `Medium`: One moderate indicator or limited data concern.
- `High`: Multiple meaningful indicators requiring review.
- `Critical`: Strong, multiple, high-impact indicators requiring urgent review.

A risk level is a review-priority label. It is not a finding of fraud.
