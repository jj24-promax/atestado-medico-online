# Plano: Vincular o projeto ao Supabase

Este guia descreve os passos para conectar o **site de atestados** e o **dashboard** ao Supabase, substituindo o armazenamento em arquivo (`data/leads.json`) por um banco de dados real.

---

## Visão geral

| Componente        | Hoje                    | Com Supabase                    |
|-------------------|-------------------------|---------------------------------|
| Leads (solicitações) | Salvos em `dashboard/data/leads.json` | Tabela `leads` no Supabase      |
| API `/api/leads`  | Lê/escreve arquivo      | Lê/escreve no Supabase          |
| Formulário (site estático) | POST para a API do dashboard | Sem mudança (continua POST na mesma API) |

---

## Fase 1 — Conta e projeto no Supabase

1. **Criar conta**
   - Acesse [supabase.com](https://supabase.com) e clique em **Start your project**.
   - Faça login com GitHub ou e-mail.

2. **Criar um projeto**
   - **New project**.
   - **Organization:** use a padrão ou crie uma.
   - **Name:** ex. `atestado-medico`.
   - **Database Password:** defina e guarde em local seguro (você vai usar no `.env`).
   - **Region:** escolha a mais próxima (ex.: South America (São Paulo)).
   - Clique em **Create new project** e aguarde a criação.

3. **Anotar as chaves**
   - No menu lateral: **Project Settings** (ícone de engrenagem) → **API**.
   - Anote:
     - **Project URL** (ex.: `https://xxxxx.supabase.co`)
     - **anon public** (chave pública, pode ir no front)
     - **service_role** (chave secreta; só no backend, nunca no front)

---

## Fase 2 — Tabela no banco

1. No Supabase: **SQL Editor** → **New query**.

2. Cole e execute o SQL abaixo (cria a tabela `leads` alinhada ao seu tipo `Transaction` e aos dados do formulário):

```sql
-- Tabela de leads (solicitações de atestado)
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  email text not null,
  whatsapp text not null,
  cpf text,
  certificate_type text not null default 'Atestado Médico',
  payment_status text not null default 'pending_pix',
  amount numeric(10,2) not null default 39.9,
  -- Campos extras do formulário (opcional)
  sintomas text,
  dias text,
  data_inicio text,
  created_at timestamptz not null default now()
);

-- Índice para listar por data (dashboard)
create index if not exists idx_leads_created_at on public.leads (created_at desc);

-- (Opcional) Habilitar RLS e permitir apenas o backend com service_role acessar
alter table public.leads enable row level security;

-- Política: leitura e escrita via service_role (API do Next.js)
create policy "API full access to leads"
  on public.leads
  for all
  using (true)
  with check (true);
```

3. Confirme em **Table Editor** que a tabela `leads` foi criada.

---

## Fase 3 — Variáveis de ambiente no dashboard

1. Na pasta do dashboard, crie (ou edite) o arquivo **`.env.local`**:

```bash
# Supabase (substitua pelos valores do seu projeto)
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service_role-key-aqui
```

2. **Substitua:**
   - `NEXT_PUBLIC_SUPABASE_URL` → **Project URL** do Supabase.
   - `SUPABASE_SERVICE_ROLE_KEY` → chave **service_role** (API).

3. **Importante:**  
   - Não commite `.env.local` no Git (ele já deve estar no `.gitignore` do Next.js).  
   - Em produção (Vercel, etc.), configure as mesmas variáveis no painel do provedor.

---

## Fase 4 — Instalar cliente Supabase no dashboard

Na pasta do dashboard:

```bash
cd dashboard
npm install @supabase/supabase-js
```

---

## Fase 5 — Código no projeto

### 5.1 Cliente Supabase (servidor)

Criar **`dashboard/lib/supabase-server.ts`** para uso nas API Routes (com `service_role`):

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
```

### 5.2 Ajustar a API de leads

Alterar **`dashboard/app/api/leads/route.ts`** para:

- **GET:** buscar todos os registros da tabela `leads` (e, se quiser, mesclar com mock ou só usar o banco).
- **POST:** fazer `insert` na tabela `leads` com os dados do body (nome, email, telefone, amount, etc.), mapeando para as colunas (ex.: `customer_name`, `whatsapp`, `certificate_type`, `payment_status`, `amount`, `sintomas`, `dias`, `data_inicio`).

A API continua recebendo o mesmo JSON do formulário; apenas a persistência deixa de ser em arquivo e passa a ser no Supabase.

### 5.3 Tipos / mapeamento

- O tipo `Transaction` do dashboard pode ser mantido; no Supabase as colunas são em snake_case (`customer_name`, `created_at`).
- No SELECT, use `select()` com os nomes das colunas e mapeie no código para `customerName`, `createdAt`, etc., ou use alias no SQL.

---

## Fase 6 — (Opcional) Site estático em outro domínio

Se o formulário (`solicitar.html`) estiver em outro domínio:

- A API do Next.js já envia **CORS**; desde que a URL do dashboard esteja em `Access-Control-Allow-Origin`, o POST do formulário continua funcionando.
- Em produção, defina `window.API_LEADS_URL` no site estático para a URL do dashboard (ex.: `https://seu-dashboard.vercel.app/api/leads`).

Nenhuma chave do Supabase precisa ficar no site estático; apenas a URL da API.

---

## Checklist final

- [ ] Conta e projeto criados no Supabase  
- [ ] Tabela `leads` criada (SQL executado)  
- [ ] `.env.local` no dashboard com `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`  
- [ ] `@supabase/supabase-js` instalado no dashboard  
- [ ] `lib/supabase-server.ts` criado  
- [ ] `app/api/leads/route.ts` atualizado para GET/POST usando Supabase  
- [ ] Teste: enviar um lead pelo formulário e conferir na tabela no Supabase e no dashboard  
- [ ] Em produção: mesmas env vars configuradas no provedor de hospedagem  

---

## Resumo de arquivos a criar/alterar

| Ação   | Arquivo |
|--------|---------|
| Criar  | `dashboard/lib/supabase-server.ts` |
| Editar | `dashboard/app/api/leads/route.ts` (trocar leitura/escrita de arquivo por Supabase) |
| Criar  | `dashboard/.env.local` (e configurar em produção no provedor) |

Depois de seguir este plano, todas as solicitações de atestado passam a ser salvas no Supabase e exibidas no dashboard.

---

## Código já preparado no projeto

O projeto já está preparado para usar Supabase quando as variáveis de ambiente estiverem definidas:

- **`dashboard/lib/supabase-server.ts`** — Cliente Supabase (servidor). Se `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` não estiverem definidos, o cliente fica `null`.
- **`dashboard/app/api/leads/route.ts`** — Se o Supabase estiver configurado, a API usa a tabela `leads`; caso contrário, continua usando o arquivo `data/leads.json`.

Basta seguir as Fases 1 a 4 (conta, tabela, `.env.local`, `npm install @supabase/supabase-js`) e reiniciar o dashboard.
