import prisma from '../src/lib/prisma';

async function main() {
  // Fetch all orders with items
  const orders = await prisma.order.findMany({
    include: {
      orderItems: { include: { product: { select: { name: true, price: true, costPrice: true } } } },
      user: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  // Fetch global settings
  const settings = await (prisma as any).globalSettings.findFirst();
  console.log('\n=== GLOBAL SETTINGS ===');
  console.log('Tax Rate:', settings ? Number(settings.taxRate) : 'NOT SET');
  console.log('Delivery Fee (base PKR):', settings ? Number(settings.deliveryFee) : 'NOT SET');

  console.log(`\n=== LAST ${orders.length} ORDERS ===\n`);

  for (const order of orders) {
    console.log(`--- Order #${order.id.slice(-6)} (${order.user?.name || 'Guest'}) ---`);
    console.log(`  Currency: ${order.currency} (${order.currencySymbol})`);
    console.log(`  Payment: ${order.paymentMethod} | Status: ${order.paymentStatus}`);
    console.log(`  Stored Values:`);
    console.log(`    totalAmount:    ${order.currencySymbol}${Number(order.totalAmount)}`);
    console.log(`    taxAmount:      ${order.currencySymbol}${Number(order.taxAmount)}`);
    console.log(`    shippingAmount: ${order.currencySymbol}${Number(order.shippingAmount)}`);
    console.log(`    profitAmount:   ${order.currencySymbol}${Number(order.profitAmount)}`);
    
    // Recalculate what it SHOULD be
    let recalcSubtotal = 0;
    let recalcCost = 0;
    console.log(`  Items:`);
    for (const item of order.orderItems) {
      const price = Number(item.priceAtOrder);
      const cost = Number(item.costPriceAtOrder);
      const qty = item.quantity;
      console.log(`    - ${item.product?.name || 'Unknown'}: price=${price} x qty=${qty} = ${price * qty} | costAtOrder=${cost} x ${qty} = ${cost * qty} | DB costPrice=${Number(item.product?.costPrice || 0)}`);
      recalcSubtotal += price * qty;
      recalcCost += cost * qty;
    }
    
    const expectedProfit = recalcSubtotal - recalcCost;
    console.log(`  Recalculation:`);
    console.log(`    Subtotal (sum of items): ${recalcSubtotal}`);
    console.log(`    Total Cost:              ${recalcCost}`);
    console.log(`    Expected Profit:         ${expectedProfit}`);
    console.log(`    Stored Profit:           ${Number(order.profitAmount)}`);
    console.log(`    MATCH: ${Number(order.profitAmount) === expectedProfit ? '✅' : '❌ MISMATCH!'}`);
    console.log('');
  }
}

main().finally(() => prisma.$disconnect());
