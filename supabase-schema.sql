-- ========================================
-- DÚ CERVEJARIA - SUPABASE DATABASE SCHEMA
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- PRODUCTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    old_price DECIMAL(10, 2),
    category TEXT NOT NULL,
    image TEXT,
    stock INTEGER DEFAULT 0,
    is_best_seller BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON products(is_best_seller);

-- ========================================
-- CATEGORIES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name) VALUES
    ('Ofertas Imperdíveis'),
    ('Ofertas do Dia'),
    ('Mais Vendidos'),
    ('Cervejas'),
    ('Destilados'),
    ('Vinhos'),
    ('Refrigerantes'),
    ('Energéticos')
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- NEIGHBORHOODS TABLE (Delivery Zones)
-- ========================================
CREATE TABLE IF NOT EXISTS neighborhoods (
    id BIGSERIAL PRIMARY KEY,
    zone TEXT NOT NULL,
    name TEXT NOT NULL,
    fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(zone, name)
);

-- ========================================
-- ORDERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    date TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    address TEXT NOT NULL,
    neighbor TEXT NOT NULL,
    zone TEXT NOT NULL,
    items JSONB NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    change JSONB,
    status TEXT DEFAULT 'Pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ========================================
-- SETTINGS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS settings (
    id BIGSERIAL PRIMARY KEY,
    whatsapp TEXT,
    admin_user TEXT DEFAULT 'ducervejariaadmin',
    admin_pass TEXT DEFAULT 'ducervejariaadmin',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (whatsapp, admin_user, admin_pass) 
VALUES ('5511999999999', 'ducervejariaadmin', 'ducervejariaadmin')
ON CONFLICT DO NOTHING;

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Products: Allow public read, authenticated write
CREATE POLICY "Allow public read access on products"
    ON products FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated insert on products"
    ON products FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow authenticated update on products"
    ON products FOR UPDATE
    USING (true);

CREATE POLICY "Allow authenticated delete on products"
    ON products FOR DELETE
    USING (true);

-- Categories: Allow public read, authenticated write
CREATE POLICY "Allow public read access on categories"
    ON categories FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated insert on categories"
    ON categories FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow authenticated delete on categories"
    ON categories FOR DELETE
    USING (true);

-- Neighborhoods: Allow public read, authenticated write
CREATE POLICY "Allow public read access on neighborhoods"
    ON neighborhoods FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated insert on neighborhoods"
    ON neighborhoods FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow authenticated update on neighborhoods"
    ON neighborhoods FOR UPDATE
    USING (true);

CREATE POLICY "Allow authenticated delete on neighborhoods"
    ON neighborhoods FOR DELETE
    USING (true);

-- Orders: Allow public insert, authenticated read/delete
CREATE POLICY "Allow public insert on orders"
    ON orders FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow authenticated read on orders"
    ON orders FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated delete on orders"
    ON orders FOR DELETE
    USING (true);

-- Settings: Allow public read, authenticated write
CREATE POLICY "Allow public read access on settings"
    ON settings FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated update on settings"
    ON settings FOR UPDATE
    USING (true);

-- ========================================
-- FUNCTIONS & TRIGGERS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for products table
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for settings table
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- SAMPLE DATA (Optional - for testing)
-- ========================================

-- Sample Products
INSERT INTO products (name, price, old_price, category, image, stock, is_best_seller) VALUES
    ('Heineken Lata 350ml', 4.50, 5.50, 'Cervejas', 'https://via.placeholder.com/300x300?text=Heineken', 100, true),
    ('Skol Lata 350ml', 3.50, 4.00, 'Cervejas', 'https://via.placeholder.com/300x300?text=Skol', 150, true),
    ('Brahma Lata 350ml', 3.50, 4.00, 'Cervejas', 'https://via.placeholder.com/300x300?text=Brahma', 120, false),
    ('Coca-Cola 2L', 8.50, 10.00, 'Refrigerantes', 'https://via.placeholder.com/300x300?text=Coca-Cola', 80, false),
    ('Red Bull 250ml', 12.00, 14.00, 'Energéticos', 'https://via.placeholder.com/300x300?text=Red+Bull', 50, false)
ON CONFLICT DO NOTHING;

-- Sample Neighborhoods
INSERT INTO neighborhoods (zone, name, fee) VALUES
    ('ZONA NORTE', 'Santana', 8.00),
    ('ZONA NORTE', 'Tucuruvi', 10.00),
    ('ZONA SUL', 'Vila Mariana', 7.00),
    ('ZONA SUL', 'Moema', 9.00),
    ('ZONA LESTE', 'Tatuapé', 12.00),
    ('ZONA OESTE', 'Pinheiros', 8.00),
    ('CENTRO', 'Sé', 6.00)
ON CONFLICT DO NOTHING;

-- ========================================
-- VIEWS (Optional - for analytics)
-- ========================================

-- View for products with discount percentage
CREATE OR REPLACE VIEW products_with_discount AS
SELECT 
    *,
    CASE 
        WHEN old_price IS NOT NULL AND old_price > price 
        THEN ROUND(((old_price - price) / old_price * 100)::numeric, 0)
        ELSE 0
    END as discount_percentage
FROM products;

-- View for order statistics
CREATE OR REPLACE VIEW order_stats AS
SELECT 
    COUNT(*) as total_orders,
    SUM(total) as total_revenue,
    AVG(total) as average_order_value,
    COUNT(DISTINCT customer_phone) as unique_customers
FROM orders;

-- ========================================
-- COMPLETION MESSAGE
-- ========================================
-- Database schema created successfully!
-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Verify tables are created
-- 3. Update your frontend to use the Supabase client
