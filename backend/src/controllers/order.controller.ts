import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { deleteCloudinaryImage } from '../utils/cloudinary';
import { sendOrderConfirmationEmail, sendPaymentStatusEmail } from '../utils/email';

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
      country 
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
    
    // Calculate total
    let totalAmount = 0;
    const orderItemsData = items.map((item: any) => {
      totalAmount += item.price * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        priceAtOrder: item.price,
      };
    });

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
        totalAmount,
        paymentMethod,
        paymentStatus,
        paymentScreenshot,
        shippingAddressId: finalAddressId,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: true,
      },
    });

    // Fetch user email for confirmation
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
    
    // Send order confirmation email (non-blocking)
    if (user?.email) {
      sendOrderConfirmationEmail(
        user.email,
        user.name || 'Customer',
        order.id,
        totalAmount,
        orderItemsData.length,
        paymentMethod
      ).catch(err => console.error('Email send failed:', err));
    }

    // Run auto-cleanup in background (non-blocking)
    cleanupOldOrders().catch(err => console.error('Cleanup failed:', err));

    res.status(201).json(order);
  } catch (error) {
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
        user: { select: { name: true, email: true } },
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
    const { paymentStatus } = req.body; // e.g., 'VERIFIED', 'FAILED'

    const order = await prisma.order.update({
      where: { id: id as string },
      data: { paymentStatus },
      include: {
        user: { select: { email: true, name: true } },
      },
    });

    // Send payment status email to customer (non-blocking)
    if (order.user?.email && (paymentStatus === 'VERIFIED' || paymentStatus === 'FAILED')) {
      sendPaymentStatusEmail(
        order.user.email,
        order.user.name || 'Customer',
        order.id,
        paymentStatus,
        Number(order.totalAmount)
      ).catch(err => console.error('Email send failed:', err));
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating payment status', error: (error as Error).message });
  }
};
