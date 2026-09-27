# NIRIKSHAK AI — API Access Control Matrix

This document defines the authoritative access control matrix for all endpoints exposed under `/api/v1/` in the NIRIKSHAK AI backend.

---

## 1. Access Classifications

- **`PUBLIC`**: Open access without authentication. Reserved for health checks, system metrics, public metadata, initial login, and public project catalog/search.
- **`AUTHENTICATED_OFFICIAL`**: Requires a valid server-side session authenticated via HttpOnly cookie or bearer token. Access is granted to any valid authenticated account.
- **`ROLE_AND_SCOPE_RESTRICTED`**: Requires both valid authentication AND backend authorization based on authoritative role and data scope. Access out-of-scope returns `HTTP 403 Forbidden`.

---

## 2. Official Product Roles & Access Summary

| Role | Classification | Authorized Scope | Operational Workflow Mutation | Forensic Decisions |
| :--- | :--- | :--- | :--- | :--- |
| **`CITIZEN`** | Public Access | Public Views Only | Disallowed | Disallowed |
| **`MP`** | Authenticated Official | Authorized Constituency | Disallowed (Monitor Only) | Disallowed |
| **`DISTRICT_AUTHORITY`** | Authenticated Official | Trusted Mapped District | Allowed (Within District) | Allowed (Within District) |
| **`STATE_NODAL_AUTHORITY`** | Authenticated Official | Authorized State | Disallowed (Coordinate Only) | Disallowed |
| **`MOSPI`** | Authenticated Official | National Scope | Disallowed (Oversee/Analyze Only) | Disallowed |

> [!NOTE]
> `ADMIN` and `INVESTIGATOR` are internal maintenance and testing capabilities only. They are not exposed as user-facing portal choices, onboarding options, or public roles.

---

## 3. Detailed Route Matrix

| HTTP Method | Route | Access Classification | Allowed Roles | Scope Behavior | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | `PUBLIC` | All (Anonymous) | Unscoped | System health, uptime, and dataset caching status. |
| `GET` | `/api/v1/statistics` | `PUBLIC` | All (Anonymous) | Unscoped | Aggregate summary statistics across official 742 records. |
| `GET` | `/api/v1/auth/portal-options` | `PUBLIC` | All (Anonymous) | Unscoped | Returns user-facing portals (`MOSPI`, `STATE_NODAL_AUTHORITY`, `DISTRICT_AUTHORITY`, `MP`) and citizen portal (`CITIZEN`). |
| `POST` | `/api/v1/auth/login` | `PUBLIC` | All (Anonymous) | Unscoped | Authenticates credentials, creates server session, attaches HttpOnly cookie. Backend account determines role and scope. |
| `POST` | `/api/v1/auth/logout` | `AUTHENTICATED_OFFICIAL` | All Authenticated | Session-bound | Revokes active session and clears client cookie. |
| `GET` | `/api/v1/auth/me` | `AUTHENTICATED_OFFICIAL` | All Authenticated | User-bound | Returns authoritative identity, role, scope, and onboarding completion status. 401 if unauthenticated. |
| `POST` | `/api/v1/auth/portal-access` | `AUTHENTICATED_OFFICIAL` | All Authenticated | User-bound | Verifies whether role can access requested portal. Never mutates role. Rejects `ADMIN` and `INVESTIGATOR` portals. |
| `GET` | `/api/v1/auth/onboarding` | `AUTHENTICATED_OFFICIAL` | All Authenticated | User-bound | Retrieves editable profile fields for onboarding. |
| `PATCH` | `/api/v1/auth/onboarding` | `AUTHENTICATED_OFFICIAL` | All Authenticated | User-bound | Updates `full_name`, `designation`, `phone`. Rejects attempts to alter role or scope. |
| `POST` | `/api/v1/auth/onboarding/complete` | `AUTHENTICATED_OFFICIAL` | All Authenticated | User-bound | Marks onboarding completed. |
| `GET` | `/api/v1/projects` | `PUBLIC` / `ROLE_AND_SCOPE_RESTRICTED` | Public / Authenticated Officials | Scoped for Officials | Authenticated officials have queries strictly constrained to backend scope (MP: constituency; State Nodal: state; District Authority: trusted mapped district). Public browsing fallback for citizen. |
| `GET` | `/api/v1/projects/search` | `PUBLIC` / `ROLE_AND_SCOPE_RESTRICTED` | Public / Authenticated Officials | Scoped for Officials | Public search query across project works and locations; automatically scoped if official session exists. |
| `GET` | `/api/v1/projects/{id}` | `PUBLIC` | All (Anonymous) | Unscoped | Public-safe project record view containing only official public fields and disclaimer. Zero internal notes, reviewer IDs, or audit events. |
| `GET` | `/api/v1/projects/{id}/overview` | `ROLE_AND_SCOPE_RESTRICTED` | `MP`, `DISTRICT_AUTHORITY`, `STATE_NODAL_AUTHORITY`, `MOSPI` | Enforced | Project overview package. 401 if unauthenticated; 403 if record is outside user scope or district is unmapped. |
| `GET` | `/api/v1/projects/{id}/peer-benchmark` | `ROLE_AND_SCOPE_RESTRICTED` | `MP`, `DISTRICT_AUTHORITY`, `STATE_NODAL_AUTHORITY`, `MOSPI` | Enforced | Stable statistical peer dispersion metrics (local state + category, or national fallback). 401 if unauthenticated; 403 if out of scope. |
| `GET` | `/api/v1/projects/{id}/duplicates` | `ROLE_AND_SCOPE_RESTRICTED` | `MP`, `DISTRICT_AUTHORITY`, `STATE_NODAL_AUTHORITY`, `MOSPI` | Enforced | Duplicate explorer for single record (exact clusters, near-duplicate pairs). 401 if unauthenticated; 403 if out of scope. |
| `GET` | `/api/v1/duplicates` | `ROLE_AND_SCOPE_RESTRICTED` | `MP`, `DISTRICT_AUTHORITY`, `STATE_NODAL_AUTHORITY`, `MOSPI` | Enforced | Paginated duplicate relationships across user's authorized jurisdiction. 401 if unauthenticated. |
| `GET` | `/api/v1/projects/{id}/demo-lifecycle` | `ROLE_AND_SCOPE_RESTRICTED` | `MP`, `DISTRICT_AUTHORITY`, `STATE_NODAL_AUTHORITY`, `MOSPI` | Enforced | Demonstration lifecycle intelligence (payment anomalies, compliance, inspections). 401 if unauthenticated; 403 if out of scope. |
| `GET` | `/api/v1/cases` | `ROLE_AND_SCOPE_RESTRICTED` | `MP`, `DISTRICT_AUTHORITY`, `STATE_NODAL_AUTHORITY`, `MOSPI` | Enforced | Forensic investigation cases. Results filtered strictly to backend scope. Client parameters cannot escalate scope. 401 if unauthenticated. |
| `GET` | `/api/v1/cases/{id}` | `ROLE_AND_SCOPE_RESTRICTED` | `MP`, `DISTRICT_AUTHORITY`, `STATE_NODAL_AUTHORITY`, `MOSPI` | Enforced | Single case summary. 401 if unauthenticated; 403 if out of scope. |
| `GET` | `/api/v1/cases/{id}/detail` | `ROLE_AND_SCOPE_RESTRICTED` | `MP`, `DISTRICT_AUTHORITY`, `STATE_NODAL_AUTHORITY`, `MOSPI` | Enforced | Complete forensic case detail package. 401 if unauthenticated; 403 if out of scope. |
| `GET` | `/api/v1/cases/{id}/workflow` | `ROLE_AND_SCOPE_RESTRICTED` | `MP`, `DISTRICT_AUTHORITY`, `STATE_NODAL_AUTHORITY`, `MOSPI` | Enforced | Retrieves current operational workflow state. 401 if unauthenticated; 403 if out of scope. |
| `PATCH` | `/api/v1/cases/{id}/workflow/status` | `ROLE_AND_SCOPE_RESTRICTED` | `DISTRICT_AUTHORITY` | Enforced | Transitions operational state (`DETECTED` -> `PRIORITIZED` -> `ASSIGNED` -> `UNDER_REVIEW` -> ... -> `CLOSED`). State transitions validated. 403 for State Nodal, MoSPI, MP, Citizen, or out-of-scope officials. |
| `POST` | `/api/v1/cases/{id}/reviews` | `ROLE_AND_SCOPE_RESTRICTED` | `DISTRICT_AUTHORITY` | Enforced | Records human review outcome. Reviewer identity derived from session. 403 for State Nodal, MoSPI, MP, Citizen, or out-of-scope officials. |
| `GET` | `/api/v1/cases/{id}/reviews` | `ROLE_AND_SCOPE_RESTRICTED` | `MP`, `DISTRICT_AUTHORITY`, `STATE_NODAL_AUTHORITY`, `MOSPI` | Enforced | Human review history. 401 if unauthenticated; 403 if out of scope. |
| `POST` | `/api/v1/cases/{id}/evidence-requests` | `ROLE_AND_SCOPE_RESTRICTED` | `DISTRICT_AUTHORITY` | Enforced | Creates evidence verification request (`REQUESTED`). Requester identity derived from session. 403 for State Nodal, MoSPI, MP, Citizen, or out-of-scope officials. |
| `GET` | `/api/v1/cases/{id}/evidence-requests` | `ROLE_AND_SCOPE_RESTRICTED` | `MP`, `DISTRICT_AUTHORITY`, `STATE_NODAL_AUTHORITY`, `MOSPI` | Enforced | Lists evidence requests for case. 401 if unauthenticated; 403 if out of scope. |
| `PATCH` | `/api/v1/cases/{id}/evidence-requests/{req_id}` | `ROLE_AND_SCOPE_RESTRICTED` | `DISTRICT_AUTHORITY` | Enforced | Updates verification tracking status following strict separate graph: `REQUESTED` -> `RECEIVED` -> `UNDER_VERIFICATION` -> `VERIFIED` or `REJECTED`. 403 for State Nodal, MoSPI, MP, Citizen, or out-of-scope officials. |
| `GET` | `/api/v1/cases/{id}/audit` | `ROLE_AND_SCOPE_RESTRICTED` | `MP`, `DISTRICT_AUTHORITY`, `STATE_NODAL_AUTHORITY`, `MOSPI` | Enforced | Retrieves workflow audit log. 401 if unauthenticated; 403 if out of scope. |
| `GET` | `/api/v1/analytics/trends/allocations` | `ROLE_AND_SCOPE_RESTRICTED` | `MP`, `DISTRICT_AUTHORITY`, `STATE_NODAL_AUTHORITY`, `MOSPI` | Enforced | Time-series allocation trends scoped to user jurisdiction. 401 if unauthenticated. |
| `GET` | `/api/v1/analytics/trends/recommendations` | `ROLE_AND_SCOPE_RESTRICTED` | `MP`, `DISTRICT_AUTHORITY`, `STATE_NODAL_AUTHORITY`, `MOSPI` | Enforced | Time-series recommendation trends scoped to user jurisdiction. 401 if unauthenticated. |
| `GET` | `/api/v1/analytics/trends/risk` | `ROLE_AND_SCOPE_RESTRICTED` | `MP`, `DISTRICT_AUTHORITY`, `STATE_NODAL_AUTHORITY`, `MOSPI` | Enforced | Time-series risk score trends scoped to user jurisdiction. 401 if unauthenticated. |
| `GET` | `/api/v1/analytics/trends/anomalies` | `ROLE_AND_SCOPE_RESTRICTED` | `MP`, `DISTRICT_AUTHORITY`, `STATE_NODAL_AUTHORITY`, `MOSPI` | Enforced | Time-series anomaly detector trends scoped to user jurisdiction. 401 if unauthenticated. |
| `GET` | `/api/v1/analytics/implementing-authorities` | `ROLE_AND_SCOPE_RESTRICTED` | `MP`, `DISTRICT_AUTHORITY`, `STATE_NODAL_AUTHORITY`, `MOSPI` | Enforced | Aggregated statistics for Implementing District Authorities scoped to user jurisdiction. 401 if unauthenticated. |
| `GET` | `/api/v1/analytics/implementing-authorities/{encoded_ida}` | `ROLE_AND_SCOPE_RESTRICTED` | `MP`, `DISTRICT_AUTHORITY`, `STATE_NODAL_AUTHORITY`, `MOSPI` | Enforced | Detailed statistics for a specific Implementing District Authority. 401 if unauthenticated; 404 if out of scope. |
| `GET` | `/api/v1/analytics/concentration` | `ROLE_AND_SCOPE_RESTRICTED` | `MP`, `DISTRICT_AUTHORITY`, `STATE_NODAL_AUTHORITY`, `MOSPI` | Enforced | Concentration indicators and temporal clusters scoped to user jurisdiction. 401 if unauthenticated. |
| `GET` | `/api/v1/system/detectors` | `AUTHENTICATED_OFFICIAL` | All Authenticated Officials | Global | Governance metadata registry for all 5 analytical detectors. 401 if unauthenticated. |
| `GET` | `/api/v1/system/provenance` | `PUBLIC` | All (Anonymous) | Unscoped | Dataset and pipeline provenance metadata distinguishing official, derived, and demonstration data. |
