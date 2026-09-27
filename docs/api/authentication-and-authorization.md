# NIRIKSHAK AI — Authentication, Role, Scope & Access Control Architecture

## 1. Core Security Principle: Backend-Authoritative Identity
In NIRIKSHAK AI, **roles and permissions cannot be self-assigned**.
- Selecting a portal (e.g. "MoSPI Portal", "State Nodal Portal", "District Authority Portal", "MP Portal") in the UI represents user intent only.
- Portal selection **never determines or elevates permissions**.
- An authenticated user's actual role and data scope are established strictly by their backend database account record.
- If a user with `DISTRICT_AUTHORITY` role attempts to access the `MOSPI` portal, access is denied and redirected to their actual permitted portal.

---

## 2. Official Product Roles & Citizen Access Model

The NIRIKSHAK AI platform recognizes exactly **FOUR** authenticated official user-facing roles:

1. **`MP` (MONITOR)**: Constituency-scoped read access. Authorized to view projects, peer benchmarks, duplicate clusters, and investigation cases within their constituency. Cannot alter forensic workflow, request/verify evidence, or record administrative decisions.
2. **`DISTRICT_AUTHORITY` (ACT / OPERATE)**: District-scoped operational role. Authorized to view projects and manage investigation workflows for projects mapped to their trusted canonical district. The ONLY official portal role permitted to transition workflow status, request/verify/reject evidence, record human reviews, and issue case decisions.
3. **`STATE_NODAL_AUTHORITY` (COORDINATE)**: State-scoped monitoring and coordination visibility across all constituencies and districts within their assigned state. Strictly blocked from performing district operational investigation mutations (transitions, reviews, evidence requests, verifications, rejections, case decisions).
4. **`MOSPI` (OVERSEE / ANALYZE)**: National oversight, policy, detector governance, system provenance, and analytical visibility. Strictly blocked from performing district operational investigation mutations (transitions, reviews, evidence requests, verifications, rejections, case decisions).

### Public Citizen Access
- **`CITIZEN`** access is public and **does not require or use an authenticated official login**.
- Citizens can browse public project records and aggregate statistics.
- Citizens cannot view internal investigative evidence, reviewer notes, workflow audit logs, or mutate case decisions.

### Internal Maintenance Capabilities (`ADMIN` / `INVESTIGATOR`)
- `ADMIN` and `INVESTIGATOR` are **non-user-facing internal/service capabilities** retained strictly for internal maintenance, system operations, and automated test fixtures.
- They are **not exposed** as portal login choices, onboarding roles, or user-facing product options.

---

## 3. Investigation Operational Workflow State Machine

Operational case management tracks cases through an explicit state machine:

```
[ DETECTED ] (Initial operational state for new cases)
     ↓
[ PRIORITIZED ]
     ↓
[ ASSIGNED ]
     ↓
[ UNDER_REVIEW ] ───→ [ EVIDENCE_REQUESTED ]
     │                         ↓
     │                 [ EVIDENCE_RECEIVED ]
     │                         ↓
     └────────────────→ [ VERIFIED ]
                              ↓
                          [ DECIDED ]
                              ↓
                          [ CLOSED ] (Terminal operational state)
```

### Transition Graph Rules:
- **`DETECTED`**: Initial state for newly initialized operational cases. May transition only to `PRIORITIZED`.
- **`PRIORITIZED`**: Case prioritized for forensic investigation. May transition only to `ASSIGNED`.
- **`ASSIGNED`**: Assigned to an investigating officer. May transition to `UNDER_REVIEW`.
- **`UNDER_REVIEW`**: Active review. May transition to `EVIDENCE_REQUESTED` or `VERIFIED`.
- **`EVIDENCE_REQUESTED`**: Formal documentation requested from field authorities. May transition to `EVIDENCE_RECEIVED`.
- **`EVIDENCE_RECEIVED`**: Evidence uploaded and recorded. May transition to `UNDER_REVIEW` or `VERIFIED`.
- **`VERIFIED`**: Evidence verified by inspector. May transition to `DECIDED`.
- **`DECIDED`**: Final administrative decision reached (`CONFIRMED_ANOMALY`, `FALSE_POSITIVE`, etc.). May transition to `CLOSED`.
- **`CLOSED`**: Terminal state. No further transitions permitted.

### Operational State Isolation & Migration:
- Operational state is stored in the persistent database (`case_workflow` table), completely isolated from analytical datasets (`anomaly_results.csv`, `investigation_cases.json`).
- Existing cases already in the database with later states are preserved and never blindly reset.

---

## 3.1. Separate Evidence-Item Verification State Machine

In NIRIKSHAK AI, **individual evidence items follow their own distinct verification lifecycle**, completely separated from the overall investigation case status:

```
[ REQUESTED ] (Evidence item created by District Authority)
      ↓
 [ RECEIVED ] (Evidence metadata / reference submitted)
      ↓
[ UNDER_VERIFICATION ] (Formal verification initiated by District team)
      ├──→ [ VERIFIED ] (Evidence item marked verified by an authorized District reviewer after review)
      └──→ [ REJECTED ] (Evidence item rejected during audit)
```

### Transition Graph Rules:
- **`REQUESTED`**: Formal request registered. Can transition ONLY to `RECEIVED`.
- **`RECEIVED`**: Documentation reference logged. Can transition ONLY to `UNDER_VERIFICATION`.
- **`UNDER_VERIFICATION`**: Active verification by District team. Can transition to `VERIFIED` or `REJECTED`.
- **`VERIFIED`**: Terminal state for verified item. Indicates that the evidence item was marked verified by an authorized District reviewer after review. Cannot transition further.
- **`REJECTED`**: Terminal state for rejected item. Means the **specific evidence item** failed verification (e.g. signature mismatch, missing certification, photo date discrepancy). It does NOT reject or close the overall investigation case.

### Strict Jump Prohibition:
- Direct transitions from `REQUESTED` -> `VERIFIED` or `REQUESTED` -> `REJECTED` are strictly rejected (`HTTP 400 Bad Request`).
- Direct transitions from `RECEIVED` -> `VERIFIED` or `RECEIVED` -> `REJECTED` are strictly rejected (`HTTP 400 Bad Request`).
- All evidence evaluations must pass through `UNDER_VERIFICATION`.

### Evidence Data Model:
Evidence items expose:
- `evidence_request_id` / `request_id`: Unique identifier (e.g., `REQ-XXXXXXXX`)
- `case_id` / `record_id`: Associated project/case record identifier
- `evidence_type`: Domain type (e.g., `measurement_book`, `site_photo`, `lab_quality_test`)
- `status`: One of `REQUESTED`, `RECEIVED`, `UNDER_VERIFICATION`, `VERIFIED`, `REJECTED`
- `requested_at`, `received_at`, `verification_started_at`, `verified_at`, `rejected_at`: RFC-3339 timestamps
- `reviewer_user_id` / `verified_by`, `reviewer_role`: Identity strictly derived from authenticated session
- `verification_note`, `verification_result`, `rejection_reason`: Audit outcomes
- `evidence_reference`, `metadata`: Structured reference data (no fake files or binary mocks)

---

## 4. Safe District Scoping Layer

### Dataset Constraint & Secure-by-Default Design:
The official MPLADS snapshot does not feature a standardized canonical district column. To guarantee complete security and eliminate unauthorized data leaks:
- District scoping **never relies on fuzzy text matching**, city matching, ward/block/village guessing, or LLM inference.
- Scoping is enforced through a deterministic **trusted district-mapping layer** located at `data/enrichment/district_mapping/trusted_districts.csv` and managed by `src/scoping/district_scope.py`.
- **Unmapped Records**: If a project record does not have a verified, trusted district mapping (`is_trusted = True`), it is **strictly inaccessible to `DISTRICT_AUTHORITY`** (HTTP 403 Forbidden on direct query, and excluded from paginated listings).

---

## 5. Authentication & Session Security

```
User (Email + Password)
        ↓
POST /api/v1/auth/login
        ↓
Backend verifies account & bcrypt password
        ↓
Backend generates cryptographically-random session token (256-bit entropy)
        ↓
Backend hashes token with SHA-256 and persists in `sessions` table
        ↓
Backend returns HttpOnly session cookie (nirikshak_session) + safe profile
        ↓
Subsequent requests: cookie validated via SHA-256 hash lookup in database
```

### Password Security:
- Passwords are encrypted using standard **bcrypt** (`bcrypt.gensalt(rounds=12)`).
- Plaintext passwords are never logged, cached, or stored.
- Verification uses secure constant-time verification (`bcrypt.checkpw`).

### Server-Side Sessions:
- Session Token: 256 bits of entropy generated via `secrets.token_urlsafe(32)`.
- The raw token is **never stored in the database**; only the SHA-256 hash is persisted.
- Cookie is `HttpOnly`, `SameSite=Lax`, and configured for strict origin validation.

---

## 6. Access Control Summary

| Classification | Endpoints | Authentication Required? | Scope Enforced? |
| :--- | :--- | :--- | :--- |
| **`PUBLIC`** | `/health`, `/statistics`, `/auth/login`, `/auth/portal-options` | No | No |
| **`AUTHENTICATED_OFFICIAL`** | `/auth/me`, `/auth/logout`, `/auth/portal-access`, `/auth/onboarding` | Yes | User-level |
| **`ROLE_AND_SCOPE_RESTRICTED`** | `/projects/*`, `/cases/*`, `/analytics/*` | Yes | Yes (Constituency / State / District / National) |
