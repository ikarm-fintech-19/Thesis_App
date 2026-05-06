import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import crypto from 'crypto'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role !== 'ACCOUNTANT' && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const teamMembers = await db.teamMember.findMany({
      where: { accountantId: session.id },
      include: {
        client: {
          include: {
            declarations: true
          }
        }
      }
    })

    const clients = teamMembers.map(tm => ({
      id: tm.client.id,
      name: tm.client.name || tm.client.email.split('@')[0],
      email: tm.client.email,
      company: tm.client.company || '-',
      nif: tm.client.nif || '-',
      declarationsCount: tm.client.declarations.length,
      lastActivity: tm.client.updatedAt.toLocaleDateString('fr-DZ')
    }))

    return NextResponse.json({ clients })
  } catch (error) {
    console.error('Get clients error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role !== 'ACCOUNTANT' && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { email, name, company, nif } = body

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const existingUser = await db.user.findUnique({ where: { email } })
    
    let clientId: string
    
    if (existingUser) {
      clientId = existingUser.id
    } else {
      const tempPassword = crypto.randomBytes(8).toString('hex')
      const passwordHash = crypto.createHash('sha256').update(tempPassword).digest('hex')
      
      const newClient = await db.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          company: company || null,
          nif: nif || null,
          passwordHash,
          role: 'CITIZEN',
          subscription: {
            create: {
              plan: 'FREE',
              isActive: true
            }
          }
        }
      })
      clientId = newClient.id
    }

    const existingLink = await db.teamMember.findFirst({
      where: { accountantId: session.id, clientId }
    })

    if (!existingLink) {
      await db.teamMember.create({
        data: {
          accountantId: session.id,
          clientId
        }
      })
    }

    await db.auditLog.create({
      data: {
        userId: session.id,
        action: 'ADD_CLIENT',
        resource: 'team_member',
        metadata: JSON.stringify({ clientId })
      }
    })

    return NextResponse.json({ success: true, clientId })
  } catch (error) {
    console.error('Add client error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}