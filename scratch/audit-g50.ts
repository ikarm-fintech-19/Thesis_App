import { calculateTotalIRG, calculateSingleSalaryIRG } from '../src/lib/irg-salaires-engine';
import { getDeductibilityCap } from '../src/lib/deductibility-rules';
import Decimal from 'decimal.js';

async function verifyG50Scenario() {
  console.log('--- G50 CALCULATION VERIFICATION REPORT ---');
  
  // Scenario Data
  const salesHT = new Decimal(1000000);
  const purchaseHT = new Decimal(400000);
  const vehicleHT = new Decimal(2000000);
  const salaries = [
    { employeeName: 'Emp 1', grossSalary: 45000 },
    { employeeName: 'Emp 2', grossSalary: 65000 }
  ];
  const tlsRate = 0.02;

  console.log('\n1. TVA CALCULATION');
  const tvaCollectee = salesHT.mul(0.19);
  const tvaDeductibleStd = purchaseHT.mul(0.19).mul(getDeductibilityCap('standard'));
  const tvaDeductibleVehicle = vehicleHT.mul(0.19).mul(getDeductibilityCap('vehicle'));
  const totalDeductible = tvaDeductibleStd.add(tvaDeductibleVehicle);
  const netTva = tvaCollectee.sub(totalDeductible);

  console.log(`- Sales HT: ${salesHT.toFixed(2)} -> Collectée (19%): ${tvaCollectee.toFixed(2)}`);
  console.log(`- Purchase Std HT: ${purchaseHT.toFixed(2)} -> Déductible: ${tvaDeductibleStd.toFixed(2)}`);
  console.log(`- Purchase Vehicle HT: ${vehicleHT.toFixed(2)} -> Déductible (Rule: ${getDeductibilityCap('vehicle')*100}%): ${tvaDeductibleVehicle.toFixed(2)}`);
  console.log(`- NET TVA: ${netTva.toFixed(2)}`);

  console.log('\n2. IRG SALAIRES CALCULATION');
  const irgResult = calculateTotalIRG(salaries);
  salaries.forEach(s => {
    const res = calculateSingleSalaryIRG(s.grossSalary);
    console.log(`- Employee ${s.employeeName} (${s.grossSalary} DZD):`);
    console.log(`  * Taxable (after 9% CNAS): ${res.details.taxable.toFixed(2)}`);
    console.log(`  * IRG Brut: ${res.details.irgBrut.toFixed(2)}`);
    console.log(`  * Abatement (Art 104): ${res.details.abatement.toFixed(2)}`);
    console.log(`  * IRG Net: ${res.irg.toFixed(2)}`);
  });
  console.log(`- TOTAL IRG: ${irgResult.totalIRG.toFixed(2)}`);

  console.log('\n3. TLS (TAXE SUR L\'ACTIVITÉ) CALCULATION');
  const tlsAmount = salesHT.mul(tlsRate);
  console.log(`- TLS (${tlsRate * 100}% of ${salesHT.toFixed(2)}): ${tlsAmount.toFixed(2)}`);

  console.log('\n4. FINAL G50 TOTAL');
  const totalPayable = netTva.add(irgResult.totalIRG).add(tlsAmount);
  console.log(`- TOTAL PAYABLE: ${totalPayable.toFixed(2)} DZD`);

  // Assertions
  const expectedTotal = new Decimal(114000).add(10185).add(20000); 
  if (totalPayable.equals(expectedTotal)) {
    console.log('\n✅ VERIFICATION SUCCESSFUL: Calculation matches law benchmarks.');
  } else {
    console.log(`\n❌ VERIFICATION FAILED: Expected ${expectedTotal.toFixed(2)}, got ${totalPayable.toFixed(2)}`);
  }
}

verifyG50Scenario();
