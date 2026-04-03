const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const dbUrl = "postgresql://neondb_owner:npg_r1YyDMS6WlQi@ep-small-sky-a4fsec97-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function main() {
    const client = new Client({ connectionString: dbUrl });
    await client.connect();
    
    const email = 'admin@vision.com';
    const password = 'Admin123!';
    
    console.log('Generating hash...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    console.log('Updating database...');
    // We update if it exists, otherwise insert. Since we don't have all uuid setups, 
    // we'll try to find first
    const res = await client.query('SELECT id FROM "User" WHERE email = $1', [email]);
    
    if (res.rows.length > 0) {
        await client.query(
            'UPDATE "User" SET "passwordHash" = $1, role = $2, name = $3 WHERE email = $4',
            [passwordHash, 'ADMIN', 'VISION Admin', email]
        );
        console.log('User updated!');
    } else {
        await client.query(
            'INSERT INTO "User" (id, email, "passwordHash", role, name, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW(), NOW())',
            [email, passwordHash, 'ADMIN', 'VISION Admin']
        );
        console.log('User created!');
    }

    console.log('SUCCESS!');
    console.log('Email:', email);
    console.log('Password:', password);
    await client.end();
}

main().catch(console.error);
