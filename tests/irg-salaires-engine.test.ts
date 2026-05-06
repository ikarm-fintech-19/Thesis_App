import { describe, it, expect } from 'bun:test';
import { calculateSingleSalaryIRG, calculateTotalIRG } from '../src/lib/irg-salaires-engine';
import Decimal from 'decimal.js';

describe('IRG Salaires Engine (LF 2026)', () => {
  it('should be exempt for gross salary <= 30,000 DZD', () => {
    const result = calculateSingleSalaryIRG(new Decimal(30000));
    // Gross: 30,000
    // CNAS: 30,000 * 0.09 = 2,700
    // Taxable: 27,300
    // IRG: 0 (Exempt)
    expect(result.irg.toNumber()).toBe(0);
    expect(result.net.toNumber()).toBe(27300);
    expect(result.cnas.toNumber()).toBe(2700);
  });

  it('should apply special abatement for salary in 30k-35k range (e.g. 32,000)', () => {
    const result = calculateSingleSalaryIRG(new Decimal(32000));
    // Gross: 32,000
    // CNAS: 32,000 * 0.09 = 2,880
    // Taxable: 29,120
    // 1st Bracket (0-30k): 0
    // 2nd Bracket (30k-120k): (29,120 is < 30k?? Wait...)
    // Actually, if taxable is < 30,000, IRG raw is 0.
    // Special Abatement: (IRG * 8/3) * (35k - Taxable)/5000
    // If IRG is 0, abatement is 0.
    expect(result.irg.toNumber()).toBe(0);
  });

  it('should calculate IRG correctly for standard salary (e.g. 50,000)', () => {
    const result = calculateSingleSalaryIRG(new Decimal(50000));
    // Gross: 50,000
    // CNAS (9%): 4,500
    // Taxable: 45,500
    
    // Brackets:
    // 0 - 30,000: 0% = 0
    // 30,000 - 120,000: (45,500 - 30,000) = 15,500 * 23% = 3,565
    
    // Abatement (40%): 3,565 * 0.4 = 1,426
    // Min abatement: 1,500
    // IRG after abatement: 3,565 - 1,500 = 2,065
    
    expect(result.irg.toNumber()).toBe(2065);
    expect(result.net.toNumber()).toBe(43435); // 50,000 - 4,500 - 2,065
  });

  it('should respect maximum abatement limit (2,500 DZD)', () => {
    const result = calculateSingleSalaryIRG(new Decimal(150000));
    // Gross: 150,000
    // CNAS (9%): 13,500
    // Taxable: 136,500
    
    // Brackets:
    // 0 - 30,000: 0
    // 30,000 - 120,000: 90,000 * 23% = 20,700
    // 120,000 - 136,500: 16,500 * 27% = 4,455
    // Total raw IRG: 25,155
    
    // Abatement (40%): 25,155 * 0.4 = 10,062 -> Cap at 2,500
    // IRG: 25,155 - 2,500 = 22,655
    
    expect(result.irg.toNumber()).toBe(22655);
  });

  it('should aggregate multiple salaries correctly', () => {
    const salaries = [
      { employeeName: 'A', grossSalary: '30000' },
      { employeeName: 'B', grossSalary: '50000' }
    ];
    
    const totals = calculateTotalIRG(salaries);
    
    // A: IRG 0, CNAS 2,700, Net 27,300
    // B: IRG 2,065, CNAS 4,500, Net 43,435
    // Totals: IRG 2,065, CNAS 7,200, Net 70,735, Gross 80,000
    
    expect(totals.totalIRG.toNumber()).toBe(2065);
    expect(totals.totalCnas.toNumber()).toBe(7200);
    expect(totals.totalGross.toNumber()).toBe(80000);
    expect(totals.totalNet.toNumber()).toBe(70735);
  });
});
