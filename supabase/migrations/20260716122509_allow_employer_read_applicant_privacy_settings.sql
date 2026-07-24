create policy "Employers can view privacy settings of their applicants" on public.talent_settings
  for select using (
    exists (
      select 1 from public.applications a
      join public.jobs j on j.id = a.job_id
      where a.talent_id = talent_settings.user_id and j.employer_id = auth.uid()
    )
  );
