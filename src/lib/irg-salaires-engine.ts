import { Decimal } from './decimal-utils';

export interface IRGSalairesBracket {
  min: number;
  max: number | null;
  rate: number;
}

/**
 * Monthly IRG Brackets (Algerian Finance Law 2022/2026)
 * Based on monthly taxable income (Salary after CNAS 9%)
 */
export const MONTHLY_IRG_BRACKETS: IRGSalairesBracket[] = [
  { min: 0, max: 30000, rate: 0 },
  { min: 30000, max: 120000, rate: 0.23 },
  { min: 120000, max: 480000, rate: 0.27 },
  { min: 480000, max: 960000, rate: 0.30 },
  { min: 960000, max: 1920000, rate: 0.33 },
  { min: 1920000, max: null, rate: 0.35 },
];

/**
 * Calculates IRG Salaires for a single employee
 * @param grossSalary Gross salary before CNAS
 * @returns { irg: Decimal, net: Decimal, cnas: Decimal, details: any }
 */
export function calculateSingleSalaryIRG(grossSalary: number | string | Decimal): {
  irg: Decimal;
  net: Decimal;
  cnas: Decimal;
  details: {
    gross: Decimal;
    cnas: Decimal;
    taxable: Decimal;
    irgBrut: Decimal;
    abatement: Decimal;
    irgNet: Decimal;
    netSalary: Decimal;
  };
} {
  const gross = new Decimal(String(grossSalary));
  
  // 1. CNAS Deduction (9%)
  const cnas = gross.mul(0.09).toDecimalPlaces(2);
  const taxable = gross.sub(cnas).toDecimalPlaces(2);

  // 2. Calculate IRG Brut based on progressive brackets
  let irgBrut = new Decimal(0);

  for (const bracket of MONTHLY_IRG_BRACKETS) {
    if (taxable.lte(bracket.min)) break;

    const max = bracket.max ? new Decimal(bracket.max) : new Decimal(Infinity);
    const taxableInBracket = Decimal.min(taxable, max).sub(bracket.min);
    
    irgBrut = irgBrut.add(taxableInBracket.mul(bracket.rate));
  }
  
  irgBrut = irgBrut.toDecimalPlaces(2);

  // 3. Apply 40% Abatement (Art 104 CID)
  // Min: 1,500 DZD, Max: 2,500 DZD
  let abatement = irgBrut.mul(0.4);
  if (abatement.lt(1500)) abatement = new Decimal(1500);
  if (abatement.gt(2500)) abatement = new Decimal(2500);

  // The abatement cannot exceed the tax itself
  if (abatement.gt(irgBrut)) abatement = irgBrut;

  // 4. Special Additional Abatement for 30,000 - 35,000 range
  if (taxable.gt(30000) && taxable.lte(35000)) {
    // Bridges the gap smoothly between exempt and taxable
    const extraAbatement = irgBrut.sub(abatement).mul(0.5);
    abatement = abatement.add(extraAbatement);
  }

  const irgNet = irgBrut.sub(abatement).toDecimalPlaces(0); // Rounded to nearest DZD
  const netSalary = taxable.sub(irgNet).toDecimalPlaces(2);

  return {
    irg: irgNet,
    net: netSalary,
    cnas: cnas,
    details: {
      gross,
      cnas,
      taxable,
      irgBrut,
      abatement,
      irgNet,
      netSalary,
    }
  };
}

/**
 * Calculates total IRG for a list of salaries
 */
export function calculateTotalIRG(salaries: any[]): {
  totalGross: Decimal;
  totalCnas: Decimal;
  totalIRG: Decimal;
  totalNet: Decimal;
} {
  let totalGross = new Decimal(0);
  let totalCnas = new Decimal(0);
  let totalIRG = new Decimal(0);
  let totalNet = new Decimal(0);

  for (const s of salaries) {
    const res = calculateSingleSalaryIRG(s.grossSalary || 0);
    totalGross = totalGross.add(res.details.gross);
    totalCnas = totalCnas.add(res.cnas);
    totalIRG = totalIRG.add(res.irg);
    totalNet = totalNet.add(res.net);
  }

  return {
    totalGross,
    totalCnas,
    totalIRG,
    totalNet,
  };
}
