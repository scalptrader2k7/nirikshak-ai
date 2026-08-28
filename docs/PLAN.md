# Nirikshak AI MVP Plan

## Problem

SIH26102: Build an AI-powered system that helps authorised officials
identify anomalies, fraud indicators, and inefficiencies in MPLADS
implementation.

## Product boundary

Nirikshak AI is an explainable decision-support platform.

It prioritises projects for human review based on unusual patterns.
It does not declare fraud, impose penalties, block payments, or make
final decisions.

For the MVP, data is uploaded as CSV and is public, synthetic, or
anonymised. The prototype does not connect to live government systems.

## Core workflow

MPLADS-style CSV data
→ validation and standardisation
→ indicator calculation
→ anomaly detection
→ risk score
→ evidence and explanation
→ human review
→ report

## MVP features

1. Fixed demo sign-in.
2. CSV upload and validation.
3. Dashboard with project, financial, utilisation, risk, delay, and
   anomaly summary metrics.
4. Searchable and filterable project explorer.
5. Explainable risk score: Low, Medium, High, or Critical.
6. Project case file with risk reasons and peer comparison.
7. Human review actions and audit history.
8. Downloadable project-risk report.

## Risk indicators

- Expenditure or release amount compared with physical progress.
- Project delay beyond expected completion date.
- Cost variance against comparable projects.
- Vendor concentration where vendor data is available.
- Duplicate identifiers, coordinates, or near-duplicate descriptions.
- Missing, inconsistent, or low-confidence data.

## Technical direction

- Frontend: Next.js.
- Backend: Python FastAPI.
- Database: SQLite.
- Data: CSV upload plus synthetic/anonymised demonstration records.
- Deployment: local development first; Docker packaging later.

## Non-goals for the MVP

- Live access to MPLADS, PFMS, GeM, or other government databases.
- Automatic fraud accusation or enforcement action.
- Production-grade identity verification.
- Complex predictive model claims without validated data.
- Real-time monitoring claims.
