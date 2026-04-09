import prisma from '../src/lib/prisma';

async function main() {
  const p = await prisma.product.findUnique({
    where: { id: 'dd112c46-20ae-405f-87ec-0f80f33e411b' }
  });
  console.log('Product Found:', JSON.stringify(p, null, 2));
  
  const cats = await prisma.category.findMany();
  console.log('Categories Available:', cats.length);
  cats.forEach(c => console.log(`- ${c.name} (${c.id})`));
}

main().finally(() => prisma.$disconnect());
