import { describe, it, expect } from 'vitest';
import { calculateIBS, IBS_RATES } from '../src/lib/ibs-engine';
import Decimal from 'decimal.js';

describe('IBS Engine', () => {
  it('should calculate IBS at 19% for production sector', () => {
    const profit = 1000000; // 1,000,000 DZD
    const result = calculateIBS(profit, 'production');
    
    expect(result.sector).toBe('production');
    expect(result.rate.toNumber()).toBe(0.19);
    expect(result.profit.toNumber()).toBe(1000000);
    expect(result.ibsAmount.toNumber()).toBe(190000); // 19% of 1M
  });

  it('should calculate IBS at 23% for BTPH/Tourism sector', () => {
    const profit = 500000; // 500,000 DZD
    const result = calculateIBS(profit, 'btph_tourism');
    
    expect(result.rate.toNumber()).toBe(0.23);
    expect(result.ibsAmount.toNumber()).toBe(115000); // 23% of 500k
  });

  it('should calculate IBS at 26% for Services/Commerce sector', () => {
    const profit = 2000000; // 2,000,000 DZD
    const result = calculateIBS(profit, 'services_commerce');
    
    expect(result.rate.toNumber()).toBe(0.26);
    expect(result.ibsAmount.toNumber()).toBe(520000); // 26% of 2M
  });

  it('should return 0 IBS when profit is zero or negative', () => {
    const resultZero = calculateIBS(0, 'production');
    expect(resultZero.ibsAmount.toNumber()).toBe(0);

    const resultNegative = calculateIBS(-50000, 'services_commerce');
    expect(resultNegative.ibsAmount.toNumber()).toBe(0);
    expect(resultNegative.profit.toNumber()).toBe(-50000);
  });
});
