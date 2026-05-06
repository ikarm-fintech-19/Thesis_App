import { describe, it, expect } from 'bun:test';
import { calculateTVA, THESIS_TEST_CASES, DECLARATION_TEST_CASES } from '../src/lib/tax-engine';
import { calculateDeclaration } from '../src/lib/declaration-engine';
import { Decimal } from '../src/lib/decimal-utils';

describe('TVA Calculation', () => {
  THESIS_TEST_CASES.forEach(tc => {
    it(`${tc.id}: ${tc.description}`, () => {
      const result = calculateTVA({
        base: tc.base,
        category: tc.category,
        sector: tc.sector
      });
      const variance = new Decimal(tc.expectedTVA).minus(result.taxAmount).abs();
      expect(variance.isZero()).toBe(true);
    });
  });
});

describe('Declaration Workflow (TC-06 to TC-08)', () => {
  DECLARATION_TEST_CASES.forEach(tc => {
    it(`${tc.id}: ${tc.description}`, () => {
      const result = calculateDeclaration({
        transactions: tc.transactions.map(t => ({
          type: t.type,
          ht_amount: t.ht_amount,
          tva_rate: t.tva_rate,
          category: t.category,
          date: '2025-06-15'
        })),
        periodType: 'MONTHLY',
        year: 2025,
        month: 6
      });

      const collecteeMatch = new Decimal(tc.expectedCollectee).equals(result.collectee);
      const deductibleMatch = new Decimal(tc.expectedDeductible).equals(result.deductible);
      const netMatch = new Decimal(tc.expectedNet).equals(result.net);
      
      expect(collecteeMatch).toBe(true);
      expect(deductibleMatch).toBe(true);
      expect(netMatch).toBe(true);
      expect(result.position).toBe(tc.expectedPosition);
    });
  });
});
