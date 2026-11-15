/*
# Prontobra — Schema Inicial

## Visão Geral
Cria o banco de dados da plataforma Prontobra, que conecta profissionais da
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