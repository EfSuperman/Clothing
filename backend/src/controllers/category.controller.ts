import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Get all categories with children (hierarchical)
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: (error as Error).message });
  }
};

// Create a category
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, parentId } = req.body;
    if (!name) {
      res.status(400).json({ message: 'Name is required' });
      return;
    }

    const category = await prisma.category.create({
      data: { 
        name, 
        parentId: parentId || null 
      },
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: (error as Error).message });
  }
};

// Update a category
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, parentId } = req.body;

    const category = await prisma.category.update({
      where: { id: id as string },
      data: { 
        name,
        parentId: parentId === '' ? null : parentId 
      },
    });
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error: (error as Error).message });
  }
};

// Delete a category
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if category has products
    const productCount = await prisma.product.count({ where: { categoryId: id as string } });
    if (productCount > 0) {
      res.status(400).json({ message: 'Cannot delete category with associated products. Reassign them first.' });
      return;
    }

    await prisma.category.delete({ where: { id: id as string } });
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: (error as Error).message });
  }
};
