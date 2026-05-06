import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.id },
      include: {
        subscription: true,
        calculations: true,
        declarations: {
          include: {
            transactions: true
          }
        },
        salaryLines: true,
        auditLogs: {
          orderBy: { timestamp: 'desc' },
          take: 100
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        company: user.company,
        nif: user.nif,
        role: user.role,
        createdAt: user.createdAt
      },
      subscription: user.subscription,
      calculations: user.calculations.map(c => ({
        id: c.id,
        mode: c.mode,
        inputData: JSON.parse(c.inputData || '{}'),
        resultData: JSON.parse(c.resultData || '{}'),
        createdAt: c.createdAt
      })),
      declarations: user.declarations.map(d => ({
        id: d.id,
        periodId: d.periodId,
        status: d.status,
        totalCollectee: d.totalCollectee,
        totalDeductible: d.totalDeductible,
        netTva: d.netTva,
        referenceNum: d.referenceNum,
        createdAt: d.createdAt,
        transactions: d.transactions.map(t => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          tvaRate: t.tvaRate,
          tvaAmount: t.tvaAmount,
          category: t.category,
          isDeductible: t.isDeductible,
          deductibleAmount: t.deductibleAmount
        }))
      })),
      salaryLines: user.salaryLines.map(s => ({
        id: s.id,
        employeeName: s.employeeName,
        grossSalary: s.grossSalary,
        netSalary: s.netSalary,
        irgAmount: s.irgAmount,
        cnasEmployee: s.cnasEmployee,
        cnasEmployer: s.cnasEmployer,
        familyChildren: s.familyChildren,
        month: s.month,
        year: s.year,
        createdAt: s.createdAt
      })),
      auditLog: user.auditLogs.map(l => ({
        id: l.id,
        action: l.action,
        resource: l.resource,
        timestamp: l.timestamp
      }))
    }

    return NextResponse.json(exportData)
  } catch (error) {
    console.error('Export data error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}