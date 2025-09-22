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
      name: 'Super Administrator',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      mustUpdate: false, // Super admin can use legacy login initially
      isActive: true
    }
  });

  console.log(`✅ Created super admin user:`);
  console.log(`   Email: ${adminUser.email}`);
  console.log(`   Name: ${adminUser.name}`);
  console.log(`   Role: ${adminUser.role}`);
  console.log(`   Password: ${defaultPassword}`);
  console.log(`   Must update password: ${adminUser.mustUpdate}`);
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