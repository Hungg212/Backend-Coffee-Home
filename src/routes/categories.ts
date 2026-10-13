import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

// GET /categories - Get all categories
router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { products: true } }
      },
      orderBy: { name: 'asc' }
    });

    const categoriesWithCount = categories.map((c) => ({
      ...c,
      productCount: c._count.products
    }));

    res.json(categoriesWithCount);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch categories';
    res.status(500).json({ error: message });
  }
});

// GET /categories/:slug - Get category by slug
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: { select: { products: true } },
        products: {
          take: 8,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json({
      ...category,
      productCount: category._count.products
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch category';
    res.status(500).json({ error: message });
  }
});

export default router;
