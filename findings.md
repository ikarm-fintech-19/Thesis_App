# 📝 Findings: Matax Platform Evolution

> Research discoveries, architecture analysis, and strategic decisions for platform evolution.

**Last Updated:** 2026-05-04 (ALL PHASES COMPLETE)

---

## 🔍 Codebase Audit Results

### Architecture Summary
- **Framework:** Next.js 16.1.1 (App Router) + TypeScript 5.x
- **Database:** SQLite via Prisma 6.11.1 (PostgreSQL-ready)
- **UI:** 48 shadcn/ui components + Tailwind CSS 4.x + Framer Motion
- **State:** Zustand 5.0.6 + React Hook Form 7.60 + Zod 4.0
- **Math:** decimal.js 10.6.0 (critical: no floats in tax calculations)
- **i18n:** next-intl 4.3.4 (FR/EN/AR with RTL)
- **Graph:** 1586 nodes, 2441 edges, 88 communities

### Core Modules
| Module | File | Lines | Status |
|--------|------|-------|--------|
| TVA Calculator | `src/lib/tax-engine.ts` | 510 | ✅ Production-ready |
| Declaration Engine | `src/lib/declaration-engine.ts` | 178 | ✅ Production-ready |
| Deductibility Rules | `src/lib/deductibility-rules.ts` | ~100 | ✅ Production-ready |
| Auth System | `src/lib/auth.ts` | ~80 | 🟡 Mock (JWT in localStorage) |
| AI Scanner | `src/components/tax/AIScanner.tsx` | ~250 | ✅ Gemini integrated |
| Declaration Tab | `src/components/tax/DeclarationTab.tsx` | 1000+ | 🟡 Large, needs wizard refactor |

### API Routes Map
```
POST   /api/calculate              → TVA calculation (working)
POST   /api/declaration/calculate  → Declaration calculation (working)
GET    /api/declaration/export/csv → CSV export (working)
POST   /api/auth/login             → Mock JWT login (working)
POST   /api/auth/logout            → Clear session (working)
GET    /api/auth/me                → Current user (working)
GET    /api/user/declarations      → User's declarations (working)
GET    /api/admin/stats            → Platform stats (working)
POST   /api/ai                     → Gemini AI scanner (working)
GET    /api/export-validation      → Thesis validation export (working)
```

### Schema Assessment
**Current models:** User, TeamMember, Subscription, Calculation, Declaration, TaxRule, TaxBracket, TaxDeduction, DeclarationPeriod, Transaction, AuditLog, PlatformAnalytics, SalaryLine, Notification, SavedTemplate

**Schema Status (as of 2026-05-04):**
- ✅ All monetary Float fields converted to String (app-layer decimal.js)
- ✅ SalaryLine model added (ready for Phase 3)
- ✅ Notification model added (ready for Phase 2)
- ✅ SavedTemplate model added (recurring transactions)
- ✅ Zod validation schemas created in `src/lib/schemas/index.ts`

**Previous issues (now resolved):**
1. `Declaration.totalCollectee`, `totalDeductible`, `netTva` → **String** ✅
2. `Transaction.amount`, `tvaRate`, `tvaAmount`, `deductibleAmount` → **String** ✅
3. `TaxBracket.minAmount`, `maxAmount`, `rate` → **String** ✅
4. `TaxRule.rate` → **String** ✅
5. `TaxDeduction.limitAmount`, `limitPct` → **String** ✅
6. `PlatformAnalytics.mrr` → **String** ✅

---

## 📊 Feature Gap Analysis vs. prompt.md Spec

### G50 Workflow (spec §UI/UX)
| Spec Requirement | Implemented | Gap |
|-----------------|-------------|-----|
| 5-step wizard UX | ❌ No | Need `<StepWizard>` component |
| Period selection | ✅ Partial | In DeclarationTab, not wizard format |
| Sales entry (quick-add) | ✅ Partial | Table exists but no guided UX |
| Purchases with deductibility warnings | ✅ Partial | Engine works, no inline warnings |
| Salary management | ❌ No | Need IRG + CNAS calculators |
| Summary + DGIP reference | ✅ Partial | Result card exists, no mock ref |
| Plain-language tooltips | ❌ No | Need `<PlainLanguageTooltip>` |
| Penalty warning banner | ❌ No | Need `checkPenaltyRisks()` + banner |
| One-click templates | ❌ No | Need `SavedTemplate` model + UI |
| Offline indicator | ❌ No | Need PWA service worker |

### Tax Modules (spec §Core Logic)
| Module | Implemented | Gap |
|--------|-------------|-----|
| TVA Calculation | ✅ Complete | 3 rates: 19%, 9%, 0% |
| Auto-exemption (Art. 30) | ✅ Complete | Services <1M, Commerce <1M, Export |
| Deductibility caps (Art. 33) | ✅ Complete | Vehicle 50%, hospitality 0% |
| IRG Salaires (progressive) | ❌ No | Need progressive bracket calculator |
| CNAS Social Charges | ❌ No | Need 9%/26% calculator |
| Family deductions | ❌ No | Need 1,000 DZD/child logic |
| IBS Annual | ❌ No | Phase 6 feature |
| Penalty calculation | ❌ No | Need late-filing penalty math |

### Infrastructure (spec §Constraints)
| Requirement | Implemented | Gap |
|-------------|-------------|-----|
| decimal.js for math | ✅ Core engine | Schema still uses Float |
| Trilingual FR/EN/AR | ✅ Complete | 3 message files, RTL works |
| Plain language dict | ✅ Partial | ~30 terms (spec says 50+) |
| Offline-capable | ❌ No | No service worker |
| Mock auth | ✅ Complete | 3 demo accounts |
| PostgreSQL-ready | 🟡 Partial | Migration guide exists, schema has Float |
| Audit trail | 🟡 Partial | AuditLog model exists, minimal use |

---

## 🏗️ Architecture Evolution Strategy

### Phase 1→2 Transition
```
Current:   [Calculator Page] → [API] → [tax-engine.ts]
                ↓
           [DeclarationTab] → [API] → [declaration-engine.ts]

Target:    [Landing Page] → [Dashboard]
                               ├── [G50 Wizard] → [StepWizard]
                               │    ├── Step 1: Period
                               │    ├── Step 2: Sales (TVA collectée)
                               │    ├── Step 3: Purchases (TVA déductible)
                               │    ├── Step 4: Salaries (IRG/CNAS)
                               │    └── Step 5: Summary + Export
                               ├── [Calculator] (existing, preserved)
                               ├── [History] → user's past declarations
                               └── [Settings] → profile, language, plan
```

### Database Evolution
```
SQLite (dev) ─── Phase 1-3 ───→ PostgreSQL (Phase 4)
                                       │
                                  Supabase hosted
                                       │
                              ┌────────┴────────┐
                              │                  │
                         Auth (RLS)        Storage (PDFs)
```

### Component Decomposition Plan
The monolithic `DeclarationTab.tsx` (1000+ lines) needs splitting:
```
DeclarationTab.tsx (current: ~41KB)
  ↓ refactor into:
  ├── G50Wizard.tsx (orchestrator)
  ├── PeriodStep.tsx
  ├── SalesStep.tsx
  ├── PurchasesStep.tsx
  ├── SalariesStep.tsx
  ├── SummaryStep.tsx
  ├── PenaltyBanner.tsx
  └── PlainLanguageTooltip.tsx
```

---

## 📈 Market & Revenue Projections

### Pricing Model
| Tier | Price | Features | Target |
|------|-------|----------|--------|
| FREE | 0 DZD | 10 calcs/mo, 2 declarations, PDF | Lead gen |
| PRO | 999 DZD/mo (~$7) | Unlimited, CSV/Excel, SMS | SMEs |
| ENTERPRISE | Custom | API, multi-user, white-label | Accountants |

### Revenue Projections
| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Free users | 1,000 | 5,000 | 10,000 |
| Paid users | 100 | 500 | 1,500 |
| Conversion rate | 10% | 10% | 15% |
| MRR | ~$700 | ~$3,500 | ~$10,500 |
| ARR | ~$8,400 | ~$42,000 | ~$126,000 |

### Competitive Moat
1. **Algeria-first tax law engine** — competitors adapt generic tools
2. **Trilingual + RTL** — native Arabic experience
3. **Academic validation** — thesis-proven calculation accuracy
4. **Offline-first** — critical for Algeria's connectivity gaps
5. **Free tier** — uncommon in Algerian B2B software market

---

## 🔐 Compliance Notes

### Algeria-Specific Requirements
- **Law 18-07** (2018): Algerian data protection law
- **Art. 45**: Right to access personal data (export button needed)
- **Art. 46**: Right to rectification and deletion (delete account needed)
- **DGIP**: Direction Générale des Impôts — tax authority
- **NIF**: Numéro d'Identification Fiscale — required for real submissions
- **G50 Filing deadline**: 20th of following month (penalties: 10% + 3%/month)

### Tax Code References
| Article | Subject | Status |
|---------|---------|--------|
| Art. 28 CID | TVA normal rate (19%) | ✅ Implemented |
| Art. 29 CID | TVA reduced rate (9%) | ✅ Implemented |
| Art. 30 CID | TVA exemptions | ✅ Implemented |
| Art. 33 CID | Deductibility caps | ✅ Implemented |
| Art. 104 CID | IRG progressive brackets | ❌ Phase 3 |
| Art. 135 CID | IBS rates | ❌ Phase 6 |

---

## 📦 Dependency Analysis

### Already Installed (No Changes Needed)
```
next@16.1.1, react@19, typescript@5, tailwindcss@4
prisma@6.11.1, decimal.js@10.6, zustand@5.0.6
framer-motion@12.23.2, recharts@2.15.4
lucide-react@0.525, sonner@2.0.6
bcryptjs@3.0.3, jsonwebtoken@9.0.3
next-intl@4.3.4, next-themes@0.4.6
react-hook-form@7.60, zod@4.0.2
@google/genai@1.51.0
```

### To Install (Future Phases)
| Package | Phase | Purpose |
|---------|-------|---------|
| `@sentry/nextjs` | Phase 4 | Error tracking |
| `workbox-webpack-plugin` | Phase 4 | Service worker / PWA |
| `@supabase/supabase-js` | Phase 4 | Auth + DB |
| `stripe` | Phase 5 | Payment processing |
| `nodemailer` | Phase 5 | Email notifications |
| `@capacitor/core` | Phase 6 | Mobile app wrapper |

---

*Update this file after every 2 view/browser/search operations*
*This prevents visual information from being lost*
