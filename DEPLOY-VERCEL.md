# Deploy do site na Vercel

O projeto é um **site estático** (HTML, CSS, JS) com **duas funções serverless** no mesmo repositório para o PIX (Fusion Pay).

---

## Deploy único

1. Conecte o repositório à Vercel (**Add New** → **Project** → importar o repo).
2. **Root Directory**: deixe a raiz (não use subpasta).
3. A Vercel vai servir os arquivos estáticos (`.html`, `.css`, `.js`, etc.) e as rotas em **`api/`** como funções serverless.
4. Em **Settings** → **Environment Variables**, configure:
   - `FUSIONPAY_PUBLIC_KEY`
   - `FUSIONPAY_SECRET_KEY`
   - `APP_URL` = URL do site (ex.: `https://www.atestadomed.com.br`)
5. Faça o deploy. O site e a API ficam no **mesmo domínio** (ex.: `https://www.atestadomed.com.br` e `https://www.atestadomed.com.br/api/create-payment`).

---

## Domínio próprio

Em **Settings** → **Domains**, adicione o domínio que você comprou (ex.: www.atestadomed.com.br). A Vercel orienta o que configurar no DNS.

Depois de publicar, defina **`APP_URL`** com essa mesma URL (para o webhook da Fusion Pay).

---

## Se `/api/create-payment` retornar 404

- Confirme que o **Root Directory** do projeto na Vercel está **vazio** (raiz do repositório).
- O **vercel.json** não usa `builds` customizados: a Vercel detecta automaticamente a pasta **`api/`** e publica cada `.js` como função serverless.
- Em **Deployments**, abra o último deploy e veja nos **Build Logs** se as funções em `api/` aparecem.
- Faça um **Redeploy** (sem cache: "Redeploy without cache") após alterar o `vercel.json` ou a pasta `api/`.
