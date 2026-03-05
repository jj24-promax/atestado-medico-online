# Como configurar as keys do Fusion Pay (site único)

O site já está preparado para gerar PIX no mesmo domínio. Só falta configurar as variáveis de ambiente na **Vercel** (ou no provedor onde o site está hospedado).

---

## 1. Pegar as keys

- Acesse o **painel Fusion Pay** → **Credenciais API**.
- Copie a **Public Key** e a **Secret Key**.

---

## 2. Onde configurar

Como o site está no **mesmo domínio** (ex.: testadomed.com.br), a API fica em `https://testadomed.com.br/api/create-payment`. As keys **não** ficam no site; ficam só no servidor (variáveis de ambiente).

### Na Vercel

1. Abra o **projeto do site** na Vercel (o que usa o domínio que você comprou).
2. Vá em **Settings** → **Environment Variables**.
3. Crie estas variáveis:

| Nome | Valor | Ambiente |
|------|--------|----------|
| `FUSIONPAY_PUBLIC_KEY` | Cole a Public Key do Fusion Pay | Production (e Preview se quiser) |
| `FUSIONPAY_SECRET_KEY` | Cole a Secret Key do Fusion Pay | Production (e Preview) |
| `APP_URL` | URL do seu site, ex.: `https://testadomed.com.br` (sem barra no final) | Production (e Preview) |

4. Salve e faça um **Redeploy** do projeto.

---

## 3. Conferir

- Abra o site no domínio (ex.: testadomed.com.br).
- Vá em **Solicitar Atestado**, preencha e clique em **Continuar para pagamento**.
- Deve abrir a tela de PIX (redirect ou QR na página). Se aparecer “Não foi possível abrir a tela de pagamento”, confira se as 3 variáveis estão corretas e se fez o redeploy.

---

## Resumo

| Onde | O que colocar |
|------|----------------|
| **Vercel** (projeto do site) | `FUSIONPAY_PUBLIC_KEY`, `FUSIONPAY_SECRET_KEY`, `APP_URL` (URL do site para o webhook) |

Não é necessário configurar nada no `config-api.js`: com `API_BASE_URL` vazio, o site usa o próprio domínio para chamar `/api/create-payment`.
