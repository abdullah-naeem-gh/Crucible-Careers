create extension if not exists citext;

create type public.company_member_role as enum ('admin', 'recruiter');
create type public.company_membership_status as enum ('active', 'left', 'removed');
create type public.company_request_status as enum ('pending', 'approved', 'rejected', 'cancelled', 'expired');
create type public.company_verification_status as enum ('unverified', 'pending', 'verified', 'rejected');

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 160),
  join_email citext not null unique,
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  verification_status public.company_verification_status not null default 'unverified',
  verified_at timestamptz,
  verified_by uuid references auth.users(id) on delete set null,
  verification_revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.company_profiles (
  company_id uuid primary key references public.companies(id) on delete cascade,
  tagline text, industry text, company_size text, founded text, website text,
  headquarters text, overview text, culture text, benefits text, tech_stack text,
  linkedin text, twitter text, logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.company_memberships (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.company_member_role not null,
  status public.company_membership_status not null default 'active',
  invited_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, user_id)
);
create unique index company_memberships_one_active_company on public.company_memberships(user_id) where status = 'active';
create index company_memberships_company_status_idx on public.company_memberships(company_id, status);

create table public.company_member_permissions (
  membership_id uuid primary key references public.company_memberships(id) on delete cascade,
  view_all_jobs boolean not null default false,
  manage_all_jobs boolean not null default false,
  view_all_applicants boolean not null default false,
  manage_all_applicants boolean not null default false,
  view_all_conversations boolean not null default false,
  manage_all_conversations boolean not null default false,
  view_company_analytics boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  check (not manage_all_jobs or view_all_jobs),
  check (not manage_all_applicants or view_all_applicants),
  check (not manage_all_conversations or view_all_conversations)
);

insert into public.companies (id, name, join_email, owner_user_id)
select p.id, coalesce(nullif(btrim(p.company), ''), 'Company'), u.email::citext, p.id
from public.profiles p
join auth.users u on u.id = p.id
join public.employer_profiles ep on ep.id = p.id
where p.role = 'employer'::public.user_role;

insert into public.company_profiles (
  company_id, tagline, industry, company_size, founded, website, headquarters,
  overview, culture, benefits, tech_stack, linkedin, twitter, logo_url, created_at, updated_at
)
select ep.id, ep.tagline, ep.industry, ep.company_size, ep.founded, ep.website,
  ep.headquarters, ep.overview, ep.culture, ep.benefits, ep.tech_stack,
  ep.linkedin, ep.twitter, ep.logo_url, coalesce(ep.created_at, now()), coalesce(ep.updated_at, now())
from public.employer_profiles ep
join public.profiles p on p.id = ep.id and p.role = 'employer'::public.user_role
join public.companies c on c.id = ep.id;

insert into public.company_memberships (company_id, user_id, role, status)
select id, owner_user_id, 'admin', 'active' from public.companies;
insert into public.company_member_permissions (membership_id)
select id from public.company_memberships;

alter table public.companies enable row level security;
alter table public.company_profiles enable row level security;
alter table public.company_memberships enable row level security;
alter table public.company_member_permissions enable row level security;
