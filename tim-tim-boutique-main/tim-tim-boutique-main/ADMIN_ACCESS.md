# 🔐 Acesso ao Painel Administrativo

## Credenciais de Acesso

Para acessar o painel administrativo em produção:

- **URL**: `https://seu-dominio.vercel.app/admin/login`
- **Email**: `admin@timtimbebidas.com`
- **Senha**: `admin123`

## Troubleshooting - Problemas Comuns

### 1. Página não carrega / 404 Error

**Problema**: A rota `/admin/login` retorna erro 404

**Solução**: Verifique se o arquivo `vercel.json` está configurado corretamente:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Se o arquivo não existir ou estiver incorreto, faça o redeploy após corrigir.

### 2. Erro de Autenticação

**Problema**: "Email ou senha incorretos" mesmo com credenciais corretas

**Possíveis causas**:
- LocalStorage bloqueado pelo navegador
- Modo privado/anônimo do navegador
- Extensões de navegador bloqueando localStorage

**Soluções**:
1. Abra o Console do navegador (F12)
2. Vá na aba "Application" > "Local Storage"
3. Verifique se o localStorage está acessível
4. Tente em modo normal (não privado)
5. Desative extensões temporariamente

### 3. Redirecionamento Infinito

**Problema**: A página fica redirecionando entre login e dashboard

**Solução**:
1. Limpe o localStorage:
   - Abra o Console (F12)
   - Vá em "Application" > "Local Storage"
   - Clique com botão direito e selecione "Clear"
2. Recarregue a página
3. Faça login novamente

### 4. Erro de CORS / Supabase

**Problema**: Erros relacionados ao Supabase no console

**Solução**:
1. Verifique se as variáveis de ambiente estão configuradas na Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
2. Verifique se a URL da Vercel está autorizada no Supabase:
   - Vá em Supabase Dashboard
   - Settings > Authentication > URL Configuration
   - Adicione `https://seu-dominio.vercel.app` em "Site URL"
   - Adicione `https://seu-dominio.vercel.app/**` em "Redirect URLs"

### 5. Página em Branco

**Problema**: A página carrega mas fica em branco

**Solução**:
1. Abra o Console do navegador (F12)
2. Verifique se há erros JavaScript
3. Erros comuns:
   - **"crypto.subtle is not defined"**: O site precisa estar em HTTPS
   - **"localStorage is not defined"**: Verifique configurações do navegador
   - **Erro de importação de módulos**: Faça um novo deploy

## Como Testar Localmente

Para testar o painel admin localmente antes de fazer deploy:

```cmd
cd tim-tim-boutique-main\tim-tim-boutique-main
npm run dev
```

Acesse: `http://localhost:8080/admin/login`

## Comandos Úteis para Debug

### Verificar variáveis de ambiente na Vercel (via CLI):

```cmd
vercel env ls
```

### Adicionar/Atualizar variável de ambiente:

```cmd
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
```

### Fazer redeploy:

```cmd
vercel --prod
```

### Ver logs de produção:

```cmd
vercel logs seu-projeto.vercel.app
```

## Segurança - IMPORTANTE

⚠️ **ATENÇÃO**: As credenciais atuais são hardcoded no código para desenvolvimento.

Para produção, você deve:

1. **Mudar a senha padrão** editando o arquivo `src/services/adminStorage.ts`
2. **Implementar autenticação real** usando Supabase Auth ou similar
3. **Adicionar 2FA** para maior segurança
4. **Usar variáveis de ambiente** para credenciais sensíveis

## Alterando a Senha Admin

Para alterar a senha do admin:

1. Abra o arquivo `src/services/adminStorage.ts`
2. Localize a constante `ADMIN_CREDENTIALS`
3. Altere o email e/ou gere um novo hash de senha
4. Para gerar um novo hash SHA-256:
   - Acesse: https://emn178.github.io/online-tools/sha256.html
   - Digite sua nova senha
   - Copie o hash gerado
   - Cole no campo `passwordHash`
5. Faça commit e redeploy

## Suporte

Se o problema persistir:

1. Verifique os logs no Console do navegador (F12)
2. Verifique os logs de deploy na Vercel
3. Teste localmente primeiro
4. Verifique se todas as variáveis de ambiente estão configuradas

## Checklist de Deploy

Antes de fazer deploy em produção:

- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] URL da Vercel autorizada no Supabase
- [ ] Arquivo `vercel.json` presente no projeto
- [ ] Senha admin alterada (recomendado)
- [ ] Teste local funcionando
- [ ] Build sem erros
