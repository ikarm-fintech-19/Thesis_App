# Matax Platform Roadmap: Demo & Launch Improvements

This document outlines the strategic plan to elevate the Matax platform from a functional MVP to a highly impressive demo, and ultimately to a production-ready SaaS application for Algerian taxpayers.

---

## Phase 1: High-Impact Demo Enhancements (The "WOW" Factor)
*Goal: Implement highly visual and impressive features that instantly prove the product's value to investors, judges, and early users.*

### 1.1 Official PDF Generation (G50 & Bilan)
- **Objective:** Allow users to download their completed tax declarations as official, print-ready PDF forms (matching the Algerian tax authority standards).
- **Implementation:**
  - Integrate a PDF generation library (e.g., `jspdf`, `pdf-lib`, or `@react-pdf/renderer`).
  - Map the calculated outputs from `G50Wizard` and `AnnualTaxWizard` to specific X/Y coordinates on a blank PDF template of the official G50 form.
  - Add a "Télécharger le G50 Officiel" button to the `SummaryStep` of the wizards.

### 1.2 Interactive Dashboard Analytics
- **Objective:** Give users a clear visual understanding of their financial health immediately upon logging in.
- **Implementation:**
  - Utilize `recharts` (compatible with `shadcn/ui`) on the main `/dashboard` page.
  - Build 2-3 key visual widgets:
    - **Revenue vs. Taxes (Bar Chart):** Display the last 6 months of revenue against the calculated TVA/IRG.
    - **Upcoming Deadlines (Timeline/List):** Visually alert users to the 20th-of-the-month deadline for G50 based on the current date.

### 1.3 AI Receipt Scanner Prototype
- **Objective:** Demonstrate the ultimate reduction in user friction by automating data entry for expenses.
- **Implementation:**
  - Build out the `/dashboard/scanner` page with a drag-and-drop file upload UI.
  - **Mock Demo Route:** For the demo, implement a simulated "scanning" state that takes a dummy image and automatically populates a JSON response with "TVA: 19%, Montant HT: 50,000 DZD".
  - **Production Route:** Integrate a lightweight OCR API or Google Cloud Vision / Azure Document Intelligence to actually parse Algerian receipts.

---

## Phase 2: Technical Readiness & Persistence (Pre-Launch)
*Goal: Ensure data integrity, cross-device support, and a scalable architecture by migrating away from temporary browser storage.*

### 2.1 Backend Database Integration
- **Objective:** Move the declaration drafts and final submissions from `localStorage` to the robust Prisma PostgreSQL database.
- **Implementation:**
  - Update the `handleSubmit` logic in the Wizards to POST to `/api/declaration/submit` and `/api/annual-tax/submit`.
  - Update the auto-save functionality to PATCH a draft record in the database (`status: "DRAFT"`).
  - Ensure users can log out, log back in on a different device, and resume their G50 exactly where they left off.

### 2.2 Global User Onboarding & Profile Setup
- **Objective:** Prevent asking the user for their company type (Personne Morale vs. Physique) and Sector every time they do a declaration.
- **Implementation:**
  - Create a new Onboarding Flow that triggers the first time a user registers.
  - Collect static data: NIF, NIS, RC, Legal Entity Type, and Primary Sector.
  - Save this securely in the `User` or `Company` Prisma model.
  - Refactor `G50Wizard` and `AnnualTaxWizard` to fetch this context automatically and bypass the `ProfileStep`.

### 2.3 Comprehensive Data Aggregation
- **Objective:** Ensure the Annual Tax Wizard (IBS/IRG) pulls accurate data from the 12 monthly G50s.
- **Implementation:**
  - Build an aggregation endpoint (e.g., `/api/annual-tax/aggregate?year=2025`) that queries the database for all `SUBMITTED` declarations for that user in that year.
  - Sum the `sales`, `purchases`, and `salaries` fields to automatically pre-fill the `ProfitStep` of the Annual Bilan.

---

## Phase 3: Future Vision (Post-Launch Expansion)
*Goal: Expand Matax into a fully automated, end-to-end compliance ecosystem.*

### 3.1 Jibaya'tic Automation
- **Objective:** Connect Matax directly to the Algerian government's tax portal.
- **Implementation:** Explore RPA (Robotic Process Automation) or official API channels (if available) to submit the G50 data directly from Matax to the Jibaya'tic system, completely removing the need for physical printing.

### 3.2 Accountant Portal (B2B)
- **Objective:** Allow certified accountants to manage multiple Matax user accounts.
- **Implementation:** Enhance the `TeamMember` relationships in the Prisma schema to provide a dedicated dashboard where accountants can review, approve, and finalize declarations on behalf of their clients.
