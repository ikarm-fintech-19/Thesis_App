import Decimal from 'decimal.js';

export type IBSSector = 'production' | 'btph_tourism' | 'services_commerce';

export const IBS_RATES: Record<IBSSector, number> = {
  production: 0.19,
  btph_tourism: 0.23,
  services_commerce: 0.26,
};

export interface IBSCalculationResult {
  profit: Decimal;
  rate: Decimal;
  ibsAmount: Decimal;
  sector: IBSSector;
}

/**
 * Calculates the Impôt sur les Bénéfices des Sociétés (IBS)
 * based on the sector of activity and the annual net profit.
 */
export function calculateIBS(profit: string | number | Decimal, sector: IBSSector): IBSCalculationResult {
  const profitDecimal = new Decimal(profit).toDecimalPlaces(2);
  const rate = new Decimal(IBS_RATES[sector]);
  
  if (profitDecimal.lte(0)) {
    return {
      profit: profitDecimal,
      rate,
      ibsAmount: new Decimal(0),
      sector,
    };
  }

  const ibsAmount = profitDecimal.mul(rate).toDecimalPlaces(2);

  return {
    profit: profitDecimal,
    rate,
    ibsAmount,
    sector,
  };
}

/**
 * Calculates IBS withholding for non-resident foreign entities (Art. 23 LF 2026).
 * Standard rate is typically 30% on the gross amount of services.
 */
export function calculateForeignWithholding(
  grossAmount: string | number | Decimal,
  type: 'service' | 'software' | 'technical' = 'service'
): { gross: Decimal; rate: Decimal; tax: Decimal; net: Decimal } {
  const gross = new Decimal(grossAmount || 0);
  
  // LF 2026 maintains the 30% withholding on service provision by foreign entities
  // but allows for specific treaty overrides.
  let rate = new Decimal(0.30);
  
  if (type === 'software') rate = new Decimal(0.24); 
  
  const tax = gross.mul(rate).toDecimalPlaces(2);
  const net = gross.minus(tax);

  return { gross, rate, tax, net };
}

/**
 * Calculates mandatory R&D allocation (1% of turnover) for large enterprises (Art. 26 LF 2026).
 */
export function calculateRdAllocation(turnover: string | number | Decimal): Decimal {
  const t = new Decimal(turnover || 0);
  return t.mul(0.01).toDecimalPlaces(2);
}
