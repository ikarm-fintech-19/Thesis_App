import { NextRequest, NextResponse } from 'next/server';
import { Decimal } from '@/lib/decimal-utils';
import { calculateTotalIRG } from '@/lib/irg-salaires-engine';
import { getDeductibilityCap } from '@/lib/deductibility-rules';

const toDecimal = (val: any) => {
  if (val === null || val === undefined || val === '') return new Decimal(0);
  try {
    return new Decimal(String(val).replace(/,/g, '.'));
  } catch {
    return new Decimal(0);
  }
};

const parseRate = (rate: Decimal) => {
  return rate.gt(1) ? rate.div(100) : rate;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      transactions = [], 
      salaries = [], 
      periodType = 'monthly', 
      year, 
      month, 
      previousCredit = 0, 
      tlsRate = '0.015' 
    } = body;

    if (!transactions || !Array.isArray(transactions)) {
      throw new Error('Invalid transactions data');
    }
    if (!salaries || !Array.isArray(salaries)) {
      throw new Error('Invalid salaries data');
    }
    if (!year || !month) {
      throw new Error('Missing period information');
    }

    const previousCreditVal = toDecimal(previousCredit);
    const tlsRateVal = toDecimal(tlsRate);

    let totalSalesHT = new Decimal(0);
    let totalPurchasesHT = new Decimal(0);
    let totalCollectee = new Decimal(0);
    let totalDeductible = new Decimal(0);

    const breakdown = (transactions || []).map((t: any, idx: number) => {
      const ht = toDecimal(t.ht_amount);
      const rate = parseRate(toDecimal(t.tva_rate));
      const grossTva = ht.mul(rate).toDecimalPlaces(2);
      
      const cap = new Decimal(String(getDeductibilityCap(t.category)));
      const deductibleTva = grossTva.mul(cap).toDecimalPlaces(2);
      const articleRef = t.type === 'SALE' ? 'Art. 28 CID' : 'Art. 33 CID';

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
        ht_amount: ht.toString(),
        tva_rate: rate.toString(),
        gross_tva: grossTva.toString(),
        deductible_cap: cap.toString(),
        deductible_tva: deductibleTva.toString(),
        articleRef
      };
    });

    const cleanedSalaries = (salaries || []).map((s: any) => ({
      employeeName: s.employeeName || s.name || 'Employee',
      grossSalary: toDecimal(s.grossSalary).toString(),
      familyChildren: s.familyChildren || s.children || 0
    }));
    const irgResult = calculateTotalIRG(cleanedSalaries);

    const netTva = totalCollectee.sub(totalDeductible).sub(previousCreditVal);
    const position = netTva.gt(0) ? 'A PAYER' : netTva.lt(0) ? 'CREDIT' : 'ZERO';
    const tlsAmount = totalSalesHT.mul(tlsRateVal).toDecimalPlaces(2);
    const tvaToPay = netTva.gt(0) ? netTva : new Decimal(0);
    const totalToPay = tvaToPay.add(tlsAmount).add(irgResult.totalIRG);

    const result = {
      collectee: totalCollectee.toString(),
      deductible: totalDeductible.toString(),
      previous_credit: previousCreditVal.toString(),
      tls_amount: tlsAmount.toString(),
      tls_rate: tlsRateVal.toString(),
      irg_salaires: irgResult.totalIRG.toString(),
      net: netTva.abs().toString(),
      net_raw: netTva.toString(),
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
        total_employer_cnas: irgResult.totalEmployerCNAS.toString(),
        total_net_salaries: irgResult.totalNet.toString(),
        employees: irgResult.employees
      }
    };

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Declaration Calculation Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      bodyKeys: Object.keys(body),
    });
    return NextResponse.json({ 
      error: 'Calculation failed', 
      detail: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
