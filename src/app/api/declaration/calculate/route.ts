import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Decimal from 'decimal.js';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();
    const { transactions, periodType, year, month, previousCredit, tlsRate } = body;

    const previousCreditVal = new Decimal(previousCredit || 0);
    const tlsRateVal = new Decimal(tlsRate || 0);

    // Calculation Logic
    let totalSalesHT = new Decimal(0);
    let totalPurchasesHT = new Decimal(0);
    let totalCollectee = new Decimal(0);
    let totalDeductible = new Decimal(0);

    const breakdown = transactions.map((t: any, idx: number) => {
      const ht = new Decimal(t.ht_amount);
      let rate = new Decimal(t.tva_rate);
      // Normalize rate (e.g., 19 -> 0.19)
      if (rate.gt(1)) {
        rate = rate.div(100);
      }
      const grossTva = ht.mul(rate);
      
      let deductibleCap = new Decimal(1);
      let deductibleTva = grossTva;
      let articleRef = 'Art. 28 LF2026';

      if (t.type === 'SALE') {
        totalSalesHT = totalSalesHT.add(ht);
        totalCollectee = totalCollectee.add(grossTva);
      } else {
        totalPurchasesHT = totalPurchasesHT.add(ht);
        // Apply Art 33 rules (simplified)
        if (t.category === 'vehicle') {
          deductibleCap = new Decimal(0.5);
          articleRef = 'Art. 33 CID (Véhicules)';
        } else if (t.category === 'hospitality') {
          deductibleCap = new Decimal(0);
          articleRef = 'Art. 33 CID (Non déductible)';
        }
        deductibleTva = grossTva.mul(deductibleCap);
        totalDeductible = totalDeductible.add(deductibleTva);
      }

      return {
        id: `tx-${idx + 1}`,
        ...t,
        gross_tva: grossTva.toString(),
        deductible_cap: deductibleCap.toString(),
        deductible_tva: deductibleTva.toString(),
        articleRef
      };
    });

    // TVA Calculation
    const netTva = totalCollectee.sub(totalDeductible).sub(previousCreditVal);
    const position = netTva.gt(0) ? 'A PAYER' : netTva.lt(0) ? 'CREDIT' : 'ZERO';

    // TLS Calculation (calculated on total HT sales/turnover)
    const tlsAmount = totalSalesHT.mul(tlsRateVal);

    // Total to pay (Sum of all liabilities, TVA credit doesn't offset TLS)
    const tvaToPay = netTva.gt(0) ? netTva : new Decimal(0);
    const totalToPay = tvaToPay.add(tlsAmount);

    const result = {
      collectee: totalCollectee.toString(),
      deductible: totalDeductible.toString(),
      previous_credit: previousCreditVal.toString(),
      tls_amount: tlsAmount.toString(),
      net: netTva.abs().toString(),
      total_to_pay: totalToPay.toString(),
      position,
      sales_count: transactions.filter((t: any) => t.type === 'SALE').length,
      purchases_count: transactions.filter((t: any) => t.type === 'PURCHASE').length,
      total_sales_ht: totalSalesHT.toString(),
      total_purchases_ht: totalPurchasesHT.toString(),
      period: { label: `${periodType} ${month}/${year}` },
      breakdown
    };

    // Attempt to save to DB in background, but don't fail the request if it fails
    if (session) {
      try {
        // Since the schema requires a periodId, we skip saving for now to prevent Internal Server Error
        // but we'll log it for future implementation of Period management.
        console.log('Draft declaration ready for user:', session.email);
        
        // This part is skipped until PeriodId logic is fully integrated with UI
        /*
        await db.declaration.create({
          data: {
            userId: session.id,
            status: 'DRAFT',
            totalCollectee: totalCollectee.toNumber(),
            totalDeductible: totalDeductible.toNumber(),
            netTva: netTva.toNumber(),
            // periodId: ... 
          }
        });
        */
      } catch (dbError) {
        console.error('Non-blocking DB error:', dbError);
      }
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Critical Declaration Error:', error);
    return NextResponse.json({ error: 'Internal server error', detail: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
