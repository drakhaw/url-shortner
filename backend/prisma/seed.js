const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  const defaultEmail = process.env.ADMIN_EMAIL || process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com';

  // Check if admin user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: defaultEmail }
  });

  if (existingUser) {
    console.log(`Admin user already exists: ${existingUser.email}`);
    return;
  }

  // Create default admin user (OAuth only - no password)
  const adminUser = await prisma.user.create({
    data: {
      email: defaultEmail,
      name: 'Super Administrator',
      role: 'SUPER_ADMIN',
      isActive: true
    }
  });

  console.log(`✅ Created super admin user: ${adminUser.email}`);
  console.log(`🔐 This user must sign in with Google OAuth using this email address.`);
  console.log(`🌐 Make sure this email has access to a Google account for authentication.`);
}

main()
  .catch((e) => {
    console.error('Database seeding failed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
