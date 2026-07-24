create table public.job_views (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  talent_id uuid not null references auth.users(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  unique (job_id, talent_id)
);

create index job_views_talent_id_idx on public.job_views(talent_id);
create index job_views_job_id_idx on public.job_views(job_id);

alter table public.job_views enable row level security;
revoke all on table public.job_views from anon, authenticated;
grant select, insert on table public.job_views to authenticated;
grant all on table public.job_views to service_role;

create policy "Talent can record own job views" on public.job_views
  for insert with check (talent_id = auth.uid());
create policy "Talent can view own job views" on public.job_views
  for select using (talent_id = auth.uid());
create policy "Employers can view views to their jobs" on public.job_views
  for select using (exists (
    select 1 from public.jobs where jobs.id = job_views.job_id and jobs.employer_id = auth.uid()
  ));
