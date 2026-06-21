# README.md

## White‑Label E‑Commerce Store

A production‑ready, **vanilla** HTML/CSS/JavaScript e‑commerce platform built on **Supabase** (PostgreSQL, Auth, Storage, Edge Functions) and **Razorpay** for payments. The site is fully **white‑label** – branding, colors, logo, contact info, and currency are stored in a single `store_settings` row and can be changed without touching the code.

### Features
- Full CRUD admin panel (products, categories, coupons, orders, customers, analytics)
- Secure payment flow – Razorpay secret never leaves the server, payments verified server‑side
- Row‑Level Security (RLS) everywhere – users can only access their own data
- Dynamic theming via CSS variables populated from `store_settings`
- Responsive, glassmorphism UI with dark/light mode and smooth micro‑animations
- SEO‑optimized pages with meta tags, JSON‑LD, sitemap, robots.txt
- Setup wizard that runs on first launch to configure branding and create the first admin
- Server‑less deployment on Vercel (static files + Edge Functions)
- Email notifications (order confirmation, invoice) via Resend (or any SMTP provider)

### Tech Stack
- **Frontend:** HTML, vanilla CSS, vanilla JS (ES6 modules)
- **Backend:** Supabase (Postgres, Auth, Storage, Edge Functions)
- **Payments:** Razorpay
- **Deployment:** Vercel (static site + Serverless Functions)
- **Email:** Resend (or custom SMTP)

### Quick Start (local development)
1. **Create a Supabase project** – note the `PROJECT_URL`, `ANON_KEY`, and `SERVICE_ROLE_KEY`.
2. Clone this repository (or copy the `ecommerce` folder).
3. Run the SQL migrations in order (`001_extensions.sql` → `005_seed.sql`).
4. Copy `.env.example` to `.env` and fill in the values.
5. `npm install` – (only for dev tools like linting; the production site uses no bundler).
6. `npm run dev` – starts a local static server (e.g., `npx -y serve .`).
7. Open `http://localhost:5000` – you will be redirected to the setup wizard. Fill in branding and create the first admin account.
8. Deploy to Vercel (`vercel` CLI) and set the same environment variables in the Vercel dashboard.

### Folder Overview
```
ecommerce/
├─ .env.example                 # Environment template (git‑ignored)
├─ README.md                    # This file
├─ ARCHITECTURE.md              # High‑level architecture diagram
├─ FOLDER_STRUCTURE.md         # Project layout
├─ supabase/
│   ├─ migrations/              # SQL files (extensions, tables, triggers, RLS, seed)
│   └─ functions/               # Edge Functions (JS)
├─ public/                      # Static files served by Vercel
│   ├─ index.html
│   ├─ setup.html
│   ├─ robots.txt
│   ├─ sitemap.xml
│   ├─ icons/                   # favicon.svg, etc.
│   ├─ images/                  # demo images (optional)
│   └─ assets/
│       ├─ css/
│       │   ├─ base.css
│       │   ├─ layout.css
│       │   ├─ components.css
│       │   └─ theme.css
│       └─ js/
│           ├─ app.js
│           ├─ router.js
│           ├─ utils.js
│           ├─ pages/ …
│           └─ components/ …
├─ vercel.json                  # Vercel rewrites & functions config
├─ package.json                 # Dev scripts (optional)
└─ docs/                        # Additional documentation (setup‑guide, etc.)
``` 

### Environment Variables (`.env.example`)
```
# Supabase
PUBLIC_SUPABASE_URL=your-supabase-url
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Razorpay
PUBLIC_RAZORPAY_KEY_ID=your-public-key-id
RAZORPAY_KEY_SECRET=your-secret-key
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# Site configuration (public, injected at build time)
PUBLIC_SITE_URL=https://your-domain.com
PUBLIC_STORE_NAME=Your Store
PUBLIC_SUPPORT_EMAIL=support@example.com
PUBLIC_PAYMENT_MODE=test   # or live

# Optional email provider (Resend)
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=no-reply@your-domain.com
```
> **Important:** Do not commit `.env` – it is ignored by Git.

---

For full documentation see the `docs/` directory.
