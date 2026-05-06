# Supabase Migration Guide — SQLite → PostgreSQL

## Overview
The TVA Calculator currently uses SQLite for local development. For production/Vercel deployment, migrate to Supabase (PostgreSQL) for persistent rules.

## Step-by-Step Migration

### 1. Create a Supabase Project (Free Tier)
1. Go to https://supabase.com → Sign up / Sign in
2. Click "New Project"
3. Choose region closest to Algeria (eu-west-1 or eu-west-2)
4. Set database password → **SAVE IT**
5. Wait for project to provision (~2 minutes)

### 2. Get Connection String
1. In Supabase Dashboard → Settings → Database
2. Find "Connection string" → Select "URI" format
3. Copy it — looks like:
   ```
   postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
   ```

### 3. Run the SQL Migration
1. In Supabase Dashboard → SQL Editor
2. Paste the entire contents of `supabase/migrations/001_tva_rules.sql`
3. Click "Run" — this creates tables + seeds data
4. Verify: Table Viewer → tax_rules should show 1 row, tax_brackets 3 rows, tax_deductions 3 rows

### 4. Update Prisma Schema
Open `prisma/schema.prisma` and change:
```diff
- datasource db {
-   provider = "sqlite"
-   url      = env("DATABASE_URL")
- }
+ datasource db {
+   provider = "postgresql"
+   url      = env("DATABASE_URL")
+ }
```

Also update field types for PostgreSQL:
```diff
- minAmount Float    @default(0)
- maxAmount Float?
- rate      Float
+ minAmount Decimal  @default(0) @db.Decimal(18, 2)
+ maxAmount Decimal? @db.Decimal(18, 2)
+ rate      Decimal  @db.Decimal(5, 4)

- value     Float?
+ value     Decimal? @db.Decimal(18, 2)
```

### 5. Update .env.local
```env
DATABASE_URL="postgresql://postgres.[YOUR_PROJECT_REF]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

### 6. Install PostgreSQL Prisma client
```bash
bun add pg
npx prisma generate
```

### 7. Test Locally
```bash
bun run dev
# Test all 3 modes
# Test thesis validation
# Verify Arabic RTL
```

### 8. Deploy to Vercel
```bash
npm i -g vercel
vercel --prod
# When asked for env vars, set:
# DATABASE_URL = your Supabase connection string
```

## Architecture After Migration
```
Vercel (Serverless)
  └── Next.js API Routes
        └── Prisma Client
              └── Supabase PostgreSQL
                    ├── tax_rules (1 row: TVA 2025)
                    ├── tax_brackets (3 rows: normal/reduced/exempt)
                    └── tax_deductions (3 rows: auto-exempts + export)
```

## Future: Adding IRG/IBS
1. Run INSERT into tax_rules with tax_code='IRG' or 'IBS'
2. Add corresponding brackets in tax_brackets
3. Tax engine automatically picks up new tax codes via rule lookup
4. No code changes needed — purely database-driven
