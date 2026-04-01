import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './lib/prisma';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://clothing-frontend.vercel.app',
    'https://frontend-one-theta-72.vercel.app',
    /\.vercel\.app$/ // Allow all Vercel subdomains
  ],
  credentials: true
}));
app.use(express.json());

import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import path from 'path';

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

app.get('/api/test-db', async (req: Request, res: Response) => {
  try {
    const count = await prisma.product.count();
    res.status(200).json({ status: 'ok', count });
  } catch (error) {
    res.status(500).json({ status: 'error', message: (error as Error).message });
  }
});

app.get('/', (req: Request, res: Response) => {
  res.send('Clothing eCommerce Backend Running');
});

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
