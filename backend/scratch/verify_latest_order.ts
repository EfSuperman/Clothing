import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- Order Profit Verification ---\n');

  // 1. Get Settings
  const settings = await prisma.globalSettings.findFirst();
  console.log('Global Settings:');
  console.log(JSON.stringify(settings, null, 2));
  console.log('\n');

  // 2. Get Latest Order
  const order = await prisma.order.findFirst({
    include: {
      orderItems: {
        include: {
          product: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  if (!order) {
    console.log('No orders found.');
    return;
  }

  console.log(`Order ID: ${order.id}`);
  console.log(`Currency: ${order.currency} (${order.currencySymbol})`);
  console.log(`Exchange Rate: ${order.exchangeRate}`);
  console.log(`Total Amount (PKR): ${order.totalAmount}`);
  console.log(`Tax Amount (PKR): ${order.taxAmount}`);
  console.log(`Shipping Amount (PKR): ${order.shippingAmount}`);
  console.log(`Reported Profit (PKR): ${order.profitAmount}`);
  console.log('\n--- Item Details ---');

  let calculatedSubtotalPKR = 0;
  let calculatedCostPKR = 0;

  order.orderItems.forEach((item, index) => {
    const isCustomized = !!item.customDesignUrl;
    const pricePKR = Number(item.priceAtOrder);
    const costPKR = Number(item.costPriceAtOrder);
    
    calculatedSubtotalPKR += pricePKR * item.quantity;
    calculatedCostPKR += costPKR * item.quantity;

    console.log(`Item ${index + 1}: ${item.product.name}`);
    console.log(`  Customized: ${isCustomized}`);
    console.log(`  Quantity: ${item.quantity}`);
    console.log(`  Price (PKR): ${pricePKR}`);
    console.log(`  Cost (PKR): ${costPKR}`);
  });

  const calculatedTax = Number((calculatedSubtotalPKR * (Number(settings?.taxRate || 0) / 100)).toFixed(2));
  const calculatedProfit = Number((calculatedSubtotalPKR - calculatedCostPKR).toFixed(2));
  const calculatedTotal = Number((calculatedSubtotalPKR + calculatedTax + Number(order.shippingAmount)).toFixed(2));

  console.log('\n--- Recalculated Values (PKR) ---');
  console.log(`Target Subtotal: ${calculatedSubtotalPKR}`);
  console.log(`Target Cost: ${calculatedCostPKR}`);
  console.log(`Target Tax: ${calculatedTax}`);
  console.log(`Target Profit: ${calculatedProfit}`);
  console.log(`Target Total: ${calculatedTotal}`);

  console.log('\n--- Match Results ---');
  console.log(`Profit Match: ${calculatedProfit === Number(order.profitAmount) ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Total Match: ${calculatedTotal === Number(order.totalAmount) ? '✅ SUCCESS' : '❌ FAILED'}`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
