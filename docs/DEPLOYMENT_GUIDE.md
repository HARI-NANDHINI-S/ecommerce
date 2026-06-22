# Deployment Guide

## Prerequisites
- Node.js 20.x (or later)
- Vercel CLI (`npm i -g vercel`)
- Supabase project with the SQL migrations applied
- PayPal Developer account (test/live keys) and webhook URL

## Steps
1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd ecommerce
   ```
2. **Create `.env`**
   Copy `.env.example` to `.env` and fill in:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `PUBLIC_PAYPAL_KEY_ID` & `PAYPAL_SECRET_KEY`
   - `PAYPAL_WEBHOOK_SECRET` (optional for webhooks)
   - `RESEND_API_KEY` (if using Resend for emails)
3. **Deploy to Vercel**
   ```bash
   vercel login
   vercel
   ```
   - When prompted, select the **Vercel Project Name**.
   - Set the Environment Variables matching `.env` (Vercel will mask them).
   - Enable **Edge Functions** (Vercel auto‑detects `supabase/functions/*`).
4. **Configure PayPal Webhook (Optional)**
   - In PayPal Developer Dashboard → Apps & Credentials → Webhooks, create a new webhook:
     `https://<your-vercel-domain>/functions/v1/webhook`
   - Subscribe to events: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`
   - Copy the webhook ID to `PAYPAL_WEBHOOK_ID` and secret to `PAYPAL_WEBHOOK_SECRET`
   - Update Vercel environment variables
5. **Verify**
   - Visit the deployed site, register a user, place a test order.
   - Check Supabase logs and PayPal dashboard for webhook events.

---
**Optional**: Connect a custom domain in Vercel → Settings → Domains.
