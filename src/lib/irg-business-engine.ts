import Decimal from 'decimal.js';

export interface IRGBracket {
  min: number;
  max: number | null;
  rate: number;
}

// Barème IRG Annuel (Loi de finances 2022/2026 for individuals/businesses)
// Ref: Art 104 du Code des Impôts Directs (CID)
export const ANNUAL_IRG_BRACKETS: IRGBracket[] = [
  { min: 0, max: 240000, rate: 0 },
  { min: 240000, max: 480000, rate: 0.23 },
  { min: 480000, max: 960000, rate: 0.27 },
  { min: 960000, max: 1920000, rate: 0.30 },
  { min: 1920000, max: 3840000, rate: 0.33 },
  { min: 3840000, max: null, rate: 0.35 },
];

export interface IRGBreakdown {
  bracket: string;
  tax: Decimal;
  rate: string;
}

export interface IRGBusinessCalculationResult {
  profit: Decimal;
  totalIrg: Decimal;
  breakdown: IRGBreakdown[];
}

/**
 * Calculates the Impôt sur le Revenu Global (IRG - Catégorie BIC/BNC)
 * based on the progressive annual tax brackets.
 */
export function calculateIRGBusiness(profit: string | number | Decimal): IRGBusinessCalculationResult {
  const profitDecimal = new Decimal(profit).toDecimalPlaces(2);
  
  if (profitDecimal.lte(0)) {
    return {
      profit: profitDecimal,
      totalIrg: new Decimal(0),
      breakdown: [],
    };
  }

  let totalTax = new Decimal(0);
  const breakdown: IRGBreakdown[] = [];

  for (const bracket of ANNUAL_IRG_BRACKETS) {
    if (profitDecimal.lte(bracket.min)) break;

    const taxableInBracket = profitDecimal.gt(bracket.max ?? Infinity) 
      ? new Decimal(bracket.max! - bracket.min)
      : profitDecimal.sub(bracket.min);

    const taxForBracket = taxableInBracket.mul(bracket.rate).toDecimalPlaces(2);
    
    if (taxForBracket.gt(0)) {
      totalTax = totalTax.add(taxForBracket);
      breakdown.push({
        bracket: `${bracket.min} - ${bracket.max || '∞'} DZD`,
        rate: `${bracket.rate * 100}%`,
        tax: taxForBracket
      });
    }
  }

  return {
    profit: profitDecimal,
    totalIrg: totalTax,
    breakdown,
  };
}
