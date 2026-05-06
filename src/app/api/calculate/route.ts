import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { calculateTVA } from '@/lib/tax-engine'
import { getSession } from '@/lib/auth'
import { SUBSCRIPTION_PLANS } from '@/lib/subscription'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const body = await request.json()
    const { base, category, sector, getRule } = body

    // 1. Handle Rule Request (for thesis mode)
    if (getRule) {
      const taxRules = await db.taxRule.findMany({
        where: { year: 2026, isActive: true },
        include: { brackets: true }
      })
      
      if (!taxRules || taxRules.length === 0) {
        return NextResponse.json({ success: true, rule: null })
      }

      // Flatten brackets from all rules and ensure each bracket has a category
      const allBrackets = taxRules.flatMap(rule => 
        rule.brackets.map(b => ({
          category: rule.category.toLowerCase(), // Ensure lowercase for engine
          rate: b.rate,
          minAmount: b.minAmount,
          condition: JSON.stringify({ 
            applies_to: [], 
            article: rule.description || `Art. ${rule.category === 'Normal' ? '28' : '29'} CID` 
          })
        }))
      )

      // Add a virtual exempt bracket if not present (to satisfy TC-03 and thesis requirements)
      if (!allBrackets.some(b => b.category === 'exempt')) {
        allBrackets.push({
          category: 'exempt',
          rate: "0",
          minAmount: "0",
          condition: JSON.stringify({ 
            applies_to: ['exports', 'basic_education', 'health_services'], 
            article: 'Art. 30 CID' 
          })
        })
      }

      return NextResponse.json({ 
        success: true, 
        rule: {
          taxCode: 'TVA',
          version: '2026',
          brackets: allBrackets,
          deductions: [
            {
              code: 'AUTO_EXEMPT_SERVICE',
              descriptionFr: 'Franchise de TVA - Prestataires de services (CA < 1 000 000 DZD)',
              descriptionEn: 'TVA Exemption - Service providers (Turnover < 1,000,000 DZD)',
              descriptionAr: 'إعفاء من TVA - مقدمو الخدمات (رقم أعمال < 1,000,000 د.ج)',
              calcType: 'exempt',
              value: 1000000,
              articleRef: 'Art. 30 - 1° du CID'
            },
            {
              code: 'AUTO_EXEMPT_GOODS',
              descriptionFr: 'Franchise de TVA - Commerçants (CA < 1 000 000 DZD)',
              descriptionEn: 'TVA Exemption - Merchants (Turnover < 1,000,000 DZD)',
              descriptionAr: 'إعفاء من TVA - التجار (رقم أعمال < 1,000,000 د.ج)',
              calcType: 'exempt',
              value: 1000000,
              articleRef: 'Art. 30 - 1° du CID'
            },
            {
              code: 'EXPORT_EXEMPT',
              descriptionFr: 'Exonération à l\'exportation',
              descriptionEn: 'Export exemption',
              descriptionAr: 'إعفاء التصدير',
              calcType: 'exempt',
              value: 0,
              articleRef: 'Art. 30 - 4° du CID'
            }
          ] 
        } 
      })
    }

    if (!base || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 2. Enforcement: Check subscription limits for logged in users
    if (session) {
      const sub = await db.subscription.findUnique({ where: { userId: session.id } })
      if (sub) {
        const planLimit = SUBSCRIPTION_PLANS[sub.plan].calculationLimit
        if (sub.calculationsUsed >= planLimit) {
          return NextResponse.json({ 
            error: 'Limit reached', 
            code: 'LIMIT_EXCEEDED',
            upgrade_url: '/dashboard/settings' 
          }, { status: 403 })
        }
      }
    }

    // 3. Fetch TVA rule from database (New Schema)
    const taxRule = await db.taxRule.findFirst({
      where: { 
        category: category.toLowerCase().includes('normal') ? 'Normal' : 'Reduced',
        year: 2026,
        isActive: true
      },
      include: { brackets: true }
    })

    // Map new schema to engine format
    const engineRule = taxRule ? {
      brackets: taxRule.brackets.map(b => ({
        category: taxRule.category.toLowerCase(),
        rate: b.rate,
        minAmount: b.minAmount,
        condition: { applies_to: [], article: '' } // FIX: Ensure condition object exists
      })),
      deductions: [
        {
          code: 'AUTO_EXEMPT_SERVICE',
          descriptionFr: 'Franchise de TVA - Prestataires de services (CA < 1 000 000 DZD)',
          descriptionEn: 'TVA Exemption - Service providers (Turnover < 1,000,000 DZD)',
          descriptionAr: 'إعفاء من TVA - مقدمو الخدمات (رقم أعمال < 1,000,000 د.ج)',
          calcType: 'exempt',
          value: 1000000,
          articleRef: 'Art. 30 - 1° du CID'
        },
        {
          code: 'AUTO_EXEMPT_GOODS',
          descriptionFr: 'Franchise de TVA - Commerçants (CA < 1 000 000 DZD)',
          descriptionEn: 'TVA Exemption - Merchants (Turnover < 1,000,000 DZD)',
          descriptionAr: 'إعفاء من TVA - التجار (رقم أعمال < 1,000,000 د.ج)',
          calcType: 'exempt',
          value: 1000000,
          articleRef: 'Art. 30 - 1° du CID'
        },
        {
          code: 'EXPORT_EXEMPT',
          descriptionFr: 'Exonération à l\'exportation',
          descriptionEn: 'Export exemption',
          descriptionAr: 'إعفاء التصدير',
          calcType: 'exempt',
          value: 0,
          articleRef: 'Art. 30 - 4° du CID'
        }
      ]
    } : null

    // 4. Perform Calculation
    const result = calculateTVA({
      base,
      category,
      sector: sector || 'production',
      rule: engineRule as any
    })

    // 5. Audit Trail & Usage Tracking
    if (session) {
      // Save calculation
      await db.calculation.create({
        data: {
          userId: session.id,
          mode: body.mode || 'SIMPLE',
          inputData: JSON.stringify(body),
          resultData: JSON.stringify(result),
          ipAddress: request.headers.get('x-forwarded-for') || 'local'
        }
      })

      // Increment usage
      await db.subscription.update({
        where: { userId: session.id },
        data: { calculationsUsed: { increment: 1 } }
      })

      // Track platform analytics
      const today = new Date()
      today.setHours(0,0,0,0)
      await db.platformAnalytics.upsert({
        where: { date: today },
        update: { totalCalculations: { increment: 1 } },
        create: { date: today, totalCalculations: 1 }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        base: result.base.toString(),
        rate: result.rate.toString(),
        taxAmount: result.taxAmount.toString(),
        totalTTC: result.totalTTC.toString(),
        category: result.category,
        exempt: result.exempt,
        exemptReason: result.exemptReason,
        article: result.article,
        breakdown: result.breakdown.map(step => ({
          label: step.label,
          base: step.base.toString(),
          rate: step.rate.toString(),
          amount: step.amount.toString(),
          article: step.article,
          notes: step.notes
        })),
        notes: result.notes,
        metadata: result.metadata
      }
    })
  } catch (error: any) {
    console.error('TVA Calculation API Error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    })
    
    if (error.message?.includes('DATABASE_URL') || error.code === 'P1001' || error.code === 'P1002' || error.code === 'P1003') {
      return NextResponse.json({ 
        error: 'Database connection error. Please check environment variables.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 500 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
