# 🔧 Comandos Úteis - Tim Tim Bebidas

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Rodar testes
npm run test

# Lint do código
npm run lint
```

## Deploy

### Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (preview)
vercel

# Deploy (produção)
vercel --prod
```

### Netlify

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy (preview)
netlify deploy

# Deploy (produção)
netlify deploy --prod
```

## Supabase

```bash
# Instalar Supabase CLI (opcional)
npm i -g supabase

# Login
supabase login

# Link projeto
supabase link --project-ref seu-projeto-id

# Pull schema
supabase db pull

# Push migrations
supabase db push
```

## Git

```bash
# Inicializar repositório
git init

# Adicionar arquivos
git add .

# Commit
git commit -m "Initial commit"

# Adicionar remote
git remote add origin https://github.com/seu-usuario/tim-tim-bebidas.git

# Push
git push -u origin main
```

## Manutenção

```bash
# Atualizar dependências
npm update

# Verificar dependências desatualizadas
npm outdated

# Limpar cache
npm cache clean --force

# Reinstalar node_modules
rm -rf node_modules package-lock.json
npm install
```

## Troubleshooting

```bash
# Limpar build
rm -rf dist

# Limpar cache do Vite
rm -rf node_modules/.vite

# Verificar portas em uso (Windows)
netstat -ano | findstr :5173

# Verificar portas em uso (Linux/Mac)
lsof -i :5173

# Matar processo na porta 5173 (Windows)
taskkill /PID <PID> /F

# Matar processo na porta 5173 (Linux/Mac)
kill -9 <PID>
```

## Variáveis de Ambiente

```bash
# Copiar .env.example
cp .env.example .env

# Editar .env (Windows)
notepad .env

# Editar .env (Linux/Mac)
nano .env
# ou
vim .env
```

## Backup

```bash
# Backup do código
git push origin main

# Backup do .env (CUIDADO - não commitar!)
cp .env .env.backup

# Backup do Supabase
# Fazer pelo painel: Database > Backups
```

## Performance

```bash
# Analisar bundle
npm run build
npx vite-bundle-visualizer

# Lighthouse audit
npx lighthouse https://seu-site.com --view

# Check de acessibilidade
npx pa11y https://seu-site.com
```

## Úteis

```bash
# Abrir no VS Code
code .

# Abrir no navegador
start http://localhost:5173  # Windows
open http://localhost:5173   # Mac
xdg-open http://localhost:5173  # Linux

# Ver logs do Vercel
vercel logs

# Ver logs do Netlify
netlify logs
```

---

**Dica:** Salve este arquivo para referência rápida!
