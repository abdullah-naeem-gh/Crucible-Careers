create table public.talent_experience_verifications (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null unique references public.talent_experiences(id) on delete cascade,
  talent_id uuid not null references auth.users(id) on delete cascade,
  employer_id uuid not null references public.employer_profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','verified','rejected')),
  rejection_reason text,
  snapshot jsonb not null,
  requested_at timestamptz not null default now(),
  responded_at timestamptz,
  talent_acknowledged_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index talent_experience_verifications_talent_id_idx on public.talent_experience_verifications(talent_id);
create index talent_experience_verifications_employer_id_idx on public.talent_experience_verifications(employer_id);

alter table public.talent_experience_verifications enable row level security;
revoke all on table public.talent_experience_verifications from anon, authenticated;
grant select on table public.talent_experience_verifications to authenticated;
grant all on table public.talent_experience_verifications to service_role;

create policy "Talent can view own verification requests" on public.talent_experience_verifications
  for select using (talent_id = auth.uid());
create policy "Employers can view their verification requests" on public.talent_experience_verifications
  for select using (employer_id = auth.uid());

create trigger update_talent_experience_verifications_updated_at before update on public.talent_experience_verifications
  for each row execute function public.handle_updated_at();

create table public.employer_talent_blacklist (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.employer_profiles(id) on delete cascade,
  talent_id uuid not null references auth.users(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  unique (employer_id, talent_id)
);
create index employer_talent_blacklist_employer_id_idx on public.employer_talent_blacklist(employer_id);

alter table public.employer_talent_blacklist enable row level security;
revoke all on table public.employer_talent_blacklist from anon, authenticated;
grant select on table public.employer_talent_blacklist to authenticated;
grant all on table public.employer_talent_blacklist to service_role;

create policy "Employers can view their own blacklist" on public.employer_talent_blacklist
  for select using (employer_id = auth.uid());

alter table public.talent_experiences drop column if exists payslip_verified;

alter publication supabase_realtime add table public.talent_experience_verifications;
