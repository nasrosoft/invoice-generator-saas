import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Placeholder routes for payments/subscriptions
router.get('/plans', async (req: express.Request, res: express.Response) => {
  res.json({
    plans: [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        features: ['5 invoices/month', 'Basic templates', 'Email support'],
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 9,
        features: ['Unlimited invoices', 'Premium templates', 'Priority support', 'PDF export'],
      },
      {
        id: 'business',
        name: 'Business',
        price: 19,
        features: ['Everything in Pro', 'Multi-user access', 'API access', 'Custom branding'],
      },
    ],
  });
});

router.post('/subscribe', authenticate, async (req: AuthRequest, res: express.Response) => {
  res.json({ message: 'Subscription routes coming soon' });
});

export default router;
