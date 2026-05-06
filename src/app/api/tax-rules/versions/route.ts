import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const taxType = searchParams.get('taxType') || 'TVA'

    const where: any = { taxType }
    if (year) {
      where.year = parseInt(year)
    }

    const rules = await db.taxRule.findMany({
      where,
      include: {
        brackets: {
          orderBy: { minAmount: 'asc' }
        }
      },
      orderBy: { year: 'desc' }
    })

    const availableYears = [...new Set(rules.map(r => r.year))].sort((a, b) => b - a)

    return NextResponse.json({
      rules,
      availableYears,
      currentYear: new Date().getFullYear()
    })
  } catch (error) {
    console.error('Get tax rules error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { year, taxType, category, rate, description, brackets } = body

    if (!year || !taxType || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const existingRule = await db.taxRule.findFirst({
      where: { year, taxType, category }
    })

    let rule
    if (existingRule) {
      await db.taxBracket.deleteMany({ where: { ruleId: existingRule.id } })
      
      rule = await db.taxRule.update({
        where: { id: existingRule.id },
        data: {
          rate: String(rate),
          description,
          brackets: {
            create: brackets.map((b: any) => ({
              minAmount: String(b.minAmount),
              maxAmount: b.maxAmount ? String(b.maxAmount) : null,
              rate: String(b.rate)
            }))
          }
        }
      })
    } else {
      rule = await db.taxRule.create({
        data: {
          year,
          taxType,
          category,
          rate: String(rate),
          description,
          brackets: {
            create: brackets.map((b: any) => ({
              minAmount: String(b.minAmount),
              maxAmount: b.maxAmount ? String(b.maxAmount) : null,
              rate: String(b.rate)
            }))
          }
        }
      })
    }

    await db.auditLog.create({
      data: {
        userId: session.id,
        action: 'UPDATE_TAX_RULE',
        resource: 'tax_rule',
        metadata: JSON.stringify({ year, taxType, category })
      }
    })

    return NextResponse.json({ success: true, rule })
  } catch (error) {
    console.error('Update tax rule error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}