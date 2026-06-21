-- 004_rls_policies.sql
-- Row‑Level Security policies (default deny, then granular permissions)

-- Enable RLS on all tables
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
    END LOOP;
END $$;

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION is_admin(p_profile_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM admin_users WHERE profile_id = p_profile_id);
END;
$$ LANGUAGE plpgsql STABLE;

-- -------------------------------------------------
-- profiles
-- Users can read/update only their own profile; admin can read all.
-- -------------------------------------------------
CREATE POLICY profiles_select_self ON profiles
    FOR SELECT USING (auth.uid() = auth_uid);
CREATE POLICY profiles_update_self ON profiles
    FOR UPDATE USING (auth.uid() = auth_uid);
CREATE POLICY profiles_admin_select ON profiles
    FOR SELECT USING (is_admin(auth.uid()));

-- -------------------------------------------------
-- store_settings (singleton, public read, admin write)
-- -------------------------------------------------
CREATE POLICY store_settings_public_read ON store_settings
    FOR SELECT USING (TRUE);
CREATE POLICY store_settings_admin_write ON store_settings
    FOR INSERT, UPDATE, DELETE USING (is_admin(auth.uid()));

-- -------------------------------------------------
-- categories
-- -------------------------------------------------
CREATE POLICY categories_select ON categories
    FOR SELECT USING (TRUE);
CREATE POLICY categories_modify ON categories
    FOR INSERT, UPDATE, DELETE USING (is_admin(auth.uid()));

-- -------------------------------------------------
-- products & product_images & product_variants
-- -------------------------------------------------
CREATE POLICY products_view_select ON products_view
    FOR SELECT USING (TRUE);
CREATE POLICY products_modify ON products
    FOR INSERT, UPDATE, DELETE USING (is_admin(auth.uid()));
CREATE POLICY product_images_modify ON product_images
    FOR INSERT, UPDATE, DELETE USING (is_admin(auth.uid()));
CREATE POLICY product_variants_modify ON product_variants
    FOR INSERT, UPDATE, DELETE USING (is_admin(auth.uid()));

-- -------------------------------------------------
-- cart_items (user owns own cart)
-- -------------------------------------------------
CREATE POLICY cart_items_select ON cart_items
    FOR SELECT USING (profile_id = (SELECT id FROM profiles WHERE auth_uid = auth.uid()));
CREATE POLICY cart_items_insert ON cart_items
    FOR INSERT WITH CHECK (profile_id = (SELECT id FROM profiles WHERE auth_uid = auth.uid()));
CREATE POLICY cart_items_update ON cart_items
    FOR UPDATE USING (profile_id = (SELECT id FROM profiles WHERE auth_uid = auth.uid()));
CREATE POLICY cart_items_delete ON cart_items
    FOR DELETE USING (profile_id = (SELECT id FROM profiles WHERE auth_uid = auth.uid()));

-- -------------------------------------------------
-- wishlist (similar to cart)
-- -------------------------------------------------
CREATE POLICY wishlist_select ON wishlist
    FOR SELECT USING (profile_id = (SELECT id FROM profiles WHERE auth_uid = auth.uid()));
CREATE POLICY wishlist_insert ON wishlist
    FOR INSERT WITH CHECK (profile_id = (SELECT id FROM profiles WHERE auth_uid = auth.uid()));
CREATE POLICY wishlist_update ON wishlist
    FOR UPDATE USING (profile_id = (SELECT id FROM profiles WHERE auth_uid = auth.uid()));
CREATE POLICY wishlist_delete ON wishlist
    FOR DELETE USING (profile_id = (SELECT id FROM profiles WHERE auth_uid = auth.uid()));

-- -------------------------------------------------
-- orders and order_items (owner can read, admin can manage)
-- -------------------------------------------------
CREATE POLICY orders_select_owner ON orders
    FOR SELECT USING (profile_id = (SELECT id FROM profiles WHERE auth_uid = auth.uid()));
CREATE POLICY orders_select_admin ON orders
    FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY orders_modify_owner ON orders
    FOR INSERT WITH CHECK (profile_id = (SELECT id FROM profiles WHERE auth_uid = auth.uid()));
CREATE POLICY orders_update_admin ON orders
    FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY order_items_select_owner ON order_items
    FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE id = order_id AND profile_id = (SELECT id FROM profiles WHERE auth_uid = auth.uid())));
CREATE POLICY order_items_select_admin ON order_items
    FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY order_items_insert_owner ON order_items
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE id = order_id AND profile_id = (SELECT id FROM profiles WHERE auth_uid = auth.uid())));
CREATE POLICY order_items_update_admin ON order_items
    FOR UPDATE USING (is_admin(auth.uid()));

-- -------------------------------------------------
-- payments (only service‑role can insert, admin can read)
-- -------------------------------------------------
CREATE POLICY payments_insert_service ON payments
    FOR INSERT TO service_role USING (TRUE);
CREATE POLICY payments_select_admin ON payments
    FOR SELECT USING (is_admin(auth.uid()));

-- -------------------------------------------------
-- reviews (any logged‑in user can create, edit own; admin can manage)
-- -------------------------------------------------
CREATE POLICY reviews_select ON reviews
    FOR SELECT USING (TRUE);
CREATE POLICY reviews_insert ON reviews
    FOR INSERT WITH CHECK (profile_id = (SELECT id FROM profiles WHERE auth_uid = auth.uid()));
CREATE POLICY reviews_update ON reviews
    FOR UPDATE USING (profile_id = (SELECT id FROM profiles WHERE auth_uid = auth.uid()));
CREATE POLICY reviews_admin_delete ON reviews
    FOR DELETE USING (is_admin(auth.uid()));

-- -------------------------------------------------
-- addresses (owner only)
-- -------------------------------------------------
CREATE POLICY addresses_select ON addresses
    FOR SELECT USING (profile_id = (SELECT id FROM profiles WHERE auth_uid = auth.uid()));
CREATE POLICY addresses_insert ON addresses
    FOR INSERT WITH CHECK (profile_id = (SELECT id FROM profiles WHERE auth_uid = auth.uid()));
CREATE POLICY addresses_update ON addresses
    FOR UPDATE USING (profile_id = (SELECT id FROM profiles WHERE auth_uid = auth.uid()));
CREATE POLICY addresses_delete ON addresses
    FOR DELETE USING (profile_id = (SELECT id FROM profiles WHERE auth_uid = auth.uid()));

-- -------------------------------------------------
-- coupons (admin only)
-- -------------------------------------------------
CREATE POLICY coupons_admin ON coupons
    FOR SELECT, INSERT, UPDATE, DELETE USING (is_admin(auth.uid()));

-- -------------------------------------------------
-- admin_users (admin can read/write themselves)
-- -------------------------------------------------
CREATE POLICY admin_users_select ON admin_users
    FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY admin_users_insert ON admin_users
    FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY admin_users_delete ON admin_users
    FOR DELETE USING (is_admin(auth.uid()));

-- -------------------------------------------------
-- Storage objects RLS (bucket: store-assets)
-- -------------------------------------------------
-- Public assets (product images) are readable by everyone
CREATE POLICY storage_public_read ON storage.objects
    FOR SELECT USING (bucket_id = 'store-assets');
-- Admins can write to product image folder; users can write avatars only to their own folder
CREATE POLICY storage_admin_write ON storage.objects
    FOR INSERT, UPDATE, DELETE USING (
        is_admin(auth.uid()) AND bucket_id = 'store-assets' AND starts_with(name, 'product-images/')
    );
CREATE POLICY storage_user_avatar_write ON storage.objects
    FOR INSERT, UPDATE, DELETE USING (
        bucket_id = 'store-assets' AND starts_with(name, 'avatars/' || auth.uid() || '/')
    );

-- Ensure RLS is enforced on storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
