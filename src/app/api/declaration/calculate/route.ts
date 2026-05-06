import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { Decimal } from '@/lib/decimal-utils';
import { calculateTotalIRG } from '@/lib/irg-salaires-engine';
import { getDeductibilityCap } from '@/lib/deductibility-rules';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();
    const { transactions = [], salaries = [], periodType, year, month, previousCredit, tlsRate } = body;

    // Safe Decimal conversion helper
    const toDecimal = (val: any) => {
      if (val === null || val === undefined || val === '') return new Decimal(0);
      try {
        return new Decimal(String(val).replace(/,/g, '.'));
      } catch (e) {
        return new Decimal(0);
      }
    };

    const previousCreditVal = toDecimal(previousCredit);
    const tlsRateVal = toDecimal(tlsRate);

    // 1. TVA Calculation Logic
    let totalSalesHT = new Decimal(0);
    let totalPurchasesHT = new Decimal(0);
    let totalCollectee = new Decimal(0);
    let totalDeductible = new Decimal(0);

    const breakdown = (transactions || []).map((t: any, idx: number) => {
      const ht = toDecimal(t.ht_amount);
      let rate = toDecimal(t.tva_rate);
      // Normalize rate (e.g., 19 -> 0.19)
      if (rate.gt(1)) {
        rate = rate.div(100);
      }
      const grossTva = ht.mul(rate);
      
      const cap = new Decimal(String(getDeductibilityCap(t.category)));
      const deductibleTva = grossTva.mul(cap);
      let articleRef = t.type === 'SALE' ? 'Art. 28 Code TVA' : 'Art. 30 Code TVA';

      if (t.type === 'SALE') {
        totalSalesHT = totalSalesHT.add(ht);
        totalCollectee = totalCollectee.add(grossTva);
      } else {
        totalPurchasesHT = totalPurchasesHT.add(ht);
        totalDeductible = totalDeductible.add(deductibleTva);
      }

      return {
        id: `tx-${idx + 1}`,
        ...t,
        gross_tva: grossTva.toString(),
        deductible_cap: cap.toString(),
        deductible_tva: deductibleTva.toString(),
        articleRef
      };
    });

    // 2. IRG Salaires Calculation
    // Ensure salaries have valid numeric grossSalary
    const cleanedSalaries = (salaries || []).map((s: any) => ({
      ...s,
      grossSalary: toDecimal(s.grossSalary).toString()
    }));
    const irgResult = calculateTotalIRG(cleanedSalaries);

    // 3. Final G50 Consolidation
    const netTva = totalCollectee.sub(totalDeductible).sub(previousCreditVal);
    const position = netTva.gt(0) ? 'A PAYER' : netTva.lt(0) ? 'CREDIT' : 'ZERO';

    // TLS Calculation (calculated on total HT sales/turnover)
    const tlsAmount = totalSalesHT.mul(tlsRateVal);

    // Total to pay (Sum of all liabilities)
    const tvaToPay = netTva.gt(0) ? netTva : new Decimal(0);
    const irgToPay = irgResult.totalIRG;
    const totalToPay = tvaToPay.add(tlsAmount).add(irgToPay);

    const result = {
      collectee: totalCollectee.toString(),
      deductible: totalDeductible.toString(),
      previous_credit: previousCreditVal.toString(),
      tls_amount: tlsAmount.toString(),
      irg_salaires: irgToPay.toString(),
      net: netTva.abs().toString(),
      total_to_pay: totalToPay.toString(),
      position,
      sales_count: (transactions || []).filter((t: any) => t.type === 'SALE').length,
      purchases_count: (transactions || []).filter((t: any) => t.type === 'PURCHASE').length,
      salaries_count: (salaries || []).length,
      total_sales_ht: totalSalesHT.toString(),
      total_purchases_ht: totalPurchasesHT.toString(),
      period: { label: `${periodType} ${month}/${year}` },
      breakdown,
      irg_details: {
        total_gross: irgResult.totalGross.toString(),
        total_cnas: irgResult.totalCnas.toString(),
        total_net_salaries: irgResult.totalNet.toString()
      }
    };

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Critical Declaration Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      detail: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
