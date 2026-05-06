import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
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

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.text()
    const lines = body.trim().split('\n')
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file is empty or invalid' }, { status: 400 })
    }

    const header = lines[0].toLowerCase().split(',').map(h => h.trim())
    const nameIdx = header.findIndex(h => h.includes('name') || h.includes('employé') || h.includes('employee'))
    const grossIdx = header.findIndex(h => h.includes('gross') || h.includes('salaire') || h.includes('brut'))
    const childrenIdx = header.findIndex(h => h.includes('children') || h.includes('enfants'))

    if (nameIdx === -1 || grossIdx === -1) {
      return NextResponse.json({ 
        error: 'CSV must have columns for employee name and gross salary' 
      }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1))
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))

    const results: any[] = []
    const errors: any[] = []

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim())
      
      if (cols.length < 2) {
        errors.push(`Line ${i + 1}: Invalid format`)
        continue
      }

      const employeeName = cols[nameIdx]
      const grossSalary = cols[grossIdx].replace(/[^\d.]/g, '')
      const familyChildren = childrenIdx !== -1 ? parseInt(cols[childrenIdx]) || 0 : 0

      if (!employeeName || !grossSalary || isNaN(parseFloat(grossSalary))) {
        errors.push(`Line ${i + 1}: Missing required fields`)
        continue
      }

      try {
        const calculated = calculateIRG(grossSalary, familyChildren)

        const salaryLine = await db.salaryLine.create({
          data: {
            userId: session.id,
            employeeName,
            grossSalary: grossSalary,
            netSalary: calculated.netSalary,
            irgAmount: calculated.irgAmount,
            cnasEmployee: calculated.cnasEmployee,
            cnasEmployer: calculated.cnasEmployer,
            familyChildren,
            month,
            year
          }
        })

        results.push(salaryLine)
      } catch (err) {
        errors.push(`Line ${i + 1}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        imported: results.length,
        errors,
        salaryLines: results
      }
    })
  } catch (error) {
    console.error('Salary import error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}