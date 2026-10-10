import { Router, Response } from 'express';
import { prisma } from '../index';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// All payment routes require authentication
router.use(authMiddleware);

// POST /payment/create - Create mock payment
router.post('/create', async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, method } = req.body;

    if (!orderId) {
      res.status(400).json({ error: 'Order ID is required' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.userId !== req.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Generate mock payment URL based on method
    const mockPaymentUrls: Record<string, string> = {
      COD: `https://mock-payment.local/cod/${orderId}`,
      BANK: `https://mock-payment.local/bank/${orderId}`,
      MOMO: `https://mock-payment.local/momo/${orderId}`,
      VNPAY: `https://mock-payment.local/vnpay/${orderId}`,
      CREDIT_CARD: `https://mock-payment.local/card/${orderId}`
    };

    const paymentUrl = mockPaymentUrls[method || 'COD'] || mockPaymentUrls.COD;
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    res.json({
      success: true,
      paymentUrl,
      transactionId,
      orderId,
      amount: order.total,
      method: method || 'COD'
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create payment';
    res.status(500).json({ error: message });
  }
});

// POST /payment/confirm - Confirm payment
router.post('/confirm', async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, transactionId } = req.body;

    if (!orderId) {
      res.status(400).json({ error: 'Order ID is required' });
      return;
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.userId !== req.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Update order status to paid
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'paid' }
    });

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      order: updatedOrder,
      transactionId: transactionId || `TXN-${Date.now()}`
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to confirm payment';
    res.status(500).json({ error: message });
  }
});

export default router;
