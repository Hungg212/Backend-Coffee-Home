import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /products - Get all products with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      featured,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = '1',
      limit = '12',
    } = req.query;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { description: { contains: String(search) } },
        { origin: { contains: String(search) } },
      ];
    }

    if (category) {
      where.categoryId = String(category);
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, number>).gte = Number(minPrice);
      if (maxPrice) (where.price as Record<string, number>).lte = Number(maxPrice);
    }

    if (featured === 'true') {
      where.featured = true;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          reviews: { select: { rating: true } },
        },
        orderBy: { [String(sortBy)]: sortOrder },
        skip,
        take: Number(limit),
      }),
      prisma.product.count({ where }),
    ]);

    // Calculate average rating for each product
    const productsWithRating = products.map((p) => {
      const avgRating =
        p.reviews.length > 0
          ? p.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / p.reviews.length
          : 0;
      return {
        ...p,
        gallery: p.gallery ? JSON.parse(p.gallery) : [],
        averageRating: Number(avgRating.toFixed(1)),
        reviewCount: p.reviews.length,
      };
    });

    res.json({
      products: productsWithRating,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch products';
    res.status(500).json({ error: message });
  }
});

// GET /products/featured - Get featured products
router.get('/featured', async (_req, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { featured: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        reviews: { select: { rating: true } },
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
    });

    const productsWithRating = products.map((p) => {
      const avgRating =
        p.reviews.length > 0
          ? p.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / p.reviews.length
          : 0;
      return {
        ...p,
        gallery: p.gallery ? JSON.parse(p.gallery) : [],
        averageRating: Number(avgRating.toFixed(1)),
        reviewCount: p.reviews.length,
      };
    });

    res.json(productsWithRating);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch featured products';
    res.status(500).json({ error: message });
  }
});

// GET /products/:slug - Get product by slug
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        reviews: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / product.reviews.length
        : 0;

    // Get related products from same category
    const related = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      take: 4,
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      ...product,
      gallery: product.gallery ? JSON.parse(product.gallery) : [],
      averageRating: Number(avgRating.toFixed(1)),
      reviewCount: product.reviews.length,
      related,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch product';
    res.status(500).json({ error: message });
  }
});

// GET /products/:id/reviews - Get product reviews
router.get('/:id/reviews', async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(reviews);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch reviews';
    res.status(500).json({ error: message });
  }
});

// POST /products/:id/reviews - Add review (auth required)
router.post('/:id/reviews', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const productId = req.params.id;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be between 1 and 5' });
      return;
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: { productId, userId: req.userId },
    });

    if (existingReview) {
      // Update existing review
      const updated = await prisma.review.update({
        where: { id: existingReview.id },
        data: { rating, comment },
        include: { user: { select: { id: true, name: true } } },
      });
      res.json(updated);
      return;
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        productId,
        userId: req.userId!,
      },
      include: { user: { select: { id: true, name: true } } },
    });

    res.status(201).json(review);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create review';
    res.status(500).json({ error: message });
  }
});

export default router;
