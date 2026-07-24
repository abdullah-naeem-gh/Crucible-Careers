create index company_reviews_talent_id_idx on public.company_reviews(talent_id);
create index employer_talent_blacklist_talent_id_idx on public.employer_talent_blacklist(talent_id);
create index jobs_employer_id_idx on public.jobs(employer_id) where employer_id is not null;
create index messages_sender_id_idx on public.messages(sender_id);
create index talent_educations_profile_id_idx on public.talent_educations(profile_id);
create index talent_experiences_profile_id_idx on public.talent_experiences(profile_id);
create index talent_projects_profile_id_idx on public.talent_projects(profile_id);
