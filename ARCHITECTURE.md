# Architecture Overview

The white‑label e‑commerce platform consists of four main layers:

1. **Static Front‑end (HTML/CSS/Vanilla JS)** – Served directly from Vercel as static assets. It loads branding information from Supabase at runtime and renders all UI components (navbar, product cards, cart, checkout, admin dashboard) using vanilla JavaScript modules.
2. **Supabase Backend** – PostgreSQL database with Row‑Level Security (RLS), Auth, Storage for images, and Edge Functions (hosted on Vercel) that run with the **service‑role** key. All secret operations (order creation, Razorpay integration, email sending) live here.
3. **Razorpay Payment Gateway** – Integrated via server‑side Edge Functions. The public key is exposed to the client only for the checkout widget; the secret key and webhook secret remain on the server.
4. **Vercel Deployment** – Hosts the static site and Edge Functions. Environment variables are injected at build time and never exposed in the source code.

```
User Browser ⇄ Vercel (static files & Edge Functions) ⇄ Supabase (DB, Auth, Storage) ⇄ Razorpay
```

**Key Security Guarantees**
- Secrets never shipped to the browser.
- All write operations guarded by RLS; only the `service_role` Edge Functions can modify orders/payments.
- Payments are verified server‑side with timing‑safe signature checks.
- Store branding lives in a single `store_settings` row; changing it re‑brands the site without code changes.

---
