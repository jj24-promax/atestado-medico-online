# Dashboard Administrativo — Atestados Médicos

Painel administrativo para gestão de leads e funil de vendas (telemedicina / atestados médicos).

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Radix UI** (Select) + **Lucide React** (ícones)
- **class-variance-authority**, **clsx**, **tailwind-merge**

## Como rodar

```bash
cd dashboard
npm install
npm run dev
```

Acesse: [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)

## Estrutura

- `app/admin/dashboard/page.tsx` — Página do dashboard
- `components/dashboard/` — KPI cards e tabela de leads
- `components/ui/` — Button, Card, Badge, Input, Select, Table
- `lib/mock-data.ts` — Dados fictícios (substituir por API depois)
- `types/index.ts` — Interface `Transaction` e status de pagamento

## Integração com o site (leads)

As solicitações do formulário **Solicitar Atestado** (página estática do projeto) podem ser enviadas para este dashboard.

1. **API de leads:** `GET /api/leads` (lista todos os leads; mock + enviados pelo formulário) e `POST /api/leads` (recebe um novo lead em JSON).
2. **Formulário estático:** Em `script.js` a variável `API_LEADS_URL` aponta para `http://localhost:3000/api/leads`. Para produção, defina `window.API_LEADS_URL` antes do script (ex.: `https://seu-dominio.com/api/leads`).
3. **Persistência:** Os leads enviados pelo POST são salvos em `dashboard/data/leads.json`. O dashboard carrega mock + esse arquivo ao abrir a página. Em ambiente serverless (ex.: Vercel), o arquivo pode não persistir entre deploys; para produção use um banco de dados.

**Como testar:** Com o dashboard rodando (`npm run dev` na pasta `dashboard`), abra o site estático (ex.: `solicitar.html`), preencha e envie o formulário. O novo lead aparecerá na tabela do dashboard (status "Pix Gerado").

## Funcionalidades

- **KPIs:** Total de leads, Pix gerados (aguardando), Faturamento total (pagos), Taxa de conversão
- **Tabela:** Colunas Nome, WhatsApp/E-mail, Tipo de atestado, Valor, Data, Status
- **Status:** Pix Gerado (amarelo), Pago (verde), Cancelado/Expirado (vermelho)
- **Filtro** por status e **busca** por nome ou e-mail
- **Paginação** (5 itens por página)
