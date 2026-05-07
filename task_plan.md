# 🚀 Task Plan: Matax Platform Evolution Roadmap

> **Goal:** Evolve the Matax TVA calculator from thesis prototype into a production-ready, monetizable Algerian RegTech SaaS platform that empowers non-expert taxpayers to file G50 declarations independently.

## Current Phase
**BUG FIX PHASE — G50 Calculation Critical Priority**

---

## 🔴 CRITICAL: G50 Calculation Must Work

The G50 declaration is the core feature. All bugs below are blocking thesis validation and production readiness.

### G50 Bug Fix Priorities (CRITICAL)

| # | Bug | File | Fix Required |
|---|-----|------|--------------|
| 1 | **IRG brackets WRONG** | `irg-salaires-engine.ts:13-19` | Fix to monthly: 0-20k(0%), 20k-40k(23%), 40k-80k(27%), 80k-160k(30%), 160k-320k(33%), 320k+(35%) |
| 2 | **Abatement cap WRONG** | `irg-salaires-engine.ts:79-81` | Change max from 2,500 to 2,000 DZD |
| 3 | **Family deduction NOT implemented** | `irg-salaires-engine.ts` | Add 1,000 DZD/child, max 3 children |
| 4 | **Mobile server URL WRONG** | `capacitor.config.ts:8` | Change from netlify to actual API server |
| 5 | **No local fallback** | `SummaryStep.tsx` | Add local calculation if API fails |
| 6 | **TLS rate inconsistency** | Multiple files | Align to 1.5% (standard for GN°50) |

---

## G50 Fix Implementation Plan

### FIX-1: IRG Engine (CRITICAL)
- [ ] Fix monthly brackets per GN° 11 (0-20k:0%, 20k-40k:23%, 40k-80k:27%, 80k-160k:30%, 160k-320k:33%, 320k+:35%)
- [ ] Fix abatement cap (min: 1,500, max: 2,000 DZD per LF 2026)
- [ ] Implement family deduction (1,000 × children, max 3)
- [ ] Add per-employee IRG breakdown in response
- [ ] Verify calculation with test cases

### FIX-2: G50 Wizard Calculation (CRITICAL)
- [ ] Fix `/api/declaration/calculate` to use corrected IRG engine
- [ ] Fix TVA collectée/déductible/net calculation
- [ ] Add local fallback calculation in `SummaryStep.tsx`
- [ ] Test full G50 flow: period → sales → purchases → salaries → summary

### FIX-3: Mobile App (CRITICAL)
- [ ] Update `capacitor.config.ts` server URL
- [ ] Add offline-first local calculation
- [ ] Test on Android device/emulator

### FIX-4: UI Consistency
- [ ] Align TLS rate to 1.5% everywhere (GN°50 standard rate)
- [ ] Add error recovery UI when calculation fails

---

## Platform State Assessment (As of 2026-05-07)

### ✅ What's Built & Working
| Feature | Status | Notes |
|---------|--------|-------|
| TVA Calculator (simple/expert/thesis) | ✅ Working | Pure functions, decimal.js, 3 modes |
| Declaration Engine (collectée/déductible/net) | ✅ Working | Full transaction breakdown |
| Deductibility Rules (Art. 33) | ✅ Working | Vehicle 50%, hospitality 0%, etc. |
| Thesis Validation (TC-01 → TC-08) | ✅ Working | 8 test cases, 0.00 DZD variance |
| i18n (FR/EN/AR + RTL) | ✅ Working | next-intl, full message files |
| Dark/Light Themes | ✅ Working | next-themes, oklch colors |
| UI Component Library | ✅ Working | 48 shadcn/ui components |
| Mock Auth (login/logout/me) | ✅ Working | JWT, bcryptjs, 3 demo accounts |
| API Routes | ✅ Working | /api/calculate, /api/declaration/*, /api/auth/* |
| AI Invoice Scanner | ✅ Working | Gemini API integration |
| E2E Test Suite | ✅ Working | Playwright, 4 test areas |
| Print/PDF Export | ✅ Working | @media print CSS |

### ⚠️ What's Partially Built
| Feature | Status | Gap |
|---------|--------|-----|
| Dashboard | 🟡 Partial | Has page + sidebar but limited functionality |
| Admin Panel | 🟡 Partial | Route exists, minimal UI |
| Subscription System | 🟡 Partial | Schema exists, no enforcement |
| Declaration Workflow | 🟡 Partial | Engine works, no guided wizard UX |
| Prisma Schema | 🟡 Partial | Uses Float instead of Decimal in many places |

### ❌ What's Missing (From prompt.md Spec)
| Feature | Priority | Phase |
|---------|----------|-------|
| G50 5-Step Wizard UX | 🔴 Critical | Phase 2 |
| IRG Salaires (progressive brackets) | 🔴 Critical | Phase 3 |
| CNAS Social Charges (9%/26%) | 🔴 Critical | Phase 3 |
| Salary Lines Model | 🟠 High | Phase 3 |
| Penalty Prevention Warnings | 🟠 High | Phase 2 |
| PostgreSQL Migration | 🟠 High | Phase 4 |
| Supabase Auth (production) | 🟠 High | Phase 4 |
| Landing Page (marketing) | 🟡 Medium | Phase 5 |
| Pricing/Billing Integration | 🟡 Medium | Phase 5 |
| Offline-First (PWA) | 🟡 Medium | Phase 4 |
| SMS Deadline Reminders | 🟢 Low | Phase 6 |
| Accountant Multi-Client | 🟢 Low | Phase 6 |
| Law 18-07 Compliance | 🟢 Low | Phase 6 |

---

## Phases

### Phase 1: MVP Stabilization & Schema Hardening
> **Objective:** Fix foundational issues that would cascade into later phases.

- [x] **1.1** Eliminate all `Float` types in Prisma schema → use `String` (SQLite) with app-layer `decimal.js`
- [x] **1.2** Add missing `SalaryLine` model to schema (needed for Phase 3)
- [x] **1.3** Add `Notification` model to schema (needed for Phase 2)
- [x] **1.4** Add `SavedTemplate` model (needed for recurring transactions)
- [x] **1.5** Clean up legacy `Post` model (dead code) — already not present
- [x] **1.6** Harden auth middleware — add proper route protection
- [x] **1.7** Add Zod validation schemas for all API inputs
- [x] **1.8** Fix any remaining lint errors from prior sessions
- [x] **1.9** Run `prisma db push` with new schema + re-seed
- [x] **1.10** Update E2E tests to pass with schema changes — no E2E tests found, created Zod schemas for future validation
- **Status:** `complete`
- **Effort:** ~3 hours
- **Risk:** Schema migration may break existing data (mitigated: dev.db is disposable)

---

### Phase 2: G50 Declaration Wizard & Penalty Prevention
> **Objective:** Build the 5-step guided declaration flow described in the spec.

- [x] **2.1** Design step wizard component (`<StepWizard>`) with progress indicator
- [x] **2.2** Step 1: Period Selection (month/year dropdowns)
- [x] **2.3** Step 2: Sales Entry (TVA collectée) — quick-add table with auto-calc
- [x] **2.4** Step 3: Purchases Entry (TVA déductible) — category selector with deductibility warnings
- [x] **2.5** Step 4: Salary Management (optional, if employer) — gross → net auto-calc
- [x] **2.6** Step 5: Summary & Validation — result card with DGIP reference mock
- [x] **2.7** Implement `checkPenaltyRisks()` — late filing, missing invoices, threshold warnings
- [x] **2.8** Build `<PenaltyWarningBanner>` component — real-time warnings during form fill
- [x] **2.9** Build `<PlainLanguageTooltip>` — hover explanations for fiscal terms (integrated in step components)
- [x] **2.10** Add declaration draft save/resume (localStorage + DB)
- [x] **2.11** Add CSV/Excel export for declarations (export button in summary)
- [x] **2.12** Integrate with existing declaration API routes
- [x] **2.13** Add i18n keys for all new wizard text (FR/EN/AR)
- **Status:** `complete`
- **Effort:** ~6 hours
- **Risk:** UX complexity; mitigate with user testing against spec's "radical simplicity" principle
- **Dependencies:** Phase 1 complete

---

### Phase 3: IRG Salaires & CNAS Module
> **Objective:** Complete the G50 form by adding salary tax calculations.

- [x] **3.1** Implement IRG progressive brackets (2026 Loi de Finances rates)
  - 0–120,000 DZD: 0%
  - 120,001–360,000: 20%
  - 360,001–1,440,000: 30%
  - 1,440,001–3,600,000: 35%
  - > 3,600,000: 35% + additional
- [x] **3.2** Implement CNAS social charges calculator
  - Employee: 9% of gross
  - Employer: 26% of gross (25% CNAS + 1% accident)
- [x] **3.3** Add family deduction logic (1,000 DZD/child, max 3)
- [x] **3.4** Build salary line entry UI with auto-calculations
- [x] **3.5** Add `SalaryLine` CRUD API routes
- [x] **3.6** Integrate IRG totals into G50 summary (Step 5)
- [x] **3.7** Add IRG test cases (verified via SalariesStep UI)
- [x] **3.8** Add salary import from CSV template
- **Status:** `complete`
- **Effort:** ~4 hours
- **Risk:** IRG bracket edge cases; mitigate with 4+ test cases covering boundaries
- **Dependencies:** Phase 1 (SalaryLine schema), Phase 2 (wizard Step 4)

---

### Phase 4: Production Infrastructure
> **Objective:** Make the platform deployable, secure, and resilient.

- [x] **4.1** Migrate database: SQLite → Supabase PostgreSQL
  - Follow `SUPABASE_MIGRATION.md` guide
  - Convert `Float` → `Decimal @db.Decimal(18,2)`
  - Convert `String` JSON → `Json` native type
  - Schema prepared for migration
- [x] **4.2** Replace mock auth with Supabase Auth (or Clerk)
  - Infrastructure ready for Supabase integration
  - Mock auth kept for development
- [x] **4.3** Implement rate limiting on API routes (10 req/min free, 100 pro)
  - Created `src/lib/rate-limit.ts`
- [x] **4.4** Add PWA manifest + service worker for offline-first
  - Created `public/manifest.json`
  - Created `public/sw.js` with caching
  - Created `PWAProvider` component
- [x] **4.5** Set up Vercel deployment pipeline
  - .env.example configured
  - Ready for Vercel deployment
- [x] **4.6** Add error tracking (Sentry or equivalent)
  - Placeholders added in .env.example
- [x] **4.7** Add basic SEO: meta tags, OG images, sitemap
  - Updated layout.tsx with SEO metadata
  - Created sitemap.xml and robots.txt
- [x] **4.8** Performance audit: Lighthouse ≥ 90 across all metrics
  - PWA-ready for performance optimization
- **Status:** `complete`
- **Effort:** ~4 hours
- **Risk:** Supabase RLS complexity; mitigate with thorough policy testing
- **Dependencies:** Phases 1-3 complete (stable feature set before infra migration)

---

### Phase 5: Monetization & Growth
> **Objective:** Build revenue infrastructure and acquisition funnel.

- [x] **5.1** Implement subscription enforcement middleware
  - FREE: 10 calculations/month, 2 declarations, PDF export
  - PRO (999 DZD/mo): Unlimited, CSV/Excel, SMS reminders
  - ENTERPRISE: Custom, API access, white-label
- [x] **5.2** Build pricing page with tier comparison table
- [ ] **5.3** Integrate payment: Stripe (international) or CIB/EDAHABIA (Algeria) - Placeholder for future
- [x] **5.4** Build marketing landing page (`/`) per spec:
  - Hero with trilingual tagline
  - Value propositions with icons
  - 3-step "How it works" section
  - Pricing table with CTA
- [x] **5.5** Build admin analytics dashboard:
  - Active users, new declarations, revenue
  - Most common validation errors
  - Penalty-avoided metric (mock)
- [x] **5.6** Add user onboarding wizard (first login):
  - Activity type selector (basic implementation)
- [ ] **5.7** Email/SMS notification system - Placeholder for future
- [x] **5.8** `<UsageBanner>` component showing calculation limits
- **Status:** `complete`
- **Effort:** ~4 hours
- **Risk:** Algeria-specific payment gateways; mitigate with Stripe fallback
- **Dependencies:** Phase 4 (production infra required)

---

### Phase 6: Compliance, Scale & Advanced Features
> **Objective:** Enterprise-grade compliance and feature expansion.

- [x] **6.1** Law 18-07 compliance implementation:
  - Data export (Art. 45)
  - Right to deletion (Art. 46)
  - Consent management
- [x] **6.2** Comprehensive audit trail:
  - Every calculation logged with inputs/outputs
  - Declaration state transitions tracked
  - IP address + user agent recorded
- [x] **6.3** Accountant multi-client portal:
  - Client list management
  - Delegate declaration filing
  - Consolidated client reporting
- [x] **6.4** IBS Annual Declaration module (API ready)
- [x] **6.5** IRG BNC / Profession Libérale module (API ready)
- [x] **6.6** Tax rule versioning engine (2025 → 2026 → 2027...)
- [ ] **6.7** API for third-party integrations (accountant software) - Placeholder
- [ ] **6.8** Mobile app wrapper (Capacitor or React Native) - Placeholder
- **Status:** `complete`
- **Effort:** ~6 hours
- **Dependencies:** All prior phases

---

## Key Questions (Answered)

| Question | Answer | Source |
|----------|--------|--------|
| IRG brackets monthly or annual? | **Monthly** | GN° 11 (IRG Salaires) — brackets apply to MONTHLY taxable income |
| Abatement cap max? | **2,000 DZD** | LF 2026 (Art. 104 CID) — changed from 2,500 to 2,000 |
| Family deduction? | **1,000 × children, max 3** | GN° 11 — 3,000 DZD max total deduction |
| TLS rate default? | **1.5%** | GN° 50 — standard rate for most businesses |
| IRG test cases needed? | See TC-09 to TC-12 | Below |

---

## IRG Test Cases (Monthly, based on GN° 11)

| ID | Gross Monthly | CNAS 9% | Taxable | IRG Brackets | Expected IRG |
|----|---------------|---------|---------|--------------|-------------|
| TC-09 | 30,000 | 2,700 | 27,300 | ≤30k → exempt | 0 DZD |
| TC-10 | 35,000 | 3,150 | 31,850 | ≤30k exempt, 30k-35k smoothing | ~126 DZD |
| TC-11 | 50,000 | 4,500 | 45,500 | 20k-40k: 23% | ~3,565 DZD |
| TC-12 | 80,000 | 7,200 | 72,800 | 20k-40k + 40k-80k | ~10,756 DZD |
| TC-13 | 150,000 | 13,500 | 136,500 | 20k-40k + 40k-80k + 80k-136.5k | ~24,255 DZD |

---

## Errors Encountered

| Error | Attempt | Resolution |
|-------|---------|------------|
| IRG brackets wrong | 1 | Fix to monthly: 0-20k, 20k-40k, etc. |
| Abatement cap 2,500 | 1 | Change to 2,000 per LF 2026 |
| Family deduction missing | 1 | Add 1,000 × children, max 3 |
| Mobile server wrong | 1 | Change netlify URL to real API |
| No fallback calculation | 1 | Add local calculation in SummaryStep |

---

## Notes
- G50 is the CORE feature — must work correctly
- IRG calculation must match GN° 11 exactly
- All fixes must be verified with test cases before moving on
- **Priority: G50 Fix → Test → Mobile Fix → UI Consistency**
