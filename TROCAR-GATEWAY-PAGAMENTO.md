# Passo a passo: trocar a gateway de pagamento

Este guia explica como substituir a Fusion Pay pela sua nova API de pagamento, mantendo o fluxo do site (formulário → API → PIX ou redirect).

---

## Visão geral do fluxo atual

1. **Usuário** preenche o formulário em `solicitar.html` e clica em "Continuar para pagamento".
2. **script.js** envia um `POST` para `/api/create-payment` com:
   - `amount` (número, ex: 37.9)
   - `name`, `email`, `cpf`, `phone`, `itemTitle`
3. **api/create-payment.js** (Vercel serverless) recebe, chama a gateway (hoje Fusion Pay) e devolve JSON.
4. **script.js** lê a resposta e:
   - Se houver **URL de checkout** → redireciona o usuário.
   - Se houver **PIX** (QR code e/ou copia e cola) → abre o modal PIX na própria página.

---

## Passo 1: Entender o que a sua API da nova gateway precisa

Sua API nova provavelmente precisa receber algo como:

- Valor (em reais ou centavos)
- Dados do cliente: nome, e-mail, CPF, telefone
- Descrição do item (ex: "Atestado Médico")
- URL de retorno ou webhook (para avisar quando o pagamento for confirmado)

Anote:

- **URL** da API (ex: `https://api.nova-gateway.com/v1/charge`)
- **Método** (GET/POST)
- **Autenticação** (API Key no header? Basic? Bearer?)
- **Formato do body** (JSON com quais campos?)
- **O que ela devolve** quando o pagamento é criado (objeto com link do PIX, QR code, copia e cola, etc.)

---

## Passo 2: Escolher onde colocar o código da nova gateway

Você tem duas opções:

### Opção A – Substituir o arquivo atual (recomendado)

- Editar **`api/create-payment.js`** e trocar toda a lógica interna:
  - Remover a chamada à Fusion Pay.
  - Incluir a chamada à sua nova API (fetch/axios com a URL, headers e body que ela exige).
  - Montar a resposta no formato que o frontend espera (ver Passo 3).

### Opção B – Criar um arquivo novo

- Criar por exemplo **`api/create-payment-nova-gateway.js`**.
- Implementar a mesma função `module.exports = async function handler(req, res)` chamando a nova API.
- No frontend, apontar para essa rota (Passo 4).

---

## Passo 3: Formato de resposta que o frontend espera

O **script.js** já está pronto para dois tipos de resposta. Sua API (ou o `create-payment.js`) precisa devolver **JSON** em um destes formatos:

### Caso 1: Redirecionar para uma página de pagamento

```json
{
  "pix": { "url": "https://gateway.com/pay/xyz123" }
}
```

ou

```json
{
  "checkout_url": "https://gateway.com/pay/xyz123"
}
```

ou

```json
{
  "url": "https://gateway.com/pay/xyz123"
}
```

Se o frontend encontrar qualquer uma dessas URLs, ele redireciona o usuário (`window.location.href = url`).

### Caso 2: Mostrar PIX na própria página (modal com QR e copia e cola)

```json
{
  "transactionId": "opcional-id-pedido",
  "pix": {
    "qr_code": "URL da imagem do QR code OU base64 da imagem",
    "e2_e": "código copia e cola do PIX"
  }
}
```

- **qr_code**: se for URL (`https://...`) ou base64 (`data:image/...`), o site mostra a imagem no modal; se for só o texto do PIX, o site gera o QR com a lib QRCode.js.
- **e2_e**: código copia e cola que aparece no campo e no botão "Copiar".

Formatos alternativos que o frontend também aceita:

- `pixCode` ou `pixQrCode` no nível raiz (são mapeados para `pix.e2_e` / `pix.qr_code`).
- `orderId` no nível raiz (usado como `transactionId`).

### Em caso de erro

Devolva status **4xx ou 5xx** e um JSON com pelo menos:

```json
{
  "error": "Mensagem legível para o usuário"
}
```

O site mostra essa mensagem na área de aviso acima do botão de pagamento.

---

## Passo 4: Configurar a URL da API no frontend (se precisar)

Por padrão o site chama **`/api/create-payment`** no mesmo domínio.

- Se você **substituiu** o conteúdo de `api/create-payment.js`, não precisa mudar nada.
- Se você **criou outro arquivo** (ex: `api/create-payment-nova-gateway.js`), abra **`config-api.js`** e defina:

```javascript
window.PAYMENT_API_PATH = "/api/create-payment-nova-gateway";
```

Assim o formulário passará a usar essa rota.

Se a API estiver em **outro domínio**, use também:

```javascript
window.API_BASE_URL = "https://seu-dominio-da-api.com";
```

(O site monta a URL final como `API_BASE_URL + PAYMENT_API_PATH`.)

---

## Passo 5: Variáveis de ambiente (Vercel)

As chaves da Fusion Pay não serão mais usadas. Em troca, você vai usar as da nova gateway:

1. Acesse o projeto na **Vercel** → **Settings** → **Environment Variables**.
2. Adicione as variáveis que sua API precisa (ex: `NOVA_GATEWAY_API_KEY`, `NOVA_GATEWAY_SECRET`).
3. Opcional: remova ou deixe em branco `FUSIONPAY_PUBLIC_KEY` e `FUSIONPAY_SECRET_KEY` se não for usar.
4. Mantenha **APP_URL** com a URL do site (ex: `https://www.atestadomed.com.br`) para webhooks, se a nova gateway precisar.

Depois, faça um **novo deploy** para as variáveis valerem.

---

## Passo 6: Webhook (quando o pagamento for confirmado)

Se a nova gateway envia um **postback/webhook** quando o PIX é pago:

1. Crie um arquivo na pasta **`api`**, por exemplo **`api/webhooks/nova-gateway.js`** (ou o nome que a documentação indicar).
2. Implemente o handler que:
   - Recebe o POST da gateway.
   - Valida a autenticidade (token/assinatura, se houver).
   - Atualiza o pedido como pago (banco, planilha, e-mail, etc.).
   - Responde 200 para a gateway parar de reenviar.
3. Na configuração da gateway, cadastre a URL do webhook, por exemplo:
   `https://www.atestadomed.com.br/api/webhooks/nova-gateway`

O projeto já tem **`api/webhooks/fusionpay.js`** como referência; você pode usar a mesma estrutura para a nova gateway.

---

## Passo 7: Testar

1. Faça o deploy na Vercel (ou rode localmente com `vercel dev`).
2. Preencha o formulário em **Solicitar Atestado** e envie.
3. Confira:
   - Se for **redirect**: a página deve ir para a URL de pagamento da nova gateway.
   - Se for **PIX na página**: o modal deve abrir com QR code e/ou copia e cola.
   - Em erro: a mensagem de `error` deve aparecer acima do botão.

Se algo não aparecer (404, resposta inválida), confira:

- Se a pasta **api/** está no deploy (Vercel inclui por padrão).
- Se a rota está correta (`PAYMENT_API_PATH` e `API_BASE_URL`).
- Console do navegador (F12) e aba Network para ver o request e a resposta da API.

---

## Resumo rápido

| Onde | O que fazer |
|------|-------------|
| **api/create-payment.js** | Trocar a lógica: receber `req.body`, chamar a **nova** API, devolver JSON no formato do Passo 3. |
| **config-api.js** | Só se usar outra rota ou outro domínio: `PAYMENT_API_PATH` e/ou `API_BASE_URL`. |
| **script.js** | Não precisa alterar, desde que a resposta siga o formato do Passo 3. |
| **Vercel → Env** | Colocar as chaves da nova gateway; manter APP_URL se usar webhook. |
| **Webhook** | Criar `api/webhooks/nome-da-gateway.js` e cadastrar a URL na gateway. |

Se você colar aqui o “script da API” da nova gateway (exemplo de request/response ou trecho de código), posso te dizer exatamente o que colocar dentro de `api/create-payment.js` e como mapear a resposta para o formato que o site espera.
