create table public.company_reviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references public.applications(id) on delete cascade,
  employer_id uuid not null references public.employer_profiles(id) on delete cascade,
  talent_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);
create index company_reviews_employer_id_idx on public.company_reviews(employer_id);

alter table public.company_reviews enable row level security;
revoke all on table public.company_reviews from anon, authenticated;
grant select, insert on table public.company_reviews to authenticated;
grant all on table public.company_reviews to service_role;

create policy "Talent can view own reviews" on public.company_reviews
  for select using (talent_id = auth.uid());
create policy "Employers can view their reviews" on public.company_reviews
  for select using (employer_id = auth.uid());
create policy "Talent can review their own applications" on public.company_reviews
  for insert with check (
    talent_id = auth.uid()
    and exists (
      select 1 from public.applications a join public.jobs j on j.id = a.job_id
      where a.id = company_reviews.application_id
        and a.talent_id = company_reviews.talent_id and j.employer_id = company_reviews.employer_id
    )
  );

create table public.employer_boosts (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.employer_profiles(id) on delete cascade,
  boost_type text not null check (boost_type in ('job-spotlight','candidate-unlock','profile-branding')),
  is_active boolean not null default true,
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','paid')),
  activated_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employer_id, boost_type)
);

alter table public.employer_boosts enable row level security;
revoke all on table public.employer_boosts from anon, authenticated;
grant select, insert, update on table public.employer_boosts to authenticated;
grant all on table public.employer_boosts to service_role;

create policy "Employers can view own boosts" on public.employer_boosts for select using (employer_id = auth.uid());
create policy "Employers can create own boosts" on public.employer_boosts for insert with check (employer_id = auth.uid());
create policy "Employers can update own boosts" on public.employer_boosts for update using (employer_id = auth.uid()) with check (employer_id = auth.uid());
create policy "Anyone can see active job-spotlight boosts" on public.employer_boosts
  for select using (boost_type = 'job-spotlight' and is_active = true);

create trigger update_employer_boosts_updated_at before update on public.employer_boosts
  for each row execute function public.handle_updated_at();
