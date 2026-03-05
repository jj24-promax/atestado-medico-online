# Fusion Pay no site (sem dashboard)

O pagamento PIX é gerado **no próprio site**: o formulário chama a API no mesmo domínio (`/api/create-payment`), que usa as keys da Fusion Pay no servidor e devolve o QR Code ou a URL de pagamento.

---

## Configuração

1. No **painel Fusion Pay** → **Credenciais API**, copie a **Public Key** e a **Secret Key**.

2. **Na Vercel** (projeto do seu site, ex.: testadomed.com.br):
   - **Settings** → **Environment Variables**
   - Crie:
     - `FUSIONPAY_PUBLIC_KEY` = sua Public Key
     - `FUSIONPAY_SECRET_KEY` = sua Secret Key
     - `APP_URL` = URL do site (ex.: `https://testadomed.com.br`) — usada para o webhook

3. Faça um **novo deploy** para as variáveis valerem.

---

## Fluxo

1. Cliente preenche **Solicitar Atestado** e clica em **Continuar para pagamento**.
2. O site envia os dados para **`/api/create-payment`** (mesmo domínio).
3. A API chama a Fusion Pay, cria a transação PIX e devolve QR Code ou URL.
4. O cliente é redirecionado para a tela de PIX da Fusion Pay ou vê o QR na própria página.
5. Quando o pagamento é confirmado, a Fusion Pay chama **`/api/webhooks/fusionpay`** no seu domínio.

---

## Estrutura do projeto

| Caminho | Função |
|--------|--------|
| `api/create-payment.js` | Cria a transação PIX na Fusion Pay (chamado pelo formulário). |
| `api/webhooks/fusionpay.js` | Recebe a notificação de pagamento da Fusion Pay. |
| `config-api.js` | `API_BASE_URL` vazio = usa o próprio domínio. |
| `solicitar.html` + `script.js` | Formulário que envia para `/api/create-payment`. |

A pasta **dashboard** não é mais usada; você pode apagá-la do disco (feche qualquer processo que esteja usando antes). Ela está no `.gitignore` para não subir no repositório.
