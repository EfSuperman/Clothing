// Simulation: Verify the new calculation logic

// Scenario: Customer in UK (GBP), product priced Rs.129.99, cost Rs.100
// Exchange rate PKR -> GBP: ~0.0027 (1 PKR = 0.0027 GBP)
const rate = 0.0027; // PKR to GBP rate

// Product data (stored in PKR in DB)
const productRetailPKR = 129.99;
const productCostPKR = 100;

// Frontend sends price converted to GBP
const itemPriceSentByFrontend = productRetailPKR * rate; // = 0.35 GBP
console.log('Frontend sends price:', itemPriceSentByFrontend.toFixed(4), 'GBP');

// === OLD BUG ===
console.log('\n=== OLD BUGGY CALCULATION ===');
const oldSubtotal = itemPriceSentByFrontend; // 0.35 GBP
const oldCost = productCostPKR; // 100 PKR (WRONG - mixing currencies!)
const oldProfit = oldSubtotal - oldCost;
console.log('Subtotal:', oldSubtotal.toFixed(2), '(GBP)');
console.log('Cost:', oldCost, '(PKR)');
console.log('Profit:', oldProfit.toFixed(2), '(MIXED! WRONG!)');
console.log('Shipping: 500 PKR * 0.0027 =', (500 * rate).toFixed(2), '(GBP - also wrong for admin)');

// === NEW FIX ===
console.log('\n=== NEW FIXED CALCULATION (ALL PKR) ===');
const numericRate = rate;
const itemPricePKR = numericRate !== 0 ? itemPriceSentByFrontend / numericRate : itemPriceSentByFrontend;
const itemCostPKR = productCostPKR;

const subtotalPKR = itemPricePKR;
const totalCostPKR = itemCostPKR;
const profitPKR = subtotalPKR - totalCostPKR;
const taxPKR = subtotalPKR * (2 / 100); // 2% tax
const shippingPKR = 500; // stays in PKR
const totalPKR = subtotalPKR + taxPKR + shippingPKR;

console.log('Item price converted back to PKR:', itemPricePKR.toFixed(2));
console.log('Cost (PKR):', totalCostPKR);
console.log('Subtotal (PKR):', subtotalPKR.toFixed(2));
console.log('Tax 2% (PKR):', taxPKR.toFixed(2));
console.log('Shipping (PKR):', shippingPKR);
console.log('Total (PKR):', totalPKR.toFixed(2));
console.log('Profit (PKR):', profitPKR.toFixed(2));
console.log('\n✅ All values in PKR - admin dashboard will be consistent!');
