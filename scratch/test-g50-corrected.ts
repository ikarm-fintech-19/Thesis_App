import { calculateSingleSalaryIRG } from '../src/lib/irg-salaires-engine';

console.log('=== G50 IRG Corrected Test ===\n');

const testCases = [
  { id: 'TC-09', gross: 30000, children: 0, note: 'Exempt ≤30k taxable' },
  { id: 'TC-10', gross: 35000, children: 0, note: 'Smoothing 30k-35k taxable' },
  { id: 'TC-11', gross: 50000, children: 0, note: '2 brackets' },
  { id: 'TC-12', gross: 80000, children: 0, note: '3 brackets' },
  { id: 'TC-13', gross: 150000, children: 0, note: '4 brackets' },
  { id: 'TC-14', gross: 200000, children: 0, note: '5 brackets' },
  { id: 'TC-15', gross: 350000, children: 0, note: '6 brackets' },
  { id: 'TC-16', gross: 50000, children: 3, note: 'With family ded (3 children)' },
];

for (const tc of testCases) {
  const result = calculateSingleSalaryIRG(tc.gross, tc.children);
  
  console.log(`${tc.id}: Gross=${tc.gross.toLocaleString()}, Children=${tc.children}`);
  console.log(`  → CNAS 9%: ${result.cnas.toFixed(2)}`);
  console.log(`  → Taxable: ${result.details.taxable.toFixed(2)}`);
  if (tc.children > 0) {
    console.log(`  → Family deduction: -${result.details.familyDeduction.toString()}`);
    console.log(`  → Taxable after family: ${result.details.taxableAfterFamily.toFixed(2)}`);
  }
  console.log(`  → IRG Brut: ${result.details.irgBrut.toFixed(2)}`);
  console.log(`  → Abatement (40%): ${result.details.abatement.toFixed(2)}`);
  console.log(`  → IRG Net: ${result.irg.toFixed(0)} DZD`);
  console.log(`  → Net Salary: ${result.net.toFixed(2)} DZD`);
  console.log(`  [${tc.note}]`);
  console.log('');
}

// Verify TVA
console.log('=== TVA Verification ===');
const tva = 1000000 * 0.19;
console.log(`1,000,000 × 19% = ${tva.toLocaleString()} DZD ✅`);
