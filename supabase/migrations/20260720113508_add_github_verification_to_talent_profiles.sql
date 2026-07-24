alter table public.talent_profiles
  add column github_verified_username text,
  add column github_verified_at timestamptz;
