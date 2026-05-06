import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactions, periodType, year, month, summary } = body;

    // Prepare data for Excel
    const data = transactions.map((t: any) => ({
      'Type': t.type === 'SALE' ? 'Vente' : 'Achat',
      'Date': t.date,
      'Description': t.description,
      'Montant HT (DZD)': Number(t.ht_amount),
      'TVA (%)': Number(t.tva_rate) * 100,
      'Montant TVA (DZD)': Number((t.ht_amount * t.tva_rate).toFixed(2)),
      'Catégorie': t.category || 'Standard',
      'Référence': t.invoice_ref || ''
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Add summary info if provided
    if (summary) {
      const summaryData = [
        [],
        ['Résumé de la Déclaration'],
        ['Période', `${periodType} ${month}/${year}`],
        ['TVA Collectée', summary.collectee],
        ['TVA Déductible', summary.deductible],
        ['Position Nette', summary.net],
        ['État', summary.position]
      ];
      XLSX.utils.sheet_add_aoa(ws, summaryData, { origin: -1 });
    }

    XLSX.utils.book_append_sheet(wb, ws, 'Déclaration TVA');

    // Generate buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=declaration-tva-${year}-${month}.xlsx`
      }
    });
  } catch (error) {
    console.error('Excel export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
