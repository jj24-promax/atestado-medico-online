# Deploy do projeto na Vercel

O projeto tem **duas partes**: o **site estático** (landing + formulários) e o **dashboard** (Next.js + API). Na Vercel você pode usar **dois projetos** no mesmo repositório, cada um com um diretório raiz diferente.

---

## Visão geral

| Projeto   | O que é              | URL exemplo                    |
|----------|-----------------------|--------------------------------|
| **Site** | HTML, CSS, JS (raiz)  | `atestado-site.vercel.app`     |
| **Dashboard** | Next.js (pasta `dashboard`) | `atestado-dashboard.vercel.app` |

A API de leads fica no **dashboard** (`/api/leads`). O site envia os formulários para essa API; por isso o site precisa saber a URL do dashboard em produção.

---

## Passo 1 — Subir o repositório no GitHub

1. Crie um repositório no GitHub (se ainda não tiver).
2. No terminal, na pasta do projeto:

```bash
git init
git add .
git commit -m "Projeto atestado + dashboard"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git push -u origin main
```

(Substitua `SEU_USUARIO` e `SEU_REPO` pelos seus dados.)

---

## Passo 2 — Deploy do Dashboard (API + painel admin)

1. Acesse [vercel.com](https://vercel.com) e faça login (GitHub).
2. **Add New** → **Project**.
3. **Import** o repositório do projeto.
4. **Importante:** em **Root Directory** clique em **Edit** e escolha: **`dashboard`**.
5. **Framework Preset** deve aparecer como **Next.js** (deixe assim).
6. **Environment Variables** (variáveis de ambiente):
   - Se usar **Supabase**, adicione:
     - `NEXT_PUBLIC_SUPABASE_URL` = URL do projeto Supabase  
     - `SUPABASE_SERVICE_ROLE_KEY` = chave `service_role` do Supabase  
   - Se não usar Supabase, pode deixar em branco (a API usará arquivo; em serverless não persiste entre deploys).
7. Clique em **Deploy**.
8. Quando terminar, anote a URL do projeto (ex.: `https://atestado-dashboard-xxx.vercel.app`). Você vai usar essa URL no site.

---

## Passo 3 — Configurar o site para apontar para o dashboard

Antes de fazer o deploy do site, o formulário precisa saber a URL da API (dashboard).

1. Abra o arquivo **`config-api.js`** na raiz do projeto.
2. Troque a URL de desenvolvimento pela URL do dashboard na Vercel:

```js
// Antes (desenvolvimento):
window.API_BASE_URL = "http://localhost:3000";

// Depois (produção) — use a URL do seu projeto Dashboard na Vercel:
window.API_BASE_URL = "https://atestado-dashboard-xxx.vercel.app";
window.API_LEADS_URL = window.API_BASE_URL + "/api/leads";
```

3. Salve e faça commit:

```bash
git add config-api.js
git commit -m "Config: API apontando para dashboard na Vercel"
git push
```

---

## Passo 4 — Deploy do Site (landing + formulários)

1. Na Vercel: **Add New** → **Project**.
2. **Import** o **mesmo repositório** de novo.
3. Dê um nome diferente (ex.: `atestado-site`).
4. **Root Directory**: deixe **`.`** (raiz do repositório).
5. **Framework Preset**: escolha **Other** (site estático, sem build).
6. **Build Command**: deixe em branco ou remova.
7. **Output Directory**: deixe em branco (a raiz é o “output”).
8. Clique em **Deploy**.

Se a Vercel reclamar de build, o `vercel.json` na raiz do projeto já está configurado para publicar os arquivos estáticos. Faça o deploy de novo.

---

## Passo 5 — Domínios (opcional)

- No projeto **Dashboard**: **Settings** → **Domains** → adicione um domínio (ex.: `dashboard.seudominio.com`).
- No projeto **Site**: **Settings** → **Domains** → adicione um domínio (ex.: `seudominio.com` ou `www.seudominio.com`).

Se mudar o domínio do dashboard, atualize de novo o **`config-api.js`** com a nova URL e faça um novo deploy do site.

---

## Checklist

- [ ] Repositório no GitHub com o código atualizado  
- [ ] Projeto **Dashboard** na Vercel com **Root Directory** = `dashboard`  
- [ ] Variáveis de ambiente do Supabase no projeto Dashboard (se usar)  
- [ ] URL do dashboard anotada  
- [ ] **config-api.js** com `API_BASE_URL` apontando para a URL do dashboard  
- [ ] Commit e push do `config-api.js`  
- [ ] Projeto **Site** na Vercel com **Root Directory** = `.` (raiz)  
- [ ] Teste: abrir o site, enviar o formulário “Solicitar Atestado” e conferir o lead no dashboard  

---

## Resumo das URLs

| Ambiente   | Site (formulário)      | Dashboard + API           |
|-----------|-------------------------|----------------------------|
| Local     | `http://localhost:3000` (serve) ou Live Server | `http://localhost:3000` (Next.js na pasta `dashboard`) |
| Vercel    | `https://seu-site.vercel.app` | `https://seu-dashboard.vercel.app` e `https://seu-dashboard.vercel.app/api/leads` |

O site e o dashboard ficam linkados pela mesma API: o **dashboard** na Vercel é quem hospeda a API; o **site** só precisa estar com **config-api.js** apontando para a URL desse dashboard.
