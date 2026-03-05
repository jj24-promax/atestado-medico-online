# Como configurar as keys do Fusion Pay (site único)

O site já está preparado para gerar PIX no mesmo domínio. Só falta configurar as variáveis de ambiente na **Vercel** (ou no provedor onde o site está hospedado).

---

## 1. Pegar as keys

- Acesse o **painel Fusion Pay** → **Credenciais API**.
- Copie a **Public Key** e a **Secret Key**.

---

## 2. Onde configurar

Como o site está no **mesmo domínio** (ex.: www.atestadomed.com.br), a API fica em `https://www.atestadomed.com.br/api/create-payment`. As keys **não** ficam no site; ficam só no servidor (variáveis de ambiente).

### Na Vercel

1. Abra o **projeto do site** na Vercel (o que usa o domínio que você comprou).
2. Vá em **Settings** → **Environment Variables**.
3. Crie estas variáveis:

| Nome | Valor | Ambiente |
|------|--------|----------|
| `FUSIONPAY_PUBLIC_KEY` | Cole a Public Key do Fusion Pay | Production (e Preview se quiser) |
| `FUSIONPAY_SECRET_KEY` | Cole a Secret Key do Fusion Pay | Production (e Preview) |
| `APP_URL` | URL do seu site, ex.: `https://www.atestadomed.com.br` (sem barra no final) | Production (e Preview) |

4. Salve e faça um **Redeploy** do projeto.

---

## 3. Conferir

- Abra o site no domínio (ex.: www.atestadomed.com.br).

---

## Se a rota Node (Vercel) não funcionar: usar a API em PHP

**Importante:** A Vercel **não executa PHP**. Se o site está 100% na Vercel, o arquivo `create-payment.php` não vai rodar lá (pode dar 403 ou ser servido como arquivo estático). Use o PHP apenas em uma **hospedagem que execute PHP** (ex.: hospedagem compartilhada do domínio, outro servidor). Se o domínio aponta só para a Vercel, prefira corrigir o deploy da pasta `api/` (Node) na Vercel.

Se `/api/create-payment` continuar retornando 404 na Vercel e você tiver um servidor com PHP (outro host ou subdomínio), pode usar a versão em PHP:

1. Envie o arquivo **`api/create-payment.php`** para o servidor, no mesmo domínio do site (ex.: em `https://www.atestadomed.com.br/api/create-payment.php`).
2. No início do arquivo PHP, defina as chaves (ou use variáveis de ambiente do painel da hospedagem):
   - `$publicKey = 'sua_public_key';`
   - `$secretKey = 'sua_secret_key';`
3. No **`config-api.js`** do site, descomente e defina:
   - `window.PAYMENT_API_PATH = "/api/create-payment.php";`
4. Faça o deploy do site (com o `config-api.js` alterado) e teste de novo. O formulário passará a chamar o PHP em vez da rota Node.
- Vá em **Solicitar Atestado**, preencha e clique em **Continuar para pagamento**.
- Deve abrir a tela de PIX (redirect ou QR na página). Se aparecer “Não foi possível abrir a tela de pagamento”, confira se as 3 variáveis estão corretas e se fez o redeploy.

---

## Resumo

| Onde | O que colocar |
|------|----------------|
| **Vercel** (projeto do site) | `FUSIONPAY_PUBLIC_KEY`, `FUSIONPAY_SECRET_KEY`, `APP_URL` (URL do site para o webhook) |

Não é necessário configurar nada no `config-api.js`: com `API_BASE_URL` vazio, o site usa o próprio domínio para chamar `/api/create-payment`.
