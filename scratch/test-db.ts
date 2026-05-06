import { PrismaClient } from '@prisma/client';

async function testConnection() {
  const prisma = new PrismaClient();
  try {
    console.log('Testing database connection...');
    const userCount = await prisma.user.count();
    console.log('Connection successful!');
    console.log('User count:', userCount);
    
    const taxRuleCount = await prisma.taxRule.count();
    console.log('Tax rules count:', taxRuleCount);
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
