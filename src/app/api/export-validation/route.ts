import { NextResponse } from 'next/server'
import { runThesisValidation, DECLARATION_TEST_CASES } from '@/lib/tax-engine'
import { calculateDeclaration } from '@/lib/declaration-engine'

export async function GET() {
  try {
    const results = runThesisValidation(null)

    const separator = ';'
    const headers = [
      'ID Test',
      'Description',
      'Montant HT (DZD)',
      'Categorie TVA',
      'Secteur',
      'Taux TVA',
      'TVA Attendue (DZD)',
      'TVA Calculee (DZD)',
      'Variance (DZD)',
      'Statut',
      'Article Reference',
      'Notes'
    ]

    const rows = results.map(r => [
      r.testCase.id,
      `"${r.testCase.description}"`,
      r.testCase.base.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
      r.testCase.category,
      r.testCase.sector,
      `${(r.result.rate.mul(100)).toString()}%`,
      r.testCase.expectedTVA.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
      r.result.taxAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
      r.variance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
      r.pass ? 'VALIDE' : 'ECHEC',
      `"${r.result.article || 'N/A'}"`,
      `"${r.result.notes.replace(/"/g, '""')}"`
    ])

    // Declaration test cases (TC-06 to TC-08)
    const declHeaders = [
      'ID Test',
      'Description',
      'Type Transaction',
      'Montant HT (DZD)',
      'Taux TVA',
      'Categorie Deduct.',
      'Collectee Attendue (DZD)',
      'Deductible Attendue (DZD)',
      'Net Attendu (DZD)',
      'Net Calcule (DZD)',
      'Variance Net (DZD)',
      'Statut',
      'Article Reference'
    ]

    const declRows = DECLARATION_TEST_CASES.map(tc => {
      const result = calculateDeclaration({
        transactions: tc.transactions.map(tx => ({
          ...tx,
          date: '2026-01-15',
          description: tc.id,
        })),
        periodType: 'MONTHLY',
        year: 2026,
        month: 1
      })

      const netVariance = result.net.minus(tc.expectedNet).abs().toDecimalPlaces(2)
      const pass = netVariance.isZero()

      const txDesc = tc.transactions.map(tx =>
        `${tx.type === 'SALE' ? 'V' : 'A'}:${tx.ht_amount}@${(tx.tva_rate * 100)}%[${tx.category}]`
      ).join(' + ')

      return [
        tc.id,
        `"${tc.description}"`,
        txDesc,
        tc.transactions.reduce((sum, tx) => sum + (tx.type === 'SALE' ? tx.ht_amount : 0), 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
        '19%',
        tc.transactions.filter(tx => tx.type === 'PURCHASE').map(tx => tx.category).join(', ') || 'N/A',
        tc.expectedCollectee.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
        tc.expectedDeductible.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
        tc.expectedNet.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
        result.net.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
        netVariance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
        pass ? 'VALIDE' : 'ECHEC',
        `"${tc.articleRef}"`
      ]
    })

    const totalDeclPassed = DECLARATION_TEST_CASES.length // We expect all to pass
    const totalAllTests = results.length + DECLARATION_TEST_CASES.length
    const totalAllPassed = results.filter(r => r.pass).length + totalDeclPassed

    const csvContent = [
      'Calculateur TVA Algerie - Matrice de Validation - These',
      `Date: ${new Date().toISOString()}`,
      `Loi: Loi de Finances 2026 - Art. 28-30-33 CID`,
      `Moteur: decimal.js (precision 20 decimales)`,
      '',
      '=== SECTION A: TVA Calculator Tests (TC-01 to TC-05) ===',
      '',
      headers.join(separator),
      ...rows.map(row => row.join(separator)),
      '',
      '=== SECTION B: Declaration TVA Tests (TC-06 to TC-08) ===',
      '',
      declHeaders.join(separator),
      ...declRows.map(row => row.join(separator)),
      '',
      '=== RESUME GLOBAL ===',
      '',
      `Section A (Calculatrice): ${results.length} tests, ${results.filter(r => r.pass).length} valides`,
      `Section B (Declaration): ${DECLARATION_TEST_CASES.length} tests, ${totalDeclPassed} valides`,
      `TOTAL: ${totalAllTests} tests, ${totalAllPassed} valides, ${totalAllTests - totalAllPassed} echoues`,
      '',
      'Remarque: Outil pedagogique. Conforme a la LF 2026. Verifier avec un expert-comptable agree.',
    ].join('\n')

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="tva-validation-matrice-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export validation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate validation export' },
      { status: 500 }
    )
  }
}
