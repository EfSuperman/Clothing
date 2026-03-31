import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

// Create a new order
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { items, paymentMethod, shippingAddress } = req.body;
    // items should be [{ productId, quantity, price }]
    
    // Calculate total
    let totalAmount = 0;
    const orderItemsData = items.map((item: any) => {
      totalAmount += item.price * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.price,
      };
    });

    let paymentScreenshot = null;
    let paymentStatus: 'PENDING' | 'VERIFICATION_PENDING' = 'PENDING';

    // Handle bank transfer screenshot
    if (paymentMethod === 'BANK_TRANSFER' && req.file) {
      paymentScreenshot = `/uploads/${req.file.filename}`;
      paymentStatus = 'VERIFICATION_PENDING';
    } else if (paymentMethod === 'BANK_TRANSFER' && !req.file) {
      res.status(400).json({ message: 'Payment screenshot is required for Bank Transfer' });
      return;
    }

    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        paymentMethod,
        paymentStatus,
        paymentScreenshot,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: true,
      },
    });

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
    });

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating payment status', error: (error as Error).message });
  }
};
