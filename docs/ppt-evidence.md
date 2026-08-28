# Nirikshak AI — Implementation Evidence Log

This document records only features that are implemented, tested, or
demonstrated in the prototype.

Do not describe planned features as completed features in the PPT.

## Product scope

- SIH26102: AI-powered detection of anomalies, fraud indicators, and
  inefficiencies in MPLADS implementation.
- Product name: Nirikshak AI.
- Risk labels: Low Risk, Medium Risk, High Risk, and Critical.
- The system prioritises projects for human review. It does not make
  automatic fraud accusations or enforcement decisions.

## MVP data boundary

- The MVP uses public, synthetic, or anonymised MPLADS-style records.
- Data enters the prototype through CSV upload.
- The MVP does not connect to live government databases.
- Any injected anomaly is a demo signal, not a finding about a real
  project, vendor, officer, constituency, or government department.

## Confirmed foundation

- GitHub repository created and linked to the local project folder.
- Shared project folders created: frontend, backend, data, docs, and scripts.
- Data folders created: data/raw and data/processed.
- Git ignore rules added for secrets, dependencies, generated data,
  local databases, uploads, logs, and editor files.
- Environment-variable template created in `.env.example`.
- Node.js, npm, Python, Docker, Docker Compose, and Git availability
  verified on the development machine.
- Local development is the first deployment target; Docker packaging
  is deferred until the MVP works.

## Evidence to add after implementation

Add an item here only after it works.

- [ ] Next.js frontend starts locally.
- [ ] FastAPI backend health endpoint responds locally.
- [ ] SQLite database initialises locally.
- [ ] CSV upload accepts a valid MPLADS-style file.
- [ ] Validation detects missing required fields.
- [ ] Validation detects duplicate project records.
- [ ] Standardisation handles dates, amounts, categories, and vendor names.
- [ ] Risk engine calculates delay indicators.
- [ ] Risk engine calculates expenditure/progress-gap indicators.
- [ ] Risk engine calculates comparable-project cost variation.
- [ ] Risk engine detects duplicate or near-duplicate descriptions.
- [ ] Risk engine assigns risk score and severity.
- [ ] Every risk alert displays evidence and human-readable reasons.
- [ ] Dashboard shows summary KPIs.
- [ ] Dashboard shows risk distribution and priority review queue.
- [ ] Dashboard supports state, district, category, and risk filters.
- [ ] Project case file displays project data, risk evidence, and comparison.
- [ ] Human review actions are recorded in an audit trail.
- [ ] Report summary can be generated or exported.
- [ ] End-to-end demonstration flow tested.
- [ ] Screenshot evidence captured for the final PPT.

## Screenshot record

Add each final screenshot after capture.

| Feature | Screenshot file | What it proves |
|---|---|---|
| Not captured yet | — | — |