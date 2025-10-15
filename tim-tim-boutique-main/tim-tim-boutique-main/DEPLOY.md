# 🚀 Guia de Deploy - Tim Tim Bebidas

## Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (gratuita)
- Conta no Vercel/Netlify (gratuita) - opcional

## 1. Configuração do Supabase

### 1.1 Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta ou faça login
3. Clique em "New Project"
4. Preencha os dados do projeto
5. Aguarde a criação (2-3 minutos)

### 1.2 Executar Scripts SQL

No painel do Supabase, vá em **SQL Editor** e execute os scripts na ordem:

1. `supabase-schema.sql` - Cria as tabelas
2. `supabase-rls-policies.sql` - Configura as políticas de segurança
3. `scripts/setup-storage.sql` - Configura o storage de imagens
4. `scripts/insert-sample-products.sql` - Insere produtos de exemplo (opcional)

### 1.3 Obter Credenciais

1. Vá em **Project Settings** > **API**
2. Copie:
   - **Project URL** (VITE_SUPABASE_URL)
   - **anon public key** (VITE_SUPABASE_ANON_KEY)

## 2. Configuração Local

### 2.1 Instalar Dependências

```bash
npm install
```

### 2.2 Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e preencha:

```env
# Supabase
VITE_SUPABASE_URL=sua-url-do-supabase
VITE_SUPABASE_ANON_KEY=sua-chave-anon-do-supabase

# WhatsApp (formato: 55 + DDD + número)
VITE_WHATSAPP_NUMBER=5581995985278
```

### 2.3 Testar Localmente

```bash
npm run dev
```

Acesse: http://localhost:5173

## 3. Deploy na Vercel (Recomendado)

### 3.1 Preparar para Deploy

```bash
npm run build
```

### 3.2 Deploy via Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer deploy
vercel
```

### 3.3 Deploy via GitHub

1. Faça push do código para o GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Clique em "Import Project"
4. Selecione seu repositório
5. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_WHATSAPP_NUMBER`
6. Clique em "Deploy"

## 4. Deploy na Netlify

### 4.1 Via Netlify CLI

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod
```

### 4.2 Via Interface Web

1. Acesse [netlify.com](https://netlify.com)
2. Arraste a pasta `dist` para fazer upload
3. Configure as variáveis de ambiente em **Site Settings** > **Environment Variables**

## 5. Configurações Pós-Deploy

### 5.1 Configurar Domínio Personalizado

**Vercel:**
- Settings > Domains > Add Domain

**Netlify:**
- Domain Settings > Add Custom Domain

### 5.2 Configurar CORS no Supabase

Se necessário, configure CORS em **Project Settings** > **API** > **CORS**

### 5.3 Testar Funcionalidades

- ✅ Navegação entre páginas
- ✅ Busca de produtos
- ✅ Adicionar ao carrinho
- ✅ Cálculo de frete
- ✅ Finalização via WhatsApp
- ✅ Painel administrativo (/admin)

## 6. Acesso ao Painel Admin

**URL:** `seu-dominio.com/admin`

**Credenciais padrão:**
- Email: `admin@timtimbebidas.com`
- Senha: `admin123`

⚠️ **IMPORTANTE:** Altere as credenciais em `src/services/adminStorage.ts` antes do deploy em produção!

## 7. Manutenção

### Atualizar Produtos

1. Acesse `/admin`
2. Faça login
3. Gerencie produtos pela interface

### Backup do Banco

No Supabase:
- Database > Backups
- Configure backups automáticos

### Monitoramento

- Vercel: Analytics integrado
- Netlify: Analytics integrado
- Supabase: Database > Logs

## 8. Troubleshooting

### Erro de CORS
- Verifique as configurações de CORS no Supabase
- Adicione seu domínio na lista de origens permitidas

### Imagens não carregam
- Verifique as políticas RLS do storage
- Execute `scripts/setup-storage.sql` novamente

### WhatsApp não abre
- Verifique o formato do número: `55 + DDD + número`
- Teste em dispositivo móvel

## 9. Suporte

Para dúvidas ou problemas:
- Documentação Supabase: [docs.supabase.com](https://docs.supabase.com)
- Documentação Vercel: [vercel.com/docs](https://vercel.com/docs)
- Documentação Netlify: [docs.netlify.com](https://docs.netlify.com)

---

**Desenvolvido com ❤️ para Tim Tim Bebidas**
