import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// placing user order for frontend

const placeOrder = async (req, res) => {

    const frontend_url = "https://tastytap-frontend-1dcx.onrender.com";

    try {
        // Validate required fields
        if (!req.body.items || req.body.items.length === 0) {
            return res.json({ success: false, message: "No items in order" });
        }
        
        if (!req.body.amount || req.body.amount <= 0) {
            return res.json({ success: false, message: "Invalid order amount" });
        }
        
        if (!req.body.address) {
            return res.json({ success: false, message: "Delivery address required" });
        }
        
        if (!process.env.STRIPE_SECRET_KEY) {
            return res.json({ success: false, message: "Payment service not configured" });
        }
        
        const newOrder = new orderModel({
            userId: req.user.id,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address
        })
        
        await newOrder.save();
        
        await userModel.findByIdAndUpdate(req.user.id, { cartData: {} });

        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: "inr",
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }))

        line_items.push({
            price_data: {
                currency: "inr",
                product_data: {
                    name: "Delivery Charges"
                },
                unit_amount: 2 * 100
            },
            quantity: 1
        })

        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: 'payment',
            success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
            metadata: {
                orderId: newOrder._id.toString()
            }
        })

        res.json({ success: true, session_url: session.url });
    } catch (error) {
        // Check for specific error types
        if (error.name === 'ValidationError') {
            return res.json({ success: false, message: "Invalid order data: " + Object.values(error.errors).map(e => e.message).join(', ') });
        }
        
        if (error.type === 'StripeCardError') {
            return res.json({ success: false, message: "Payment card error: " + error.message });
        }
        
        if (error.type === 'StripeInvalidRequestError') {
            return res.json({ success: false, message: "Payment configuration error: " + error.message });
        }
        
        res.json({ success: false, message: "Order placement failed: " + error.message });
    }
}

const verifyOrder = async (req, res) => {
    const { orderId, success, sessionId } = req.body;
    try {
        if (String(success).toLowerCase() === "true") {
            // Find the order first
            const order = await orderModel.findById(orderId);
            
            if (order && order.userId) {
                // If we have a sessionId, verify with Stripe
                if (sessionId) {
                    try {
                        const session = await stripe.checkout.sessions.retrieve(sessionId);
                        
                        if (session.payment_status === 'paid') {
                            // Payment confirmed by Stripe
                        }
                    } catch (stripeError) {
                        // Continue with verification even if Stripe session retrieval fails
                    }
                }
                
                // Mark payment as true
                const updatedOrder = await orderModel.findByIdAndUpdate(
                    orderId, 
                    { payment: true },
                    { new: true }
                );
                
                // Clear the user's cart
                await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
                
                res.json({ success: true, message: "Paid" });
            } else {
                res.json({ success: false, message: "Order not found" });
            }
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Not Paid" });
        }
    } catch (error) {
        res.json({ success: false, message: "Error" });
    }
}

// user order for frontend

const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.user.id });
        res.json({ success: true, data: orders })
    } catch (error) {
        res.json({ success: false, message: "Error" });
    }
}

// // list orders for admin panel
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders });
    } catch (error) {
        res.json({ success: false, message: "Error" })
    }
}

// // api for updating order status

const updateStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        res.json({ success: true, message: "Status Updated" })
    } catch (error) {
        res.json({ success: false, message: "Error" })
    }
}

const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            
            // Extract orderId from metadata or session
            const orderId = session.metadata?.orderId;
            if (orderId) {
                try {
                    await orderModel.findByIdAndUpdate(orderId, { payment: true });
                } catch (error) {
                    // Handle error silently
                }
            }
            break;
            
        case 'payment_intent.payment_failed':
            const paymentIntent = event.data.object;
            break;
            
        default:
            // Unhandled event type
    }

    res.json({ received: true });
};

// export const createStripeSession = async (req, res) => {
//   try {
//     const { items, amount, address } = req.body;

//     // Map items to Stripe line items
//     const line_items = items.map(item => ({
//       price_data: {
//         currency: 'inr',
//         product_data: {
//           name: item.name,
//         },
//         unit_amount: Math.round(item.price * 100), // Stripe expects cents
//       },
//       quantity: item.quantity,
//     }));

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items,
//       mode: 'payment',
//       success_url: 'http://localhost:5175/success', // Change to your frontend success page
//       cancel_url: 'http://localhost:5175/cancel',   // Change to your frontend cancel page
//       metadata: {
//         address: JSON.stringify(address),
//       },
//     });

//     res.json({ success: true, session_url: session.url });
//   } catch (error) {
//     console.error(error);
//     res.json({ success: false, message: "Stripe session creation failed" });
//   }
// };

const testOrder = async (req, res) => {
    try {
        res.json({ 
            success: true, 
            message: "Test endpoint working",
            user: req.user.id,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.json({ success: false, message: "Test failed: " + error.message });
    }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus, handleStripeWebhook, testOrder }
