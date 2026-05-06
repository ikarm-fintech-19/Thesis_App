const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function setup() {
  const email = "admin@matax.dz";
  const password = "admin_password_2026";
  const hash = await bcrypt.hash(password, 12);

  console.log(`Creating initial admin user in Supabase: ${email}...`);
  
  try {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hash,
        name: "Matax Admin",
        role: "ADMIN",
        company: "Matax Compliance Ltd",
        nif: "123456789012345",
        subscription: {
          create: {
            plan: "PRO",
            isActive: true,
            startDate: new Date(),
          }
        }
      }
    });
    console.log("SUCCESS: Live database provisioned with admin account.");
    console.log("--------------------------------------------------");
    console.log(`URL: https://jklisqvugxfzqlbmvlmi.supabase.co`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log("--------------------------------------------------");
  } catch (err) {
    if (err.message.includes('unique constraint')) {
      console.log("User already exists, skipping creation.");
    } else {
      console.error("ERROR:", err.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

setup();
