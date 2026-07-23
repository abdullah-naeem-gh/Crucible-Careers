drop policy "Applicants can view jobs they applied to" on public.jobs;
create policy "Applicants can view jobs they applied to" on public.jobs for select to authenticated
using (public.talent_has_applied_to_job(id,(select auth.uid())));
notify pgrst, 'reload schema';
