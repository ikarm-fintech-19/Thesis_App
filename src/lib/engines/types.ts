import { Decimal } from '../decimal-utils';

export type TaxPeriod = 'MONTHLY' | 'QUARTERLY';

export interface BaseTransaction {
  id?: string;
  type: 'SALE' | 'PURCHASE';
  date: string;
  description: string;
  ht_amount: number | string | Decimal;
  tva_rate: number | string | Decimal;
  category?: string;
  invoice_ref?: string;
}

export interface TVAResult {
  collectee: Decimal;
  deductible: Decimal;
  previous_credit: Decimal;
  tls_amount: Decimal;
  net: Decimal;
  total_to_pay: Decimal;
  position: 'A PAYER' | 'CREDIT' | 'ZERO';
  sales_count: number;
  purchases_count: number;
  total_sales_ht: Decimal;
  total_purchases_ht: Decimal;
  breakdown: TVALineItem[];
}

export interface TVALineItem {
  id: string;
  type: 'SALE' | 'PURCHASE';
  date: string;
  description: string;
  ht_amount: Decimal;
  tva_rate: Decimal;
  gross_tva: Decimal;
  deductible_cap: Decimal;
  deductible_tva: Decimal;
  category: string;
  invoice_ref: string;
  articleRef?: string;
}

export interface IRGSalaryResult {
  totalGross: Decimal;
  totalCnas: Decimal;
  totalEmployerCNAS: Decimal;
  totalIRG: Decimal;
  totalNet: Decimal;
  employees: Array<{
    name: string;
    gross: Decimal;
    irg: Decimal;
    cnas: Decimal;
    net: Decimal;
    children: number;
    familyDeduction: Decimal;
  }>;
}
