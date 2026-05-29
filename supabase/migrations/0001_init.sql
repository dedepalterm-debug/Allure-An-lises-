-- Imóvel Viável — schema inicial (PRD seção 5).
-- Aplicar no projeto Supabase (SQL editor ou `supabase db push`).

create extension if not exists "pgcrypto";

-- Benchmarks de mercado por bairro (editáveis sem deploy — RNF-06).
create table if not exists public.bairros (
  id             uuid primary key default gen_random_uuid(),
  bairro         text not null,
  cidade         text not null,
  tipo           text not null check (tipo in ('Alto Padrão','Médio-Alto','Médio','Popular')),
  preco_m2       numeric not null,
  aluguel_m2     numeric not null,
  valorizacao    numeric not null default 0,
  cap_rate       numeric not null default 0,
  prioridade     boolean not null default false,
  fonte          text,
  atualizado_em  date not null default current_date
);

-- Operações analisadas (histórico — RF-14).
create table if not exists public.operacoes (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid,                       -- preenchido quando houver auth (Fase 2)
  created_at         timestamptz not null default now(),
  mode               text not null check (mode in ('flip','rent')),
  usa_financiamento  boolean not null default false,
  inputs             jsonb not null,
  resultado          jsonb not null,
  bairro             text,
  veredicto          boolean not null
);

create index if not exists operacoes_created_at_idx on public.operacoes (created_at desc);
create index if not exists bairros_cidade_idx on public.bairros (cidade);

-- RLS: na v1 (sessão anônima) liberamos leitura/escrita via anon key.
-- Endurecer na Fase 2 ao introduzir Supabase Auth (filtrar por auth.uid()).
alter table public.bairros enable row level security;
alter table public.operacoes enable row level security;

drop policy if exists "bairros_read" on public.bairros;
create policy "bairros_read" on public.bairros for select using (true);

drop policy if exists "operacoes_anon_all" on public.operacoes;
create policy "operacoes_anon_all" on public.operacoes
  for all using (true) with check (true);
