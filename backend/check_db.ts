import prisma from './src/lib/prisma';

async function main() {
  const count = await prisma.product.count();
  console.log(`Product count in Neon: ${count}`);
  if (count === 0) {
    await prisma.product.create({
      data: {
        name: 'Dark Luxury Hoodie',
        description: 'Premium heavy weight organic cotton hoodie with minimalist design.',
        price: 89.99,
        category: 'Hoodies',
        stock: 50,
        imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1974&auto=format&fit=crop'
      }
    });
    console.log('Seeded 1 test product.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
