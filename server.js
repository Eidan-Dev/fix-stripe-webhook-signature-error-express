js
// server.js
import express from "express";
import Stripe from "stripe";

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// ❌ THE BUG: if express.json() runs before the webhook route, it parses
// and re-serializes the body. The bytes no longer match what Stripe signed,
// so verification fails with "No signature found matching...".
// app.use(express.json());

// ✅ THE FIX: the webhook route gets the RAW body, before any JSON parsing.
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const signature = req.headers["stripe-signature"];

    let event;
    try {
      // req.body is a Buffer here, exactly as Stripe sent it
      event = stripe.webhooks.constructEvent(req.body, signature, WEBHOOK_SECRET);
    } catch (err) {
      console.error("Signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("✅ Verified event:", event.type);
    res.json({ received: true });
  }
);

// Every other route can safely use JSON parsing.
app.use(express.json());

app.get("/", (req, res) => res.send("OK"));

app.listen(3000, () => console.log("Listening on http://localhost:3000"));