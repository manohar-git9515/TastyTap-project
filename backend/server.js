import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import 'dotenv/config'
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import path from "path";
import { fileURLToPath } from 'url';
import helmet from "helmet";
import dotenv from 'dotenv';
// import Stripe from 'stripe';
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

dotenv.config();

// console.log('JWT_SECRET used for signing:', process.env.JWT_SECRET);
// console.log('JWT_SECRET used for verifying:', process.env.JWT_SECRET);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express()
const port = process.env.PORT || 4002

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            fontSrc: ["'self'", "http://localhost:4002"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "http://localhost:4002"],
            imgSrc: ["'self'"],
        },
    })
);



app.use(express.json())
app.use(cors({
  origin: "http://localhost:5174", // allow your frontend
  credentials: true                // if you use cookies/auth
}));

// DB  Connection
connectDB();

// api endpoint
app.use("/api/food", foodRouter)
app.use("/uploads", express.static('uploads'))
app.use("/api/user", userRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)

app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

app.get("/", (req, res) => {
    res.send("API Working ")
})

app.get("/test", (req, res) => {
    res.json({ message: "Server is working", timestamp: new Date().toISOString() })
})

app.listen(port, () => {
    console.log(`Server Started on http://localhost:${port}`)
})

export const createStripeSession = async (req, res) => {
  try {
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
    res.json({ success: false, message: "Stripe session creation failed" });
  }
};
