CREATE TABLE IF NOT EXISTS public.solicitacoes_parceria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  nome_empresa text NOT NULL CHECK (char_length(btrim(nome_empresa)) BETWEEN 2 AND 120),
  cnpj text CHECK (cnpj IS NULL OR cnpj ~ '^\d{14}$'),
  responsavel text NOT NULL CHECK (char_length(btrim(responsavel)) BETWEEN 2 AND 120),
  whatsapp text NOT NULL CHECK (whatsapp ~ '^\d{10,13}$'),
  cidade text NOT NULL CHECK (char_length(btrim(cidade)) BETWEEN 2 AND 100),
  estado text NOT NULL CHECK (estado IN (
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
    'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
    'SP', 'SE', 'TO'
  )),
  categoria text,
  cota text CHECK (cota IS NULL OR cota IN ('Ouro', 'Prata', 'Bronze')),
  mensagem text NOT NULL CHECK (char_length(btrim(mensagem)) BETWEEN 2 AND 1000),
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_atendimento', 'concluida')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.solicitacoes_parceria ENABLE ROW LEVEL SECURITY;
GRANT INSERT ON public.solicitacoes_parceria TO anon, authenticated;

DROP POLICY IF EXISTS "Visitantes podem solicitar parceria" ON public.solicitacoes_parceria;
CREATE POLICY "Visitantes podem solicitar parceria"
  ON public.solicitacoes_parceria FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.cupons_desconto (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coupon_slug text NOT NULL CHECK (coupon_slug IN ('cimento-argamassa', 'locacao-betoneira', 'ferramentas-obra')),
  redemption_code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, coupon_slug)
);

ALTER TABLE public.cupons_desconto ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.cupons_desconto TO authenticated;

DROP POLICY IF EXISTS "Usuários veem seus próprios cupons" ON public.cupons_desconto;
CREATE POLICY "Usuários veem seus próprios cupons"
  ON public.cupons_desconto FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários resgatam seus próprios cupons" ON public.cupons_desconto;
CREATE POLICY "Usuários resgatam seus próprios cupons"
  ON public.cupons_desconto FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
