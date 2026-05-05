-- =============================================
-- SECRETARIA APP - Tabelas Supabase
-- Rode este SQL no SQL Editor do Supabase
-- =============================================

-- Tabela de Anotações
CREATE TABLE anotacoes (
  id BIGSERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  conteudo TEXT DEFAULT '',
  cor TEXT DEFAULT 'yellow',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Viagens
CREATE TABLE viagens (
  id BIGSERIAL PRIMARY KEY,
  viajante TEXT NOT NULL,
  cargo TEXT DEFAULT '',
  origem TEXT DEFAULT '',
  destino TEXT NOT NULL,
  motivo_viagem TEXT DEFAULT '',
  data_ida DATE,
  data_volta DATE,
  voo_ida TEXT DEFAULT '',
  cia_ida TEXT DEFAULT '',
  horario_ida TEXT DEFAULT '',
  aeroporto_ida TEXT DEFAULT '',
  voo_volta TEXT DEFAULT '',
  cia_volta TEXT DEFAULT '',
  horario_volta TEXT DEFAULT '',
  aeroporto_volta TEXT DEFAULT '',
  hotel TEXT DEFAULT '',
  endereco_hotel TEXT DEFAULT '',
  check_in DATE,
  check_out DATE,
  reserva_hotel TEXT DEFAULT '',
  status TEXT DEFAULT 'planejada',
  observacoes TEXT DEFAULT '',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Eventos
CREATE TABLE eventos (
  id BIGSERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT DEFAULT '',
  data DATE,
  horario TEXT DEFAULT '',
  local TEXT DEFAULT '',
  tipo TEXT DEFAULT 'outro',
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar acesso público (sem autenticação)
ALTER TABLE anotacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE viagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso público anotacoes" ON anotacoes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acesso público viagens" ON viagens
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acesso público eventos" ON eventos
  FOR ALL USING (true) WITH CHECK (true);
