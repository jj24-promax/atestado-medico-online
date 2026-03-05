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
   - `APP_URL` = URL do site (ex.: `https://testadomed.com.br`)
5. Faça o deploy. O site e a API ficam no **mesmo domínio** (ex.: `https://testadomed.com.br` e `https://testadomed.com.br/api/create-payment`).

---

## Domínio próprio

Em **Settings** → **Domains**, adicione o domínio que você comprou (ex.: testadomed.com.br). A Vercel orienta o que configurar no DNS.

Depois de publicar, defina **`APP_URL`** com essa mesma URL (para o webhook da Fusion Pay).
