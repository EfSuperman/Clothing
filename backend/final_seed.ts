import prisma from './src/lib/prisma';

async function main() {
  console.log('Seeding Neon database with app prisma client...');
  try {
    const product = await prisma.product.create({
      data: {
        name: 'Classic Dark Luxe Hoodie',
        description: 'Premium heavyweight cotton for the ultimate minimalist dark luxury look.',
        price: 129.99,
        stockQty: 100,
        imageURLs: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1974&auto=format&fit=crop'],
      },
    });
    console.log('Successfully seeded:', product.name);
  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
