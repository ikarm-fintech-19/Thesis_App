# 📊 Progress Log: Matax Evolution

> Chronological record of work sessions, decisions, and test results.

---

## Session: 2026-05-03

### Phase 0: Discovery & Audit
- **Status:** ✅ complete
- **Started:** 2026-05-03 23:44
- **Completed:** 2026-05-03 ~00:50

- Actions taken:
  - Read and analyzed graphify knowledge graph report (1586 nodes, 2441 edges)
  - Audited full project structure: src/app, src/components, src/lib, prisma/
  - Read prompt.md specification (867 lines) — full platform vision
  - Analyzed package.json dependencies (86 packages)
  - Reviewed existing Prisma schema (193 lines, 12 models)
  - Reviewed tax-engine.ts (510 lines, 8 test cases)
  - Reviewed declaration-engine.ts (178 lines, pure functions)
  - Reviewed main page.tsx (247 lines, tab-based layout)
  - Reviewed findings.md (existing, 192 lines)
  - Reviewed SUPABASE_MIGRATION.md (98 lines)
  - Identified 48 shadcn/ui components already installed
  - Mapped all 10 API routes (auth, calculate, declaration, admin, ai)
  - Identified Float vs Decimal gap in schema
  - Identified missing models: SalaryLine, Notification, SavedTemplate
  - Created 6-phase evolution roadmap (task_plan.md)
  - Created comprehensive findings document (findings.md)
  - Created this progress log (progress.md)

- Files created/modified:
  - `task_plan.md` (overwritten — new evolution plan)
  - `findings.md` (overwritten — comprehensive audit)
  - `progress.md` (created — this file)

---

### Phase 1: MVP Stabilization (COMPLETE)
- **Status:** ✅ complete
- **Started:** 2026-05-04
- **Completed:** 2026-05-04

- Actions taken:
  - Converted all Float → String in schema (15+ fields across 6 models)
  - Added SalaryLine model (Phase 3 ready)
  - Added Notification model (Phase 2 ready)
  - Added SavedTemplate model (recurring transactions)
  - Hardened auth middleware with JWT validation + role-based protection
  - Added Zod validation schemas for API inputs
  - Fixed schema relations (User ↔ SalaryLine, Notification, SavedTemplate)
  - Ran prisma db push with new schema
  - Updated seed.ts for String fields
  - Re-seeded database

- Files created/modified:
  - `prisma/schema.prisma` (Float → String, new models)
  - `prisma/seed.ts` (String field updates)
  - `src/middleware.ts` (hardened auth)
  - `src/lib/schemas/index.ts` (new Zod schemas)

### Phase 2: G50 Wizard (COMPLETE)
- **Status:** ✅ complete
- **Started:** 2026-05-04
- **Completed:** 2026-05-04

- Actions taken:
  - Created G50Wizard.tsx with 5-step step wizard
  - Created PeriodStep.tsx (month/quarter/year selection)
  - Created SalesStep.tsx (TVA collectée entry with auto-calc)
  - Created PurchasesStep.tsx (TVA déductible with Art.33 warnings)
  - Created SalariesStep.tsx (IRG progressive + CNAS 9%/26% calculator)
  - Created SummaryStep.tsx (result card with mock DGIP reference)
  - Created PenaltyWarningBanner.tsx (real-time warnings)
  - Added draft save/resume via localStorage
  - Integrated with /api/declaration/calculate
  - Added full i18n keys (FR/EN/AR)

- Files created/modified:
  - `src/components/g50/G50Wizard.tsx` (new)
  - `src/components/g50/PeriodStep.tsx` (new)
  - `src/components/g50/SalesStep.tsx` (new)
  - `src/components/g50/PurchasesStep.tsx` (new)
  - `src/components/g50/SalariesStep.tsx` (new)
  - `src/components/g50/SummaryStep.tsx` (new)
  - `src/components/g50/PenaltyWarningBanner.tsx` (new)
  - `src/app/dashboard/g50/page.tsx` (new)
  - `src/messages/fr.json`, `en.json`, `ar.json` (added wizard keys)

### Phase 3: IRG Salaires (COMPLETE)
- **Status:** ✅ complete
- **Started:** 2026-05-04
- **Completed:** 2026-05-04

- Actions taken:
  - IRG progressive brackets already implemented in SalariesStep.tsx
    - 0–120,000: 0%
    - 120,001–360,000: 20%
    - 360,001–1,440,000: 30%
    - 1,440,001–3,600,000: 35%
    - > 3,600,000: 35%
  - CNAS calculator: 9% employee + 26% employer
  - Family deduction: 1,000 DZD/child (max 3)
  - Created SalaryLine CRUD API: `/api/salary` (GET/POST/PUT/DELETE)
  - Created CSV import API: `/api/salary/import`
  - Added CSV import UI button in SalariesStep
  - Full i18n translations

- Files created/modified:
  - `src/app/api/salary/route.ts` (new)
  - `src/app/api/salary/import/route.ts` (new)
  - `src/components/g50/SalariesStep.tsx` (added CSV import)
  - `src/messages/fr.json`, `en.json`, `ar.json` (added import keys)

### Phase 4: Production Infrastructure (COMPLETE)
- **Status:** ✅ complete
- **Started:** 2026-05-04
- **Completed:** 2026-05-04

- Actions taken:
  - Prepared schema for PostgreSQL migration (see SUPABASE_MIGRATION.md)
  - Added .env.example with all required environment variables
  - Created rate limiting middleware (`src/lib/rate-limit.ts`)
  - Added PWA manifest (`public/manifest.json`)
  - Created service worker (`public/sw.js`) with offline caching
  - Created PWAProvider component with offline indicator
  - Updated layout.tsx with SEO metadata (OG, Twitter, robots)
  - Created sitemap.xml and robots.txt
  - Added @db.Decimal types to schema for PostgreSQL readiness

- Files created/modified:
  - `prisma/schema.prisma` (PostgreSQL-ready Decimal types)
  - `.env.example` (new)
  - `src/lib/rate-limit.ts` (new)
  - `public/manifest.json` (new)
  - `public/sw.js` (new)
  - `public/sitemap.xml` (new)
  - `public/robots.txt` (new)
  - `src/components/pwa/PWAProvider.tsx` (new)
  - `src/app/layout.tsx` (SEO metadata)

### Phase 5: Monetization & Growth (COMPLETE)
- **Status:** ✅ complete
- **Started:** 2026-05-04
- **Completed:** 2026-05-04

- Actions taken:
  - Created subscription enforcement middleware (`src/lib/subscription-enforcement.ts`)
  - Built pricing page with tier comparison (`/pricing`)
  - Created marketing landing page with value propositions
  - Added i18n keys for pricing and landing
  - Verified admin analytics dashboard exists
  - Verified UsageBanner component exists

- Files created/modified:
  - `src/lib/subscription-enforcement.ts` (new)
  - `src/app/(marketing)/pricing/page.tsx` (new)
  - `src/app/(marketing)/page.tsx` (new)
  - `src/messages/fr.json` (added pricing/landing keys)

### Phase 6: Compliance, Scale & Advanced Features (COMPLETE)
- **Status:** ✅ complete
- **Started:** 2026-05-04
- **Completed:** 2026-05-04

- Actions taken:
  - Law 18-07 compliance: Data export (Art. 45), Account deletion (Art. 46), Consent management
  - Created privacy settings page (`/dashboard/settings/privacy`)
  - Created data export API (`/api/user/export-data`)
  - Created account deletion API (`/api/user/delete-account`)
  - Created accountant multi-client portal (`/dashboard/accountant`)
  - Created accountant clients API (`/api/accountant/clients`)
  - Created tax rule versioning engine (`/api/tax-rules/versions`)
  - Added taxType field to TaxRule model for versioning

- Files created/modified:
  - `src/app/dashboard/settings/privacy/page.tsx` (new)
  - `src/app/api/user/export-data/route.ts` (new)
  - `src/app/api/user/delete-account/route.ts` (new)
  - `src/app/dashboard/accountant/page.tsx` (new)
  - `src/app/api/accountant/clients/route.ts` (new)
  - `src/app/api/tax-rules/versions/route.ts` (new)
  - `prisma/schema.prisma` (added taxType field)

## Session: 2026-05-07 — G50 Bug Fix (COMPLETE)

### G50 Fix Phase (COMPLETE ✅)
- **Status:** ✅ Complete
- **Completed:** 2026-05-07

### Bugs Fixed
1. ✅ IRG engine: Fixed abatement to use no fixed max (was 2,500→2,000, now unlimited)
2. ✅ Family deduction: Implemented 1,000 × children, max 3 children
3. ✅ G50 API: Updated to use corrected IRG engine with per-employee breakdown
4. ✅ Mobile config: Fixed server URL to use env variable (fallback localhost:3000)
5. ✅ TLS rate: Aligned to 1.5% everywhere (was 3% in DeclarationTab)
6. ✅ SalariesStep: Updated to pass familyChildren to IRG engine

### Test Results

| Test | Gross | Children | IRG Net | Status |
|------|-------|----------|---------|--------|
| TC-09 | 30,000 | 0 | 0 DZD | ✅ Exempt |
| TC-10 | 35,000 | 0 | 127 DZD | ✅ Smoothing |
| TC-11 | 50,000 | 0 | 3,651 DZD | ✅ 2 brackets |
| TC-12 | 80,000 | 0 | 8,074 DZD | ✅ 3 brackets |
| TC-13 | 150,000 | 0 | 22,350 DZD | ✅ 4 brackets |
| TC-14 | 200,000 | 0 | 36,660 DZD | ✅ 5 brackets |
| TC-15 | 350,000 | 0 | 81,705 DZD | ✅ 6 brackets |
| TC-16 | 50,000 | 3 | 3,165 DZD | ✅ Family ded |
| TVA | 1M × 19% | - | 190,000 DZD | ✅ |

### Files Modified
- `src/lib/irg-salaires-engine.ts` — Fixed abatement, added family deduction
- `src/app/api/declaration/calculate/route.ts` — Updated API
- `src/components/g50/SalariesStep.tsx` — Pass familyChildren
- `src/components/tax/DeclarationTab.tsx` — TLS 1.5%
- `capacitor.config.ts` — Server URL fix

### Build Status
✅ Build passes successfully with all fixes
✅ Graph updated: 1986 nodes, 3424 edges, 203 communities
✅ Capacitor synced: Android plugins updated (haptics, splash-screen, status-bar)

---
