import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactions, periodType, year, month } = body;

    let csv = 'Type,Date,Description,HT,TVA Rate,Category,Ref\n';
    transactions.forEach((t: any) => {
      csv += `${t.type},${t.date},"${t.description}",${t.ht_amount},${t.tva_rate},${t.category},${t.invoice_ref}\n`;
    });

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=declaration-${year}-${month}.csv`
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
