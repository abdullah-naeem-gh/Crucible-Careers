create table public.employer_calendar_connections (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.employer_profiles(id) on delete cascade,
  provider text not null check (provider in ('google','microsoft')),
  access_token text not null,
  refresh_token text,
  token_expires_at timestamptz,
  provider_account_email text,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employer_id, provider)
);

alter table public.employer_calendar_connections enable row level security;
revoke all on table public.employer_calendar_connections from anon, authenticated;
grant select, insert, update, delete on table public.employer_calendar_connections to authenticated;
grant all on table public.employer_calendar_connections to service_role;

create policy "Employers manage own calendar connections" on public.employer_calendar_connections
  for all using (employer_id = auth.uid()) with check (employer_id = auth.uid());

create trigger update_employer_calendar_connections_updated_at
  before update on public.employer_calendar_connections for each row execute function public.handle_updated_at();

create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  employer_id uuid not null references public.employer_profiles(id) on delete cascade,
  scheduled_date date not null,
  start_time time not null,
  end_time time not null,
  format text not null check (format in ('video','phone','in-person')),
  location text,
  calendar_provider text check (calendar_provider in ('google','microsoft')),
  calendar_event_id text,
  calendar_event_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index interviews_employer_id_idx on public.interviews(employer_id);
create index interviews_application_id_idx on public.interviews(application_id);

alter table public.interviews enable row level security;
revoke all on table public.interviews from anon, authenticated;
grant select, insert, update, delete on table public.interviews to authenticated;
grant all on table public.interviews to service_role;

create policy "Employers manage interviews for their own jobs" on public.interviews
  for all using (employer_id = auth.uid()) with check (
    employer_id = auth.uid()
    and exists (
      select 1 from public.applications a join public.jobs j on j.id = a.job_id
      where a.id = interviews.application_id and j.employer_id = interviews.employer_id
    )
  );

create trigger update_interviews_updated_at
  before update on public.interviews for each row execute function public.handle_updated_at();
