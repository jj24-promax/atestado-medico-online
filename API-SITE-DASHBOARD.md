# API única: site + dashboard

A **mesma API** é usada pelo **site estático** (landing + formulário) e pelo **dashboard** (painel admin).

---

## Como funciona

```
                    ┌─────────────────────────────────────┐
                    │   API de leads (Next.js dashboard)   │
                    │   GET  /api/leads  → listar leads   │
                    │   POST /api/leads  → criar lead     │
                    └─────────────────────────────────────┘
                                      ▲
                    ┌─────────────────┴─────────────────┐
                    │                                   │
        ┌───────────┴───────────┐           ┌───────────┴───────────┐
        │  Site estático       │           │  Dashboard (Next.js)   │
        │  solicitar.html      │           │  /admin/dashboard     │
        │  POST /api/leads     │           │  GET /api/leads       │
        │  (envia novo lead)   │           │  (lista na tabela)     │
        └──────────────────────┘           └───────────────────────┘
```

- **Site:** ao enviar o formulário "Solicitar Atestado", o `script.js` envia um **POST** para a URL da API.
- **Dashboard:** ao abrir o painel, a página faz **GET** na mesma API e exibe os leads na tabela.
- A API fica dentro do projeto **dashboard** (Next.js): `dashboard/app/api/leads/route.ts`.

Assim, os dois lados ficam ligados à **mesma API** (e ao mesmo banco, seja arquivo `leads.json` ou Supabase).

---

## Configuração da URL da API

### No site estático

A URL da API é definida em **`config-api.js`** na raiz do projeto:

```js
window.API_BASE_URL = "http://localhost:3000";
window.API_LEADS_URL = window.API_BASE_URL + "/api/leads";
```

- **Desenvolvimento:** deixe `http://localhost:3000` (com o dashboard rodando nessa porta).
- **Produção:** altere para a URL do seu dashboard, por exemplo:
  - `https://seu-dashboard.vercel.app`
  - Ou o domínio onde você hospedar o Next.js.

O arquivo **`solicitar.html`** já carrega `config-api.js` antes do `script.js`, então o formulário usa automaticamente `window.API_LEADS_URL`.

### No dashboard

O dashboard usa a **mesma origem** do Next.js, então chama a API em **caminho relativo**:

- `fetch("/api/leads")` → sempre a API do próprio app (localhost em dev, ou o mesmo domínio em produção).

Não é necessário configurar URL no dashboard; só garantir que o site aponte para onde o dashboard está rodando.

---

## Resumo

| Onde           | Função              | Como usa a API                    |
|----------------|---------------------|-----------------------------------|
| **Site**       | Enviar solicitações | POST em `config-api.js` → API_LEADS_URL |
| **Dashboard**  | Ver e gerenciar     | GET/POST relativos em `/api/leads`     |

Uma única API, linkada ao **site original** e ao **dashboard**.
