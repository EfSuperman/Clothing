import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@darkluxury.com';
  const password = 'Admin123!';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'ADMIN',
      passwordHash,
    },
    create: {
      name: 'Dark Luxury Admin',
      email,
      passwordHash,
      role: 'ADMIN',
    },
  });

  console.log('--- ADMIN ACCOUNT CREATED/UPDATED ---');
  console.log('Email:', user.email);
  console.log('Password: Admin123!');
  console.log('Role:', user.role);
  console.log('------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
