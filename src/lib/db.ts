import { PrismaClient } from '@prisma/client'

if (!process.env.DATABASE_URL) {
  console.error('CRITICAL: DATABASE_URL is not defined in environment variables. Check your .env file or deployment settings.');
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db