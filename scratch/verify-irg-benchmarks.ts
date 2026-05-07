import { calculateSingleSalaryIRG } from '../src/lib/irg-salaires-engine';
import Decimal from 'decimal.js';

function verifyIRGBenchmarks() {
  const benchmarks = [
    { gross: 25000, expectedIRG: 0, desc: 'Exempt (< 30k Taxable)' },
    { gross: 30000, expectedIRG: 0, desc: 'Exempt (27.3k Taxable)' },
    { gross: 33000, expectedIRG: 2, desc: 'Smoothing (30,030 Taxable) - Should be near 0' },
    { gross: 35000, expectedIRG: 126, desc: 'Smoothing (31,850 Taxable) - OFFICIAL BENCHMARK' },
    { gross: 50000, expectedIRG: 3651, desc: 'Standard (Official Table 2024)' },
    { gross: 80000, expectedIRG: 10956, desc: 'Standard (Official Table 2024)' },
    { gross: 100000, expectedIRG: 16200, desc: 'High range (Official Table 2024)' }
  ];

  console.log('--- FINAL IRG SALAIRES COMPLIANCE REPORT ---\n');
  
  benchmarks.forEach(b => {
    const res = calculateSingleSalaryIRG(b.gross);
    const actual = res.irg.toNumber();
    const diff = Math.abs(actual - b.expectedIRG);
    const status = diff <= 5 ? '✅ PASS' : '❌ FAIL';
    
    console.log(`[${status}] Gross: ${b.gross} DZD | Expected: ${b.expectedIRG} | Actual: ${actual} | ${b.desc}`);
  });
}

verifyIRGBenchmarks();
