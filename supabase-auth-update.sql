-- =============================================
-- ATUALIZAÇÃO: Adicionar user_id e RLS por usuário
-- Rode este SQL no SQL Editor do Supabase
-- =============================================

-- Adicionar coluna user_id nas tabelas existentes
ALTER TABLE anotacoes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE viagens ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Remover policies antigas
DROP POLICY IF EXISTS "Acesso público anotacoes" ON anotacoes;
DROP POLICY IF EXISTS "Acesso público viagens" ON viagens;
DROP POLICY IF EXISTS "Acesso público eventos" ON eventos;

-- Novas policies: cada usuário só vê/edita seus próprios dados
CREATE POLICY "Usuário vê suas anotacoes" ON anotacoes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuário insere suas anotacoes" ON anotacoes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário atualiza suas anotacoes" ON anotacoes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuário deleta suas anotacoes" ON anotacoes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Usuário vê suas viagens" ON viagens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuário insere suas viagens" ON viagens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário atualiza suas viagens" ON viagens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuário deleta suas viagens" ON viagens
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Usuário vê seus eventos" ON eventos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuário insere seus eventos" ON eventos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário atualiza seus eventos" ON eventos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuário deleta seus eventos" ON eventos
  FOR DELETE USING (auth.uid() = user_id);
