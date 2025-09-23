const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../utils/password');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com';
  const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

  // Check if admin user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: defaultEmail }
  });

  if (existingUser) {
    return;
  }

  // Create default admin user
  const hashedPassword = await hashPassword(defaultPassword);
  
  const adminUser = await prisma.user.create({
    data: {
      email: defaultEmail,
      name: 'Super Administrator',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      mustUpdate: false, // Super admin can use legacy login initially
      isActive: true
    }
  });

  console.log(`Created super admin user: ${adminUser.email}`);
}

main()
  .catch((e) => {
    console.error('Database seeding failed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
