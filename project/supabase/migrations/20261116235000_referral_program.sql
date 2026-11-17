ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_points integer NOT NULL DEFAULT 0
    CHECK (referral_points >= 0);

CREATE TABLE IF NOT EXISTS public.indicacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicador_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  indicado_user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmada')),
  pontos integer NOT NULL DEFAULT 0 CHECK (pontos >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz,
  CHECK (indicador_user_id <> indicado_user_id),
  CHECK ((status = 'pendente' AND pontos = 0 AND confirmed_at IS NULL)
      OR (status = 'confirmada' AND pontos = 10 AND confirmed_at IS NOT NULL))
);

ALTER TABLE public.indicacoes ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.indicacoes TO authenticated;

DROP POLICY IF EXISTS "Indicadores veem apenas suas indicacoes" ON public.indicacoes;
CREATE POLICY "Indicadores veem apenas suas indicacoes"
  ON public.indicacoes FOR SELECT TO authenticated
  USING (auth.uid() = indicador_user_id);

CREATE OR REPLACE FUNCTION public.record_referral_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  referrer_id uuid;
  initially_confirmed boolean := NEW.email_confirmed_at IS NOT NULL;
BEGIN
  IF COALESCE(NEW.raw_user_meta_data ->> 'referrer_user_id', '') !~
    '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$' THEN
    RETURN NEW;
  END IF;

  referrer_id := (NEW.raw_user_meta_data ->> 'referrer_user_id')::uuid;
  IF referrer_id = NEW.id OR NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = referrer_id
  ) THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.indicacoes (
    indicador_user_id, indicado_user_id, status, pontos, confirmed_at
  )
  VALUES (
    referrer_id,
    NEW.id,
    CASE WHEN initially_confirmed THEN 'confirmada' ELSE 'pendente' END,
    CASE WHEN initially_confirmed THEN 10 ELSE 0 END,
    CASE WHEN initially_confirmed THEN now() ELSE NULL END
  )
  ON CONFLICT (indicado_user_id) DO NOTHING;

  IF initially_confirmed THEN
    UPDATE public.profiles
    SET referral_points = referral_points + 10
    WHERE user_id = referrer_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_referral ON auth.users;
CREATE TRIGGER on_auth_user_created_referral
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.record_referral_signup();

CREATE OR REPLACE FUNCTION public.confirm_referral_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    WITH confirmed_referral AS (
      UPDATE public.indicacoes
      SET status = 'confirmada', pontos = 10, confirmed_at = now()
      WHERE indicado_user_id = NEW.id AND status = 'pendente'
      RETURNING indicador_user_id
    )
    UPDATE public.profiles AS profile
    SET referral_points = profile.referral_points + 10
    FROM confirmed_referral
    WHERE profile.user_id = confirmed_referral.indicador_user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_confirmed_referral ON auth.users;
CREATE TRIGGER on_auth_user_confirmed_referral
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.confirm_referral_signup();
