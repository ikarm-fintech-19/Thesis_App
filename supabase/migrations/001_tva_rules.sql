-- ============================================================
-- Supabase Migration: TVA Rules Database
-- Version: 001_tva_rules_2026.sql
-- Law Reference: Loi de Finances 2026 — Art. 28-30 CID
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: tax_rules
-- Stores the master tax rule per tax code + version
-- ============================================================
CREATE TABLE IF NOT EXISTS tax_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tax_code VARCHAR(20) NOT NULL,
  version VARCHAR(10) NOT NULL,
  effective_from TIMESTAMPTZ NOT NULL,
  effective_to TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(10) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: tax_brackets
-- Rate brackets linked to a tax rule
-- ============================================================
CREATE TABLE IF NOT EXISTS tax_brackets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id UUID NOT NULL REFERENCES tax_rules(id) ON DELETE CASCADE,
  category VARCHAR(20) NOT NULL,
  min_amount NUMERIC(18,2) DEFAULT 0,
  max_amount NUMERIC(18,2),
  rate NUMERIC(5,4) NOT NULL,
  condition JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: tax_deductions
-- Deductions and exemptions linked to a tax rule
-- ============================================================
CREATE TABLE IF NOT EXISTS tax_deductions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id UUID NOT NULL REFERENCES tax_rules(id) ON DELETE CASCADE,
  code VARCHAR(30) NOT NULL,
  description_fr TEXT DEFAULT '',
  description_en TEXT DEFAULT '',
  description_ar TEXT DEFAULT '',
  calc_type VARCHAR(20) DEFAULT 'exempt',
  value NUMERIC(18,2),
  article_ref VARCHAR(100) DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_tax_rules_code_version ON tax_rules(tax_code, version, status);
CREATE INDEX idx_tax_brackets_rule_id ON tax_brackets(rule_id);
CREATE INDEX idx_tax_brackets_category ON tax_brackets(category);
CREATE INDEX idx_tax_deductions_rule_id ON tax_deductions(rule_id);
CREATE INDEX idx_tax_deductions_code ON tax_deductions(code);

-- ============================================================
-- ROW LEVEL SECURITY (public read for thesis demo)
-- ============================================================
ALTER TABLE tax_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_deductions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_tva_rules" ON tax_rules FOR SELECT USING (true);
CREATE POLICY "public_read_tva_brackets" ON tax_brackets FOR SELECT USING (true);
CREATE POLICY "public_read_tva_deductions" ON tax_deductions FOR SELECT USING (true);

-- ============================================================
-- SEED DATA: 2026 Loi de Finances TVA Rules
-- ============================================================

-- Master rule
INSERT INTO tax_rules (tax_code, version, effective_from, metadata, status) VALUES
('TVA', '2026', '2026-01-01', '{"law": "Loi de Finances 2026", "authority": "DGIP", "article_main": "Art. 28 CID"}', 'active')
ON CONFLICT DO NOTHING;

-- Rate brackets
INSERT INTO tax_brackets (rule_id, category, min_amount, max_amount, rate, condition) VALUES
((SELECT id FROM tax_rules WHERE tax_code='TVA' AND version='2026' LIMIT 1),
 'normal', 0, NULL, 0.19, '{"applies_to": ["most_goods","services"], "article": "Art. 28 - Taux normal 19%"}'),

((SELECT id FROM tax_rules WHERE tax_code='TVA' AND version='2026' LIMIT 1),
 'reduced', 0, NULL, 0.09, '{"applies_to": ["food","pharma","transport"], "article": "Art. 29 - Taux réduit 9%"}'),

((SELECT id FROM tax_rules WHERE tax_code='TVA' AND version='2026' LIMIT 1),
 'exempt', 0, NULL, 0.00, '{"applies_to": ["exports","basic_education","health_services"], "article": "Art. 30 - Exonérations"}')
ON CONFLICT DO NOTHING;

-- Deductions and exemptions
INSERT INTO tax_deductions (rule_id, code, description_fr, description_en, description_ar, calc_type, value, article_ref) VALUES
((SELECT id FROM tax_rules WHERE tax_code='TVA' AND version='2026' LIMIT 1),
 'AUTO_EXEMPT_SERVICE',
 'Franchise de TVA — Prestataires de services (CA ≤ 1 000 000 DZD)',
 'TVA Exemption — Service providers (Turnover ≤ 1,000,000 DZD)',
 'إعفاء من TVA — مقدمو الخدمات (رقم أعمال ≤ 1,000,000 د.ج)',
 'exempt', 1000000, 'Art. 30 - 1° du CID'),

((SELECT id FROM tax_rules WHERE tax_code='TVA' AND version='2026' LIMIT 1),
 'AUTO_EXEMPT_GOODS',
 'Franchise de TVA — Commerçants (CA ≤ 1 000 000 DZD)',
 'TVA Exemption — Merchants (Turnover ≤ 1,000,000 DZD)',
 'إعفاء من TVA — التجار (رقم أعمال ≤ 1,000,000 د.ج)',
 'exempt', 1000000, 'Art. 30 - 1° du CID'),

((SELECT id FROM tax_rules WHERE tax_code='TVA' AND version='2026' LIMIT 1),
 'EXPORT_EXEMPT',
 'Exonération à l''exportation',
 'Export exemption',
 'إعفاء التصدير',
 'exempt', 0, 'Art. 30 - 4° du CID')
ON CONFLICT DO NOTHING;

-- ============================================================
-- TABLE: declaration_periods
-- Stores declaration filing periods (monthly/quarterly)
-- ============================================================
CREATE TABLE IF NOT EXISTS declaration_periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(10) NOT NULL DEFAULT 'MONTHLY',  -- MONTHLY or QUARTERLY
  year INT NOT NULL,
  period INT NOT NULL,                          -- 1-12 monthly, 1-4 quarterly
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  tva_collectee NUMERIC(18,2) DEFAULT 0,
  tva_deductible NUMERIC(18,2) DEFAULT 0,
  net_tva NUMERIC(18,2) DEFAULT 0,
  status VARCHAR(10) DEFAULT 'draft',           -- draft, submitted
  user_id UUID,                                   -- for future auth
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: transactions
-- Individual sale/purchase transactions per period
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  period_id UUID NOT NULL REFERENCES declaration_periods(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL DEFAULT 'SALE',      -- SALE or PURCHASE
  date TIMESTAMPTZ NOT NULL,
  description TEXT,
  ht_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  tva_rate NUMERIC(5,4) NOT NULL DEFAULT 0.19,   -- 0.19, 0.09, 0.00
  category VARCHAR(20) NOT NULL DEFAULT 'standard', -- standard, vehicle, hospitality, real_estate
  invoice_ref VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES for declaration tables
-- ============================================================
CREATE INDEX idx_declaration_periods_type_year ON declaration_periods(type, year);
CREATE INDEX idx_declaration_periods_user ON declaration_periods(user_id);
CREATE INDEX idx_transactions_period_id ON transactions(period_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_date ON transactions(date);

-- ============================================================
-- RLS for declaration tables
-- ============================================================
ALTER TABLE declaration_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_declaration_periods" ON declaration_periods FOR SELECT USING (true);
CREATE POLICY "public_all_declaration_periods" ON declaration_periods FOR ALL USING (true);
CREATE POLICY "public_read_transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "public_all_transactions" ON transactions FOR ALL USING (true);

-- ============================================================
-- UPDATED AT trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_declaration_periods_updated
  BEFORE UPDATE ON declaration_periods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- FUTURE: IRG/IBS placeholder tables (uncomment when ready)
-- ============================================================
-- INSERT INTO tax_rules (tax_code, version, effective_from, metadata, status) VALUES
-- ('IRG', '2026', '2026-01-01', '{"law": "Loi de Finances 2026", "authority": "DGIP"}', 'active');

-- INSERT INTO tax_rules (tax_code, version, effective_from, metadata, status) VALUES
-- ('IBS', '2026', '2026-01-01', '{"law": "Loi de Finances 2026", "authority": "DGIP"}', 'active');

