ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS specialties text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_available boolean NOT NULL DEFAULT true;
