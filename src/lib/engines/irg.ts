import { Decimal } from '../decimal-utils';
import { IRGSalaryResult } from './types';

export interface IRGSalairesBracket {
  min: number;
  max: number | null;
  rate: number;
}

/**
 * 2026 Finance Law Monthly Brackets (LF 2026)
 */
export const MONTHLY_IRG_BRACKETS: IRGSalairesBracket[] = [
  { min: 0, max: 20000, rate: 0.00 },
  { min: 20000, max: 40000, rate: 0.23 },
  { min: 40000, max: 80000, rate: 0.27 },
  { min: 80000, max: 160000, rate: 0.30 },
  { min: 160000, max: 320000, rate: 0.33 },
  { min: 320000, max: 999999999, rate: 0.35 },
];

export const FAMILY_DEDUCTION_PER_CHILD = 1000;
export const FAMILY_DEDUCTION_MAX_CHILDREN = 3;

export const ABATEMENT_MIN = 1500;
export const ABATEMENT_MAX = 2500;
export const ABATEMENT_RATE = 0.40;

export function calculateSingleSalaryIRG(grossSalary: number | string | Decimal, familyChildren: number = 0) {
  const gross = new Decimal(String(grossSalary));
  
  const cnas = gross.mul(0.09).toDecimalPlaces(2);
  const employerCNAS = gross.mul(0.26).toDecimalPlaces(2);
  let taxable = gross.sub(cnas).toDecimalPlaces(2);

  if (taxable.lte(30000)) {
    return {
      irg: new Decimal(0),
      net: taxable,
      cnas: cnas,
      employerCNAS: employerCNAS,
      details: {
        gross,
        cnas,
        employerCNAS,
        taxable,
        familyDeduction: new Decimal(0),
        taxableAfterFamily: taxable,
        irgBrut: new Decimal(0),
        abatement: new Decimal(0),
        irgNet: new Decimal(0),
        netSalary: taxable,
      }
    };
  }

  const familyDeduction = new Decimal(Math.min(familyChildren, FAMILY_DEDUCTION_MAX_CHILDREN) * FAMILY_DEDUCTION_PER_CHILD);
  const taxableAfterFamily = Decimal.max(taxable.sub(familyDeduction), new Decimal(0));

  let irgBrut = new Decimal(0);
  const taxableForCalc = taxable.lte(35000) ? taxable : taxableAfterFamily;

  for (const bracket of MONTHLY_IRG_BRACKETS) {
    if (taxableForCalc.lte(bracket.min)) break;

    const max = bracket.max ? new Decimal(bracket.max) : new Decimal(Infinity);
    const taxableInBracket = Decimal.min(taxableForCalc, max).sub(bracket.min);
    
    irgBrut = irgBrut.add(taxableInBracket.mul(bracket.rate));
  }
  
  irgBrut = irgBrut.toDecimalPlaces(2);

  let abatement = irgBrut.mul(ABATEMENT_RATE);
  if (abatement.lt(ABATEMENT_MIN)) abatement = new Decimal(ABATEMENT_MIN);
  if (abatement.gt(ABATEMENT_MAX)) abatement = new Decimal(ABATEMENT_MAX);

  if (abatement.gt(irgBrut)) abatement = irgBrut;

  // Smoothing for 30k-35k range
  if (taxable.gt(30000) && taxable.lte(35000)) {
    const standardNet = irgBrut.sub(abatement);
    const rangeProgress = taxable.sub(30000).div(5000);
    const smoothingFactor = rangeProgress.mul(0.28);
    const smoothedIrg = standardNet.mul(smoothingFactor);
    abatement = irgBrut.sub(smoothedIrg);
  }

  const irgNet = Decimal.max(irgBrut.sub(abatement), new Decimal(0)).toDecimalPlaces(0);
  const netSalary = taxable.sub(irgNet).toDecimalPlaces(2);

  return {
    irg: irgNet,
    net: netSalary,
    cnas: cnas,
    employerCNAS: employerCNAS,
    details: {
      gross,
      cnas,
      employerCNAS,
      taxable,
      familyDeduction,
      taxableAfterFamily,
      irgBrut,
      abatement,
      irgNet,
      netSalary,
    }
  };
}

export function calculateTotalIRG(salaries: any[]): IRGSalaryResult {
  let totalGross = new Decimal(0);
  let totalCnas = new Decimal(0);
  let totalEmployerCNAS = new Decimal(0);
  let totalIRG = new Decimal(0);
  let totalNet = new Decimal(0);
  const employees: any[] = [];

  for (const s of salaries) {
    const children = parseInt(String(s.familyChildren || 0)) || 0;
    const res = calculateSingleSalaryIRG(s.grossSalary || 0, children);
    totalGross = totalGross.add(res.details.gross);
    totalCnas = totalCnas.add(res.cnas);
    totalEmployerCNAS = totalEmployerCNAS.add(res.employerCNAS);
    totalIRG = totalIRG.add(res.irg);
    totalNet = totalNet.add(res.net);
    employees.push({
      name: s.employeeName || `Employee ${employees.length + 1}`,
      gross: res.details.gross,
      irg: res.irg,
      cnas: res.cnas,
      net: res.net,
      children,
      familyDeduction: res.details.familyDeduction,
    });
  }

  return {
    totalGross,
    totalCnas,
    totalEmployerCNAS,
    totalIRG,
    totalNet,
    employees,
  };
}
