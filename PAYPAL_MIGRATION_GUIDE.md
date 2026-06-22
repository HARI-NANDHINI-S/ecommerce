# PayPal Migration Guide

This guide explains the migration from Razorpay to PayPal and how to deploy your e-commerce store live.

## Summary of Changes

Your e-commerce application has been successfully migrated from Razorpay to **PayPal** for payment processing. All payment-related code has been updated to use PayPal's REST API v2.

### What Was Changed:
1. ✅ **Frontend Components**
   - Updated `checkout.html` - PayPal button container
   - Updated `checkout.js` - PayPal SDK initialization and order creation
   - Updated `app.js` - PayPal client ID setup

2. ✅ **Backend Functions**
   - Updated `create-order.js` - PayPal order creation using PayPal API v2
   - Updated `verify-payment.js` - PayPal order capture and verification
   - Updated `webhook.js` - PayPal webhook handling for payment confirmations

3. ✅ **Configuration**
   - Updated `.env` - PayPal credentials setup
   - Updated documentation files - README, deployment guide, security docs

## Prerequisites

Before deploying, ensure you have:

1. **PayPal Developer Account**
   - Go to https://developer.paypal.com
   - Sign up for a free developer account
   - Access the sandbox environment for testing

2. **Node.js 20.x or later**
   ```bash
   node --version  # Should be v20.x or later
   ```

3. **Vercel CLI**
   ```bash
   npm install -g vercel
   ```

4. **Supabase Project** (already set up)
   - Your project URL
   - Anon key
   - Service role key

## Step 1: Get PayPal Credentials

### In PayPal Developer Dashboard:

1. Log in to https://developer.paypal.com
2. Go to **Apps & Credentials**
3. Ensure you're in the **Sandbox** tab
4. Copy your **Client ID** (public key)
5. Click "Show" next to your app to see the **Secret** key
6. Save both credentials

### Your Credentials (Update in `.env`):
```
PUBLIC_PAYPAL_KEY_ID=YOUR_CLIENT_ID
PAYPAL_SECRET_KEY=YOUR_SECRET_KEY
PAYPAL_MODE=sandbox    # Use 'sandbox' for testing, 'live' for production
```

## Step 2: Configure Environment Variables

### Local Development (`.env`):
```bash
# Supabase
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# PayPal (Sandbox for testing)
PUBLIC_PAYPAL_KEY_ID=your-sandbox-client-id
PAYPAL_SECRET_KEY=your-sandbox-secret-key
PAYPAL_MODE=sandbox

# Site Configuration
PUBLIC_SITE_URL=http://localhost:3000
PUBLIC_STORE_NAME=My Store
PUBLIC_SUPPORT_EMAIL=support@example.com
PAYPAL_WEBHOOK_SECRET=optional-for-testing

# Email (Optional)
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=noreply@yourstore.com
```

## Step 3: Run Locally

```bash
cd c:\Users\devasri\OneDrive\Desktop\projects\ecommerce

# Install dependencies (optional)
npm install

# Start local development server
npm run dev

# Open browser
# http://localhost:3000
```

## Step 4: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Or deploy to preview first
vercel
```

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com
2. Create a new project or import from Git
3. Add the environment variables in Vercel Dashboard
4. Deploy

### Set Environment Variables in Vercel:

1. Go to **Project Settings** → **Environment Variables**
2. Add all variables from your `.env` file:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `PUBLIC_PAYPAL_KEY_ID`
   - `PAYPAL_SECRET_KEY`
   - `PUBLIC_SITE_URL` (your actual domain)
   - `PUBLIC_STORE_NAME`
   - `PUBLIC_SUPPORT_EMAIL`
   - `PAYPAL_MODE` (sandbox for testing, live for production)
   - `RESEND_API_KEY` (if using email)

## Step 5: Configure PayPal Webhooks (Optional but Recommended)

### Create PayPal Webhook:

1. In PayPal Developer Dashboard → **Apps & Credentials**
2. Click **Webhooks** in the left menu
3. Click **Create Webhook**
4. Set the **Event Notification URL** to:
   ```
   https://your-vercel-domain.vercel.app/functions/v1/webhook
   ```
5. Select events to subscribe to:
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
6. Copy the **Webhook ID** and **Webhook Signature** (secret)
7. Add to your Vercel environment variables:
   - `PAYPAL_WEBHOOK_ID=webhook-id`
   - `PAYPAL_WEBHOOK_SECRET=webhook-secret`

## Step 6: Test Payment Flow

### Test Credentials (Sandbox):

Use these PayPal test accounts to test your store:

**Buyer Account:**
- Email: `sb-xxxxx@personal.example.com`
- Password: Get from PayPal Developer Dashboard

**Seller Account:**
- Email: `sb-xxxxx@business.example.com`
- Password: Get from PayPal Developer Dashboard

### Testing Steps:

1. Go to your deployed site
2. Add products to cart
3. Proceed to checkout
4. Click "Pay with PayPal"
5. Log in with the **Buyer test account**
6. Approve the payment
7. Verify order in your Supabase dashboard

## Step 7: Switch to Production (Live)

### When Ready for Real Payments:

1. **Get Live PayPal Credentials:**
   - Log in to PayPal Developer Dashboard
   - Switch from **Sandbox** to **Live** tab
   - Copy your Live Client ID and Secret

2. **Update Environment Variables:**
   - Change `PAYPAL_MODE=sandbox` to `PAYPAL_MODE=live`
   - Replace Client ID and Secret with live credentials
   - Update `PUBLIC_SITE_URL` to your actual domain
   - Update PayPal Webhook settings in PayPal to use your live domain

3. **Test with Small Transaction:**
   - Process a small test payment with your live account

## Troubleshooting

### "PayPal SDK not loading"
- Ensure `PUBLIC_PAYPAL_KEY_ID` is set correctly
- Check browser console for CORS errors
- Verify the key is a valid Client ID (not Secret key)

### "Payment verification failed"
- Check that `PAYPAL_SECRET_KEY` is set correctly in Vercel
- Ensure webhook URL is configured correctly in PayPal Dashboard
- Check Supabase logs for any database errors

### "404 Not Found on checkout"
- Ensure your Supabase queries table (`orders`, `payments`) exist
- Run all migrations in `supabase/migrations/`

### "Order not found" error
- Verify `cart_items` are being created correctly
- Check user is authenticated before checkout
- Ensure profile exists in `profiles` table

## File Changes Summary

| File | Changes |
|------|---------|
| `public/checkout.html` | Added PayPal button container, removed Razorpay |
| `public/assets/js/checkout.js` | PayPal SDK initialization and order flow |
| `public/assets/js/app.js` | PayPal client ID setup |
| `public/assets/js/api.js` | Updated mock responses for PayPal |
| `supabase/functions/create-order.js` | PayPal order creation via API v2 |
| `supabase/functions/verify-payment.js` | PayPal capture and verification |
| `supabase/functions/webhook.js` | PayPal webhook handler |
| `.env` | PayPal credentials and configuration |
| `README.md` | Updated documentation |
| `package.json` | Updated description |
| `docs/*.md` | Updated all documentation files |

## API Currency Support

The PayPal integration currently supports **USD**. To support other currencies:

1. Update `supabase/functions/create-order.js` - change `'USD'` to your currency code
2. Update `public/checkout.html` - change `&currency=USD` in PayPal SDK URL
3. Ensure your Supabase `store_settings.currency` matches the PayPal currency

## Support

For issues or questions:
1. Check PayPal API documentation: https://developer.paypal.com/docs/
2. Check Supabase docs: https://supabase.com/docs
3. Review error logs in Vercel dashboard
4. Check browser console for JavaScript errors

## Next Steps

1. ✅ Local testing with sandbox credentials
2. ✅ Deploy to Vercel
3. ✅ Configure PayPal webhooks
4. ✅ Test production payment flow
5. ✅ Go live with real transactions

Happy selling! 🎉
