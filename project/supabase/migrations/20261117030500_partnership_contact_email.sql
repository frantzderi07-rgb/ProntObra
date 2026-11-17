ALTER TABLE public.solicitacoes_parceria
  ADD COLUMN IF NOT EXISTS email text;

ALTER TABLE public.solicitacoes_parceria
  ADD CONSTRAINT solicitacoes_parceria_email_required_check
  CHECK (
    email IS NOT NULL
    AND email = btrim(email)
    AND char_length(email) BETWEEN 6 AND 254
    AND email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ) NOT VALID;

DROP POLICY IF EXISTS "Visitantes podem solicitar parceria"
  ON public.solicitacoes_parceria;
CREATE POLICY "Visitantes podem solicitar parceria"
  ON public.solicitacoes_parceria FOR INSERT TO anon, authenticated
  WITH CHECK (
    status = 'pendente'
    AND (user_id IS NULL OR user_id = auth.uid())
    AND char_length(btrim(nome_empresa)) BETWEEN 2 AND 120
    AND char_length(btrim(responsavel)) BETWEEN 2 AND 120
    AND email IS NOT NULL
    AND email = btrim(email)
    AND char_length(email) BETWEEN 6 AND 254
    AND email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    AND whatsapp ~ '^\d{11}$'
    AND char_length(btrim(cidade)) BETWEEN 2 AND 100
    AND char_length(mensagem) BETWEEN 2 AND 1000
  );

REVOKE INSERT ON public.solicitacoes_parceria FROM anon, authenticated;
GRANT INSERT (
  nome_empresa, cnpj, responsavel, email, whatsapp, cidade, estado,
  categoria, tipo_parceria, cota, mensagem
) ON public.solicitacoes_parceria TO anon, authenticated;
