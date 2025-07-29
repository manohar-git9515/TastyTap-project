import express from "express";
import authMiddleware from "../middleware/auth.js";
import { placeOrder, userOrders, verifyOrder, listOrders, updateStatus, handleStripeWebhook, testOrder } from "../controllers/orderController.js";
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const orderRouter = express.Router();
orderRouter.post("/test", authMiddleware, testOrder);
orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/verify", authMiddleware, verifyOrder);
orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.get('/list', listOrders);
orderRouter.post("/status", updateStatus);
orderRouter.post("/webhook", express.raw({ type: 'application/json' }), handleStripeWebhook);

export const createStripeSession = async (req, res) => {
  try {
    if (!stripe) {
      res.json({ success: false, message: "Stripe not configured. Please set STRIPE_SECRET_KEY in environment variables." });
      return;
    }

    const { items, amount, address } = req.body;

    // Map items to Stripe line items
    const line_items = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100), // Stripe expects cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: 'http://localhost:5174/success', // Change to your frontend success page
      cancel_url: 'http://localhost:5174/cancel',   // Change to your frontend cancel page
      metadata: {
        address: JSON.stringify(address),
      },
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Stripe session creation failed" });
  }
};

orderRouter.post("/stripe-session", createStripeSession);

export default orderRouter;