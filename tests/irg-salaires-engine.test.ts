import { describe, it, expect } from 'bun:test';
import { calculateSingleSalaryIRG, calculateTotalIRG } from '../src/lib/irg-salaires-engine';
import Decimal from 'decimal.js';

describe('IRG Salaires Engine (LF 2026)', () => {
  it('should be exempt for gross salary <= 30,000 DZD', () => {
    const result = calculateSingleSalaryIRG(new Decimal(30000));
    expect(result.irg.toNumber()).toBe(0);
    expect(result.net.toNumber()).toBe(27300);
    expect(result.cnas.toNumber()).toBe(2700);
  });

  it('should be exempt for salary in 30k-35k range', () => {
    const result = calculateSingleSalaryIRG(new Decimal(32000));
    expect(result.irg.toNumber()).toBe(0);
  });

  it('should calculate IRG correctly for standard salary (50,000)', () => {
    const result = calculateSingleSalaryIRG(new Decimal(50000));
    // Gross: 50,000 | CNAS: 4,500 | Taxable: 45,500
    // Brackets on taxable (45,500):
    //   20,000-40,000: 20,000 * 23% = 4,600
    //   40,000-45,500: 5,500 * 27% = 1,485
    // IRG Brut = 6,085
    // Abatement: 6,085 * 40% = 2,434 (min 1,500, max 10,000)
    // IRG Net = 6,085 - 2,434 = 3,651
    expect(result.irg.toNumber()).toBe(3651);
  });

  it('should respect maximum abatement limit (10,000 DZD)', () => {
    const result = calculateSingleSalaryIRG(new Decimal(150000));
    // Gross: 150,000 | CNAS: 13,500 | Taxable: 136,500
    // IRG Brut = 32,350
    // Abatement: 32,350 * 40% = 12,940 → capped at 10,000
    // IRG Net = 32,350 - 10,000 = 22,350
    expect(result.irg.toNumber()).toBe(22350);
  });

  it('should aggregate multiple salaries correctly', () => {
    const salaries = [
      { employeeName: 'A', grossSalary: '30000' },
      { employeeName: 'B', grossSalary: '50000' }
    ];
    const totals = calculateTotalIRG(salaries);
    // A: IRG 0, CNAS 2,700 | B: IRG 3,651, CNAS 4,500
    expect(totals.totalIRG.toNumber()).toBe(3651);
    expect(totals.totalCnas.toNumber()).toBe(7200);
    expect(totals.totalGross.toNumber()).toBe(80000);
  });
});
