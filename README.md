# Imóvel Viável

Sistema de análise de viabilidade de investimento imobiliário. Três modos de operação — **Flip**, **Locação** e **Construção** — com análise de **alavancagem** (ROI sobre capital próprio), **benchmarks de mercado** reais (Ribeirão Preto priorizado) e **análise qualitativa por IA**.

Abas: **Análise** · **Mercado** · **Portfólio** · **Histórico**.

---

## Stack

- **Next.js 14** (App Router)
- **React 18**
- **Anthropic API** (análise de IA, via API route segura)
- Persistência: **localStorage** por padrão; **Supabase** opcional (banco Postgres)

---

## Rodando localmente

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# edite .env.local e coloque sua ANTHROPIC_API_KEY

# 3. Rodar em desenvolvimento
npm run dev
# abre em http://localhost:3000
```

Sem a `ANTHROPIC_API_KEY` o app funciona normalmente — apenas a aba de Análise de IA exibirá um aviso de configuração ausente.

---

## Deploy no Vercel

1. Suba o projeto para um repositório no GitHub:
   ```bash
   git init
   git add .
   git commit -m "Imóvel Viável - versão inicial"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/imovel-viavel.git
   git push -u origin main
   ```

2. Acesse [vercel.com](https://vercel.com), clique em **Add New → Project** e importe o repositório.

3. Em **Environment Variables**, adicione:
   - `ANTHROPIC_API_KEY` = sua chave da Anthropic
   - (opcional) `ANTHROPIC_MODEL` = `claude-sonnet-4-6`

4. Clique em **Deploy**. Pronto — o Vercel detecta Next.js automaticamente.

---

## Ativando banco de dados (Supabase) — opcional

Por padrão o histórico é salvo no navegador (localStorage). Para persistir num banco real, compartilhado entre dispositivos:

1. Crie um projeto em [supabase.com](https://supabase.com).

2. No **SQL Editor**, rode o conteúdo de [`supabase-schema.sql`](./supabase-schema.sql).

3. Instale o cliente:
   ```bash
   npm install @supabase/supabase-js
   ```

4. Em `lib/storage.js`, troque o export do final do arquivo:
   ```js
   import { supabaseDriver } from "./storage.supabase";
   export const storage = supabaseDriver;
   ```

5. Adicione as variáveis (local e no Vercel):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> **Atenção:** o schema vem com RLS liberado para acesso anônimo (uso pessoal/single-tenant). Antes de um uso multiusuário/produção, ajuste as políticas e adicione autenticação (Supabase Auth).

---

## Estrutura

```
imovel-viavel/
├── app/
│   ├── layout.jsx           # layout raiz
│   ├── page.jsx             # aplicação completa (4 abas)
│   └── api/
│       └── analise/
│           └── route.js     # proxy seguro para a Anthropic API
├── lib/
│   ├── storage.js           # driver de armazenamento (localStorage por padrão)
│   └── storage.supabase.js  # driver Supabase (opcional)
├── supabase-schema.sql      # schema do banco
├── .env.example
├── package.json
└── next.config.js
```

---

## Notas

- Os cálculos financeiros (ROI, TIR, VPL, Tabela Price, cap rate, alavancagem) rodam no cliente, instantaneamente.
- A chamada de IA passa pela API route `/api/analise`, mantendo a chave secreta no servidor.
- Os benchmarks de mercado estão embutidos em `app/page.jsx` (constante `MARKET`). Para torná-los editáveis sem deploy, mova-os para uma tabela `bairros` no Supabase (ver o PRD).
- O modelo de IA é configurável via `ANTHROPIC_MODEL`. Confira os modelos disponíveis na sua conta em [console.anthropic.com](https://console.anthropic.com).

---

Este é um sistema de apoio à decisão. Os resultados são estimativas e não constituem aconselhamento financeiro, jurídico ou de investimento.
