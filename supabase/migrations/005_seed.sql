-- 005_seed.sql
-- Seed data for initial store configuration and demo products

-- Insert default store settings (only one row allowed)
INSERT INTO store_settings (store_name, store_logo_url, currency, tax_rate, default_shipping_fee, razorpay_key_id, razorpay_secret_key, stripe_key_id, stripe_secret_key)
VALUES (
    'My Store',
    'https://example.com/logo.png',
    'USD',
    0.07,
    5.00,
    'rzp_test_XXXXXXXXXXXXXXXX',
    'YourRazorpaySecret',
    'pk_test_XXXXXXXXXXXXXXXX',
    'YourStripeSecret'
);

-- Demo categories
INSERT INTO categories (name, slug, description) VALUES
    ('Electronics', 'electronics', 'Electronic gadgets and accessories'),
    ('Clothing', 'clothing', 'Apparel for all genders'),
    ('Home', 'home', 'Home and kitchen items');

-- Demo products (create a few products with variants and images)
INSERT INTO products (category_id, name, slug, description, price, tax_rate, rating, num_ratings) VALUES
    (1, 'Wireless Headphones', 'wireless-headphones', 'High‑quality Bluetooth headphones', 99.99, 0.07, 0, 0),
    (2, 'Organic T‑Shirt', 'organic-tshirt', 'Soft organic cotton T‑shirt', 19.99, 0.07, 0, 0);

-- Retrieve product IDs for variant insertion
WITH prod AS (SELECT id, slug FROM products WHERE slug IN ('wireless-headphones','organic-tshirt'))
INSERT INTO product_variants (product_id, sku, price, stock, options) VALUES
    ((SELECT id FROM prod WHERE slug='wireless-headphones'), 'WH‑BLK', 99.99, 100, '{"color":"black","size":"standard"}'),
    ((SELECT id FROM prod WHERE slug='organic-tshirt'), 'TS‑SM', 19.99, 200, '{"size":"S","color":"white"}');

-- Demo images for products
INSERT INTO product_images (product_id, url, is_primary) SELECT p.id, 'https://example.com/images/'||p.slug||'_1.jpg', true FROM products p WHERE p.slug='wireless-headphones';
INSERT INTO product_images (product_id, url, is_primary) SELECT p.id, 'https://example.com/images/'||p.slug||'_1.jpg', true FROM products p WHERE p.slug='organic-tshirt';

-- Demo admin user (replace auth UID with real Supabase Auth UID after registration)
INSERT INTO admin_users (auth_uid) VALUES ('00000000-0000-0000-0000-000000000000');
