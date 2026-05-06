import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function DELETE() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await db.auditLog.create({
      data: {
        userId: session.id,
        action: 'ACCOUNT_DELETE',
        resource: 'user',
        metadata: JSON.stringify({ reason: 'user_requested' })
      }
    })

    await db.calculation.deleteMany({ where: { userId: session.id } })
    await db.salaryLine.deleteMany({ where: { userId: session.id } })
    await db.notification.deleteMany({ where: { userId: session.id } })
    await db.savedTemplate.deleteMany({ where: { userId: session.id } })
    await db.declaration.deleteMany({ where: { userId: session.id } })
    await db.subscription.deleteMany({ where: { userId: session.id } })
    await db.teamMember.deleteMany({ 
      where: { OR: [{ accountantId: session.id }, { clientId: session.id }] } 
    })
    await db.auditLog.deleteMany({ where: { userId: session.id } })
    await db.user.delete({ where: { id: session.id } })

    return NextResponse.json({ success: true, message: 'Account deleted' })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}