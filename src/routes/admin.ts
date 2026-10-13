import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// All admin routes require authentication and admin role
router.use(authMiddleware, adminMiddleware);

// GET /admin/products - Get all products for admin
router.get('/products', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { reviews: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(products);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch products';
    res.status(500).json({ error: message });
  }
});

// POST /admin/products - Create product
router.post('/products', async (req: AuthRequest, res: Response) => {
  try {
    const { name, slug, description, price, imageUrl, gallery, origin, roastLevel, weight, stock, featured, categoryId } = req.body;

    if (!name || !slug || price === undefined) {
      res.status(400).json({ error: 'Name, slug, and price are required' });
      return;
    }

    const existing = await prisma.product.findUnique({ where: { slug: String(slug) } });
    if (existing) {
      res.status(400).json({ error: 'Slug already exists' });
      return;
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: Number(price),
        imageUrl,
        gallery: gallery ? JSON.stringify(gallery) : null,
        origin,
        roastLevel,
        weight: weight ? Number(weight) : null,
        stock: stock ? Number(stock) : 0,
        featured: featured || false,
        categoryId
      },
      include: { category: true }
    });

    res.status(201).json(product);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create product';
    res.status(500).json({ error: message });
  }
});

// PUT /admin/products/:id - Update product
router.put('/products/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, slug, description, price, imageUrl, gallery, origin, roastLevel, weight, stock, featured, categoryId } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Check slug uniqueness if changed
    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.product.findUnique({ where: { slug: String(slug) } });
      if (slugExists) {
        res.status(400).json({ error: 'Slug already exists' });
        return;
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        price: price !== undefined ? Number(price) : undefined,
        imageUrl,
        gallery: gallery !== undefined ? (gallery ? JSON.stringify(gallery) : null) : undefined,
        origin,
        roastLevel,
        weight: weight !== undefined ? (weight ? Number(weight) : null) : undefined,
        stock: stock !== undefined ? Number(stock) : undefined,
        featured,
        categoryId
      },
      include: { category: true }
    });

    res.json(product);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update product';
    res.status(500).json({ error: message });
  }
});

// DELETE /admin/products/:id - Delete product
router.delete('/products/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Product deleted successfully' });
  } catch (error: unknown) {
    res.status(404).json({ error: 'Product not found' });
  }
});

// GET /admin/orders - Get all orders
router.get('/orders', async (_req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: { select: { name: true, imageUrl: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const ordersWithAddress = orders.map((o) => ({
      ...o,
      shippingAddress: o.shippingAddress ? JSON.parse(o.shippingAddress) : null
    }));

    res.json(ordersWithAddress);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch orders';
    res.status(500).json({ error: message });
  }
});

// PUT /admin/orders/:id/status - Update order status
router.put('/orders/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const orderId = String(req.params.id);
    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } }
      }
    });

    res.json(order);
  } catch (error: unknown) {
    res.status(404).json({ error: 'Order not found' });
  }
});

// GET /admin/users - Get all users
router.get('/users', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true, reviews: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch users';
    res.status(500).json({ error: message });
  }
});

// GET /admin/categories - Get all categories
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' }
    });

    res.json(categories.map((c) => ({ ...c, productCount: c._count.products })));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch categories';
    res.status(500).json({ error: message });
  }
});

// POST /admin/categories - Create category
router.post('/categories', async (req: Request, res: Response) => {
  try {
    const { name, slug, description, image } = req.body;

    if (!name || !slug) {
      res.status(400).json({ error: 'Name and slug are required' });
      return;
    }

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      res.status(400).json({ error: 'Slug already exists' });
      return;
    }

    const category = await prisma.category.create({
      data: { name, slug, description, image }
    });

    res.status(201).json(category);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create category';
    res.status(500).json({ error: message });
  }
});

export default router;
