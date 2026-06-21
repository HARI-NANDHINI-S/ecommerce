# Folder Structure

```
ecommerce/
├─ .env.example                # Environment variable template (git‑ignored)
├─ README.md                    # Project overview and quick‑start
├─ ARCHITECTURE.md              # High‑level architecture description
├─ FOLDER_STRUCTURE.md         # This file – folder layout
├─ supabase/                    # Supabase configuration & migrations
│   ├─ migrations/
│   │   ├─ 001_extensions.sql
│   │   ├─ 002_tables.sql
│   │   ├─ 003_policies.sql
│   │   └─ 004_seed.sql
│   └─ functions/                # Edge functions (Vercel serverless)
│       ├─ create-order.js
│       ├─ verify-payment.js
│       └─ razorpay-webhook.js
├─ public/                       # Static assets served by Vercel
│   ├─ index.html
│   ├─ setup.html
│   ├─ robots.txt
│   ├─ sitemap.xml
│   ├─ icons/
│   │   └─ favicon.svg
│   ├─ images/                    # Product images, placeholders, etc.
│   └─ assets/                    # CSS, JS bundles
│       ├─ css/
│       │   └─ style.css
│       └─ js/
│           ├─ app.js
│           ├─ auth.js
│           ├─ cart.js
│           ├─ checkout.js
│           ├─ admin.js
│           └─ utils.js
├─ components/                  # Reusable UI components (HTML snippets, CSS classes)
│   ├─ navbar.html
│   ├─ footer.html
│   ├─ product-card.html
│   ├─ toast.html
│   └─ modal.html
├─ pages/                        # Individual page templates
│   ├─ home.html
│   ├─ shop.html
│   ├─ product.html
│   ├─ cart.html
│   ├─ checkout.html
│   ├─ profile.html
│   ├─ login.html
│   ├─ register.html
│   └─ admin/
│       ├─ dashboard.html
│       ├─ products.html
│       ├─ categories.html
│       ├─ orders.html
│       ├─ customers.html
│       ├─ coupons.html
│       └─ settings.html
├─ utils/                        # Server‑side helper scripts (used by Edge Functions)
│   ├─ email.js                 # SendGrid / Resend email helper
│   ├─ razorpay.js              # Razorpay SDK wrapper (server‑side only)
│   └─ db.js                    # Supabase admin client wrapper
└─ vercel.json                  # Vercel configuration (rewrites, functions)
```

The structure separates **static assets** (`public/`) from **backend logic** (`supabase/functions/`) and **HTML components** for easy theming via the white‑label `store_settings` row.
