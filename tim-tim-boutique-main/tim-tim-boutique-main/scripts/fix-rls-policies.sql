-- ============================================
-- FIX RLS POLICIES - Tim-Tim Boutique
-- ============================================
-- Este script corrige as políticas de segurança para permitir
-- operações CRUD na tabela products
-- ============================================

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Allow all operations on products" ON products;
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON products;

-- Habilitar RLS na tabela products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Criar política permissiva para TODAS as operações
-- NOTA: Esta é uma política permissiva para desenvolvimento
-- Em produção, você deve criar políticas mais restritivas
CREATE POLICY "Allow all operations on products" 
ON products
FOR ALL
USING (true)
WITH CHECK (true);

-- Verificar políticas criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'products';

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '✅ Políticas RLS configuradas com sucesso!';
    RAISE NOTICE 'Agora você pode criar, editar e deletar produtos.';
END $$;
