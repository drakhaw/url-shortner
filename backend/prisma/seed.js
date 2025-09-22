const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../utils/password');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com';
  const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

  // Check if admin user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: defaultEmail }
  });

  if (existingUser) {
    console.log(`ℹ️  Admin user with email ${defaultEmail} already exists`);
    return;
  }

  // Create default admin user
  const hashedPassword = await hashPassword(defaultPassword);
  
  const adminUser = await prisma.user.create({
    data: {
      email: defaultEmail,
      password: hashedPassword,
      mustUpdate: true
    }
  });

  console.log(`✅ Created default admin user:`);
  console.log(`   Email: ${adminUser.email}`);
  console.log(`   Password: ${defaultPassword}`);
  console.log(`   Must update password on first login: ${adminUser.mustUpdate}`);
  console.log('🌱 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Database seeding failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });