-- 003_triggers.sql
-- Triggers and functions for the e‑commerce DB

-- 1. Ensure only one store_settings row can be inserted when table is empty
CREATE OR REPLACE FUNCTION prevent_multiple_store_settings()
RETURNS trigger AS $$
BEGIN
    IF (SELECT COUNT(*) FROM store_settings) >= 1 THEN
        RAISE EXCEPTION 'store_settings already has a row';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_one_store_settings
BEFORE INSERT ON store_settings
FOR EACH ROW EXECUTE FUNCTION prevent_multiple_store_settings();

-- 2. When a new auth user is created, create a profile row
CREATE OR REPLACE FUNCTION create_profile_on_auth()
RETURNS trigger AS $$
DECLARE
    new_profile_id UUID;
BEGIN
    INSERT INTO profiles (auth_uid, email, role)
    VALUES (NEW.id, NEW.email, 'customer')
    RETURNING id INTO new_profile_id;

    -- If this is the first profile, also make admin_users entry
    IF (SELECT COUNT(*) FROM profiles) = 1 THEN
        INSERT INTO admin_users (profile_id) VALUES (new_profile_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_profile
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION create_profile_on_auth();

-- 3. Update search_vector on products when name or description changes
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', NEW.name), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_product_search_vector
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();

-- 4. Generate sequential order numbers (e.g., ORD-20230620-0001)
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS trigger AS $$
DECLARE
    prefix TEXT := 'ORD-';
    today TEXT := to_char(current_date, 'YYYYMMDD');
    seq_num BIGINT;
BEGIN
    SELECT nextval('order_number_seq') INTO seq_num;
    NEW.order_number := prefix || today || '-' || lpad(seq_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_number
BEFORE INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- 5. Recalculate product rating after a new review
CREATE OR REPLACE FUNCTION recalc_product_rating()
RETURNS trigger AS $$
DECLARE
    avg_rating NUMERIC;
BEGIN
    SELECT AVG(rating)::NUMERIC(2,1) INTO avg_rating FROM reviews WHERE product_id = NEW.product_id;
    UPDATE products SET rating = avg_rating WHERE id = NEW.product_id;
    RETURN NULL; -- AFTER triggers can return null
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recalc_rating
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION recalc_product_rating();

-- 6. Decrement stock after successful payment (called from webhook)
CREATE OR REPLACE FUNCTION decrement_stock_on_payment()
RETURNS trigger AS $$
DECLARE
    oi record;
BEGIN
    FOR oi IN SELECT * FROM order_items WHERE order_id = NEW.order_id LOOP
        UPDATE product_variants SET stock = stock - oi.quantity WHERE id = oi.product_variant_id;
        UPDATE products SET stock = stock - oi.quantity WHERE id = (SELECT product_id FROM product_variants WHERE id = oi.product_variant_id);
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_decrement_stock
AFTER INSERT ON payments
FOR EACH ROW WHEN (NEW.status = 'captured')
EXECUTE FUNCTION decrement_stock_on_payment();

-- 7. Analytics RPCs (example: total revenue)
CREATE OR REPLACE FUNCTION analytics_total_revenue(start_date DATE, end_date DATE)
RETURNS TABLE(total NUMERIC) AS $$
BEGIN
    RETURN QUERY
    SELECT SUM(total_amount) FROM orders
    WHERE status = 'paid' AND created_at BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- Additional analytic functions can be added similarly.
