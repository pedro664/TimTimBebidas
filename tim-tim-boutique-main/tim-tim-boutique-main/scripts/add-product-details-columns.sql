-- ============================================
-- Adicionar Colunas de Detalhes dos Produtos
-- ============================================
-- Este script adiciona as colunas que estavam faltando na tabela products
-- Execute no SQL Editor do Supabase
-- ============================================

-- Adicionar coluna de teor alcoólico
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS alcohol_content VARCHAR(20);

-- Adicionar coluna de volume
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS volume VARCHAR(20);

-- Adicionar coluna de harmonização (array de strings)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS pairing TEXT[];

-- Adicionar coluna de notas de degustação (array de strings)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS tasting_notes TEXT[];

-- Adicionar coluna de uvas (para vinhos)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS grapes TEXT[];

-- Adicionar coluna de país de origem
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS country VARCHAR(100);

-- Adicionar coluna de região
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS region VARCHAR(100);

-- Adicionar coluna de produtor/marca
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS producer VARCHAR(255);

-- Adicionar coluna de ano/safra
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS vintage VARCHAR(10);

-- Comentários nas novas colunas
COMMENT ON COLUMN products.alcohol_content IS 'Teor alcoólico (ex: 13%, 40%)';
COMMENT ON COLUMN products.volume IS 'Volume da garrafa (ex: 750ml, 1L)';
COMMENT ON COLUMN products.pairing IS 'Sugestões de harmonização';
COMMENT ON COLUMN products.tasting_notes IS 'Notas de degustação';
COMMENT ON COLUMN products.grapes IS 'Tipos de uvas (para vinhos)';
COMMENT ON COLUMN products.country IS 'País de origem';
COMMENT ON COLUMN products.region IS 'Região de produção';
COMMENT ON COLUMN products.producer IS 'Produtor ou marca';
COMMENT ON COLUMN products.vintage IS 'Ano ou safra';

-- Verificar as colunas adicionadas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;
