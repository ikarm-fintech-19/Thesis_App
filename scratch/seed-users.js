const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seed() {
  const users = [
    {
      email: "citizen@matax.dz",
      password: "citizen_password_2026",
      name: "Ahmed Auto-Entrepreneur",
      role: "CITIZEN",
      company: "Ahmed Digital Services",
      nif: "123456789000001",
      plan: "FREE"
    },
    {
      email: "accountant@matax.dz",
      password: "accountant_password_2026",
      name: "Sabrina Fiscaliste",
      role: "ACCOUNTANT",
      company: "Elite Accounting Algeria",
      nif: "123456789000002",
      plan: "PRO"
    },
    {
      email: "auditor@matax.dz",
      password: "auditor_password_2026",
      name: "Inspecteur Omar",
      role: "AUDITOR",
      company: "Ministère des Finances",
      nif: "123456789000003",
      plan: "ENTERPRISE"
    }
  ];

  console.log("Seeding mock users to Supabase...");

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 12);
    try {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {
          role: u.role,
          name: u.name,
          passwordHash: hash
        },
        create: {
          email: u.email,
          passwordHash: hash,
          name: u.name,
          role: u.role,
          company: u.company,
          nif: u.nif,
          subscription: {
            create: {
              plan: u.plan,
              isActive: true,
              startDate: new Date(),
            }
          }
        }
      });
      console.log(`✅ User synced: ${u.email}`);
    } catch (err) {
      console.error(`❌ Error seeding ${u.email}:`, err.message);
    }
  }

  await prisma.$disconnect();
  console.log("Seeding complete!");
}

seed();
