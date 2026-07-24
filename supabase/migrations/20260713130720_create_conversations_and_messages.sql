create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references public.applications(id) on delete cascade,
  talent_id uuid not null references auth.users(id) on delete cascade,
  employer_id uuid not null references public.employer_profiles(id) on delete cascade,
  initiated_by text not null check (initiated_by in ('talent','employer')),
  request_state text not null default 'pending' check (request_state in ('pending','accepted','declined')),
  initial_message text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index conversations_talent_id_idx on public.conversations(talent_id);
create index conversations_employer_id_idx on public.conversations(employer_id);
alter table public.conversations enable row level security;
revoke all on table public.conversations from anon, authenticated;
grant select, insert on table public.conversations to authenticated;
grant update (request_state) on table public.conversations to authenticated;
grant all on table public.conversations to service_role;

create policy "Participants can view their conversations" on public.conversations
  for select using (talent_id = auth.uid() or employer_id = auth.uid());

-- Validates the (application_id, talent_id, employer_id) triple is real —
-- without this, a client could insert a conversation naming itself as a
-- participant of an application/job it has no actual relationship to.
create policy "Participants can create a validated conversation" on public.conversations
  for insert with check (
    (auth.uid() = talent_id or auth.uid() = employer_id)
    and exists (
      select 1 from public.applications a
      join public.jobs j on j.id = a.job_id
      where a.id = conversations.application_id
        and a.talent_id = conversations.talent_id
        and j.employer_id = conversations.employer_id
    )
  );

create policy "Participants can update request state" on public.conversations
  for update using (talent_id = auth.uid() or employer_id = auth.uid())
  with check (talent_id = auth.uid() or employer_id = auth.uid());

create trigger update_conversations_updated_at
  before update on public.conversations for each row execute function public.handle_updated_at();

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_role text not null check (sender_role in ('talent','employer')),
  sender_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  body text not null,
  sent_at timestamptz not null default now(),
  read_by_recipient boolean not null default false
);
create index messages_conversation_id_idx on public.messages(conversation_id);
alter table public.messages enable row level security;
revoke all on table public.messages from anon, authenticated;
grant select, insert on table public.messages to authenticated;
grant update (read_by_recipient) on table public.messages to authenticated;
grant all on table public.messages to service_role;

create policy "Participants can view messages" on public.messages
  for select using (exists (
    select 1 from public.conversations c where c.id = messages.conversation_id
      and (c.talent_id = auth.uid() or c.employer_id = auth.uid())
  ));

-- Validates sender_role actually matches which side of the conversation the
-- inserting user is on — otherwise a talent could tag a message
-- sender_role:'employer', corrupting unread counts and bubble alignment.
create policy "Participants can send messages as themselves" on public.messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c where c.id = messages.conversation_id
        and ( (c.talent_id = auth.uid() and sender_role = 'talent')
           or (c.employer_id = auth.uid() and sender_role = 'employer') )
    )
  );

create policy "Participants can mark messages read" on public.messages
  for update using (exists (
    select 1 from public.conversations c where c.id = messages.conversation_id
      and (c.talent_id = auth.uid() or c.employer_id = auth.uid())
  ));

-- Fixes an existing RLS gap: a talent whose applied-to job later becomes
-- Draft/Paused/Closed currently loses SELECT on that jobs row entirely
-- (the "Anyone can view active jobs" policy only covers status='Active').
-- Needed so conversation joins can still reach jobs.title/employer_id for
-- older applications.
create policy "Applicants can view jobs they applied to" on public.jobs
  for select using (exists (
    select 1 from public.applications a where a.job_id = jobs.id and a.talent_id = auth.uid()
  ));

alter publication supabase_realtime add table public.conversations, public.messages;
