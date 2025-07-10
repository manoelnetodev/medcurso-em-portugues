/*
  # Create respostas_questoes table
  1. New Tables: respostas_questoes (id uuid, user_id uuid, questao_id uuid, respondido_em timestamptz, acertou boolean)
  2. Security: Enable RLS, add policies for insert (self), select (all for aggregation)
*/
CREATE TABLE IF NOT EXISTS respostas_questoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  questao_id uuid NOT NULL, -- Assuming 'questoes' table exists or will be created
  respondido_em timestamptz DEFAULT now() NOT NULL,
  acertou boolean NOT NULL
);

ALTER TABLE respostas_questoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own responses." ON respostas_questoes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow all users to select responses for public ranking aggregation
CREATE POLICY "Responses are viewable by everyone for ranking." ON respostas_questoes
  FOR SELECT USING (true);

-- Add index for faster queries by user and time
CREATE INDEX IF NOT EXISTS idx_respostas_questoes_user_id_respondido_em ON respostas_questoes (user_id, respondido_em DESC);
