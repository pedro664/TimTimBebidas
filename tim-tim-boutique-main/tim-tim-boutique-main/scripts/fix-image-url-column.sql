-- Script para garantir que a coluna image_url esteja configurada corretamente
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar a estrutura atual da tabela products
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- 2. Garantir que a coluna image_url existe e está configurada corretamente
-- Se a coluna não existir, será criada
-- Se existir, será modificada para garantir o tipo correto
DO $$
BEGIN
    -- Verificar se a coluna existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'image_url'
    ) THEN
        -- Criar a coluna se não existir
        ALTER TABLE products ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Coluna image_url criada com sucesso';
    ELSE
        -- Garantir que o tipo está correto
        ALTER TABLE products ALTER COLUMN image_url TYPE TEXT;
        RAISE NOTICE 'Coluna image_url já existe e foi verificada';
    END IF;
    
    -- Garantir que a coluna não é nullable (opcional, remova se quiser permitir NULL)
    -- ALTER TABLE products ALTER COLUMN image_url SET NOT NULL;
END $$;

-- 3. Adicionar índice para melhorar performance de busca por imagem
CREATE INDEX IF NOT EXISTS idx_products_image_url ON products(image_url);

-- 4. Verificar produtos sem imagem
SELECT id, name, image_url
FROM products
WHERE image_url IS NULL OR image_url = '';

-- 5. Atualizar produtos sem imagem com placeholder (OPCIONAL)
-- Descomente as linhas abaixo se quiser adicionar imagens placeholder
/*
UPDATE products
SET image_url = 'https://via.placeholder.com/400x600/FF69B4/FFFFFF?text=' || REPLACE(name, ' ', '+')
WHERE image_url IS NULL OR image_url = '';
*/

-- 6. Verificar se há URLs duplicadas (para garantir unicidade se necessário)
SELECT image_url, COUNT(*) as count
FROM products
WHERE image_url IS NOT NULL AND image_url != ''
GROUP BY image_url
HAVING COUNT(*) > 1;

-- 7. Adicionar constraint de unicidade (OPCIONAL - apenas se quiser URLs únicas)
-- Descomente se quiser garantir que cada produto tenha uma URL única
/*
ALTER TABLE products ADD CONSTRAINT unique_image_url UNIQUE (image_url);
*/

-- 8. Verificar resultado final
SELECT 
    id,
    name,
    category,
    image_url,
    CASE 
        WHEN image_url IS NULL OR image_url = '' THEN '❌ SEM IMAGEM'
        WHEN image_url LIKE 'http%' THEN '✅ URL VÁLIDA'
        ELSE '⚠️ URL SUSPEITA'
    END as status
FROM products
ORDER BY created_at DESC;

-- 9. Estatísticas
SELECT 
    COUNT(*) as total_produtos,
    COUNT(image_url) as produtos_com_url,
    COUNT(*) - COUNT(image_url) as produtos_sem_url,
    ROUND(COUNT(image_url)::numeric / COUNT(*)::numeric * 100, 2) as percentual_com_imagem
FROM products;

RAISE NOTICE 'Script executado com sucesso! Verifique os resultados acima.';
