import { calculateSingleSalaryIRG } from '../src/lib/irg-salaires-engine';
import { Decimal } from '../src/lib/decimal-utils';

console.log('=== G50 IRG Calculation Test ===\n');

// Test cases based on GN° 11
const testCases = [
  { id: 'TC-09', gross: 30000, children: 0, expectedIRG: 0, note: 'Exempt ≤30k' },
  { id: 'TC-10', gross: 35000, children: 0, expectedIRG: 126, note: 'Smoothing 30k-35k' },
  { id: 'TC-11', gross: 50000, children: 0, expectedIRG: 3565, note: '20k-40k: 23%' },
  { id: 'TC-12', gross: 80000, children: 0, expectedIRG: 10756, note: 'Full brackets' },
  { id: 'TC-13', gross: 150000, children: 0, expectedIRG: 24255, note: 'High income' },
  { id: 'TC-14', gross: 50000, children: 2, expectedIRG: 3105, note: 'With family ded' },
];

let passed = 0;
let failed = 0;

for (const tc of testCases) {
  const result = calculateSingleSalaryIRG(tc.gross, tc.children);
  const variance = new Decimal(tc.expectedIRG).minus(result.irg).abs();
  const pass = variance.lte(50); // Allow 50 DZD tolerance for smoothing
  
  console.log(`${tc.id}: Gross=${tc.gross.toLocaleString()}, Children=${tc.children}`);
  console.log(`  CNAS (9%): ${result.cnas.toFixed(2)}`);
  console.log(`  Taxable: ${result.details.taxable.toFixed(2)}`);
  console.log(`  IRG Brut: ${result.details.irgBrut.toFixed(2)}`);
  console.log(`  Abatement: ${result.details.abatement.toFixed(2)}`);
  console.log(`  IRG Net: ${result.irg.toFixed(0)} (expected: ${tc.expectedIRG})`);
  console.log(`  Net Salary: ${result.net.toFixed(2)}`);
  console.log(`  Status: ${pass ? '✅ PASS' : '❌ FAIL'} (variance: ${variance.toFixed(0)} DZD)`);
  console.log(`  Note: ${tc.note}\n`);
  
  if (pass) passed++; else failed++;
}

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);

// TVA Test
console.log('\n=== TVA Calculation Test ===');
const ht = new Decimal('1000000');
const rate = new Decimal('0.19');
const tva = ht.mul(rate).toDecimalPlaces(2);
const net = ht.add(tva).toDecimalPlaces(2);
console.log(`HT: 1,000,000 × 19% = TVA: ${tva.toString()}`);
console.log(`Total TTC: ${net.toString()}`);
console.log(tva.toString() === '190000.00' ? '✅ PASS' : '❌ FAIL');

console.log('\n=== All tests completed ===');
