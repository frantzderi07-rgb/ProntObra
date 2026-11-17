-- ProntObra: schema consolidado para um projeto Supabase novo.
-- Execute uma vez no SQL Editor ou com psql. Migrações ordenadas pelo timestamp do nome.
-- Perfis novos ficam pendentes (is_approved=false); um administrador deve aprová-los após revisão.
BEGIN;

-- >>> 20261114185512_prontobra_initial_schema.sql
/*
# ProntObra — Schema Inicial

## Visão Geral
Cria o banco de dados da plataforma ProntObra, que conecta profissionais da
construção civil com clientes e empresas na região de Andradina (SP) e cidades
vizinhas (incluindo Três Lagoas e Brasilândia no MS).

## Novas Tabelas

1. **profiles** — Perfis de usuários (profissionais e empresas)
   - id (uuid, PK)
   - user_id (uuid, FK → auth.users, nullable) — dono do perfil (null para dados mock)
   - user_type ('professional' | 'company')
   - full_name, email, phone (WhatsApp), avatar_url
   - specialty (profissionais), experience_years, service_radius
   - city, state, bio, is_featured
   - created_at

2. **portfolio_photos** — Fotos de portfólio dos profissionais
   - id, profile_id (FK → profiles), image_url, caption, created_at

3. **jobs** — Vagas / pedidos de orçamento publicados por empresas
   - id, user_id (FK → auth.users, nullable), company_name, company_phone
   - title, description, specialty, city, state
   - contract_type ('diaria' | 'empreitada' | 'clt'), deadline
   - status ('open' | 'closed'), created_at

4. **applications** — Candidaturas / propostas de profissionais para vagas
   - id, job_id (FK → jobs), professional_id (FK → profiles)
   - user_id (FK → auth.users, nullable) — dono da candidatura
   - message, proposed_value, status ('pending' | 'accepted' | 'rejected'), created_at

5. **reviews** — Avaliações de profissionais por clientes
   - id, profile_id (FK → profiles), reviewer_name, rating (1-5), comment, created_at

## Segurança (RLS)
- profiles, portfolio_photos, jobs, reviews: SELECT público (anon + authenticated);
  escrita restrita ao dono (auth.uid() = user_id).
- applications: SELECT visível para o candidato OU o dono da vaga; INSERT pelo
  candidato autenticado; UPDATE pelo dono da vaga (aceitar/recusar).
- Todas as tabelas têm RLS habilitado e grants explícitos.

## Dados Iniciais (Mock)
- 6 perfis de profissionais fictícios (Andradina-SP e Três Lagoas-MS)
- Fotos de portfólio para cada profissional
- Avaliações de clientes
- 4 vagas ativas na região

## Notas
- user_id é nullable com DEFAULT auth.uid() para permitir dados mock sem
  conta de autenticação e inserts automáticos de usuários reais.
- IDs dos perfis mock são fixos (UUIDs sequenciais) para referência em
  portfolio_photos, applications e reviews.
*/

-- ============ PROFILES ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type text NOT NULL CHECK (user_type IN ('professional', 'company')),
  full_name text NOT NULL,
  email text,
  phone text,
  avatar_url text,
  specialty text,
  experience_years int,
  city text NOT NULL,
  state text NOT NULL,
  service_radius text,
  bio text,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON profiles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON profiles TO authenticated;

DROP POLICY IF EXISTS "profiles_select_public" ON profiles;
CREATE POLICY "profiles_select_public"
  ON profiles FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own"
  ON profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ PORTFOLIO_PHOTOS ============
CREATE TABLE IF NOT EXISTS portfolio_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE portfolio_photos ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON portfolio_photos TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON portfolio_photos TO authenticated;

DROP POLICY IF EXISTS "portfolio_select_public" ON portfolio_photos;
CREATE POLICY "portfolio_select_public"
  ON portfolio_photos FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "portfolio_insert_own" ON portfolio_photos;
CREATE POLICY "portfolio_insert_own"
  ON portfolio_photos FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = portfolio_photos.profile_id AND p.user_id = auth.uid()));

DROP POLICY IF EXISTS "portfolio_update_own" ON portfolio_photos;
CREATE POLICY "portfolio_update_own"
  ON portfolio_photos FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = portfolio_photos.profile_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = portfolio_photos.profile_id AND p.user_id = auth.uid()));

DROP POLICY IF EXISTS "portfolio_delete_own" ON portfolio_photos;
CREATE POLICY "portfolio_delete_own"
  ON portfolio_photos FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = portfolio_photos.profile_id AND p.user_id = auth.uid()));

-- ============ JOBS ============
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  company_phone text,
  title text NOT NULL,
  description text NOT NULL,
  specialty text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  contract_type text NOT NULL CHECK (contract_type IN ('diaria', 'empreitada', 'clt')),
  deadline text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON jobs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON jobs TO authenticated;

DROP POLICY IF EXISTS "jobs_select_public" ON jobs;
CREATE POLICY "jobs_select_public"
  ON jobs FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "jobs_insert_own" ON jobs;
CREATE POLICY "jobs_insert_own"
  ON jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "jobs_update_own" ON jobs;
CREATE POLICY "jobs_update_own"
  ON jobs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "jobs_delete_own" ON jobs;
CREATE POLICY "jobs_delete_own"
  ON jobs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ APPLICATIONS ============
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  message text,
  proposed_value text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON applications TO authenticated;

DROP POLICY IF EXISTS "applications_select_visible" ON applications;
CREATE POLICY "applications_select_visible"
  ON applications FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM jobs j WHERE j.id = applications.job_id AND j.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "applications_insert_own" ON applications;
CREATE POLICY "applications_insert_own"
  ON applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "applications_update_owner" ON applications;
CREATE POLICY "applications_update_owner"
  ON applications FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM jobs j WHERE j.id = applications.job_id AND j.user_id = auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM jobs j WHERE j.id = applications.job_id AND j.user_id = auth.uid())
  );

-- ============ REVIEWS ============
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewer_name text NOT NULL,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON reviews TO anon, authenticated;
GRANT INSERT ON reviews TO authenticated;

DROP POLICY IF EXISTS "reviews_select_public" ON reviews;
CREATE POLICY "reviews_select_public"
  ON reviews FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "reviews_insert_auth" ON reviews;
CREATE POLICY "reviews_insert_auth"
  ON reviews FOR INSERT TO authenticated WITH CHECK (true);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_profiles_specialty ON profiles(specialty);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_jobs_specialty ON jobs(specialty);
CREATE INDEX IF NOT EXISTS idx_jobs_city ON jobs(city);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_portfolio_profile_id ON portfolio_photos(profile_id);
CREATE INDEX IF NOT EXISTS idx_reviews_profile_id ON reviews(profile_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);

-- ============ MOCK DATA: PROFILES ============
INSERT INTO profiles (id, user_id, user_type, full_name, email, phone, avatar_url, specialty, experience_years, city, state, service_radius, bio, is_featured) VALUES
('a0000001-0000-0000-0000-000000000001', null, 'professional', 'João Carlos Mendes', 'joao.mendes@example.com', '(18) 99999-1001', 'https://images.pexels.com/photos/16552856/pexels-photo-16552856.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', 'Pedreiro', 15, 'Andradina', 'SP', 'Até 60 km (Andradina e região)', 'Pedreiro com mais de 15 anos de experiência em construção residencial e comercial. Especialista em fundações, alvenaria e acabamento. Trabalho garantido com qualidade e pontualidade.', true),
('a0000001-0000-0000-0000-000000000002', null, 'professional', 'Rafael Santos Silva', 'rafael.santos@example.com', '(67) 99999-1002', 'https://images.pexels.com/photos/16552843/pexels-photo-16552843.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', 'Eletricista', 10, 'Três Lagoas', 'MS', 'Até 80 km (Três Lagoas e região)', 'Eletricista predial e predial certified. Instalações elétricas residenciais e comerciais, manutenção preventiva e corretiva, projetos de iluminação e energia solar.', true),
('a0000001-0000-0000-0000-000000000003', null, 'professional', 'Marcos Antônio Pereira', 'marcos.pereira@example.com', '(18) 99999-1003', 'https://images.pexels.com/photos/31499725/pexels-photo-31499725.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', 'Mestre de Obras', 22, 'Andradina', 'SP', 'Até 100 km (Alta Noroeste e MS)', 'Mestre de obras com mais de duas décadas no ramo. Liderança de equipes, planejamento de etapas construtivas, controle de qualidade e cumprimento de prazos. Reformas e obras do zero.', true),
('a0000001-0000-0000-0000-000000000004', null, 'professional', 'Fernando Costa Lima', 'fernando.lima@example.com', '(18) 99999-1004', 'https://images.pexels.com/photos/16552841/pexels-photo-16552841.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', 'Pintor', 8, 'Ilha Solteira', 'SP', 'Até 50 km (Ilha Solteira e região)', 'Pintor residencial e comercial. Pintura interna e externa, texturas, grafiato, epóxi e efeitos decorativos. Trabalho limpo e finalização impecável.', false),
('a0000001-0000-0000-0000-000000000005', null, 'professional', 'Ana Paula Ferreira', 'ana.ferreira@example.com', '(67) 99999-1005', 'https://images.pexels.com/photos/40088759/pexels-photo-40088759.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', 'Arquiteta', 7, 'Três Lagoas', 'MS', 'Até 120 km (Três Lagoas, Brasilândia e MS)', 'Arquiteta formada pela UNIDERP, especialista em projetos residenciais e comerciais. Plantas, memoriais, aprovação na prefeitura e acompanhamento de obra.', true),
('a0000001-0000-0000-0000-000000000006', null, 'professional', 'Paulo Roberto Gomes', 'paulo.gomes@example.com', '(18) 99999-1006', 'https://images.pexels.com/photos/17063686/pexels-photo-17063686.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', 'Encanador', 12, 'Pereira Barreto', 'SP', 'Até 70 km (Pereira Barreto e região)', 'Encanador e hidráulico. Instalações hidráulicas e sanitárias, detecção de vazamentos, desentupimento, caixa de gordura e sistemas de aquecimento.', false)
ON CONFLICT (id) DO NOTHING;

-- ============ MOCK DATA: PORTFOLIO PHOTOS ============
INSERT INTO portfolio_photos (profile_id, image_url, caption) VALUES
('a0000001-0000-0000-0000-000000000001', 'https://images.pexels.com/photos/15798783/pexels-photo-15798783.jpeg?auto=compress&cs=tinysrgb&h=600&w=900', 'Reforma completa de sala — Andradina/SP'),
('a0000001-0000-0000-0000-000000000001', 'https://images.pexels.com/photos/15798782/pexels-photo-15798782.jpeg?auto=compress&cs=tinysrgb&h=600&w=900', 'Construção de muro residencial'),
('a0000001-0000-0000-0000-000000000001', 'https://images.pexels.com/photos/38798439/pexels-photo-38798439.jpeg?auto=compress&cs=tinysrgb&h=600&w=900', 'Edificação em fase de acabamento'),
('a0000001-0000-0000-0000-000000000002', 'https://images.pexels.com/photos/14541104/pexels-photo-14541104.jpeg?auto=compress&cs=tinysrgb&h=600&w=900', 'Instalação elétrica predial — Três Lagoas/MS'),
('a0000001-0000-0000-0000-000000000002', 'https://images.pexels.com/photos/27134625/pexels-photo-27134625.jpeg?auto=compress&cs=tinysrgb&h=600&w=900', 'Manutenção de fachada comercial'),
('a0000001-0000-0000-0000-000000000003', 'https://images.pexels.com/photos/37028150/pexels-photo-37028150.jpeg?auto=compress&cs=tinysrgb&h=600&w=900', 'Obra residencial — estrutura completa'),
('a0000001-0000-0000-0000-000000000003', 'https://images.pexels.com/photos/15933576/pexels-photo-15933576.jpeg?auto=compress&cs=tinysrgb&h=600&w=900', 'Reforma de fachada — Castilho/SP'),
('a0000001-0000-0000-0000-000000000004', 'https://images.pexels.com/photos/6474133/pexels-photo-6474133.jpeg?auto=compress&cs=tinysrgb&h=600&w=900', 'Pintura interna com pistola — acabamento liso'),
('a0000001-0000-0000-0000-000000000004', 'https://images.pexels.com/photos/36035072/pexels-photo-36035072.jpeg?auto=compress&cs=tinysrgb&h=600&w=900', 'Reforma de cozinha — Ilha Solteira/SP'),
('a0000001-0000-0000-0000-000000000005', 'https://images.pexels.com/photos/8146158/pexels-photo-8146158.jpeg?auto=compress&cs=tinysrgb&h=600&w=900', 'Projeto residencial contemporâneo entregue'),
('a0000001-0000-0000-0000-000000000005', 'https://images.pexels.com/photos/4756489/pexels-photo-4756489.jpeg?auto=compress&cs=tinysrgb&h=600&w=900', 'Reforma com rebaixamento de teto em gesso'),
('a0000001-0000-0000-0000-000000000006', 'https://images.pexels.com/photos/5691550/pexels-photo-5691550.jpeg?auto=compress&cs=tinysrgb&h=600&w=900', 'Instalação hidráulica em obra nova')
ON CONFLICT DO NOTHING;

-- ============ MOCK DATA: REVIEWS ============
INSERT INTO reviews (profile_id, reviewer_name, rating, comment) VALUES
('a0000001-0000-0000-0000-000000000001', 'Construtora Vale do Paraná', 5, 'Excelente profissional! Cumpriu o prazo e a qualidade do acabamento superou nossas expectativas. Recomendamos.'),
('a0000001-0000-0000-0000-000000000001', 'Maria Aparecida S.', 5, 'João fez a reforma da minha casa e ficou perfeita. Muito honesto e trabalhador.'),
('a0000001-0000-0000-0000-000000000002', 'Comércio Central Três Lagoas', 5, 'Instalação elétrica impecável. Resolveu um problema antigo que outros não conseguiram. Nota 10!'),
('a0000001-0000-0000-0000-000000000002', 'Pedro Henrique A.', 4, 'Bom serviço, demorou um pouco mais que o previsto mas a qualidade foi ótima.'),
('a0000001-0000-0000-0000-000000000003', 'Imobiliária Andradina Prime', 5, 'O mestre Marcos conduziu a obra com excelência. Equipe organizada e prazo cumprido rigorosamente.'),
('a0000001-0000-0000-0000-000000000004', 'Restaurante Sabor Caseiro', 5, 'Pintura do salão ficou linda! Trabalho limpo e muito profissional.'),
('a0000001-0000-0000-0000-000000000005', 'Família Souza', 5, 'A Ana projetou nossa casa dos sonhos. Muito atenciosa e criativa. Super recomendamos!'),
('a0000001-0000-0000-0000-000000000006', 'Hotel Vale Verde', 4, 'Bom serviço de hidráulica, resolveu vazamentos crônicos. Recomendado.')
ON CONFLICT DO NOTHING;

-- ============ MOCK DATA: JOBS ============
INSERT INTO jobs (user_id, company_name, company_phone, title, description, specialty, city, state, contract_type, deadline, status) VALUES
(null, 'Construtora Vale do Paraná', '(18) 3333-1100', 'Reforma de cozinha residencial', 'Preciso de profissional para reforma completa de cozinha: demolição, novo revestimento, troca de gabinetes e instalação elétrica. Aproximadamente 25 m². Material já comprado.', 'Reforma Geral', 'Andradina', 'SP', 'empreitada', '30 dias', 'open'),
(null, 'Imobiliária Andradina Prime', '(18) 3333-2200', 'Construção de muro e calçada', 'Construção de muro de frente de 18 metros em bloco, com revestimento e calçada de concreto. Obra em bairro residencial. Início imediato.', 'Pedreiro', 'Castilho', 'SP', 'empreitada', '20 dias', 'open'),
(null, 'Comércio Central Três Lagoas', '(67) 3333-3300', 'Instalação elétrica predial — retrofit', 'Retrofit de instalação elétrica de loja comercial de 120 m². Troca de quadro de distribuição, fiação e pontos de iluminação. Projento elétrico já aprovado.', 'Eletricista', 'Três Lagoas', 'MS', 'diaria', '15 dias', 'open'),
(null, 'Restaurante Sabor Caseiro', '(18) 3333-4400', 'Pintura de imóvel comercial (salão + fachada)', 'Pintura completa de restaurante: salão interno de 80 m², cozinha e fachada. Preparação de paredes, massa corrida e tinta acrílica. Cor a definir com o cliente.', 'Pintor', 'Murutinga do Sul', 'SP', 'empreitada', '10 dias', 'open')
ON CONFLICT DO NOTHING;

-- >>> 20261116170000_professional_profile_enhancements.sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS specialties text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_available boolean NOT NULL DEFAULT true;


-- >>> 20261116172500_community_media.sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('posts', 'posts', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']),
  ('quotes', 'quotes', false, 5242880, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE TABLE IF NOT EXISTS public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  author text NOT NULL,
  specialty text NOT NULL,
  title text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  description text NOT NULL,
  media_url text,
  media_type text CHECK (media_type IN ('image', 'video')),
  video_url text,
  source_whatsapp_message_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_posts TO authenticated;
GRANT SELECT ON public.community_posts TO anon;

DROP POLICY IF EXISTS "Community posts are publicly readable" ON public.community_posts;
CREATE POLICY "Community posts are publicly readable"
  ON public.community_posts FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Users can publish their own community posts" ON public.community_posts;
CREATE POLICY "Users can publish their own community posts"
  ON public.community_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own community posts" ON public.community_posts;
CREATE POLICY "Users can update their own community posts"
  ON public.community_posts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own community posts" ON public.community_posts;
CREATE POLICY "Users can delete their own community posts"
  ON public.community_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS community_posts_created_at_idx ON public.community_posts (created_at DESC);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS company_cnpj text,
  ADD COLUMN IF NOT EXISTS whatsapp_number text,
  ADD COLUMN IF NOT EXISTS whatsapp_alerts_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_feed_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_recommendations_enabled boolean NOT NULL DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_whatsapp_number_unique_idx
  ON public.profiles (whatsapp_number)
  WHERE whatsapp_number IS NOT NULL AND whatsapp_number <> '';

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_type_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_user_type_check CHECK (user_type IN ('professional', 'company', 'client'));
CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_unique_idx ON public.profiles (user_id);

CREATE OR REPLACE FUNCTION public.create_profile_for_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  profile_type text := COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'client');
BEGIN
  IF profile_type NOT IN ('professional', 'company', 'client') THEN
    profile_type := 'client';
  END IF;
  INSERT INTO public.profiles (
    user_id, user_type, full_name, email, phone, specialty, specialties,
    experience_years, city, state, bio, is_available, company_cnpj
  )
  VALUES (
    NEW.id,
    profile_type,
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''), 'Usuário ProntObra'),
    NEW.email,
    NULLIF(NEW.raw_user_meta_data ->> 'phone', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'specialty', ''),
    CASE WHEN jsonb_typeof(NEW.raw_user_meta_data -> 'specialties') = 'array'
      THEN ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data -> 'specialties'))
      ELSE '{}'::text[] END,
    CASE WHEN (NEW.raw_user_meta_data ->> 'experience_years') ~ '^\d+$'
      THEN (NEW.raw_user_meta_data ->> 'experience_years')::integer ELSE NULL END,
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'city', ''), 'Andradina'),
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'state', ''), 'SP'),
    NULLIF(NEW.raw_user_meta_data ->> 'bio', ''),
    CASE WHEN NEW.raw_user_meta_data ->> 'is_available' IN ('true', 'false')
      THEN (NEW.raw_user_meta_data ->> 'is_available')::boolean ELSE true END,
    NULLIF(NEW.raw_user_meta_data ->> 'company_cnpj', '')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_prontobra_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_prontobra_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_auth_user();

CREATE TABLE IF NOT EXISTS public.profile_private_data (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tax_document text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profile_private_data ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.profile_private_data TO authenticated;
GRANT ALL ON public.profile_private_data TO service_role;

DROP POLICY IF EXISTS "Users can read their private profile data" ON public.profile_private_data;
CREATE POLICY "Users can read their private profile data"
  ON public.profile_private_data FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their private profile data" ON public.profile_private_data;
CREATE POLICY "Users can insert their private profile data"
  ON public.profile_private_data FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their private profile data" ON public.profile_private_data;
CREATE POLICY "Users can update their private profile data"
  ON public.profile_private_data FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.whatsapp_ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_message_id text NOT NULL UNIQUE,
  sender_number text NOT NULL,
  status text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'complete', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_ai_messages ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.whatsapp_ai_messages TO service_role;

CREATE TABLE IF NOT EXISTS public.whatsapp_ai_rate_limits (
  sender_number text PRIMARY KEY,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  message_count integer NOT NULL DEFAULT 0
);

ALTER TABLE public.whatsapp_ai_rate_limits ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.whatsapp_ai_rate_limits TO service_role;

CREATE TABLE IF NOT EXISTS public.whatsapp_ai_alerts (
  provider_message_id text NOT NULL,
  recipient_number text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (provider_message_id, recipient_number)
);

ALTER TABLE public.whatsapp_ai_alerts ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.whatsapp_ai_alerts TO service_role;

CREATE OR REPLACE FUNCTION public.consume_whatsapp_rate_limit(
  p_sender_number text,
  p_limit integer DEFAULT 20,
  p_window_seconds integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_count integer;
BEGIN
  INSERT INTO public.whatsapp_ai_rate_limits AS rate_limit (sender_number, window_started_at, message_count)
  VALUES (p_sender_number, now(), 1)
  ON CONFLICT (sender_number) DO UPDATE SET
    window_started_at = CASE
      WHEN rate_limit.window_started_at <= now() - make_interval(secs => p_window_seconds) THEN now()
      ELSE rate_limit.window_started_at
    END,
    message_count = CASE
      WHEN rate_limit.window_started_at <= now() - make_interval(secs => p_window_seconds) THEN 1
      ELSE rate_limit.message_count + 1
    END
  RETURNING message_count INTO current_count;
  RETURN current_count <= p_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_whatsapp_rate_limit(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_whatsapp_rate_limit(text, integer, integer) TO service_role;


-- >>> 20261116233000_home_partnerships_coupons.sql
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


-- >>> 20261116235000_referral_program.sql
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


-- >>> 20261116235500_partnership_type.sql
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


-- >>> 20261117010000_security_hardening.sql
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

-- >>> 20261117030500_partnership_contact_email.sql
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

COMMIT;
