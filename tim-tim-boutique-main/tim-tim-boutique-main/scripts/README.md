# Scripts SQL - Tim Tim Bebidas

## 📋 Ordem de Execução

Execute os scripts SQL no Supabase SQL Editor na seguinte ordem:

### 1. Criar Banco de Dados
```
../supabase-database-schema.sql
```
Cria as tabelas `products` e `orders`.

### 2. Configurar Segurança
```
../supabase-rls-policies.sql
```
Configura Row Level Security (RLS) para proteger os dados.

### 3. Configurar Storage
```
setup-storage.sql
```
Cria o bucket `product-images` para upload de imagens.

### 4. Ajustar Coluna de Imagens
```
fix-image-url-column.sql
```
Ajusta a coluna `image_url` para aceitar URLs longas.

### 5. Adicionar Campos de Detalhes dos Produtos
```
add-product-details-columns.sql
```
Adiciona colunas para teor alcoólico, volume, harmonização, notas de degustação, etc.

### 6. Inserir Produtos de Exemplo (Opcional)
```
insert-sample-products.sql
```
Adiciona produtos de exemplo para testar o sistema.

## 🔧 Scripts Utilitários

- `fix-rls-policies.sql` - Corrige políticas RLS se necessário
- `setup-database.ts` - Script TypeScript para setup automatizado (não usado atualmente)

## ⚠️ Importante

- Execute os scripts no Supabase SQL Editor
- Não execute scripts fora de ordem
- Faça backup antes de executar em produção
- Verifique se as políticas RLS estão ativas

## 📝 Notas

- Os scripts são idempotentes (podem ser executados múltiplas vezes)
- Use `IF NOT EXISTS` para evitar erros
- Sempre teste em ambiente de desenvolvimento primeiro
