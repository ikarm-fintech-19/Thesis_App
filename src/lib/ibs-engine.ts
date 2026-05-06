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
