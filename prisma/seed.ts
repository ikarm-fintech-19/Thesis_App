import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Helper for bcrypt hashing
async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

async function main() {
  console.log('🌱 Starting seed...')

  // 1. Clean existing data
  await prisma.platformAnalytics.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.declaration.deleteMany()
  await prisma.declarationPeriod.deleteMany()
  await prisma.calculation.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.teamMember.deleteMany()
  await prisma.user.deleteMany()
  await prisma.taxBracket.deleteMany()
  await prisma.taxDeduction.deleteMany()
  await prisma.taxRule.deleteMany()

  console.log('✅ Cleaned database')

  // 2. Seed Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@matax.dz',
      name: 'Admin Matax',
      passwordHash: await hashPassword('admin123'),
      role: 'ADMIN',
      subscription: {
        create: {
          plan: 'ENTERPRISE',
          isActive: true
        }
      }
    }
  })

  const accountant = await prisma.user.create({
    data: {
      email: 'expert@compta.dz',
      name: 'Ahmed Compta',
      company: 'Cabinet Ahmed & Co',
      nif: '123456789012345',
      passwordHash: await hashPassword('expert123'),
      role: 'ACCOUNTANT',
      subscription: {
        create: {
          plan: 'PRO',
          isActive: true
        }
      }
    }
  })

  const citizen = await prisma.user.create({
    data: {
      email: 'user@matax.dz',
      name: 'Mohamed User',
      passwordHash: await hashPassword('user123'),
      role: 'CITIZEN',
      subscription: {
        create: {
          plan: 'FREE',
          isActive: true,
          calculationsUsed: 7,
          declarationsUsed: 0
        }
      }
    }
  })

  console.log('✅ Seeded users')

// 3. Seed Tax Rules 2026
  const normalRule = await prisma.taxRule.create({
    data: {
      year: 2026,
      category: 'Normal',
      rate: '0.19',
      description: 'Taux normal applicable à la majorité des opérations (Art. 28 CID)',
      brackets: {
        create: [
          { minAmount: '0', rate: '0.19' }
        ]
      }
    }
  })

  const reducedRule = await prisma.taxRule.create({
    data: {
      year: 2026,
      category: 'Reduced',
      rate: '0.09',
      description: 'Taux réduit applicable aux produits de large consommation (Art. 29 CID)',
      brackets: {
        create: [
          { minAmount: '0', rate: '0.09' }
        ]
      }
    }
  })

  await prisma.taxDeduction.createMany({
    data: [
      {
        category: 'Vehicle',
        articleRef: 'Art. 33 CID',
        description: 'Plafonnement de la déductibilité pour les véhicules de tourisme (80% / 50%)',
        limitPct: '0.50'
      },
      {
        category: 'Phone',
        articleRef: 'Art. 33 CID',
        description: 'Plafonnement des frais de téléphoné',
        limitPct: '0.80'
      }
]
  })

  console.log('✅ Seeded tax rules')

  // 4. Seed Platform Analytics (Last 30 days)
  const now = new Date()
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    await prisma.platformAnalytics.create({
      data: {
        date,
        totalCalculations: Math.floor(Math.random() * 50) + 10,
        totalUsers: 100 + (30 - i) * 2,
        activeUsers: Math.floor(Math.random() * 30) + 5,
        mrr: String(15000 + (30 - i) * 500)
      }
    })
  }

  console.log('✅ Seeded analytics')
  console.log('🌱 Seed complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
