
import { Decimal } from '../src/lib/decimal-utils';
import { calculateTotalIRG } from '../src/lib/irg-salaires-engine';

async function test() {
  const body = {
    transactions: [
      { type: 'sale', ht_amount: '100000', tva_rate: '0.19' },
      { type: 'purchase', ht_amount: '50000', tva_rate: '0.19', category: 'goods' }
    ],
    salaries: [
      { employeeName: 'Test', grossSalary: '50000', familyChildren: 0 }
    ],
    period: { year: 2026, month: 5 },
    previousCredit: '0',
    tlsRate: '0.015'
  };

  try {
    console.log('Testing Calculation logic...');
    
    const transactions = body.transactions;
    const salaries = body.salaries;
    const tlsRate = body.tlsRate || '0.015';
    
    let totalSalesHT = new Decimal(0);
    let totalSalesTVA = new Decimal(0);
    let totalPurchasesHT = new Decimal(0);
    let totalPurchasesTVA = new Decimal(0);
    let totalDeductibleTVA = new Decimal(0);

    for (const t of transactions) {
      const ht = new Decimal(t.ht_amount);
      const rate = new Decimal(t.tva_rate);
      const tva = ht.mul(rate);

      if (t.type === 'sale') {
        totalSalesHT = totalSalesHT.add(ht);
        totalSalesTVA = totalSalesTVA.add(tva);
      } else {
        totalPurchasesHT = totalPurchasesHT.add(ht);
        totalPurchasesTVA = totalPurchasesTVA.add(tva);
        totalDeductibleTVA = totalDeductibleTVA.add(tva);
      }
    }

    const irgResult = calculateTotalIRG(salaries.map((s: any) => ({
      employeeName: s.employeeName,
      grossSalary: s.grossSalary,
      familyChildren: s.familyChildren
    })));

    const tlsAmount = totalSalesHT.mul(new Decimal(tlsRate)).toDecimalPlaces(2);
    const tvaToPay = Decimal.max(totalSalesTVA.sub(totalDeductibleTVA), new Decimal(0));
    const totalToPay = tvaToPay.add(tlsAmount).add(irgResult.totalIRG);

    console.log('Result:', {
      tvaToPay: tvaToPay.toString(),
      tlsAmount: tlsAmount.toString(),
      totalIRG: irgResult.totalIRG.toString(),
      totalToPay: totalToPay.toString()
    });
    
    console.log('SUCCESS');
  } catch (err) {
    console.error('FAILED:', err);
  }
}

test();
