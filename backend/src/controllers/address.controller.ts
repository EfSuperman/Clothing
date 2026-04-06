import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

// Get all addresses for a user
export const getAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
    });

    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching addresses', error: (error as Error).message });
  }
};

// Add a new address
export const addAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { name, line1, city, state, zip, country } = req.body;

    const newAddress = await prisma.address.create({
      data: {
        userId,
        name: (name as string) || 'Home',
        line1: line1 as string,
        city: city as string,
        state: state as string,
        zip: zip as string,
        country: (country as string) || 'Pakistan',
      },
    });

    res.status(201).json(newAddress);
  } catch (error) {
    res.status(500).json({ message: 'Error adding address', error: (error as Error).message });
  }
};

// Update an address
export const updateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { name, line1, city, state, zip, country } = req.body;

    // Check if address belongs to user
    const existingAddress = await prisma.address.findUnique({ where: { id: id as string } });
    if (!existingAddress || existingAddress.userId !== userId) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    const updatedAddress = await prisma.address.update({
      where: { id: id as string },
      data: {
        name: name as string | undefined,
        line1: line1 as string | undefined,
        city: city as string | undefined,
        state: state as string | undefined,
        zip: zip as string | undefined,
        country: country as string | undefined,
      },
    });

    res.status(200).json(updatedAddress);
  } catch (error) {
    res.status(500).json({ message: 'Error updating address', error: (error as Error).message });
  }
};

// Delete an address
export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Check if address belongs to user
    const existingAddress = await prisma.address.findUnique({ where: { id: id as string } });
    if (!existingAddress || existingAddress.userId !== userId) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    // Instead of deleting, we check if it's used in orders.
    // If it is, we might want to just decouple it from the user's profile set
    // though the current schema allows multiple orders to share an address.
    // For simplicity, let's just allow deleting if it's not used in orders, 
    // or we set userId to null to preserve order history.
    
    await prisma.address.update({
      where: { id: id as string },
      data: { userId: null }
    });

    res.status(200).json({ message: 'Address removed from profile' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting address', error: (error as Error).message });
  }
};
