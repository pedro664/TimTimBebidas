-- ============================================
-- Tim-Tim Bebidas - Supabase Database Schema
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- Dashboard > SQL Editor > New Query > Cole e Execute
-- ============================================

-- 1. CRIAR TABELA PRODUCTS
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('vinho', 'whisky', 'destilado', 'espumante')),
  image_url TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  discount DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- 2. CRIAR TABELA ORDERS
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Informações do cliente
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  
  -- Endereço de entrega
  shipping_street VARCHAR(255) NOT NULL,
  shipping_number VARCHAR(20) NOT NULL,
  shipping_complement VARCHAR(255),
  shipping_neighborhood VARCHAR(100) NOT NULL,
  shipping_city VARCHAR(100) NOT NULL,
  shipping_state VARCHAR(2) NOT NULL,
  shipping_zip_code VARCHAR(9) NOT NULL,
  
  -- Valores
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  
  -- Informações de entrega
  shipping_carrier VARCHAR(100) NOT NULL,
  shipping_estimated_hours INTEGER,
  shipping_is_free BOOLEAN DEFAULT FALSE,
  shipping_tracking_code VARCHAR(100),
  shipping_delivery_time TIMESTAMP WITH TIME ZONE,
  
  -- Status e pagamento
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')
  ),
  payment_method VARCHAR(20) NOT NULL CHECK (
    payment_method IN ('credit_card', 'debit_card', 'pix', 'boleto')
  ),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

-- 3. CRIAR TABELA ORDER_ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 4. CRIAR TABELA SETTINGS
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configurações padrão
INSERT INTO settings (key, value) VALUES
  ('site_name', '"Tim-Tim Bebidas"'::jsonb),
  ('admin_email', '"admin@timtimbebidas.com"'::jsonb),
  ('contact_info', '{"phone": "(81) 99999-9999", "email": "contato@timtimbebidas.com"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 5. HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS DE SEGURANÇA - PRODUCTS
-- ============================================
-- Leitura pública
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

-- Inserção apenas para usuários autenticados (admin)
DROP POLICY IF EXISTS "Products are insertable by authenticated users" ON products;
CREATE POLICY "Products are insertable by authenticated users"
  ON products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Atualização apenas para usuários autenticados (admin)
DROP POLICY IF EXISTS "Products are updatable by authenticated users" ON products;
CREATE POLICY "Products are updatable by authenticated users"
  ON products FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Deleção apenas para usuários autenticados (admin)
DROP POLICY IF EXISTS "Products are deletable by authenticated users" ON products;
CREATE POLICY "Products are deletable by authenticated users"
  ON products FOR DELETE
  USING (auth.role() = 'authenticated');

-- 7. POLÍTICAS DE SEGURANÇA - ORDERS
-- ============================================
-- Criação pública (qualquer um pode criar pedido)
DROP POLICY IF EXISTS "Orders are insertable by everyone" ON orders;
CREATE POLICY "Orders are insertable by everyone"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Leitura apenas para usuários autenticados (admin)
DROP POLICY IF EXISTS "Orders are viewable by authenticated users" ON orders;
CREATE POLICY "Orders are viewable by authenticated users"
  ON orders FOR SELECT
  USING (auth.role() = 'authenticated');

-- Atualização apenas para usuários autenticados (admin)
DROP POLICY IF EXISTS "Orders are updatable by authenticated users" ON orders;
CREATE POLICY "Orders are updatable by authenticated users"
  ON orders FOR UPDATE
  USING (auth.role() = 'authenticated');

-- 8. POLÍTICAS DE SEGURANÇA - ORDER_ITEMS
-- ============================================
-- Criação pública (junto com o pedido)
DROP POLICY IF EXISTS "Order items are insertable by everyone" ON order_items;
CREATE POLICY "Order items are insertable by everyone"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- Leitura apenas para usuários autenticados (admin)
DROP POLICY IF EXISTS "Order items are viewable by authenticated users" ON order_items;
CREATE POLICY "Order items are viewable by authenticated users"
  ON order_items FOR SELECT
  USING (auth.role() = 'authenticated');

-- 9. POLÍTICAS DE SEGURANÇA - SETTINGS
-- ============================================
-- Leitura pública
DROP POLICY IF EXISTS "Settings are viewable by everyone" ON settings;
CREATE POLICY "Settings are viewable by everyone"
  ON settings FOR SELECT
  USING (true);

-- Atualização apenas para usuários autenticados (admin)
DROP POLICY IF EXISTS "Settings are updatable by authenticated users" ON settings;
CREATE POLICY "Settings are updatable by authenticated users"
  ON settings FOR UPDATE
  USING (auth.role() = 'authenticated');

-- ============================================
-- FIM DO SCRIPT
-- ============================================
-- ✅ Tabelas criadas: products, orders, order_items, settings
-- ✅ Índices criados para performance
-- ✅ RLS habilitado em todas as tabelas
-- ✅ Políticas de segurança configuradas
-- ============================================
