# 🏠 Imóvel Viável

Sistema de análise de viabilidade de investimento imobiliário. Avalia operações
de **flip** (compra-reforma-revenda) e **locação**, calcula os indicadores
financeiros relevantes e emite um veredicto objetivo **GO / NO-GO** com base em
critérios configuráveis — incluindo análise de **alavancagem** (ROI sobre
capital próprio), **benchmarks de mercado** por bairro e **análise qualitativa
por IA**.

Stack: **Next.js (App Router) + TypeScript + Tailwind + Supabase + Anthropic API**, com deploy alvo no **Vercel**.

---

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # opcional — veja abaixo
npm run dev                  # http://localhost:3000
```

O app **funciona sem nenhuma configuração**: sem Supabase o histórico usa
`localStorage` e os benchmarks usam o seed local. Sem chave da Anthropic, toda a
análise numérica funciona; apenas a análise qualitativa por IA fica indisponível.

### Variáveis de ambiente

| Variável | Necessária | Descrição |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | opcional | URL do projeto Supabase. Sem ela, usa `localStorage`. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | opcional | Anon key do Supabase. |
| `ANTHROPIC_API_KEY` | opcional | Habilita a análise por IA. **Só no servidor**, nunca exposta ao cliente (RF-18). |
| `ANTHROPIC_MODEL` | opcional | Modelo Claude (default `claude-sonnet-4-6`). |

### Banco de dados (Supabase)

Aplique a migração e o seed:

```sql
-- supabase/migrations/0001_init.sql   (tabelas operacoes e bairros)
-- supabase/seed.sql                   (benchmarks de Ribeirão Preto + refs)
```

Os benchmarks vivem na tabela `bairros` (editável sem deploy — RNF-06).

---

## Scripts

| Comando | Ação |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm test` | Testes unitários das fórmulas financeiras (Vitest) |
| `npm run lint` | ESLint (next) |

---

## Arquitetura

```
Cliente (Next.js/React)          API Route (/api/ai)         Supabase
  • UI + cálculos em tempo real    • proxy seguro Anthropic     • operacoes
  • estado da análise              • chave em env var           • bairros
  • veredicto GO/NO-GO
```

- **Cálculos** (`src/lib/finance.ts`): puros, no cliente, instantâneos (RNF-01),
  cobertos por testes de referência (RNF-07).
- **Persistência** (`src/lib/storage.ts`): Supabase quando configurado, com
  fallback transparente para `localStorage`.
- **IA** (`src/app/api/ai/route.ts`): a chamada à Anthropic ocorre no backend; a
  chave nunca chega ao cliente.

### Principais arquivos

```
src/lib/finance.ts        Motor de cálculo (Price, TIR, VPL, cap rate, alavancagem)
src/lib/finance.test.ts   36 testes com casos de referência conferidos à mão
src/lib/types.ts          Tipos do domínio
src/lib/storage.ts        Histórico + benchmarks (Supabase / localStorage)
src/lib/benchmarks.ts     Seed de bairros (Ribeirão Preto em destaque)
src/app/api/ai/route.ts   Análise qualitativa por IA (backend)
src/components/            UI (Análise, Mercado, Histórico, IA, Veredicto)
supabase/                 Migração + seed
```

---

## Fórmulas (seção 6 do PRD)

Implementadas em `src/lib/finance.ts` e validadas por testes:

- **Total investido** = compra + reforma + transação + outros
- **Tabela Price**: `PMT = PV·i(1+i)^n / [(1+i)^n − 1]`
- **Saldo devedor**: `PV(1+i)^k − PMT·[(1+i)^k − 1]/i`
- **ROI s/ capital próprio (flip alavancado)**:
  `(venda − corretagem − saldo − parcelas pagas − capital próprio) / capital próprio`
- **Multiplicador de alavancagem** = ROI equity / ROI total
- **Cap rate** = NOI anual / valor do imóvel
- **Cashflow após financiamento** = cashflow operacional − parcela
- **TIR** por bisseção sobre os fluxos; **VPL** descontado ao custo de capital.

---

## Decisões da v1 (questões em aberto do PRD)

Defaults adotados nesta entrega (Fase 1 — MVP); revisáveis nas próximas fases:

- **Autenticação**: sessão anônima (sem login). Auth via Supabase Auth fica para
  a Fase 2 — o schema já reserva `operacoes.user_id`.
- **Supabase opcional**: o app roda out-of-the-box com `localStorage`; ao
  configurar as env vars, passa a persistir no banco.
- **Benchmarks**: atualização manual via tabela `bairros` (seed inicial 2025).
- **IA**: sob demanda, sem limite de uso configurado ainda (ver Fase 3 / custo).

---

## Roadmap

- **Fase 1 (este MVP)** ✅ — projeto Next.js, cálculos + veredicto, benchmarks,
  histórico (Supabase/localStorage), IA via API route segura, schema Supabase.
- **Fase 2** — Supabase Auth + histórico por usuário, painel admin de
  benchmarks, exportação em PDF (testes de fórmulas já incluídos aqui).
- **Fase 3** — mais cidades, comparação lado a lado, cenários, integração
  FipeZAP, gráficos de sensibilidade.

---

## Disclaimer

O Imóvel Viável é uma ferramenta de apoio à decisão e cálculo. Os resultados são
estimativas baseadas nos dados inseridos e em benchmarks de mercado que podem
variar. **Não constitui aconselhamento financeiro, jurídico ou de investimento.**
Toda decisão deve ser validada com profissionais qualificados e due diligence
apropriada.
