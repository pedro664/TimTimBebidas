-- ============================================
-- CONFIGURAÇÃO DO SUPABASE STORAGE
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- para configurar o bucket de imagens de produtos
-- ============================================

-- 1. Criar bucket para imagens de produtos (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Configurar políticas de acesso ao bucket

-- Permitir leitura pública (qualquer um pode ver as imagens)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Permitir upload para todos (desenvolvimento)
-- NOTA: Em produção, você deve restringir isso apenas para admins
CREATE POLICY "Allow Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

-- Permitir atualização para todos (desenvolvimento)
-- NOTA: Em produção, você deve restringir isso apenas para admins
CREATE POLICY "Allow Update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images');

-- Permitir deleção para todos (desenvolvimento)
-- NOTA: Em produção, você deve restringir isso apenas para admins
CREATE POLICY "Allow Delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar se o bucket foi criado
SELECT * FROM storage.buckets WHERE id = 'product-images';

-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- ============================================
-- MENSAGEM FINAL
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'STORAGE CONFIGURADO COM SUCESSO!';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Bucket criado: product-images';
    RAISE NOTICE 'Políticas configuradas: Leitura, Upload, Update, Delete';
    RAISE NOTICE '';
    RAISE NOTICE 'IMPORTANTE:';
    RAISE NOTICE 'Em produção, restrinja as políticas de upload/update/delete';
    RAISE NOTICE 'apenas para usuários admin autenticados.';
    RAISE NOTICE '============================================';
END $$;
