# ✅ Checklist de Deploy - Tim Tim Bebidas

## Antes do Deploy

### Configuração
- [ ] Criar projeto no Supabase
- [ ] Executar scripts SQL no Supabase (na ordem correta)
- [ ] Configurar storage de imagens no Supabase
- [ ] Copiar credenciais do Supabase (URL + anon key)
- [ ] Configurar número de WhatsApp no formato correto
- [ ] Preencher arquivo `.env` com as credenciais

### Segurança
- [ ] Alterar senha do admin em `src/services/adminStorage.ts`
- [ ] Verificar políticas RLS no Supabase
- [ ] Adicionar domínio nas configurações de CORS do Supabase

### Testes Locais
- [ ] Rodar `npm install`
- [ ] Rodar `npm run dev`
- [ ] Testar navegação entre páginas
- [ ] Testar busca de produtos
- [ ] Testar adicionar ao carrinho
- [ ] Testar cálculo de frete
- [ ] Testar finalização via WhatsApp
- [ ] Testar login no painel admin
- [ ] Testar CRUD de produtos no admin

## Durante o Deploy

### Build
- [ ] Rodar `npm run build` sem erros
- [ ] Verificar tamanho do bundle (dist/)

### Plataforma (Vercel/Netlify)
- [ ] Criar conta na plataforma escolhida
- [ ] Conectar repositório GitHub (opcional)
- [ ] Configurar variáveis de ambiente:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `VITE_WHATSAPP_NUMBER`
- [ ] Fazer deploy

## Após o Deploy

### Verificação
- [ ] Site está acessível no domínio
- [ ] Todas as páginas carregam corretamente
- [ ] Imagens estão carregando
- [ ] Busca funciona
- [ ] Carrinho funciona
- [ ] Cálculo de frete funciona
- [ ] WhatsApp abre corretamente
- [ ] Painel admin acessível em `/admin`
- [ ] Login no admin funciona
- [ ] CRUD de produtos funciona

### Performance
- [ ] Lighthouse Score > 90
- [ ] Imagens otimizadas
- [ ] Tempo de carregamento < 3s

### SEO
- [ ] Meta tags configuradas
- [ ] Favicon presente
- [ ] Sitemap gerado (opcional)

### Monitoramento
- [ ] Configurar analytics (opcional)
- [ ] Configurar alertas de erro (opcional)
- [ ] Configurar backups automáticos no Supabase

## Configurações Opcionais

### Domínio Personalizado
- [ ] Comprar domínio
- [ ] Configurar DNS
- [ ] Adicionar domínio na plataforma
- [ ] Configurar SSL/HTTPS

### Email
- [ ] Configurar email de contato
- [ ] Atualizar email no footer

### Redes Sociais
- [ ] Adicionar links de redes sociais (opcional)
- [ ] Configurar Open Graph tags

## Manutenção Contínua

### Semanal
- [ ] Verificar logs de erro
- [ ] Verificar performance
- [ ] Atualizar produtos (se necessário)

### Mensal
- [ ] Verificar backups
- [ ] Atualizar dependências (se necessário)
- [ ] Revisar analytics

### Trimestral
- [ ] Revisar segurança
- [ ] Atualizar conteúdo
- [ ] Otimizar performance

---

**Data do último deploy:** ___/___/______

**Responsável:** _________________

**Notas:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
