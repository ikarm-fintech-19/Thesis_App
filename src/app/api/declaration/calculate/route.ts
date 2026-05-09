import { NextRequest, NextResponse } from 'next/server';
import { Decimal } from '@/lib/decimal-utils';
import { calculateDeclarationTVA } from '@/lib/engines/tva';
import { calculateTotalIRG } from '@/lib/engines/irg';
import { BaseTransaction } from '@/lib/engines/types';

const toDecimal = (val: any) => {
  if (val === null || val === undefined || val === '') return new Decimal(0);
  try {
    const cleanVal = String(val).replace('%', '').replace(/,/g, '.').trim();
    if (cleanVal === '') return new Decimal(0);
    return new Decimal(cleanVal);
  } catch {
    console.warn(`Failed to parse value to Decimal: ${val}`);
    return new Decimal(0);
  }
};

const parseRate = (rate: Decimal) => {
  return rate.gt(1) ? rate.div(100) : rate;
};

export async function POST(request: NextRequest) {
  let body: any = {};
  try {
    body = await request.json();
    const { 
      transactions = [], 
      salaries = [], 
      periodType = 'MONTHLY', 
      year, 
      month, 
      previousCredit = 0, 
      tlsRate = '0.015' 
    } = body;

    if (!year || !month) {
      throw new Error('Missing period information');
    }

    const previousCreditVal = toDecimal(previousCredit);
    const tlsRateVal = toDecimal(tlsRate);

    // Prepare transactions for the TVA engine
    const tvaInput: BaseTransaction[] = (transactions || []).map((t: any) => ({
      ...t,
      ht_amount: toDecimal(t.ht_amount),
      tva_rate: parseRate(toDecimal(t.tva_rate))
    }));

    // Run Engines
    const tvaResult = calculateDeclarationTVA(tvaInput, previousCreditVal, tlsRateVal);
    
    const cleanedSalaries = (salaries || []).map((s: any) => ({
      employeeName: s.employeeName || s.name || 'Employee',
      grossSalary: toDecimal(s.grossSalary),
      familyChildren: s.familyChildren || s.children || 0
    }));
    const irgResult = calculateTotalIRG(cleanedSalaries);

    // Final Total Calculation
    const totalToPay = tvaResult.total_to_pay.add(irgResult.totalIRG);

    // Build standard response
    const result = {
      ...tvaResult,
      irg_salaires: irgResult.totalIRG.toString(),
      total_to_pay: totalToPay.toString(),
      salaries_count: (salaries || []).length,
      period: { label: `${periodType} ${month}/${year}` },
      irg_details: {
        total_gross: irgResult.totalGross.toString(),
        total_cnas: irgResult.totalCnas.toString(),
        total_employer_cnas: irgResult.totalEmployerCNAS.toString(),
        total_net_salaries: irgResult.totalNet.toString(),
        employees: irgResult.employees.map(e => ({
          ...e,
          gross: e.gross.toString(),
          irg: e.irg.toString(),
          cnas: e.cnas.toString(),
          net: e.net.toString(),
          familyDeduction: e.familyDeduction.toString()
        }))
      },
      // Keep string versions for frontend compatibility
      collectee: tvaResult.collectee.toString(),
      deductible: tvaResult.deductible.toString(),
      previous_credit: tvaResult.previous_credit.toString(),
      tls_amount: tvaResult.tls_amount.toString(),
      net: tvaResult.net.toString(),
      total_sales_ht: tvaResult.total_sales_ht.toString(),
      total_purchases_ht: tvaResult.total_purchases_ht.toString(),
      breakdown: tvaResult.breakdown.map(b => ({
        ...b,
        ht_amount: b.ht_amount.toString(),
        tva_rate: b.tva_rate.toString(),
        gross_tva: b.gross_tva.toString(),
        deductible_cap: b.deductible_cap.toString(),
        deductible_tva: b.deductible_tva.toString()
      }))
    };

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Declaration Calculation ERROR:', error);
    return NextResponse.json({ 
      error: 'Calculation failed', 
      detail: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
