# Fix Stripe Webhook "No signature found" Error in Express

> Stripe webhooks fail with "No signature found matching the expected signature" because Express parses the body before Stripe can verify it.

<img width="800" height="800" alt="stripe-webhook-hero" src="https://github.com/user-attachments/assets/164f5c36-131e-4b6f-9c06-2e4ad6c4c2b0" />


## Le Problème

You set up a Stripe webhook, Stripe sends events, and every single one returns a 400 with "No signature found matching the expected signature for payload". You check your secret, you check your keys, you check everything. The real cause: `express.json()` runs first and rewrites the request body, so the bytes Stripe signed no longer match.

## La Solution

- Mount the webhook route with `express.raw()` so Stripe gets the untouched body
- Register `express.json()` only after the webhook route
- Verify with `stripe.webhooks.constructEvent()` using the raw body and the signature header

## Comment l'utiliser

```bash
git clone https://github.com/YOUR_USERNAME/fix-stripe-webhook-signature-error-express.git
cd fix-stripe-webhook-signature-error-express
npm install
cp .env.example .env   # add your STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET
npm run dev
```

In another terminal:

```bash
stripe listen --forward-to localhost:3000/webhook
```

## Ce que j'ai appris

Express's JSON middleware is not neutral: it changes the body, and signature verification depends on the exact bytes.

---

Part of my challenge: 1 repo / day. Building ShipIt, the tool to publish an app in 1 click.
