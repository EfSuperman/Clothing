import prisma from '../src/lib/prisma';

async function main() {
  // Test 1: Can we read costPrice?
  const p = await prisma.product.findUnique({
    where: { id: 'dd112c46-20ae-405f-87ec-0f80f33e411b' },
    select: { id: true, name: true, costPrice: true }
  });
  console.log('READ costPrice:', p);

  // Test 2: Can we update costPrice?
  try {
    const updated = await prisma.product.update({
      where: { id: 'dd112c46-20ae-405f-87ec-0f80f33e411b' },
      data: { costPrice: 50 }
    });
    console.log('UPDATE costPrice SUCCESS:', updated.costPrice);
  } catch (e: any) {
    console.error('UPDATE costPrice FAILED:', e.message);
  }
}

main().finally(() => prisma.$disconnect());
