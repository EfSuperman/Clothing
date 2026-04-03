const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
    datasourceUrl: "postgresql://neondb_owner:npg_r1YyDMS6WlQi@ep-small-sky-a4fsec97-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
});

async function main() {
    const email = 'admin@vision.com';
    const password = 'Admin123!';
    
    console.log('Generating hash...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    console.log('Updating database...');
    const user = await prisma.user.upsert({
        where: { email: email },
        update: {
            role: 'ADMIN',
            passwordHash: passwordHash,
            name: 'VISION Admin'
        },
        create: {
            name: 'VISION Admin',
            email: email,
            passwordHash: passwordHash,
            role: 'ADMIN',
        },
    });

    console.log('SUCCESS!');
    console.log('Email:', user.email);
    console.log('Password:', password);
}

main()
  .catch((e) => {
    console.error('ERROR:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
