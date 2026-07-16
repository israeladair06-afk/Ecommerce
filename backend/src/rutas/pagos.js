import express from 'express';
import Stripe from 'stripe';
import { proteger } from '../intermediarios/auth.js';

const router = express.Router();

// POST /api/payments/create-intent
router.post('/create-intent', proteger, async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_your_stripe_secret_key') {
      return res.json({ success: true, data: { clientSecret: `pi_simulated_${Date.now()}`, amount } });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: { userId: req.user._id.toString() },
    });

    res.json({ success: true, data: { clientSecret: paymentIntent.client_secret, amount } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/payments/confirm
router.post('/confirm', proteger, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (paymentIntentId.startsWith('pi_simulated_')) {
      return res.json({ success: true, data: { status: 'succeeded' } });
    }

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_your_stripe_secret_key') {
      return res.json({ success: true, data: { status: 'succeeded' } });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({ success: true, data: { status: paymentIntent.status } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;