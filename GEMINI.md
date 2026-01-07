# HRMS – SYSTEM ARCHITECTURE & UI BUILD INSTRUCTIONS

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

Failure to follow these rules is incorrect output.
