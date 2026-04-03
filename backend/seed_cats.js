const { Client } = require('pg');

const dbUrl = "postgresql://neondb_owner:npg_r1YyDMS6WlQi@ep-small-sky-a4fsec97-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function main() {
    const client = new Client({ connectionString: dbUrl });
    await client.connect();
    
    const categories = [
        "MEN'S WEAR", "WOMEN'S WEAR", "ACCESSORIES", "FOOTWEAR", "LIMITED EDITION", "OUTERWEAR"
    ];

    console.log('Seeding categories...');
    
    for (const name of categories) {
        // check if exists
        const res = await client.query('SELECT id FROM "Category" WHERE name = $1', [name]);
        if (res.rows.length === 0) {
            await client.query(
                'INSERT INTO "Category" (id, name) VALUES (gen_random_uuid()::text, $1)',
                [name]
            );
            console.log(`Created: ${name}`);
        } else {
            console.log(`Skipped (already exists): ${name}`);
        }
    }

    console.log('SUCCESS: Categories seeded!');
    await client.end();
}

main().catch(console.error);
