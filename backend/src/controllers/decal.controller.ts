import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getDecals = async (req: Request, res: Response) => {
  try {
    const decals = await prisma.decal.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(decals);
  } catch (error) {
    console.error('Error fetching decals:', error);
    res.status(500).json({ message: 'Error fetching decals' });
  }
};

import { deleteCloudinaryImage } from '../utils/cloudinary';

export const createDecal = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    let imageUrl = req.body.imageUrl;

    if (req.file) {
      imageUrl = req.file.path;
    }

    if (!name || !imageUrl) {
      return res.status(400).json({ message: 'Name and imageUrl/file are required' });
    }

    const newDecal = await prisma.decal.create({
      data: {
        name,
        imageUrl,
      },
    });

    res.status(201).json(newDecal);
  } catch (error) {
    console.error('Error creating decal:', error);
    res.status(500).json({ message: 'Error creating decal' });
  }
};

export const deleteDecal = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const decal = await prisma.decal.findUnique({ where: { id } });
    if (!decal) {
      return res.status(404).json({ message: 'Decal not found' });
    }

    if (decal.imageUrl.includes('res.cloudinary.com')) {
      await deleteCloudinaryImage(decal.imageUrl);
    }

    await prisma.decal.delete({ where: { id } });

    res.json({ message: 'Decal deleted successfully' });
  } catch (error) {
    console.error('Error deleting decal:', error);
    res.status(500).json({ message: 'Error deleting decal' });
  }
};
