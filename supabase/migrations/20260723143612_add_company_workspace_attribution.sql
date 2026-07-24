alter table public.jobs
  add column company_id uuid references public.companies(id) on delete cascade,
  add column created_by_user_id uuid references auth.users(id) on delete set null,
  add column assigned_to_user_id uuid references auth.users(id) on delete set null,
  add column archived_at timestamptz;
alter table public.conversations
  add column company_id uuid references public.companies(id) on delete cascade,
  add column assigned_to_user_id uuid references auth.users(id) on delete set null;
alter table public.messages
  add column sender_user_id uuid references auth.users(id) on delete set null,
  add column sender_display_name text,
  add column sender_avatar_url text,
  add column sender_company_name text,
  add column sender_company_logo_url text,
  add column sender_company_verified boolean not null default false;
alter table public.employer_boosts add column company_id uuid references public.companies(id) on delete cascade;
alter table public.employer_talent_blacklist
  add column company_id uuid references public.companies(id) on delete cascade,
  add column acted_by_user_id uuid references auth.users(id) on delete set null;
alter table public.company_reviews add column company_id uuid references public.companies(id) on delete cascade;
alter table public.interviews
  add column company_id uuid references public.companies(id) on delete cascade,
  add column organizer_user_id uuid references auth.users(id) on delete set null;
alter table public.talent_experience_verifications
  add column company_id uuid references public.companies(id) on delete cascade,
  add column reviewer_user_id uuid references auth.users(id) on delete set null;

update public.jobs set company_id=employer_id, created_by_user_id=employer_id, assigned_to_user_id=employer_id;
update public.conversations set company_id=employer_id, assigned_to_user_id=employer_id;
update public.messages m
set sender_user_id=m.sender_id,
    sender_display_name=coalesce(nullif(btrim(concat_ws(' ', p.first_name, p.last_name)), ''), 'Crucible user'),
    sender_avatar_url=p.avatar_url,
    sender_company_name=case when m.sender_role='employer' then c.name end,
    sender_company_logo_url=case when m.sender_role='employer' then cp.logo_url end,
    sender_company_verified=case when m.sender_role='employer' then c.verification_status='verified' else false end
from public.profiles p
left join public.company_memberships cm on cm.user_id=p.id and cm.status='active'
left join public.companies c on c.id=cm.company_id
left join public.company_profiles cp on cp.company_id=c.id
where p.id=m.sender_id;
update public.employer_boosts set company_id=employer_id;
update public.employer_talent_blacklist set company_id=employer_id, acted_by_user_id=employer_id;
update public.company_reviews set company_id=employer_id;
update public.interviews set company_id=employer_id, organizer_user_id=employer_id;
update public.talent_experience_verifications set company_id=employer_id, reviewer_user_id=employer_id;

alter table public.jobs alter column employer_id drop not null;
alter table public.conversations alter column employer_id drop not null;
alter table public.employer_boosts alter column employer_id drop not null;
alter table public.employer_talent_blacklist alter column employer_id drop not null;
alter table public.company_reviews alter column employer_id drop not null;
alter table public.interviews alter column employer_id drop not null;
alter table public.talent_experience_verifications alter column employer_id drop not null;

create index jobs_company_archived_created_idx on public.jobs(company_id, archived_at, created_at desc);
create index jobs_created_by_user_idx on public.jobs(created_by_user_id);
create index jobs_assigned_to_user_idx on public.jobs(assigned_to_user_id);
create index conversations_company_updated_idx on public.conversations(company_id, updated_at desc);
create index conversations_assigned_to_user_idx on public.conversations(assigned_to_user_id);
create index messages_sender_user_idx on public.messages(sender_user_id);
create unique index employer_boosts_company_type_idx on public.employer_boosts(company_id, boost_type);
create unique index employer_talent_blacklist_company_talent_idx on public.employer_talent_blacklist(company_id, talent_id);
create index company_reviews_company_idx on public.company_reviews(company_id);
create index interviews_company_idx on public.interviews(company_id);
create index interviews_organizer_idx on public.interviews(organizer_user_id);
create index talent_experience_verifications_company_idx on public.talent_experience_verifications(company_id);
