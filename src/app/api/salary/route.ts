import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import Decimal from 'decimal.js'

const IRG_BRACKETS = [
  { max: 120000, rate: 0 },
  { max: 360000, rate: 0.20 },
  { max: 1440000, rate: 0.30 },
  { max: 3600000, rate: 0.35 },
  { max: Infinity, rate: 0.35 }
]

const CNAS_EMPLOYEE_RATE = 0.09
const CNAS_EMPLOYER_RATE = 0.26
const FAMILY_DEDUCTION_PER_CHILD = 1000

function calculateIRG(gross: string, children: number) {
  const grossDecimal = new Decimal(gross)
  const taxable = grossDecimal.sub(FAMILY_DEDUCTION_PER_CHILD * children)
  
  if (taxable.lt(0)) {
    return {
      irgAmount: '0',
      netSalary: grossDecimal.sub(grossDecimal.mul(CNAS_EMPLOYEE_RATE)).toString(),
      cnasEmployee: grossDecimal.mul(CNAS_EMPLOYEE_RATE).toString(),
      cnasEmployer: grossDecimal.mul(CNAS_EMPLOYER_RATE).toString()
    }
  }
  
  let remaining = taxable.toNumber()
  let totalTax = 0
  let previousMax = 0
  
  for (const bracket of IRG_BRACKETS) {
    if (remaining <= 0) break
    const taxableInBracket = Math.min(remaining, bracket.max - previousMax)
    if (taxableInBracket > 0) {
      totalTax += taxableInBracket * bracket.rate
      remaining -= taxableInBracket
      previousMax = bracket.max
    }
  }
  
  const irgAmount = new Decimal(totalTax)
  const cnasEmployee = grossDecimal.mul(CNAS_EMPLOYEE_RATE)
  const netSalary = grossDecimal.sub(irgAmount).sub(cnasEmployee)
  const cnasEmployer = grossDecimal.mul(CNAS_EMPLOYER_RATE)
  
  return {
    irgAmount: irgAmount.toString(),
    netSalary: netSalary.toString(),
    cnasEmployee: cnasEmployee.toString(),
    cnasEmployer: cnasEmployer.toString()
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    const where: any = { userId: session.id }
    if (month && year) {
      where.month = parseInt(month)
      where.year = parseInt(year)
    }

    const salaryLines = await db.salaryLine.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, data: salaryLines })
  } catch (error) {
    console.error('Salary lines fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { employeeName, grossSalary, familyChildren, month, year } = body

    if (!employeeName || !grossSalary || !month || !year) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const calculated = calculateIRG(grossSalary, familyChildren || 0)

    const salaryLine = await db.salaryLine.create({
      data: {
        userId: session.id,
        employeeName,
        grossSalary: String(grossSalary),
        netSalary: calculated.netSalary,
        irgAmount: calculated.irgAmount,
        cnasEmployee: calculated.cnasEmployee,
        cnasEmployer: calculated.cnasEmployer,
        familyChildren: familyChildren || 0,
        month,
        year
      }
    })

    return NextResponse.json({ success: true, data: salaryLine })
  } catch (error) {
    console.error('Salary line create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, employeeName, grossSalary, familyChildren, month, year } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing salary line ID' }, { status: 400 })
    }

    const existing = await db.salaryLine.findFirst({
      where: { id, userId: session.id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Salary line not found' }, { status: 404 })
    }

    const newGross = grossSalary || existing.grossSalary
    const newChildren = familyChildren !== undefined ? familyChildren : existing.familyChildren
    const calculated = calculateIRG(newGross, newChildren)

    const salaryLine = await db.salaryLine.update({
      where: { id },
      data: {
        employeeName: employeeName || existing.employeeName,
        grossSalary: String(newGross),
        netSalary: calculated.netSalary,
        irgAmount: calculated.irgAmount,
        cnasEmployee: calculated.cnasEmployee,
        cnasEmployer: calculated.cnasEmployer,
        familyChildren: newChildren,
        month: month || existing.month,
        year: year || existing.year
      }
    })

    return NextResponse.json({ success: true, data: salaryLine })
  } catch (error) {
    console.error('Salary line update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing salary line ID' }, { status: 400 })
    }

    const existing = await db.salaryLine.findFirst({
      where: { id, userId: session.id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Salary line not found' }, { status: 404 })
    }

    await db.salaryLine.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Salary line delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}