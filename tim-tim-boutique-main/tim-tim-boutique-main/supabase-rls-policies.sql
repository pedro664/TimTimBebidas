-- ============================================
-- Tim-Tim Bebidas - Row Level Security (RLS)
-- ============================================
-- Este script configura as políticas de segurança
-- Execute no SQL Editor do Supabase após criar as tabelas
-- ============================================

-- PASSO 1: HABILITAR RLS EM TODAS AS TABELAS
-- ============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- PASSO 2: REMOVER POLÍTICAS EXISTENTES (SE HOUVER)
-- ============================================
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products are insertable by authenticated users" ON products;
DROP POLICY IF EXISTS "Products are updatable by authenticated users" ON products;
DROP POLICY IF EXISTS "Products are deletable by authenticated users" ON products;

DROP POLICY IF EXISTS "Orders are insertable by everyone" ON orders;
DROP POLICY IF EXISTS "Orders are viewable by authenticated users" ON orders;
DROP POLICY IF EXISTS "Orders are updatable by authenticated users" ON orders;

DROP POLICY IF EXISTS "Order items are insertable by everyone" ON order_items;
DROP POLICY IF EXISTS "Order items are viewable by authenticated users" ON order_items;

DROP POLICY IF EXISTS "Settings are viewable by everyone" ON settings;
DROP POLICY IF EXISTS "Settings are updatable by authenticated users" ON settings;

-- ============================================
-- POLÍTICAS PARA TABELA: PRODUCTS
-- ============================================
-- Requisito: Leitura pública, escrita apenas admin

-- SELECT: Qualquer pessoa pode visualizar produtos
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

-- INSERT: Apenas usuários autenticados podem criar produtos
CREATE POLICY "Products are insertable by authenticated users"
  ON products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- UPDATE: Apenas usuários autenticados podem atualizar produtos
CREATE POLICY "Products are updatable by authenticated users"
  ON products FOR UPDATE
  USING (auth.role() = 'authenticated');

-- DELETE: Apenas usuários autenticados podem deletar produtos
CREATE POLICY "Products are deletable by authenticated users"
  ON products FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- POLÍTICAS PARA TABELA: ORDERS
-- ============================================
-- Requisito: Criação pública, leitura/atualização apenas admin

-- INSERT: Qualquer pessoa pode criar pedidos (checkout público)
CREATE POLICY "Orders are insertable by everyone"
  ON orders FOR INSERT
  WITH CHECK (true);

-- SELECT: Apenas usuários autenticados podem visualizar pedidos
CREATE POLICY "Orders are viewable by authenticated users"
  ON orders FOR SELECT
  USING (auth.role() = 'authenticated');

-- UPDATE: Apenas usuários autenticados podem atualizar pedidos
CREATE POLICY "Orders are updatable by authenticated users"
  ON orders FOR UPDATE
  USING (auth.role() = 'authenticated');

-- ============================================
-- POLÍTICAS PARA TABELA: ORDER_ITEMS
-- ============================================
-- Requisito: Criação pública, leitura apenas admin

-- INSERT: Qualquer pessoa pode criar itens de pedido (junto com o pedido)
CREATE POLICY "Order items are insertable by everyone"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- SELECT: Apenas usuários autenticados podem visualizar itens de pedido
CREATE POLICY "Order items are viewable by authenticated users"
  ON order_items FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- POLÍTICAS PARA TABELA: SETTINGS
-- ============================================
-- Requisito: Leitura pública, escrita apenas admin

-- SELECT: Qualquer pessoa pode visualizar configurações
CREATE POLICY "Settings are viewable by everyone"
  ON settings FOR SELECT
  USING (true);

-- UPDATE: Apenas usuários autenticados podem atualizar configurações
CREATE POLICY "Settings are updatable by authenticated users"
  ON settings FOR UPDATE
  USING (auth.role() = 'authenticated');

-- ============================================
-- VERIFICAÇÃO DAS POLÍTICAS
-- ============================================
-- Execute estas queries para verificar se as políticas foram criadas:

-- Ver todas as políticas de products
-- SELECT * FROM pg_policies WHERE tablename = 'products';

-- Ver todas as políticas de orders
-- SELECT * FROM pg_policies WHERE tablename = 'orders';

-- Ver todas as políticas de order_items
-- SELECT * FROM pg_policies WHERE tablename = 'order_items';

-- Ver todas as políticas de settings
-- SELECT * FROM pg_policies WHERE tablename = 'settings';

-- ============================================
-- RESUMO DAS POLÍTICAS
-- ============================================
-- 
-- PRODUCTS:
-- ✅ SELECT: Público (qualquer um pode ver)
-- ✅ INSERT: Autenticado (apenas admin)
-- ✅ UPDATE: Autenticado (apenas admin)
-- ✅ DELETE: Autenticado (apenas admin)
--
-- ORDERS:
-- ✅ SELECT: Autenticado (apenas admin)
-- ✅ INSERT: Público (clientes podem criar)
-- ✅ UPDATE: Autenticado (apenas admin)
--
-- ORDER_ITEMS:
-- ✅ SELECT: Autenticado (apenas admin)
-- ✅ INSERT: Público (clientes podem criar)
--
-- SETTINGS:
-- ✅ SELECT: Público (qualquer um pode ver)
-- ✅ UPDATE: Autenticado (apenas admin)
--
-- ============================================
