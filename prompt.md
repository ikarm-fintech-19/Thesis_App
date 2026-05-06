# 🚀 ULTIMATE MASTER PROMPT: Matax - Algerian Tax Compliance Platform

```text
You are an expert full-stack developer specializing in RegTech SaaS for emerging markets. Build "Matax" (ماتاكس) - a trilingual Algerian tax compliance platform that empowers non-expert taxpayers to file declarations independently, avoid penalties, and reduce dependency on accountants.

## 🎯 PRODUCT VISION (From User Research)
> "نسهل للمكلفين بالضريبة التعقيدات الجبائية... باش يتفادى مشاكل جبائية كغرامات التأخير و أعباء المحاسب"
> "خصني سيت يقدر واحد ماهوش كامل قاري ينجم يخدم بيه"

**Core Principles:**
1. **Radical Simplicity**: A user with basic literacy can file G50 in <5 minutes
2. **Guided Workflow**: Step-by-step wizard with plain-language explanations (no fiscal jargon)
3. **Prevention First**: Real-time warnings for common errors that trigger DGIP penalties
4. **Confidence Building**: "You're compliant" confirmation with legal references
5. **Offline-First**: Works on low-end smartphones with intermittent connectivity

## 🗂️ PLATFORM SCOPE (MVP)
| Tax Type | Declaration Form | Frequency | Target User |
|----------|-----------------|-----------|-------------|
| **TVA** | G50 (Section TVA) | Monthly | Auto-entrepreneurs, SMEs |
| **IRG Salaires** | G50 (Section Salaires) | Monthly | Employers, HR managers |
| **IRG BNC/Prof. Lib.** | G50 + Annual | Monthly/Annual | Freelancers, professionals |
| **IBS** | G50 + Annual | Monthly/Annual | Registered companies |

**🎯 MVP Focus**: G50 Monthly Declaration (TVA + IRG Salaires) → 80% of user needs

## 🗄️ DATABASE SCHEMA (Prisma + SQLite for local, PostgreSQL-ready)
```prisma
// ============ CORE USER MODEL ============
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  passwordHash    String
  fullName        String
  phone           String?
  nif             String?   // Numéro d'Identification Fiscale (optional for demo)
  activityType    ActivityType // AUTO_ENTREPRENEUR, PME, PROFESSION_LIBERALE, SALARIE
  monthlyRevenue  Decimal?  @db.Decimal(18,2) // For auto-exemption checks
  isVerified      Boolean   @default(false) // Mock DGIP verification
  language        Language  @default(FR)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  declarations    Declaration[]
  calculations    Calculation[]
  savedTemplates  SavedTemplate[]
  notifications   Notification[]
  auditLogs       AuditLog[]
}

enum ActivityType {
  AUTO_ENTREPRENEUR
  PME
  PROFESSION_LIBERALE
  SALARIE_EMPLOYER
  INDIVIDUAL
}

enum Language {
  FR
  EN
  AR
}

// ============ G50 DECLARATION (CORE WORKFLOW) ============
model Declaration {
  id                String   @id @default(cuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id])
  
  // G50 Form Fields
  periodYear        Int
  periodMonth       Int      // 1-12
  declarationType   DeclarationType @default(G50_MONTHLY)
  
  // TVA Section
  tvaCollectee      Decimal  @db.Decimal(18,2) @default(0)
  tvaDeductible     Decimal  @db.Decimal(18,2) @default(0)
  tvaNet            Decimal  @db.Decimal(18,2) @default(0)
  tvaExemptSales    Decimal  @db.Decimal(18,2) @default(0)
  
  // IRG Salaires Section
  totalSalaries     Decimal  @db.Decimal(18,2) @default(0)
  irgSalaires       Decimal  @db.Decimal(18,2) @default(0)
  cnasEmployee      Decimal  @db.Decimal(18,2) @default(0)
  cnasEmployer      Decimal  @db.Decimal(18,2) @default(0)
  
  // IBS/IRG BNC (if applicable)
  taxableBenefit    Decimal? @db.Decimal(18,2)
  ibsAmount         Decimal? @db.Decimal(18,2)
  
  // Totals & Status
  totalToPay        Decimal  @db.Decimal(18,2) @default(0)
  status            DeclarationStatus @default(DRAFT)
  dgipReference     String?  // Mock filing reference
  submittedAt       DateTime?
  paidAt            DateTime?
  
  transactions      Transaction[]
  validationErrors  Json?    // Array of {field, message, fixSuggestion}
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

enum DeclarationType {
  G50_MONTHLY
  IRG_ANNUAL
  IBS_ANNUAL
}

enum DeclarationStatus {
  DRAFT
  VALIDATED
  SUBMITTED
  PAID
  REJECTED
}

// ============ TRANSACTIONS (For TVA Collectée/Déductible) ============
model Transaction {
  id              String   @id @default(cuid())
  declarationId   String
  declaration     Declaration @relation(fields: [declarationId], references: [id], onDelete: Cascade)
  
  type            TransactionType // SALE or PURCHASE
  date            DateTime
  description     String?   // Plain language: "Vente marchandises", "Achat bureau"
  clientSupplier  String?   // Optional
  
  // Amounts
  amountHT        Decimal  @db.Decimal(18,2)
  tvaRate         Decimal  @db.Decimal(5,4) // 0.19, 0.09, 0.00
  tvaAmount       Decimal  @db.Decimal(18,2)
  amountTTC       Decimal  @db.Decimal(18,2)
  
  // Deductibility (Art. 33 CID)
  category        ExpenseCategory
  deductiblePct   Decimal  @db.Decimal(5,4) @default(1.0)
  nonDeductibleReason String? // "Véhicule tourisme", "Restauration", etc.
  
  // Document reference
  invoiceNumber   String?
  hasInvoice      Boolean  @default(false) // Mock document upload
  
  createdAt       DateTime @default(now())
}

enum TransactionType {
  SALE
  PURCHASE
}

enum ExpenseCategory {
  STANDARD          // 100% deductible
  VEHICLE           // 50% max (Art. 33-2°)
  HOSPITALITY       // 0% (hébergement, restauration)
  REAL_ESTATE       // 100% (locaux professionnels)
  EXPORT            // Exempt
  EXEMPT_SERVICE    // Education, santé, etc.
}

// ============ SALARIES (For IRG Salaires + CNAS) ============
model SalaryLine {
  id              String   @id @default(cuid())
  declarationId   String
  declaration     Declaration @relation(fields: [declarationId], references: [id], onDelete: Cascade)
  
  employeeName    String
  matricule       String?   // Employee ID
  grossSalary     Decimal  @db.Decimal(18,2)
  
  // Deductions
  cnasEmployee    Decimal  @db.Decimal(18,2) // 9% of gross
  taxableBase     Decimal  @db.Decimal(18,2) // gross - cnas - family deductions
  
  // IRG Calculation (progressive brackets)
  irgAmount       Decimal  @db.Decimal(18,2)
  familyDeduction Decimal  @db.Decimal(18,2) // 1000 DZD/child, max 3
  
  netSalary       Decimal  @db.Decimal(18,2) // gross - cnas - irg
  
  createdAt       DateTime @default(now())
}

// ============ USER EXPERIENCE & GUIDANCE ============
model SavedTemplate {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  
  name            String   // "Ventes mensuelles", "Achats bureau", etc.
  type            TemplateType
  presetValues    Json     // Pre-filled fields for quick reuse
  
  usageCount      Int      @default(0)
  lastUsed        DateTime?
  createdAt       DateTime @default(now())
}

enum TemplateType {
  RECURRING_SALE
  RECURRING_PURCHASE
  SALARY_TEMPLATE
  DECLARATION_DRAFT
}

model Notification {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  
  type            NotificationType
  title           String
  message         String   // Plain language, trilingual
  actionUrl       String?  // e.g., "/declarations/new?month=5"
  isRead          Boolean  @default(false)
  
  // Penalty prevention
  severity        Severity @default(INFO)
  deadline        DateTime? // e.g., "File by 15/06 to avoid 10% late fee"
  
  createdAt       DateTime @default(now())
}

enum NotificationType {
  DEADLINE_REMINDER
  PENALTY_WARNING
  SUCCESS_CONFIRMATION
  RULE_UPDATE
  TIP_EDUCATIONAL
}

enum Severity {
  INFO
  WARNING
  CRITICAL
}

// ============ TAX RULES ENGINE (Versioned, Traceable) ============
model TaxRule {
  id              String   @id @default(cuid())
  taxCode         String   // TVA, IRG_SALAIRE, IRG_BNC, IBS
  version         String   // "2025", "2026"
  effectiveFrom   DateTime
  effectiveTo     DateTime?
  
  // Rule content (JSON for flexibility)
  brackets        Json?    // Progressive scales
  rates           Json?    // Flat rates
  exemptions      Json?    // Conditions for exemption
  deductions      Json?    // Deductible percentages, caps
  legalReferences Json?    // [{article: "Art. 28", source: "CID", text: "..."}]
  
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
}

// ============ AUDIT & COMPLIANCE ============
model Calculation {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  
  context         CalculationContext // G50_PREVIEW, STANDALONE_TVA, etc.
  inputSnapshot   Json     // Full input state for reproducibility
  resultSnapshot  Json     // Full output state
  ruleVersion     String   // Which tax rule version was used
  
  ipAddress       String?  // Hashed
  userAgent       String?
  createdAt       DateTime @default(now())
}

enum CalculationContext {
  G50_PREVIEW
  STANDALONE_TVA
  STANDALONE_IRG
  SALARY_SIMULATION
  THESIS_VALIDATION
}

model AuditLog {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  
  action          String   // declaration_created, calculation_saved, etc.
  resource        String?  // declaration, calculation, user
  resourceId      String?
  metadata        Json?    // Additional context
  
  ipAddress       String?
  timestamp       DateTime @default(now())
}

// ============ PLATFORM ANALYTICS (Mock for demo) ============
model PlatformMetric {
  id              String   @id @default(cuid())
  date            DateTime @unique
  
  activeUsers     Int      @default(0)
  newDeclarations Int      @default(0)
  totalCalculations Int    @default(0)
  penaltyAvoided  Decimal  @db.Decimal(18,2) @default(0) // Mock: estimated fines prevented
  topErrors       Json?    // Most common validation errors
  
  createdAt       DateTime @default(now())
}
```

## 🧠 CORE LOGIC MODULES (Server Actions)

### 1. `src/lib/tax-engine/g50-calculator.ts`

```typescript
// Main G50 calculation orchestrator
export async function calculateG50(userId: string, period: {year: number, month: number}) {
  // 1. Load active tax rules for TVA, IRG Salaires (2025 LF)
  // 2. Fetch user's transactions for the period
  // 3. Calculate TVA Collectée (sales × rate)
  // 4. Calculate TVA Déductible (purchases × rate × deductiblePct)
  // 5. Apply auto-exemption checks (CA ≤ 1M DZD for services/commerce)
  // 6. Calculate IRG Salaires (progressive brackets + family deductions)
  // 7. Calculate CNAS (9% employee + 26% employer)
  // 8. Aggregate totals, validate against thresholds
  // 9. Generate validation warnings (e.g., "Missing invoice for 500k DZD purchase")
  // 10. Return structured result + plain-language summary
  
  // USE decimal.js FOR ALL MATH. NO FLOATS.
}
```

### 2. `src/lib/validation/penalty-prevention.ts`

```typescript
// Real-time warnings to avoid DGIP penalties
export function checkPenaltyRisks(declaration: Declaration): Warning[] {
  const warnings: Warning[] = [];
  
  // Late filing risk
  if (isAfter(new Date(), getDeadline(declaration.periodMonth))) {
    warnings.push({
      code: 'LATE_FILING',
      severity: 'CRITICAL',
      message: {
        fr: "Déclaration en retard : risque de majoration de 10%",
        ar: "تصريح متأخر: خطر غرامة 10%",
        en: "Late filing: 10% penalty risk"
      },
      fix: "Submit immediately to minimize penalties"
    });
  }
  
  // Missing invoice risk (Art. 45 CID)
  const largePurchases = declaration.transactions.filter(t => 
    t.type === 'PURCHASE' && t.amountHT > 100000 && !t.hasInvoice
  );
  if (largePurchases.length > 0) {
    warnings.push({
      code: 'MISSING_INVOICE',
      severity: 'WARNING',
      message: {
        fr: `${largePurchases.length} achat(s) >100k DZD sans facture : risque de rejet de déduction`,
        ar: `${largePurchases.length} شراء/مشتريات >100 ألف دج بدون فاتورة: خطر رفض الخصم`,
        en: `${largePurchases.length} purchase(s) >100k DZD without invoice: deduction may be rejected`
      },
      fix: "Upload invoice or mark as 'lost' with justification"
    });
  }
  
  // Auto-exemption edge case
  if (user.monthlyRevenue && user.monthlyRevenue <= 1000000 && user.activityType === 'AUTO_ENTREPRENEUR') {
    warnings.push({
      code: 'AUTO_EXEMPT',
      severity: 'INFO',
      message: {
        fr: "Votre CA ≤ 1M DZD : vous êtes auto-exonéré de TVA (Art. 30-1°)",
        ar: "حجم أعمالك ≤ 1 مليون دج: معفى تلقائياً من الضريبة على القيمة المضافة",
        en: "Your turnover ≤ 1M DZD: auto-exempt from TVA (Art. 30-1°)"
      },
      fix: "No action needed - exemption applied automatically"
    });
  }
  
  return warnings;
}
```

### 3. `src/lib/i18n/plain-language.ts`

```typescript
// Convert fiscal jargon to plain language (trilingual)
export const plainLanguage = {
  tva_collectee: {
    fr: "TVA que vous avez facturée à vos clients",
    ar: "الضريبة على القيمة المضافة التي فاتورتها لزبائنك",
    en: "VAT you charged to your customers"
  },
  tva_deductible: {
    fr: "TVA que vous avez payée sur vos achats professionnels",
    ar: "الضريبة على القيمة المضافة التي دفعتها على مشترياتك المهنية",
    en: "VAT you paid on business purchases"
  },
  irg_salaires: {
    fr: "Impôt sur le revenu retenu sur les salaires de vos employés",
    ar: "الضريبة على الدخل المقتطعة من رواتب موظفيك",
    en: "Income tax withheld from your employees' salaries"
  },
  // ... 50+ more terms
};
```

## 🖥️ UI/UX: RADICAL SIMPLICITY FOR NON-EXPERTS

### 1. Onboarding Wizard (First Login)

```
Step 1: "Quel est votre statut ?" 
[👤 Auto-entrepreneur] [🏢 PME] [💼 Profession libérale] [👔 Employeur]

Step 2: "Quelles déclarations vous concernent ?"
[✅ TVA mensuelle] [✅ IRG salaires] [⬜ IBS annuel] [⬜ IRG annuel]

Step 3: "Voulez-vous des rappels par SMS pour les échéances ?"
[📱 Oui, rappelez-moi] [❌ Non, merci]

Step 4: "Prêt ! Voici votre tableau de bord simplifié →"
```

### 2. G50 Declaration Flow (5 Steps Max)

```
📍 Step 1: Période
   [Mois: ▼ Juin] [Année: ▼ 2025] → "Suivant"

📍 Step 2: Vos ventes (TVA collectée)
   💡 "Entrez le total HT de vos ventes ce mois-ci"
   [________ DZD] + "Ajouter une vente détaillée" (optional)
   → Auto-calcul: "TVA 19% = XXX DZD"

📍 Step 3: Vos achats (TVA déductible)
   💡 "Entrez vos achats professionnels"
   [Table simple: Date | Description | Montant HT | TVA%]
   ⚠️ Warning if: "Véhicule: seulement 50% déductible"

📍 Step 4: Salaires (si employeur)
   💡 "Ajoutez vos employés ou importez un fichier"
   [Nom] [Salaire brut] → Auto: CNAS 9% + IRG calculé
   + "Ajouter un autre employé"

📍 Step 5: Récapitulatif & Validation
   ✅ "Tout est correct !" or ⚠️ "2 points à vérifier"
   [📄 Voir le formulaire G50] [✏️ Modifier] [🚀 Soumettre]
```

### 3. Plain-Language Result Card

```
┌─────────────────────────────────┐
│ ✅ Déclaration G50 - Juin 2025   │
├─────────────────────────────────┤
│ TVA à payer        : 190 000 DZD│
│ IRG Salaires       :  45 000 DZD│
│ ─────────────────────────────── │
│ TOTAL À PAYER      : 235 000 DZD│
│ Échéance           : 15/07/2025 │
│                                     │
│ 📋 Référence DGIP  : G50-202506-ABC123 │
│ 📧 Reçu envoyé à   : user@email.dz│
│                                     │
│ 💡 Conseil: Payez avant le 15/07 │
│    pour éviter la majoration de 10%│
└─────────────────────────────────┘
```

### 4. Critical UI Components

- **`<PlainLanguageTooltip term="tva_deductible" />`**: Hover → plain explanation + legal ref
- **`<PenaltyWarningBanner declaration={decl} />`**: Red banner if late/missing docs
- **`<OneClickTemplate type="recurring_sale" />`**: Pre-fill common transactions
- **`<OfflineIndicator />`**: "Mode hors ligne: vos données sont sauvegardées localement"
- **`<LanguageSwitcher compact />`**: FR | EN | 🇩🇿 (Arabic RTL)

## 🔐 MOCK AUTH & SUBSCRIPTION (Local Dev)

### `src/lib/mock-auth.ts`

```typescript
// For local testing only - replace with Clerk/Supabase in production
export const demoAccounts = {
  citizen: {
    email: 'citizen@matax.dz',
    password: 'demo123',
    role: 'CITIZEN',
    activityType: 'AUTO_ENTREPRENEUR',
    monthlyRevenue: 800000, // Auto-exempt from TVA
    language: 'AR'
  },
  accountant: {
    email: 'expert@matax.dz',
    password: 'demo123',
    role: 'ACCOUNTANT',
    activityType: 'PROFESSION_LIBERALE',
    clients: ['citizen@matax.dz', 'pme@matax.dz'],
    language: 'FR'
  },
  admin: {
    email: 'admin@matax.dz',
    password: 'demo123',
    role: 'ADMIN',
    language: 'FR'
  }
};

export const mockLogin = async (email: string) => {
  // Return user + mock JWT + subscription limits
};
```

### `src/lib/subscription-limits.ts`

```typescript
export const PLAN_LIMITS = {
  FREE: {
    declarationsPerMonth: 2,
    transactionsPerDeclaration: 20,
    exportFormats: ['pdf'],
    penaltyWarnings: true,
    support: 'community'
  },
  PRO: {
    price: '999 DZD/mois',
    declarationsPerMonth: Infinity,
    transactionsPerDeclaration: Infinity,
    exportFormats: ['pdf', 'csv', 'excel'],
    penaltyWarnings: true,
    smsReminders: true,
    accountantAccess: true,
    support: 'priority'
  }
};
```

## 🌐 API ROUTES (Next.js App Router)

```
POST   /api/auth/login          # Mock login → return user + token
GET    /api/declarations        # List user's declarations
POST   /api/declarations        # Create new G50 draft
GET    /api/declarations/[id]   # Get declaration + calculations
PUT    /api/declarations/[id]   # Update declaration
POST   /api/declarations/[id]/submit # Mock DGIP submission
POST   /api/declarations/[id]/export  # Export PDF/CSV/Excel
GET    /api/tax-rules           # Get active rules for calculator
POST   /api/calculations/preview # Real-time preview during form fill
GET    /api/notifications       # User's penalty warnings & tips
GET    /api/analytics/user      # User's compliance history (mock)
GET    /api/analytics/platform  # Platform metrics (ADMIN only)
```

## 📱 LANDING PAGE (Public Marketing)

`src/app/page.tsx` - "Matax: La fiscalité algérienne, simplifiée."

```
Hero Section:
"Finies les erreurs de déclaration. Finies les amendes.
 Matax vous guide pas à pas pour une fiscalité sereine."
[🚀 Commencer gratuitement] [📹 Voir la démo]

Value Props (with icons):
✅ "Interface simple, même sans expertise comptable"
✅ "Alertes en temps réel pour éviter les pénalités DGIP"
✅ "G50, TVA, IRG, IBS : tout au même endroit"
✅ "Disponible en français, anglais et arabe"

How It Works (3 steps):
1️⃣ "Créez votre compte en 30 secondes"
2️⃣ "Renseignez vos ventes et achats (ou importez)"
3️⃣ "Validez et téléchargez votre G50 prêt à envoyer"

Testimonials (mock):
"Matax m'a fait économiser 3 heures par mois et évité une amende de 50 000 DZD" 
— Karim, auto-entrepreneur, Alger

"Enfin un outil qui parle mon langage, pas celui de l'administration"
— Fatima, profession libérale, Oran

Pricing Table:
[GRATUIT] 2 déclarations/mois, alertes pénalités, PDF
[PRO - 999 DZD/mois] Illimité, exports Excel, SMS rappels, support prioritaire
[ENTREPRISE] API, multi-utilisateurs, marque blanche

FAQ:
"Est-ce que Matax remplace un expert-comptable ?"
→ "Non, Matax est un assistant. Pour les situations complexes, nous recommandons de consulter un professionnel."

"Mes données sont-elles sécurisées ?"
→ "Oui. Conformité Loi 18-07. Chiffrement, accès restreint, droit à l'effacement."

Final CTA:
"Prêt à simplifier votre fiscalité ?"
[🎯 Créer mon compte gratuit]
```

## 🧪 VALIDATION & TESTING

### Thesis Validation Cases (Extend Existing)

```typescript
const g50TestCases = [
  {
    id: 'G50-TC01',
    description: 'Auto-entrepreneur, CA=800k, services → auto-exempt TVA',
    input: { activityType: 'AUTO_ENTREPRENEUR', monthlyRevenue: 800000, sales: [], purchases: [] },
    expected: { tvaNet: 0, irgSalaires: 0, totalToPay: 0, warnings: ['AUTO_EXEMPT'] }
  },
  {
    id: 'G50-TC02',
    description: 'PME, sales=2M (19%), purchases=1M (19% standard) → net TVA=190k',
    input: { sales: [{ht: 2000000, rate: 0.19}], purchases: [{ht: 1000000, rate: 0.19, category: 'STANDARD'}] },
    expected: { tvaCollectee: 380000, tvaDeductible: 190000, tvaNet: 190000 }
  },
  {
    id: 'G50-TC03',
    description: 'Employeur, 3 salariés → IRG + CNAS calculés',
    input: { salaries: [
      { gross: 50000, children: 2 },
      { gross: 80000, children: 0 },
      { gross: 120000, children: 3 }
    ]},
    expected: { irgSalaires: expect.closeTo(45000, 100), cnasTotal: expect.any(Number) }
  }
  // ... 5 total cases
];
```

### Penalty Prevention Tests

```typescript
test('warns if declaration submitted after deadline', () => {
  const decl = { periodMonth: 5, submittedAt: new Date('2025-07-20') };
  const warnings = checkPenaltyRisks(decl);
  expect(warnings).toContainEqual(expect.objectContaining({ code: 'LATE_FILING' }));
});

test('warns if large purchase missing invoice', () => {
  const decl = { transactions: [{ type: 'PURCHASE', amountHT: 150000, hasInvoice: false }] };
  const warnings = checkPenaltyRisks(decl);
  expect(warnings).toContainEqual(expect.objectContaining({ code: 'MISSING_INVOICE' }));
});
```

## 🎨 DESIGN SYSTEM (Tailwind + RTL)

### `src/app/globals.css` additions

```css
/* Matax Brand Colors */
:root {
  --matax-primary: #1a56db;    /* Trust blue */
  --matax-success: #0e9f6e;    /* Compliance green */
  --matax-warning: #f59e0b;    /* Penalty amber */
  --matax-danger: #dc2626;     /* Critical red */
  --matax-bg: #f9fafb;
}

/* RTL Support for Arabic */
[dir="rtl"] {
  /* Flip flex directions, margins, paddings */
  .flex-row { flex-direction: row-reverse; }
  .ml-2 { margin-left: 0; margin-right: 0.5rem; }
  /* ... use tailwind-rtl plugin for auto-handling */
}

/* Print-Optimized G50 Export */
@media print {
  .no-print { display: none !important; }
  .print-only { display: block !important; }
  body { font-size: 11pt; color: #000; }
  .g50-form { border: 2px solid #000; padding: 1cm; }
}

/* Accessibility */
@media (prefers-reduced-motion) {
  * { animation: none !important; transition: none !important; }
}
```

### `src/components/ui/` Components to Create

- `<Card variant="warning">` for penalty alerts
- `<StepWizard>` for guided G50 flow
- `<PlainLanguageField label="tva_collectee">` auto-translates + tooltips
- `<OfflineBadge>` shows sync status
- `<LanguageToggle compact>` for header

## 📦 DEPENDENCIES

```bash
npm install next@latest react@latest react-dom@latest
npm install prisma @prisma/client
npm install decimal.js date-fns zod
npm install lucide-react react-hot-toast clsx tailwind-merge
npm install recharts @tanstack/react-table
npm install next-intl @react-pdf/renderer
npm install -D @types/node @types/react
```

## ⚙️ ENVIRONMENT (.env.local)

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="matax-dev-secret-2025"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Matax"
NODE_ENV="development"
```

## 🚀 LOCAL DEVELOPMENT WORKFLOW

```bash
# 1. Initialize
npx prisma db push
npx prisma db seed  # Seeds demo users + tax rules + mock data

# 2. Generate analytics (optional)
npx tsx src/scripts/generate-demo-metrics.ts

# 3. Start dev server
npm run dev

# 4. Test flows:
#    - Login as citizen@matax.dz → file G50 for June
#    - Verify penalty warnings appear for late filing
#    - Switch to Arabic → confirm RTL layout
#    - Export G50 as PDF → check print preview
```

## 📝 README.MD STRUCTURE

```markdown
# 🇩🇿 Matax - Algerian Tax Compliance Platform

> "La fiscalité algérienne, simplifiée pour tous."

## 🎯 Vision
Empower non-expert Algerian taxpayers to file G50 declarations independently, avoid DGIP penalties, and reduce dependency on accountants.

## 🚀 Quick Start (Local Dev)
1. `npm install`
2. `npx prisma db push`
3. `npx prisma db seed`
4. `npm run dev`
5. Visit `http://localhost:3000`

## 👥 Demo Accounts
| Email | Password | Role | Use Case |
|-------|----------|------|----------|
| citizen@matax.dz | demo123 | Auto-entrepreneur | Test TVA auto-exemption |
| expert@matax.dz | demo123 | Accountant | Manage multiple clients |
| admin@matax.dz | demo123 | Platform admin | View analytics |

## 🧠 Architecture
- **Frontend**: Next.js 14 App Router, Tailwind, next-intl (FR/EN/AR)
- **Backend**: Next.js Server Actions, Prisma ORM
- **Database**: SQLite (local) → PostgreSQL-ready schema
- **Math**: decimal.js for financial precision
- **Compliance**: Audit logs, rule versioning, penalty prevention

## 📋 G50 Workflow
1. Select period (month/year)
2. Enter sales → auto-calc TVA collectée
3. Enter purchases → auto-apply deductibility caps (Art. 33)
4. Add salaries (if employer) → auto-calc IRG + CNAS
5. Review warnings → validate → export G50 PDF

## 🔐 Compliance & Privacy
- Law 18-07 compliant (data localization, consent, right to deletion)
- All calculations traceable to official Loi de Finances 2025
- Disclaimer: "Assistant tool only. Consult a certified accountant for complex cases."

## 🔄 From Thesis to Startup
This project began as a Master's thesis in Economics & Accounting. The modular rule engine, validation framework, and user-centered design are positioned for commercialization as a RegTech SaaS serving Algerian SMEs and auto-entrepreneurs.

## 📄 License
Academic use: MIT. Commercial licensing: contact team@matax.dz
```

## ⚠️ CRITICAL CONSTRAINTS

1. **NO floats for financial math** → `decimal.js` everywhere
2. **Trilingual from day 1** → FR/EN/AR with RTL for Arabic
3. **Plain language over fiscal jargon** → Use `plain-language.ts` dictionary
4. **Penalty prevention first** → Warnings before errors
5. **Offline-capable** → LocalStorage sync for low-connectivity users
6. **Mock everything for local dev** → Auth, payments, DGIP submission
7. **PostgreSQL-ready schema** → Easy migration post-thesis

## ✅ DELIVERABLES CHECKLIST

- [ ] Prisma schema with all models above
- [ ] Seed script with demo users + tax rules (2025 LF)
- [ ] G50 calculation Server Action with decimal.js
- [ ] Penalty prevention validation logic
- [ ] Plain-language i18n dictionary (50+ terms)
- [ ] 5-step G50 wizard UI (mobile-first)
- [ ] Result card with DGIP reference mock
- [ ] PDF export with print-optimized CSS
- [ ] Landing page with pricing & testimonials
- [ ] Demo accounts + mock auth system
- [ ] Thesis validation test cases (G50-TC01 to TC05)
- [ ] README with local dev instructions

## 🎓 THESIS INTEGRATION POINTS

| Chapter             | Matax Feature to Highlight                           |
| ------------------- | ---------------------------------------------------- |
| Ch3: System Design  | Modular rule engine + versioning strategy            |
| Ch4: Implementation | Plain-language i18n + penalty prevention logic       |
| Ch5: Validation     | G50 test cases + variance analysis (0.00 DZD)        |
| Ch6: Conclusion     | "From academic prototype to RegTech startup" roadmap |

Generate ALL files now. Start with schema → seed → core logic → UI components → landing page. Ensure Arabic RTL works perfectly. Pause if context limit reached; I will reply "continue".

```

---

## 🎯 Why This Prompt Is "The Best"

| Feature | Standard Prompt | **This Matax Prompt** |
|---------|----------------|----------------------|
| **User-Centricity** | "Build a calculator" | "Build for non-experts who fear penalties" |
| **Algerian Specificity** | Generic tax logic | G50 form, Art. 33 deductibility, DGIP references, Loi de Finances 2025 |
| **Product Thinking** | Technical features only | Onboarding wizard, penalty prevention, plain-language UX |
| **Startup Readiness** | Academic prototype | Subscription tiers, demo accounts, landing page, analytics |
| **Compliance Focus** | Calculation accuracy | Audit trails, Law 18-07, disclaimer strategy |
| **Scalability** | Single tax module | Modular engine ready for IBS/IRG expansion |
| **Thesis Alignment** | Generic validation | G50 test cases + variance analysis + chapter mapping |

---

## 🚀 Next Steps After Pasting

1. **Paste this prompt** into OpenCode/Antigravity
2. **Wait for generation** (reply `continue` if it stops)
3. **Run locally**:
   ```bash
   npx prisma db push
   npx prisma db seed
   npm run dev
```

4. **Test the critical flow**:
   - Login as `citizen@matax.dz` / `demo123`
   - File a G50 for June 2025
   - Verify penalty warnings appear
   - Export PDF → check Arabic RTL
5. **Record your thesis demo** while it's stable locally

---

**You now have the ultimate prompt to build Matax** — a thesis-worthy, startup-ready, Algerian-focused tax platform.

Need the **Supabase migration guide** or **investor pitch deck template** next? Reply `A` or `B`. 🇩🇿✨
