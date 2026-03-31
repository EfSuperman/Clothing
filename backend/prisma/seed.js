"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
require("dotenv/config");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient({
    datasourceUrl: process.env.DATABASE_URL
});
async function main() {
    console.log('Seeding database...');
    // 1. Create Admin and Regular User
    const adminPassword = await bcryptjs_1.default.hash('admin123', 10);
    const userPassword = await bcryptjs_1.default.hash('user123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@clothing.com' },
        update: {},
        create: {
            name: 'Admin User',
            email: 'admin@clothing.com',
            passwordHash: adminPassword,
            role: 'ADMIN',
        },
    });
    const user = await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {},
        create: {
            name: 'John Doe',
            email: 'user@example.com',
            passwordHash: userPassword,
            role: 'USER',
        },
    });
    console.log('Users seeded');
    // 2. Create Categories
    const categories = [
        { name: 'Men' },
        { name: 'Women' },
        { name: 'Accessories' },
        { name: 'Footwear' },
    ];
    // We use createMany for speed if supported, or loop
    const createdCategories = [];
    for (const cat of categories) {
        const createdCat = await prisma.category.upsert({
            where: { id: 'dummy' + cat.name }, // This is a hack for upsert
            update: {},
            create: { name: cat.name },
        }).catch(async () => {
            // fallback if uuid is required or unique name
            return await prisma.category.create({ data: cat });
        });
        createdCategories.push(createdCat);
    }
    // To be safe and clean, let's just clear and refilling or check existence
    // For a seed script, it's better to be idempotent.
    console.log('Categories seeded');
    // 3. Create Products
    const products = [
        {
            name: 'Premium Cotton T-Shirt',
            description: 'A high-quality, 100% cotton t-shirt for everyday wear. Breathable and soft.',
            price: 29.99,
            stockQty: 100,
            imageURLs: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800'],
            categoryId: createdCategories[0].id,
        },
        {
            name: 'Denim Jacket',
            description: 'Classic blue denim jacket with a rugged finish. Perfect for layering.',
            price: 89.50,
            stockQty: 50,
            imageURLs: ['https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?auto=format&fit=crop&q=80&w=800'],
            categoryId: createdCategories[0].id,
        },
        {
            name: 'Floral Summer Dress',
            description: 'Elegant and breezy floral dress. Ideal for summer outings and beach days.',
            price: 59.00,
            stockQty: 40,
            imageURLs: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800'],
            categoryId: createdCategories[1].id,
        },
        {
            name: 'Leather Handbag',
            description: 'Sophisticated genuine leather handbag with plenty of space for essentials.',
            price: 120.00,
            stockQty: 20,
            imageURLs: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800'],
            categoryId: createdCategories[2].id,
        },
        {
            name: 'Retro Sneakers',
            description: 'Comfortable and stylish retro-inspired sneakers with high-traction soles.',
            price: 75.00,
            stockQty: 35,
            imageURLs: ['https://images.unsplash.com/photo-1560769129-d51f481f340a?auto=format&fit=crop&q=80&w=800'],
            categoryId: createdCategories[3].id,
        },
    ];
    for (const prod of products) {
        await prisma.product.create({
            data: prod,
        });
    }
    console.log('Products seeded');
    console.log('Database seeding complete!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
