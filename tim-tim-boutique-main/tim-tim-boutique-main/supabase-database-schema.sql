-- ============================================
-- Tim-Tim Bebidas - Supabase Database Schema
-- ============================================
-- Este arquivo contém toda a estrutura do banco de dados
-- Execute este SQL no SQL Editor do Supabase Dashboard
-- ============================================

-- Habilitar extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: products
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  category VARCHAR(50) NOT NULL CHECK (category IN ('vinho', 'whisky', 'destilado', 'espumante')),
  image_url TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  discount DECIMAL(5, 2) DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance da tabela products
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- ============================================
-- TABELA: orders
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
  shipping_cost DECIMAL(10, 2) NOT NULL CHECK (shipping_cost >= 0),
  total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
  
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

-- Índices para performance da tabela orders
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- ============================================
-- TABELA: order_items
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL CHECK (product_price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para performance da tabela order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- ============================================
-- TABELA: settings
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configurações padrão
INSERT INTO settings (key, value) VALUES
  ('site_name', '"Tim-Tim Bebidas"'),
  ('admin_email', '"admin@timtimbebidas.com"'),
  ('contact_info', '{"phone": "(81) 99598-5278", "email": "pedro664.ph@gmail.com"}'),
  ('shipping_cities', '["Recife", "Olinda", "Jaboatão dos Guararapes", "Camaragibe"]'),
  ('shipping_free_threshold', '200.00'),
  ('shipping_base_cost', '15.00'),
  ('shipping_weight_per_bottle', '1.5')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- FUNÇÃO: Atualizar updated_at automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMENTÁRIOS NAS TABELAS
-- ============================================
COMMENT ON TABLE products IS 'Tabela de produtos da loja';
COMMENT ON TABLE orders IS 'Tabela de pedidos dos clientes';
COMMENT ON TABLE order_items IS 'Tabela de itens de cada pedido';
COMMENT ON TABLE settings IS 'Tabela de configurações do sistema';

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Execute estas queries para verificar se tudo foi criado corretamente:
-- SELECT * FROM products;
-- SELECT * FROM orders;
-- SELECT * FROM order_items;
-- SELECT * FROM settings;
