create table public.talent_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  notifications jsonb not null default '{}'::jsonb,
  profile_visibility jsonb not null default '{}'::jsonb,
  communications jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.talent_settings enable row level security;
revoke all on table public.talent_settings from anon, authenticated;
grant select, insert, update on table public.talent_settings to authenticated;
grant all on table public.talent_settings to service_role;

create policy "Talent manage own settings" on public.talent_settings
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create trigger update_talent_settings_updated_at
  before update on public.talent_settings for each row execute function public.handle_updated_at();
