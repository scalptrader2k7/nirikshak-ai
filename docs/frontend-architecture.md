# Frontend Foundation & Design System Architecture

This document outlines the design tokens, components layout, API contracts, routing, and directory structure of the **NIRIKSHAK AI** frontend application.

---

## 1. Directory Structure
All frontend files reside under the `frontend` folder and follow the Next.js App Router structure:

```
frontend/
├── src/
│   ├── api/
│   │   ├── client.ts         # Typesafe API client
│   │   └── types.ts          # TypeScript interfaces matching FastAPI schemas
│   ├── app/
│   │   ├── globals.css       # Tailwind v4 theme and typography rules
│   │   ├── layout.tsx        # HTML document layout wrapping AppShell
│   │   ├── page.tsx          # Dashboard landing page stub
│   │   ├── investigations/   # /investigations page stub
│   │   ├── projects/         # /projects page stub
│   │   ├── analytics/        # /analytics page stub
│   │   ├── evidence/         # /evidence page stub
│   │   └── about/            # /about page stub
│   └── components/
│       ├── layout/
│       │   └── AppShell.tsx  # Sidebar, Header, Breadcrumbs, Status, and Disclaimer
│       └── ui/
│           ├── RiskComponents.tsx  # RiskBadge, DetectorBadge, SeverityIndicator
│           └── UIStates.tsx        # LoadingSkeleton, EmptyState, ErrorState
├── tsconfig.json             # TypeScript configuration
└── tailwind.config.mjs       # Tailwind configuration
```

---

## 2. Design System Tokens (Tailwind CSS v4)
Design variables are declared inside `src/app/globals.css` using custom `@theme` variables:

### Core Palette
* **Deep Navy** (`--color-navy`): `#0B1321` (Main background for navigation components)
* **Indigo** (`--color-indigo`): `#1E293B` (Sidebar highlights and divider borders)
* **Brand Blue** (`--color-brand-blue`): `#2563EB` (Primary buttons and active navigation states)
* **Teal** (`--color-teal`): `#0D9488` (Status success indicators)
* **Background** (`--color-background`): `#F8FAFC` (Main app layout canvas)
* **Surface/Card** (`--color-card`): `#FFFFFF` (White audit blocks)
* **Border** (`--color-border`): `#E2E8F0` (Restrained border lines)
* **Text Primary** (`--color-foreground`): `#0F172A`
* **Text Secondary** (`--color-muted-text`): `#64748B`

### Semantic Risk Palette (Used exclusively for indicators)
* **CRITICAL** (`--color-risk-critical`): `#B91C1C`
* **HIGH** (`--color-risk-high`): `#EA580C`
* **MEDIUM** (`--color-risk-medium`): `#D97706`
* **LOW** (`--color-risk-low`): `#475569`
* **INFO/NEUTRAL** (`--color-risk-info`): `#0891B2`

---

## 3. Typography & Hierarchy
* **Alignment**: Numbers and values in KPI cards use the `.tabular-nums` class to ensure visual alignment when stacked.
* **Tone**: Interface copy is kept factual, neutral, and concise (e.g. *Investigation Case Queue*, *Risk Indicators*, *Project Records*, *Cost Indicators*). Banned marketing terms like "magic" or "unlock insights" are strictly avoided.

---

## 4. UI Shell Layout
* **AppShell.tsx** contains:
  * A left sidebar that collapses to icon-only labels on desktop and opens as an overlay drawer on tablet/mobile screens.
  * A top header containing breadcrumbs (dynamically derived from route paths) and a live system database online status indicator connecting to `GET /api/v1/health`.
  * A persistent bottom banner showing the platform disclaimer:
    `"Risk indicators identify records that may warrant further review. They do not establish wrongdoing or corruption."`

---

## 5. API Client Integration
* Exposes functions inside `src/api/client.ts` mapping to:
  * `/health`
  * `/cases`
  * `/cases/{record_id}`
  * `/statistics`
* Reads base URL path from `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:8000/api/v1`).
* Includes structured interfaces in `types.ts` mirroring the FastAPI Pydantic models.

---

## 6. Reusable State Feedbacks
* **LoadingSkeleton**: Draws pulsing card outlines matching the layout skeleton.
* **EmptyState**: Offers filter reset controls when filters exclude all results.
* **ErrorState**: Explains REST API connection failures with detail and contains a `"Retry Connection"` action button.
* **RiskBadge**, **DetectorBadge**, and **SeverityIndicator**: Expose unified labels, Lucide icons, and ARIA attributes for WCAG accessibility.
