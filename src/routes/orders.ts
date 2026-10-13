import { Router, Response } from 'express';
import { prisma } from '../index';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /orders - Create new order (auth required)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { items, shippingAddress, note, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      res.status(400).json({ error: 'Order must have at least one item' });
      return;
    }

    if (!shippingAddress) {
      res.status(400).json({ error: 'Shipping address is required' });
      return;
    }

    // Calculate total
    let total = 0;
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        res.status(400).json({ error: `Product ${item.productId} not found` });
        return;
      }
      if (product.stock < item.quantity) {
        res.status(400).json({ error: `Insufficient stock for ${product.name}` });
        return;
      }
      total += product.price * item.quantity;
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        userId: req.userId!,
        total,
        shippingAddress: JSON.stringify(shippingAddress),
        note,
        items: {
          create: items.map((item: { productId: string; quantity: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: 0 // Will be updated below
          }))
        }
      },
      include: {
        items: {
          include: { product: { select: { name: true, imageUrl: true } } }
        }
      }
    });

    // Update prices in order items
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (product) {
        await prisma.orderItem.updateMany({
          where: { orderId: order.id, productId: item.productId },
          data: { price: product.price }
        });
        // Reduce stock
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }
    }

    res.status(201).json(order);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create order';
    res.status(500).json({ error: message });
  }
});

// GET /orders - Get user's orders (auth required)
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId },
      include: {
        items: {
          include: {
            product: { select: { name: true, slug: true, imageUrl: true } }
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

// GET /orders/:id - Get order by ID (auth required, own orders or admin)
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const orderId = String(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { select: { name: true, slug: true, imageUrl: true } }
          }
        },
        user: { select: { id: true, name: true, email: true } }
      }
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Check ownership or admin
    if (order.userId !== req.userId && req.userRole !== 'admin') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({
      ...order,
      shippingAddress: order.shippingAddress ? JSON.parse(order.shippingAddress) : null
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch order';
    res.status(500).json({ error: message });
  }
});

export default router;
