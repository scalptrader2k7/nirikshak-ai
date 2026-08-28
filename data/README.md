# Nirikshak AI Demo Data

This directory contains data used by the Nirikshak AI MVP.

## Data boundary

The MVP uses public, synthetic, or anonymised MPLADS-style records.
It does not connect to live government databases.

The prototype does not make findings about real projects, vendors,
officials, or constituencies. Any injected anomaly is a demonstration
signal for human review.

## Folder usage

- `raw/`: Source CSV files used as demonstration inputs.
- `processed/`: Generated validation and risk-scoring outputs.
  Generated files are ignored by Git.

## Initial project-record fields

- `project_id`
- `state`
- `district`
- `constituency`
- `work_category`
- `project_description`
- `sanctioned_amount`
- `released_amount`
- `expenditure_amount`
- `physical_progress_percent`
- `start_date`
- `expected_completion_date`
- `current_status`
- `vendor_id`
- `latitude`
- `longitude`

Additional fields may be added only when they are documented in the
shared API contract.