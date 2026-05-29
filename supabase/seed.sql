-- Seed da tabela `bairros` (Ribeirão Preto em destaque + referências).
-- Fonte: FipeZAP, CRECISP, Apto.vc, KoreImob e fontes locais (2025).

insert into public.bairros (bairro, cidade, tipo, preco_m2, aluguel_m2, valorizacao, cap_rate, prioridade, fonte, atualizado_em) values
  ('Jardim Botânico', 'Ribeirão Preto', 'Alto Padrão', 9800, 38, 8.5, 5.2, true, 'FipeZAP/Apto.vc 2025', '2025-01-01'),
  ('Jardim Canadá',   'Ribeirão Preto', 'Alto Padrão', 9200, 36, 7.8, 5.4, true, 'CRECISP/KoreImob 2025', '2025-01-01'),
  ('Ribeirânia',      'Ribeirão Preto', 'Médio-Alto',  7400, 33, 6.9, 5.8, true, 'FipeZAP 2025', '2025-01-01'),
  ('Jardim Irajá',    'Ribeirão Preto', 'Médio-Alto',  7000, 31, 6.5, 5.9, true, 'Apto.vc 2025', '2025-01-01'),
  ('Vila Tibério',    'Ribeirão Preto', 'Médio',       5200, 27, 5.8, 6.6, true, 'CRECISP 2025', '2025-01-01'),
  ('Campos Elíseos',  'Ribeirão Preto', 'Popular',     3600, 22, 4.9, 7.5, true, 'KoreImob 2025', '2025-01-01'),
  ('Centro',          'Ribeirão Preto', 'Médio',       4800, 28, 4.2, 7.1, true, 'FipeZAP 2025', '2025-01-01'),
  ('Pinheiros',       'São Paulo',      'Alto Padrão', 14500, 55, 7.0, 4.6, false, 'FipeZAP 2025', '2025-01-01'),
  ('Mooca',           'São Paulo',      'Médio-Alto',  9800, 42, 6.2, 5.1, false, 'FipeZAP 2025', '2025-01-01'),
  ('Cambuí',          'Campinas',       'Alto Padrão', 10200, 44, 6.8, 5.2, false, 'FipeZAP 2025', '2025-01-01');
