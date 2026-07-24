-- The "Applicants can view jobs they applied to" policy (added in the
-- previous migration) queried public.applications directly, which itself
-- has an RLS policy ("Employers can view applications to their jobs") that
-- queries public.jobs — creating a circular RLS evaluation and a Postgres
-- "infinite recursion detected in policy" error. Break the cycle with a
-- SECURITY DEFINER helper that bypasses RLS for just this narrow boolean
-- check (same pattern already used elsewhere in this project, e.g.
-- handle_new_user()).
drop policy "Applicants can view jobs they applied to" on public.jobs;

create or replace function public.talent_has_applied_to_job(p_job_id uuid, p_talent_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.applications a
    where a.job_id = p_job_id and a.talent_id = p_talent_id
  );
$$;

revoke all on function public.talent_has_applied_to_job(uuid, uuid) from public;
grant execute on function public.talent_has_applied_to_job(uuid, uuid) to authenticated;

create policy "Applicants can view jobs they applied to" on public.jobs
  for select using (public.talent_has_applied_to_job(jobs.id, auth.uid()));
