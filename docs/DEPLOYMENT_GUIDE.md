# Deployment Guide

## Prerequisites
- Node.js 20.x (or later)
- Vercel CLI (`npm i -g vercel`)
- Supabase project with the SQL migrations applied
- Razorpay account (test keys) and webhook URL

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
   - `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`
   - `RESEND_API_KEY` (if using Resend for emails)
3. **Deploy to Vercel**
   ```bash
   vercel login
   vercel
   ```
   - When prompted, select the **Vercel Project Name**.
   - Set the Environment Variables matching `.env` (Vercel will mask them).
   - Enable **Edge Functions** (Vercel auto‑detects `supabase/functions/*`).
4. **Configure Razorpay Webhook**
   - In Razorpay Dashboard → Webhooks, add the URL:
     `https://<your‑vercel‑domain>/api/webhook`
   - Use the secret you set in `RAZORPAY_WEBHOOK_SECRET`.
5. **Verify**
   - Visit the deployed site, register a user, place a test order.
   - Check Supabase logs and Razorpay dashboard for webhook events.

---
**Optional**: Connect a custom domain in Vercel → Settings → Domains.
