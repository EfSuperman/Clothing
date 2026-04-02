import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables correctly
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const prisma = new PrismaClient();

async function main() {
  console.log('--- RESETTING ADMIN ACCOUNT ---');
  const email = 'admin@darkluxury.com';
  const password = 'Admin123!';
  
  // Hashing logic matching the auth controller
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'ADMIN',
      passwordHash: passwordHash,
      name: 'Dark Luxury Admin'
    },
    create: {
      name: 'Dark Luxury Admin',
      email,
      passwordHash: passwordHash,
      role: 'ADMIN',
    },
  });

  console.log('SUCCESS: Admin account reset.');
  console.log('Email:', user.email);
  console.log('Password: Admin123!');
  console.log('Role:', user.role);
  console.log('-------------------------------');
}

main()
  .catch((e) => {
    console.error('ERROR:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
