import Decimal from 'decimal.js';

export interface DividendResult {
  grossAmount: Decimal;
  withholdingRate: Decimal;
  taxAmount: Decimal;
  netAmount: Decimal;
}

/**
 * Calculates dividend withholding tax according to Art. 22 LF 2026.
 * The standard rate is updated to 10% for residents.
 */
export function calculateDividends(grossAmount: number | string | Decimal): DividendResult {
  const gross = new Decimal(grossAmount || 0);
  const rate = new Decimal(0.10); // 10% withholding tax as per LF 2026
  
  const taxAmount = gross.times(rate);
  const netAmount = gross.minus(taxAmount);

  return {
    grossAmount: gross,
    withholdingRate: rate,
    taxAmount,
    netAmount
  };
}
