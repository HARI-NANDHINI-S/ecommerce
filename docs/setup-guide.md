# Setup Guide

This guide walks you through the **first‑time setup** of the white‑label e‑commerce store.

1. **Create Supabase project**
   - Sign‑in to https://supabase.com and create a new project.
   - Copy the `PROJECT URL`, `ANON PUBLIC KEY`, and `SERVICE ROLE KEY`.
2. **Run SQL migrations**
   ```bash
   psql <PROJECT_URL> -U supabase_admin -f supabase/migrations/001_extensions.sql
   psql <PROJECT_URL> -U supabase_admin -f supabase/migrations/002_tables.sql
   psql <PROJECT_URL> -U supabase_admin -f supabase/migrations/003_triggers.sql
   psql <PROJECT_URL> -U supabase_admin -f supabase/migrations/004_rls_policies.sql
   psql <PROJECT_URL> -U supabase_admin -f supabase/migrations/005_seed.sql
   ```
3. **Configure storage bucket**
   - In Supabase Dashboard → Storage → Create bucket `store-assets`.
   - Set **public** read on `product-images/` and **RLS** for avatars (`avatars/{uid}/`).
4. **Add environment variables**
   - Copy `.env.example` → `.env` and fill in all values (Supabase keys, Razorpay keys, site URL, etc.).
5. **Run the setup wizard**
   - Deploy to Vercel (see deployment guide) and open the site.
   - If `store_settings` is empty you will be redirected to `/setup.html`.
   - Fill in store name, logo, colors, support email, and the first admin email.
   - The wizard uploads the logo/favicon to Supabase Storage, inserts a `store_settings` row, and creates the admin user.
6. **Deploy**
   - `vercel --prod` (or via Vercel dashboard) will build the static site and expose the Edge Functions.

After these steps your store is live and fully brandable via the **Admin → Settings** panel.
