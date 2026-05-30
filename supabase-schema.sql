-- Schema para o histórico de operações do Imóvel Viável (Supabase / Postgres)
-- Rode no SQL Editor do seu projeto Supabase.

create table if not exists public.operacoes (
  chave        text primary key,
  valor        jsonb not null,
  criado_em    timestamptz not null default now()
);

-- Index para buscas por prefixo (hist:)
create index if not exists idx_operacoes_chave on public.operacoes (chave text_pattern_ops);

-- RLS: para um app de uso pessoal/single-tenant, libere acesso anônimo de leitura/escrita.
-- AJUSTE conforme sua necessidade de segurança antes de produção real.
alter table public.operacoes enable row level security;

create policy "acesso_publico_leitura"  on public.operacoes for select using (true);
create policy "acesso_publico_escrita"  on public.operacoes for insert with check (true);
create policy "acesso_publico_update"   on public.operacoes for update using (true);
create policy "acesso_publico_delete"   on public.operacoes for delete using (true);
