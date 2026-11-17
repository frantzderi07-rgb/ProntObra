-- Profiles are private until an administrator approves them.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT false;

UPDATE public.profiles
SET is_approved = true
WHERE user_id IS NULL;

ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true;

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS reviewer_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.reviews
  ALTER COLUMN reviewer_user_id SET DEFAULT auth.uid();

CREATE UNIQUE INDEX IF NOT EXISTS reviews_profile_reviewer_unique_idx
  ON public.reviews (profile_id, reviewer_user_id)
  WHERE reviewer_user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.set_review_reviewer_name()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL OR NEW.reviewer_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'A avaliação deve pertencer ao usuário autenticado.';
  END IF;
  SELECT p.full_name INTO NEW.reviewer_name
  FROM public.profiles p
  WHERE p.user_id = auth.uid()
  LIMIT 1;
  IF NEW.reviewer_name IS NULL THEN
    RAISE EXCEPTION 'Cadastre um perfil antes de enviar uma avaliação.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_review_reviewer_name ON public.reviews;
CREATE TRIGGER set_review_reviewer_name
  BEFORE INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_review_reviewer_name();

ALTER TABLE public.jobs
  ADD CONSTRAINT jobs_title_length_check CHECK (char_length(btrim(title)) BETWEEN 2 AND 120) NOT VALID,
  ADD CONSTRAINT jobs_description_length_check CHECK (char_length(btrim(description)) BETWEEN 2 AND 5000) NOT VALID,
  ADD CONSTRAINT jobs_company_name_length_check CHECK (char_length(btrim(company_name)) BETWEEN 2 AND 120) NOT VALID,
  ADD CONSTRAINT jobs_city_length_check CHECK (char_length(btrim(city)) BETWEEN 2 AND 100) NOT VALID;

ALTER TABLE public.solicitacoes_parceria
  DROP CONSTRAINT IF EXISTS solicitacoes_parceria_whatsapp_check;
UPDATE public.solicitacoes_parceria
SET tipo_parceria = CASE
  WHEN cota IS NOT NULL THEN 'Patrocinador (Ouro, Prata ou Bronze)'
  WHEN categoria IN ('Lojas de materiais', 'Locadoras de equipamentos', 'Construtoras e imobiliárias') THEN 'Loja Parceira / Divulgação'
  ELSE 'Outro'
END
WHERE tipo_parceria IS NULL;
ALTER TABLE public.solicitacoes_parceria
  ADD CONSTRAINT solicitacoes_parceria_whatsapp_check CHECK (whatsapp ~ '^\d{11}$') NOT VALID;

ALTER TABLE public.solicitacoes_parceria
  ADD CONSTRAINT solicitacoes_parceria_tipo_parceria_required_check
  CHECK (tipo_parceria IS NOT NULL);

CREATE TABLE IF NOT EXISTS public.cupons (
  slug text PRIMARY KEY CHECK (slug IN ('cimento-argamassa', 'locacao-betoneira', 'ferramentas-obra')),
  discount text NOT NULL CHECK (char_length(btrim(discount)) BETWEEN 2 AND 40),
  title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 2 AND 120),
  partner text NOT NULL CHECK (char_length(btrim(partner)) BETWEEN 2 AND 160),
  detail text NOT NULL CHECK (char_length(btrim(detail)) BETWEEN 2 AND 500),
  is_active boolean NOT NULL DEFAULT true,
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (valid_until IS NULL OR valid_until > valid_from)
);

INSERT INTO public.cupons (slug, discount, title, partner, detail)
VALUES
  ('cimento-argamassa', '10% OFF', 'Cimento e argamassa', 'Lojas de materiais parceiros', 'Desconto sujeito à disponibilidade e às condições da loja.'),
  ('locacao-betoneira', '15% OFF', 'Locação de betoneiras', 'Locadoras parceiras', 'Consulte prazos, região de atendimento e disponibilidade.'),
  ('ferramentas-obra', 'Condição especial', 'Ferramentas para sua obra', 'Parceiros ProntObra', 'Apresente seu código ao parceiro para consultar a oferta vigente.')
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_private_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_ai_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_ai_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes_parceria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cupons_desconto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_approved_public" ON public.profiles;
CREATE POLICY "profiles_select_approved_public"
  ON public.profiles FOR SELECT TO anon, authenticated
  USING (is_approved = true AND user_type IN ('professional', 'company'));

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

REVOKE INSERT ON public.profiles FROM anon, authenticated;
REVOKE UPDATE ON public.profiles FROM anon, authenticated;
GRANT UPDATE (
  full_name, email, phone, avatar_url, specialty, specialties, experience_years,
  city, state, service_radius, bio, is_available, company_cnpj, whatsapp_number,
  whatsapp_alerts_enabled, whatsapp_feed_enabled, whatsapp_recommendations_enabled
) ON public.profiles TO authenticated;
GRANT UPDATE (is_approved, is_featured, referral_points) ON public.profiles TO service_role;

DROP POLICY IF EXISTS "portfolio_select_public" ON public.portfolio_photos;
CREATE POLICY "portfolio_select_public"
  ON public.portfolio_photos FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = portfolio_photos.profile_id AND p.is_approved = true
  ));

DROP POLICY IF EXISTS "portfolio_select_own" ON public.portfolio_photos;
CREATE POLICY "portfolio_select_own"
  ON public.portfolio_photos FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = portfolio_photos.profile_id AND p.user_id = auth.uid()
  ));

REVOKE UPDATE ON public.portfolio_photos FROM authenticated;
GRANT UPDATE (profile_id, image_url, caption) ON public.portfolio_photos TO authenticated;
REVOKE INSERT ON public.portfolio_photos FROM authenticated;
GRANT INSERT (profile_id, image_url, caption) ON public.portfolio_photos TO authenticated;

DROP POLICY IF EXISTS "jobs_select_public" ON public.jobs;
CREATE POLICY "jobs_select_public"
  ON public.jobs FOR SELECT TO anon, authenticated
  USING (
    auth.uid() = user_id
    OR (
      status = 'open'
      AND (
        user_id IS NULL
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.user_id = jobs.user_id AND p.is_approved = true
        )
      )
    )
  );

DROP POLICY IF EXISTS "jobs_insert_own" ON public.jobs;
CREATE POLICY "jobs_insert_own"
  ON public.jobs FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'open'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.user_type IN ('company', 'professional')
        AND p.is_approved = true
    )
  );

REVOKE INSERT ON public.jobs FROM authenticated;
GRANT INSERT (
  user_id, company_name, company_phone, title, description, specialty, city,
  state, contract_type, deadline, status
) ON public.jobs TO authenticated;
REVOKE UPDATE ON public.jobs FROM authenticated;
GRANT UPDATE (
  company_name, company_phone, title, description, specialty, city, state,
  contract_type, deadline, status
) ON public.jobs TO authenticated;

DROP POLICY IF EXISTS "applications_insert_own" ON public.applications;
CREATE POLICY "applications_insert_own"
  ON public.applications FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
    AND (message IS NULL OR char_length(message) <= 2000)
    AND (proposed_value IS NULL OR char_length(proposed_value) <= 120)
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = applications.professional_id
        AND p.user_id = auth.uid()
        AND p.user_type = 'professional'
        AND p.is_approved = true
    )
    AND EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = applications.job_id
        AND j.status = 'open'
        AND (
          j.user_id IS NULL
          OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = j.user_id AND p.is_approved = true
          )
        )
    )
  );

DROP POLICY IF EXISTS "applications_update_owner" ON public.applications;
CREATE POLICY "applications_update_owner"
  ON public.applications FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id = applications.job_id AND j.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id = applications.job_id AND j.user_id = auth.uid()
  ));

REVOKE UPDATE ON public.applications FROM authenticated;
GRANT UPDATE (status) ON public.applications TO authenticated;
REVOKE INSERT ON public.applications FROM authenticated;
GRANT INSERT (job_id, professional_id, user_id, message, proposed_value)
  ON public.applications TO authenticated;

DROP POLICY IF EXISTS "reviews_select_public" ON public.reviews;
DROP POLICY IF EXISTS "reviews_select_approved" ON public.reviews;
CREATE POLICY "reviews_select_approved"
  ON public.reviews FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = reviews.profile_id
        AND (p.is_approved = true OR p.user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "reviews_insert_auth" ON public.reviews;
CREATE POLICY "reviews_insert_auth"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = reviewer_user_id
    AND char_length(btrim(reviewer_name)) BETWEEN 2 AND 120
    AND (comment IS NULL OR char_length(comment) <= 2000)
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = reviews.profile_id
        AND p.is_approved = true
        AND p.user_id IS DISTINCT FROM auth.uid()
    )
  );

REVOKE INSERT ON public.reviews FROM authenticated;
GRANT INSERT (profile_id, reviewer_user_id, rating, comment)
  ON public.reviews TO authenticated;

DROP POLICY IF EXISTS "Community posts are publicly readable" ON public.community_posts;
CREATE POLICY "Community posts are publicly readable"
  ON public.community_posts FOR SELECT TO anon, authenticated
  USING (
    is_public = true
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = community_posts.profile_id
        AND p.is_approved = true
        AND p.user_type IN ('professional', 'company')
    )
  );

DROP POLICY IF EXISTS "Users can read their own community posts" ON public.community_posts;
CREATE POLICY "Users can read their own community posts"
  ON public.community_posts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can publish their own community posts" ON public.community_posts;
CREATE POLICY "Users can publish their own community posts"
  ON public.community_posts FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND char_length(btrim(author)) BETWEEN 2 AND 120
    AND char_length(btrim(title)) BETWEEN 2 AND 120
    AND char_length(btrim(description)) BETWEEN 1 AND 5000
    AND char_length(btrim(city)) BETWEEN 2 AND 100
    AND state IN (
      'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
      'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
      'SP', 'SE', 'TO'
    )
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = community_posts.profile_id
        AND p.user_id = auth.uid()
        AND p.user_type IN ('professional', 'company')
    )
  );

REVOKE INSERT ON public.community_posts FROM authenticated;
GRANT INSERT (
  user_id, profile_id, author, specialty, title, city, state, description,
  media_url, media_type, video_url
) ON public.community_posts TO authenticated;

REVOKE UPDATE ON public.community_posts FROM authenticated;
GRANT UPDATE (author, specialty, title, city, state, description, media_url, media_type, video_url, is_public)
  ON public.community_posts TO authenticated;

DROP POLICY IF EXISTS "Visitantes podem solicitar parceria" ON public.solicitacoes_parceria;
CREATE POLICY "Visitantes podem solicitar parceria"
  ON public.solicitacoes_parceria FOR INSERT TO anon, authenticated
  WITH CHECK (
    status = 'pendente'
    AND (user_id IS NULL OR user_id = auth.uid())
    AND char_length(btrim(nome_empresa)) BETWEEN 2 AND 120
    AND char_length(btrim(responsavel)) BETWEEN 2 AND 120
    AND whatsapp ~ '^\d{11}$'
    AND char_length(btrim(cidade)) BETWEEN 2 AND 100
    AND char_length(mensagem) BETWEEN 2 AND 1000
  );

REVOKE INSERT ON public.solicitacoes_parceria FROM anon, authenticated;
GRANT INSERT (
  nome_empresa, cnpj, responsavel, whatsapp, cidade, estado, categoria,
  tipo_parceria, cota, mensagem
) ON public.solicitacoes_parceria TO anon, authenticated;

CREATE TABLE IF NOT EXISTS public.solicitacoes_parceria_rate_limit (
  contact_fingerprint text PRIMARY KEY,
  last_submitted_at timestamptz NOT NULL
);
ALTER TABLE public.solicitacoes_parceria_rate_limit ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.solicitacoes_parceria_rate_limit FROM anon, authenticated;
GRANT ALL ON public.solicitacoes_parceria_rate_limit TO service_role;

CREATE OR REPLACE FUNCTION public.limit_partnership_request_rate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  fingerprint text := md5(COALESCE(NEW.cnpj, '') || ':' || NEW.whatsapp);
BEGIN
  INSERT INTO public.solicitacoes_parceria_rate_limit AS rate_limit (contact_fingerprint, last_submitted_at)
  VALUES (fingerprint, now())
  ON CONFLICT (contact_fingerprint) DO UPDATE
    SET last_submitted_at = now()
    WHERE rate_limit.last_submitted_at <= now() - interval '10 minutes';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Aguarde alguns minutos antes de enviar outra proposta.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS limit_partnership_request_rate ON public.solicitacoes_parceria;
CREATE TRIGGER limit_partnership_request_rate
  BEFORE INSERT ON public.solicitacoes_parceria
  FOR EACH ROW EXECUTE FUNCTION public.limit_partnership_request_rate();

DROP POLICY IF EXISTS "cupons_active_public" ON public.cupons;
CREATE POLICY "cupons_active_public"
  ON public.cupons FOR SELECT TO anon, authenticated
  USING (
    is_active = true
    AND valid_from <= now()
    AND (valid_until IS NULL OR valid_until > now())
  );
REVOKE ALL ON public.cupons FROM anon, authenticated;
GRANT SELECT ON public.cupons TO anon, authenticated;
GRANT ALL ON public.cupons TO service_role;

ALTER TABLE public.cupons_desconto
  DROP CONSTRAINT IF EXISTS cupons_desconto_coupon_slug_check;
ALTER TABLE public.cupons_desconto
  ADD CONSTRAINT cupons_desconto_coupon_slug_fkey
  FOREIGN KEY (coupon_slug) REFERENCES public.cupons (slug) ON DELETE RESTRICT;

CREATE OR REPLACE FUNCTION public.assign_coupon_redemption_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL OR NEW.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Apenas o titular autenticado pode resgatar este cupom.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.cupons c
    WHERE c.slug = NEW.coupon_slug
      AND c.is_active = true
      AND c.valid_from <= now()
      AND (c.valid_until IS NULL OR c.valid_until > now())
  ) THEN
    RAISE EXCEPTION 'Este cupom não está ativo.';
  END IF;
  NEW.redemption_code := 'PO-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS assign_coupon_redemption_code ON public.cupons_desconto;
CREATE TRIGGER assign_coupon_redemption_code
  BEFORE INSERT ON public.cupons_desconto
  FOR EACH ROW EXECUTE FUNCTION public.assign_coupon_redemption_code();

DROP POLICY IF EXISTS "Usuários resgatam seus próprios cupons" ON public.cupons_desconto;
CREATE POLICY "Usuários resgatam seus próprios cupons"
  ON public.cupons_desconto FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.cupons c
      WHERE c.slug = coupon_slug
        AND c.is_active = true
        AND c.valid_from <= now()
        AND (c.valid_until IS NULL OR c.valid_until > now())
    )
  );

REVOKE INSERT ON public.cupons_desconto FROM authenticated;
GRANT INSERT (user_id, coupon_slug) ON public.cupons_desconto TO authenticated;
GRANT SELECT (user_id, coupon_slug, redemption_code, created_at)
  ON public.cupons_desconto TO authenticated;

DROP POLICY IF EXISTS "Public can view ProntObra avatars" ON storage.objects;
CREATE POLICY "Public can view ProntObra avatars"
  ON storage.objects FOR SELECT TO public
  USING (
    bucket_id = 'avatars'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id::text = (storage.foldername(name))[1]
        AND p.is_approved = true
    )
  );

DROP POLICY IF EXISTS "Public can view community media" ON storage.objects;
CREATE POLICY "Public can view community media"
  ON storage.objects FOR SELECT TO public
  USING (
    bucket_id = 'posts'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id::text = (storage.foldername(name))[1]
        AND p.is_approved = true
        AND p.user_type IN ('professional', 'company')
    )
  );

DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
CREATE POLICY "Users can delete their own avatars"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete their community media" ON storage.objects;
CREATE POLICY "Users can delete their community media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'posts' AND (storage.foldername(name))[1] = auth.uid()::text);
