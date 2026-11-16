INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('posts', 'posts', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']),
  ('quotes', 'quotes', false, 5242880, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can view ProntObra avatars" ON storage.objects;
CREATE POLICY "Public can view ProntObra avatars"
  ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
CREATE POLICY "Users can upload their own avatars"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
CREATE POLICY "Users can update their own avatars"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Public can view community media" ON storage.objects;
CREATE POLICY "Public can view community media"
  ON storage.objects FOR SELECT TO public USING (bucket_id = 'posts');

DROP POLICY IF EXISTS "Users can upload community media" ON storage.objects;
CREATE POLICY "Users can upload community media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'posts' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their community media" ON storage.objects;
CREATE POLICY "Users can update their community media"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'posts' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'posts' AND (storage.foldername(name))[1] = auth.uid()::text);

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
