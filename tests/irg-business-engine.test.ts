import { describe, it, expect } from 'vitest';
import { calculateIRGBusiness } from '../src/lib/irg-business-engine';
import Decimal from 'decimal.js';

describe('IRG Business Engine', () => {
  it('should return 0 IRG for profit under or equal to 240,000 DZD (Exempt bracket)', () => {
    const result1 = calculateIRGBusiness(200000);
    expect(result1.totalIrg.toNumber()).toBe(0);
    expect(result1.breakdown.length).toBe(0);

    const result2 = calculateIRGBusiness(240000);
    expect(result2.totalIrg.toNumber()).toBe(0);
  });

  it('should calculate IRG correctly for profit within 2nd bracket (240k - 480k)', () => {
    const profit = 400000; 
    // Exempt: 0 - 240,000
    // Taxable: 400,000 - 240,000 = 160,000 * 23% = 36,800
    const result = calculateIRGBusiness(profit);
    
    expect(result.totalIrg.toNumber()).toBe(36800);
    expect(result.breakdown).toHaveLength(1);
    expect(result.breakdown[0].rate).toBe('23%');
    expect(result.breakdown[0].tax.toNumber()).toBe(36800);
  });

  it('should calculate IRG correctly for profit crossing multiple brackets', () => {
    const profit = 1500000; // 1.5M DZD
    // Bracket 1: 0 - 240k -> 0
    // Bracket 2: 240k - 480k (240k) * 23% = 55,200
    // Bracket 3: 480k - 960k (480k) * 27% = 129,600
    // Bracket 4: 960k - 1.5M (540k) * 30% = 162,000
    // Total = 55,200 + 129,600 + 162,000 = 346,800

    const result = calculateIRGBusiness(profit);
    expect(result.totalIrg.toNumber()).toBe(346800);
    expect(result.breakdown).toHaveLength(3);
    
    // Check specific breakdowns
    expect(result.breakdown[0].tax.toNumber()).toBe(55200); // 23% bracket
    expect(result.breakdown[1].tax.toNumber()).toBe(129600); // 27% bracket
    expect(result.breakdown[2].tax.toNumber()).toBe(162000); // 30% bracket
  });

  it('should calculate IRG correctly for highest bracket (over 3.84M)', () => {
    const profit = 5000000; // 5M DZD
    // B1: 240k * 0 = 0
    // B2: 240k * 0.23 = 55,200
    // B3: 480k * 0.27 = 129,600
    // B4: 960k * 0.30 = 288,000
    // B5: 1920k * 0.33 = 633,600
    // B6: (5000k - 3840k) = 1160k * 0.35 = 406,000
    // Total = 1,512,400

    const result = calculateIRGBusiness(profit);
    expect(result.totalIrg.toNumber()).toBe(1512400);
    expect(result.breakdown).toHaveLength(5);
  });
});
