import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getSettings = async (req: Request, res: Response) => {
  try {
    let settings = await (prisma as any).globalSettings.findFirst();
    
    // If no settings exist yet, create default entry
    if (!settings) {
      settings = await (prisma as any).globalSettings.create({
        data: {
          id: 1,
          taxRate: 0,
          deliveryFee: 0,
          customizedShirtPrice: 0,
          customizedShirtCostPrice: 0,
        },
      });
    }
    
    res.status(200).json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Error fetching settings', error: (error as Error).message });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { taxRate, deliveryFee, customizedShirtPrice, customizedShirtCostPrice } = req.body;

    const settings = await (prisma as any).globalSettings.upsert({
      where: { id: 1 },
      update: {
        taxRate: taxRate !== undefined ? Number(taxRate) : undefined,
        deliveryFee: deliveryFee !== undefined ? Number(deliveryFee) : undefined,
        customizedShirtPrice: customizedShirtPrice !== undefined ? Number(customizedShirtPrice) : undefined,
        customizedShirtCostPrice: customizedShirtCostPrice !== undefined ? Number(customizedShirtCostPrice) : undefined,
      },
      create: {
        id: 1,
        taxRate: Number(taxRate || 0),
        deliveryFee: Number(deliveryFee || 0),
        customizedShirtPrice: Number(customizedShirtPrice || 0),
        customizedShirtCostPrice: Number(customizedShirtCostPrice || 0),
      },
    });

    res.status(200).json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Error updating settings', error: (error as Error).message });
  }
};
