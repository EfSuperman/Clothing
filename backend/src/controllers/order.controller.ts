import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { deleteCloudinaryImage } from '../utils/cloudinary';
import { sendOrderConfirmationEmail, sendPaymentStatusEmail, sendAdminOrderNotificationEmail } from '../utils/email';

const MAX_ORDERS = 50; // Keep only the most recent 50 orders

// Auto-cleanup: delete oldest orders beyond the limit
async function cleanupOldOrders(): Promise<void> {
  try {
    const totalOrders = await prisma.order.count();
    
    if (totalOrders > MAX_ORDERS) {
      const ordersToDelete = totalOrders - MAX_ORDERS;

      // Find the oldest orders
      const oldOrders = await prisma.order.findMany({
        orderBy: { createdAt: 'asc' },
        take: ordersToDelete,
        select: { id: true, paymentScreenshot: true },
      });

      for (const order of oldOrders) {
        // Delete Cloudinary image if exists
        if (order.paymentScreenshot) {
          await deleteCloudinaryImage(order.paymentScreenshot);
        }

        // Delete order items first (foreign key)
        await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
        
        // Delete the order
        await prisma.order.delete({ where: { id: order.id } });
      }

      console.log(`🧹 Auto-cleanup: Deleted ${ordersToDelete} old order(s)`);
    }
  } catch (error) {
    console.error('Auto-cleanup error:', error);
  }
}

// Create a new order
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    let { 
      items, 
      paymentMethod, 
      shippingAddress, 
      addressId, 
      saveAddress,
      // Structured address fields for new addresses
      name,
      line1,
      city,
      state,
      zip,
      country,
      phone,
      currency,
      currencySymbol 
    } = req.body;
    
    // Parse items if they are sent as a JSON string (typical for multipart/form-data)
    if (typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch (e) {
        res.status(400).json({ message: 'Invalid items format' });
        return;
      }
    }
    
    const { rate = 1 } = req.body; // Conversion rate from PKR to customer currency
    const numericRate = Number(rate) || 1;
    
    // Fetch global settings (values stored in PKR)
    const settings = await (prisma as any).globalSettings.findFirst();
    const taxRate = settings ? Number(settings.taxRate) : 0;  // percentage
    const deliveryFeeBasePKR = settings ? Number(settings.deliveryFee) : 0;  // in PKR
    
    // Calculate subtotal and profit - ALL in PKR
    let subtotalPKR = 0;
    let totalCostPKR = 0;
    
    // Fetch products to get current cost price (stored in PKR)
    const productIds = items.map((item: any) => item.productId);
    const productsInDb = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, costPrice: true, price: true }
    });

    const costPriceMap: Record<string, number> = {};
    const retailPriceMap: Record<string, number> = {};
    productsInDb.forEach(p => {
      costPriceMap[p.id] = Number(p.costPrice);
      retailPriceMap[p.id] = Number(p.price);
    });

    const orderItemsData = items.map((item: any) => {
      // item.price comes from frontend in CUSTOMER's currency
      // Convert back to PKR for storage: divide by rate
      const itemPricePKR = numericRate !== 0 ? Number(item.price) / numericRate : Number(item.price);
      
      // Fix: If it has customDesignUrl, use the global customCostPrice from settings
      // Otherwise use the product's individual costPrice
      const isCustomized = !!item.customDesignUrl;
      const globalCustomCost = settings ? Number((settings as any).customizedShirtCostPrice || 0) : 0;
      
      const itemCostPKR = isCustomized ? globalCustomCost : (costPriceMap[item.productId] || 0);
      const quantity = Number(item.quantity);
      
      subtotalPKR += itemPricePKR * quantity;
      totalCostPKR += itemCostPKR * quantity;

      return {
        productId: item.productId,
        quantity: quantity,
        priceAtOrder: Number(itemPricePKR.toFixed(2)),  // Store in PKR
        costPriceAtOrder: itemCostPKR,                  // Already in PKR
        customDesignUrl: item.customDesignUrl || null,
      };
    });

    // All financial calculations in PKR
    const taxAmountPKR = Number((subtotalPKR * (taxRate / 100)).toFixed(2));
    const shippingAmountPKR = deliveryFeeBasePKR;  // Already in PKR, no conversion needed
    const totalAmountPKR = Number((subtotalPKR + taxAmountPKR + shippingAmountPKR).toFixed(2));
    const profitAmountPKR = Number((subtotalPKR - totalCostPKR).toFixed(2));

    let paymentScreenshot = null;
    let paymentStatus: 'PENDING' | 'VERIFICATION_PENDING' = 'PENDING';

    // Handle bank transfer screenshot
    if (paymentMethod === 'BANK_TRANSFER' && req.file) {
      paymentScreenshot = (req.file as any).path;
      paymentStatus = 'VERIFICATION_PENDING';
    } else if (paymentMethod === 'BANK_TRANSFER' && !req.file) {
      res.status(400).json({ message: 'Payment screenshot is required for Bank Transfer' });
      return;
    }

    // Handle Address
    let finalAddressId = addressId;

    if (!finalAddressId && (shippingAddress || line1)) {
      // Create new Address with structured fields
      const newAddress = await prisma.address.create({
        data: {
          userId: saveAddress === 'true' || saveAddress === true ? userId : null,
          name: name || 'Order Address',
          line1: line1 || shippingAddress || 'Unknown Street',
          city: city || 'Unknown City',
          state: state || 'Unknown State',
          zip: zip || '00000',
          country: country || 'Pakistan',
          phone: phone || null,
        }
      });
      finalAddressId = newAddress.id;
    }

    if (!finalAddressId) {
      res.status(400).json({ message: 'Shipping address is required' });
      return;
    }

    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount: totalAmountPKR,
        taxAmount: taxAmountPKR,
        shippingAmount: shippingAmountPKR,
        profitAmount: profitAmountPKR,
        currency: (currency as string) || 'PKR',
        currencySymbol: (currencySymbol as string) || 'Rs.',
        exchangeRate: numericRate,   // Store the rate used at checkout
        paymentMethod,
        paymentStatus,
        paymentScreenshot,
        shippingAddressId: finalAddressId,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: { include: { product: true } },
      },
    });

    // Fetch user email for confirmation
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
    
    // Send emails (non-blocking)
    if (user?.email) {
      // 1. Customer Email: Native Currency (Amounts * Rate)
      const customerEmailItems = items.map((item: any) => ({
        name: item.name || 'Product Acquisition',
        quantity: item.quantity,
        price: Number(item.price) // Already in customer currency from frontend
      }));

      sendOrderConfirmationEmail(
        user.email,
        user.name || 'Customer',
        order.id,
        Number((totalAmountPKR * numericRate).toFixed(2)),
        customerEmailItems,
        paymentMethod,
        Number((taxAmountPKR * numericRate).toFixed(2)),
        Number((shippingAmountPKR * numericRate).toFixed(2)),
        (currencySymbol as string) || 'Rs.'
      ).catch(err => console.error('Customer Email failed:', err));

      // 2. Admin Email: Always PKR Notifications
      const adminEmailItems = items.map((item: any) => ({
        name: item.name || 'Product',
        quantity: item.quantity,
        price: numericRate !== 0 ? Number(item.price) / numericRate : Number(item.price) // Convert back to PKR
      }));

      sendAdminOrderNotificationEmail(
        order.id,
        totalAmountPKR,
        user.name || 'Customer',
        user.email,
        paymentMethod,
        adminEmailItems,
        taxAmountPKR,
        shippingAmountPKR,
        'Rs.'
      ).catch(err => console.error('Admin Email Notification failed:', err));
    }

    // Run auto-cleanup in background (non-blocking)
    cleanupOldOrders().catch(err => console.error('Cleanup failed:', err));

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order', error: (error as Error).message });
  }
};

// Get User's Orders
export const getUserOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: { orderItems: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: (error as Error).message });
  }
};

// Admin: Get All Orders
export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        shippingAddress: true,
        orderItems: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all orders', error: (error as Error).message });
  }
};

// Admin: Verify Payment Status
export const updatePaymentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body; // e.g., 'VERIFIED', 'FAILED', 'APPROVED'

    // Check current status to prevent multiple email triggers
    const currentOrder = await prisma.order.findUnique({
      where: { id: id as string },
      select: { paymentStatus: true }
    });

    if (currentOrder?.paymentStatus === paymentStatus) {
      res.status(200).json({ message: 'Status already updated' });
      return;
    }

    const order = await prisma.order.update({
      where: { id: id as string },
      data: { paymentStatus },
      include: {
        user: { select: { email: true, name: true } },
      },
    });

    // Send payment status email to customer (non-blocking)
    if (order.user?.email && (paymentStatus === 'VERIFIED' || paymentStatus === 'FAILED' || paymentStatus === 'APPROVED')) {
      const rate = Number(order.exchangeRate || 1.0);
      
      sendPaymentStatusEmail(
        order.user.email,
        order.user.name || 'Customer',
        order.id,
        paymentStatus,
        Number((Number(order.totalAmount) * rate).toFixed(2)),
        Number((Number(order.taxAmount || 0) * rate).toFixed(2)),
        Number((Number(order.shippingAmount || 0) * rate).toFixed(2)),
        (order as any).currencySymbol || 'Rs.'
      ).catch(err => console.error('Email send failed:', err));
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Error updating payment status', error: (error as Error).message });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: id as string },
    });

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    await prisma.order.delete({
      where: { id: id as string },
    });

    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Error deleting order', error: (error as Error).message });
  }
};
