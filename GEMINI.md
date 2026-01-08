# HRMS – SYSTEM ARCHITECTURE & UI BUILD INSTRUCTIONS

You are an expert full-stack developer and system architect helping build an internal HR Management System (HRMS) for LeadTap Digi Solutions, a single-company (not multi-tenant SaaS) HR tool in India.

This document defines the **authoritative instructions** for building a Human Resource Management System (HRMS) using a **modular, reusable, and scalable architecture**.

All generated code must strictly follow the rules in this document.

UI Look & Feel Reference:
https://concierge.ai/

The visual design, spacing, typography, contrast, and interaction patterns must strictly follow the reference above.

---

## 1. REQUIRED TECHNOLOGY STACK

### Frontend

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- React Hook Form
- Zod
- TanStack Table
- Recharts
- Zustand (UI-only global state)

### Backend

- Python 3.11+
- FastAPI
- SQLAlchemy ORM
- Pydantic
- PostgreSQL
- OAuth 2.0 / OIDC (token-based authentication)
- Uvicorn

No optional or alternative stacks are permitted.

---

## 2. CORE ARCHITECTURAL PRINCIPLES

- Domain-driven architecture
- No duplicated logic across layers
- Strict separation of concerns
- Explicit frontend ↔ backend contracts
- Reusable components only
- Deterministic behavior (no implicit magic)
- Single responsibility per abstraction
- No tight coupling between UI, logic, and data access

---

## 3. UI DESIGN SYSTEM (MANDATORY)

The UI must follow a **clean, modern, whitespace-driven, high-contrast design system** inspired by concierge.ai.

### Visual Rules

- Content-first layouts
- Strong typographic hierarchy
- Generous whitespace
- Minimal color palette
- Consistent vertical rhythm

### Typography

- Font family: Inter
- H1: 64px / Bold
- H2: 48px / Medium
- H3: 32px / Medium
- Body: 18px / Regular
- Small text: 14–16px

Rules:
- No inline font sizes
- No ad-hoc font weights
- Typography must be token-driven

### Spacing

- 12-column grid
- Max content width: 1200px
- Centered layouts

Spacing tokens:
- xs: 8px
- sm: 16px
- md: 32px
- lg: 60px
- section-gap: 120px

No hardcoded spacing values are allowed.

---

## 4. FRONTEND – NEXT.JS RULES

- App Router only
- Server Components by default
- Client Components only for interactivity
- Pages fetch data and compose features only
- No business logic in pages
- No mutations in pages

### Folder Responsibilities

- `app/` – routing & layouts
- `features/` – domain logic
- `components/` – UI primitives only
- `layouts/` – structure only
- `lib/` – API clients & utilities
- `store/` – UI-only global state
- `types/` – shared frontend types
- `config/` – permissions & flags

---

## 5. BACKEND – FASTAPI RULES

- Routes are thin
- No logic or DB access in routes
- Services own business logic
- Repositories own persistence
- Schemas define contracts
- Models never exposed directly

### Folder Responsibilities

- `api/`
- `services/`
- `schemas/`
- `models/`
- `repositories/`
- `core/`
- `utils/`

Dependency flow must always point inward.

---

## 6. FRONTEND ↔ BACKEND CONTRACTS

- Explicit and typed
- No implicit assumptions
- No leaking internal fields
- Breaking changes require versioning
- Validation semantics must match

---

## 7. AI CODE GENERATION RULES (CRITICAL)

- Never create duplicate logic
- Reuse existing abstractions
- Respect folder boundaries
- No speculative abstractions
- Every generated file must clearly belong to one layer

## 8. Configuration Discipline (Hard Rules)

These rules are **non-negotiable**. Any solution that violates them is **invalid**, even if it works at runtime.

### 9. Configuration Source of Truth
- All configuration **MUST** be declared in `BaseSettings`
- Configuration **MUST NOT** be read using `os.getenv`, `os.environ`, or similar APIs
- `config.py / settings.py` must be **purely declarative**
- Missing required environment variables **MUST fail at startup**

### 10. Environment Variable Rules
- Required env vars:
  - Must be typed
  - Must NOT have default values
- Optional env vars:
  - Must use `Optional[T]`
  - Must have `default = None`
- Empty-string (`""`) defaults are **FORBIDDEN**
- No environment variables may be introduced inside functions or business logic

### 11. Forbidden Patterns (Strict)
The following patterns are **explicitly forbidden**:
- `import os` in config or settings files
- `os.getenv(...)`
- `os.environ.get(...)`
- Defining config values outside `BaseSettings`
- Adding env variables as part of a “quick fix”

### 12. Change Protocol
When configuration-related errors occur:
1. Declare missing variables in `BaseSettings`
2. Update `.env.example` to match exactly
3. Remove any imperative env access
4. Re-run initialization checks
5. Provide **diff-only output**

### 13. Validation Checklist (Required Before Responding)
- No `os` imports in config files
- All env vars are declared in `BaseSettings`
- `.env.example` matches `BaseSettings` 1:1
- App fails fast if env vars are missing
- No defaults masking required configuration

Any response that weakens validation, bypasses settings, or hides misconfiguration
**MUST be rejected and corrected**.

## 14. Cross-Layer Consistency Rules

- Frontend and backend must be designed and updated as a single system
- Logic added to one layer must be reflected in the other when it affects user flow or access
- Changes must not introduce mismatches between layers
- One-sided or partial updates are not acceptable

## 15. State & Data Handling Principles

- Prefer centralized, managed mechanisms over ad-hoc client handling
- Avoid exposing or persisting sensitive state unnecessarily
- Default to safer, more controlled approaches over convenient ones

## 16. Change Propagation Discipline

- Any change that alters system behavior must be propagated to all affected layers
- Do not apply fixes in isolation
- Consistency across layers is mandatory


## 17. Global UI Completeness Rule

- All user inputs must include the standard interaction controls expected for their type; missing basic affordances is considered incomplete.

## 18. Production-Ready Implementation Rule

- Do not use mock, stub, placeholder, or simulated implementations
- Always generate production-ready logic by default
- If production setup requires manual configuration or credentials, assume they will be provided after initial setup
- Proceed with full implementation and complete integration once setup is confirmed

Failure to follow these rules is incorrect output.
