const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Connecting to Neon...');
    const count = await prisma.product.count();
    console.log(`Current product count: ${count}`);
    
    if (count === 0) {
      console.log('Seeding a test product with correct schema fields...');
      await prisma.product.create({
        data: {
          name: 'Dark Luxury Hoodie',
          description: 'Premium heavyweight cotton with a dark minimalist aesthetic.',
          price: 89.99,
          stockQty: 50,
          imageURLs: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1974&auto=format&fit=crop']
        }
      });
      console.log('Test product seeded successfully!');
    } else {
      const products = await prisma.product.findMany();
      console.log('Existing products:', JSON.stringify(products, null, 2));
    }
  } catch (error) {
    console.error('Error details:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
