ALTER TABLE public.solicitacoes_parceria
  ADD COLUMN IF NOT EXISTS tipo_parceria text;

ALTER TABLE public.solicitacoes_parceria
  DROP CONSTRAINT IF EXISTS solicitacoes_parceria_tipo_parceria_check;

ALTER TABLE public.solicitacoes_parceria
  ADD CONSTRAINT solicitacoes_parceria_tipo_parceria_check
  CHECK (
    tipo_parceria IS NULL OR tipo_parceria IN (
      'Patrocinador (Ouro, Prata ou Bronze)',
      'Clube de Descontos / Cupons',
      'Loja Parceira / Divulgação',
      'Outro'
    )
  );
