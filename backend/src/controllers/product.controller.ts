import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Get all products (with optional search and category filters)
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, categoryId } = req.query;

    const products = await prisma.product.findMany({
      where: {
        name: search ? { contains: String(search), mode: 'insensitive' } : undefined,
        categoryId: categoryId ? String(categoryId) : undefined,
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: (error as Error).message });
  }
};

// Get single product
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: id as string },
      include: { category: true, reviews: true },
    });

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: (error as Error).message });
  }
};

// Create product (Admin only)
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, stockQty, imageURLs, categoryId } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stockQty,
        imageURLs,
        categoryId,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: (error as Error).message });
  }
};

// Update product (Admin only)
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, price, stockQty, imageURLs, categoryId } = req.body;

    const product = await prisma.product.update({
      where: { id: id as string },
      data: { name, description, price, stockQty, imageURLs, categoryId },
    });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: (error as Error).message });
  }
};

// Delete product (Admin only)
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.product.delete({ where: { id: id as string } });

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: (error as Error).message });
  }
};

// Categories
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: (error as Error).message });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, parentId } = req.body;
    const category = await prisma.category.create({
      data: { name, parentId },
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: (error as Error).message });
  }
};
