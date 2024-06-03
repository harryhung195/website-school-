import express from "express";
import dotenv from "dotenv";
import Stripe from "stripe";

// Load environment variables
dotenv.config();

// Initialize Stripe with the secret key from environment variables
const stripe = Stripe(process.env.STRIPE_KEY);

// Initialize the Express application
const app = express();

// Middleware to serve static files from the "public" directory
app.use(express.static("public"));

// Middleware to parse JSON request bodies
app.use(express.json());

// Route to serve the home page
app.get("/", (req, res) => {
    res.sendFile("index.html", { root: "public" });
});

// Route to serve the success page
app.get("/success.html", (req, res) => {
    res.sendFile("success.html", { root: "public" });
});

// Route to serve the cancel page
app.get("/cancel.html", (req, res) => {
    res.sendFile("cancel.html", { root: "public" });
});

// Route to handle Stripe checkout session creation
app.post("/stripe-checkout", async (req, res) => {
    try {
        const lineItems = req.body.items.map((item) => {
            const unitAmount = parseInt(parseFloat(item.price.replace(/[^0-9.-]+/g, "")) * 100); // Remove "$" sign and convert to cents
            console.log('item-price:', item.price);
            console.log('unitAmount:', unitAmount);
            return {
                price_data: {
                    currency: "aud",
                    product_data: {
                        name: item.title,
                        images: [item.productImg], // Product image URL
                    },
                    unit_amount: unitAmount,
                },
                quantity: parseInt(item.quantity), // Item quantity
            };
        });

        // Create a Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            success_url: "http://localhost:3000/success.html",
            cancel_url: "http://localhost:3000/cancel.html",
            billing_address_collection: "required",
            line_items: lineItems,
        });

        // Respond with the session URL
        res.json({ url: session.url });
    } catch (error) {
        console.error("Error creating Stripe session:", error);
        res.status(500).json({ error: "Error creating Stripe session" });
    }
});

// Start the server on port 3000
app.listen(3000, () => {
    console.log("Listening on port 3000");
});
