create or replace function public.can_access_company_resource(target_company_id uuid, resource_owner_user_id uuid, required_permission text)
returns boolean language sql stable security definer set search_path='' as $$
  select exists (
    select 1 from public.company_memberships m
    left join public.company_member_permissions p on p.membership_id=m.id
    where m.user_id=(select auth.uid()) and m.company_id=target_company_id and m.status='active'
      and (m.role='admin' or resource_owner_user_id=(select auth.uid()) or case required_permission
        when 'view_jobs' then coalesce(p.view_all_jobs,false) or coalesce(p.manage_all_jobs,false)
        when 'manage_jobs' then coalesce(p.manage_all_jobs,false)
        when 'view_applicants' then coalesce(p.view_all_applicants,false) or coalesce(p.manage_all_applicants,false)
        when 'manage_applicants' then coalesce(p.manage_all_applicants,false)
        when 'view_conversations' then coalesce(p.view_all_conversations,false) or coalesce(p.manage_all_conversations,false)
        when 'manage_conversations' then coalesce(p.manage_all_conversations,false)
        when 'view_analytics' then coalesce(p.view_company_analytics,false)
        else false end)
  );
$$;
revoke all on function public.can_access_company_resource(uuid,uuid,text) from public, anon;
grant execute on function public.can_access_company_resource(uuid,uuid,text) to authenticated, service_role;

drop policy "Employers can manage their own jobs" on public.jobs;
create policy "Workspace members view company jobs" on public.jobs for select to authenticated
using (company_id is not null and public.can_access_company_resource(company_id,coalesce(assigned_to_user_id,created_by_user_id),'view_jobs'));
create policy "Workspace members create own jobs" on public.jobs for insert to authenticated
with check (company_id=public.current_company_id() and created_by_user_id=(select auth.uid())
  and assigned_to_user_id=(select auth.uid()) and (employer_id is null or employer_id=(select auth.uid())));
create policy "Workspace members update company jobs" on public.jobs for update to authenticated
using (company_id is not null and public.can_access_company_resource(company_id,coalesce(assigned_to_user_id,created_by_user_id),'manage_jobs'))
with check (company_id=public.current_company_id() and public.can_access_company_resource(company_id,coalesce(assigned_to_user_id,created_by_user_id),'manage_jobs'));
create policy "Workspace members delete company jobs" on public.jobs for delete to authenticated
using (company_id is not null and public.can_access_company_resource(company_id,coalesce(assigned_to_user_id,created_by_user_id),'manage_jobs'));

drop policy "Employers can view applications to their jobs" on public.applications;
drop policy "Employers can update applications to their jobs" on public.applications;
create policy "Workspace members view company applications" on public.applications for select to authenticated
using (exists (select 1 from public.jobs j where j.id=applications.job_id
  and public.can_access_company_resource(j.company_id,coalesce(j.assigned_to_user_id,j.created_by_user_id),'view_applicants')));
create policy "Workspace members update company applications" on public.applications for update to authenticated
using (exists (select 1 from public.jobs j where j.id=applications.job_id
  and public.can_access_company_resource(j.company_id,coalesce(j.assigned_to_user_id,j.created_by_user_id),'manage_applicants')))
with check (exists (select 1 from public.jobs j where j.id=applications.job_id
  and public.can_access_company_resource(j.company_id,coalesce(j.assigned_to_user_id,j.created_by_user_id),'manage_applicants')));

drop policy "Employers can view views to their jobs" on public.job_views;
create policy "Workspace members view company job views" on public.job_views for select to authenticated
using (exists (select 1 from public.jobs j where j.id=job_views.job_id
  and public.can_access_company_resource(j.company_id,coalesce(j.assigned_to_user_id,j.created_by_user_id),'view_analytics')));

drop policy "Talent can review their own applications" on public.company_reviews;
drop policy "Employers can view their reviews" on public.company_reviews;
create policy "Talent can review own company application" on public.company_reviews for insert to authenticated
with check (talent_id=(select auth.uid()) and exists (
  select 1 from public.applications a join public.jobs j on j.id=a.job_id
  where a.id=company_reviews.application_id and a.talent_id=company_reviews.talent_id and j.company_id=company_reviews.company_id));
create policy "Workspace members view company reviews" on public.company_reviews for select to authenticated
using (public.can_access_company_resource(company_id,null,'view_analytics'));

drop policy "Employers can create own boosts" on public.employer_boosts;
drop policy "Employers can view own boosts" on public.employer_boosts;
drop policy "Employers can update own boosts" on public.employer_boosts;
create policy "Workspace members view company boosts" on public.employer_boosts for select to authenticated
using (public.is_company_admin(company_id) or public.can_access_company_resource(company_id,null,'view_analytics'));
create policy "Company admins create boosts" on public.employer_boosts for insert to authenticated
with check (public.is_company_admin(company_id));
create policy "Company admins update boosts" on public.employer_boosts for update to authenticated
using (public.is_company_admin(company_id)) with check (public.is_company_admin(company_id));

drop policy "Employers can view their own blacklist" on public.employer_talent_blacklist;
create policy "Workspace members view company blacklist" on public.employer_talent_blacklist for select to authenticated
using (public.can_access_company_resource(company_id,acted_by_user_id,'view_applicants'));

drop policy "Employers manage interviews for their own jobs" on public.interviews;
create policy "Workspace members manage company interviews" on public.interviews for all to authenticated
using (exists (select 1 from public.applications a join public.jobs j on j.id=a.job_id
  where a.id=interviews.application_id and j.company_id=interviews.company_id
    and public.can_access_company_resource(j.company_id,coalesce(j.assigned_to_user_id,j.created_by_user_id),'manage_applicants')))
with check (exists (select 1 from public.applications a join public.jobs j on j.id=a.job_id
  where a.id=interviews.application_id and j.company_id=interviews.company_id
    and public.can_access_company_resource(j.company_id,coalesce(j.assigned_to_user_id,j.created_by_user_id),'manage_applicants')));

drop policy "Employers can view their verification requests" on public.talent_experience_verifications;
create policy "Workspace members view company verification requests" on public.talent_experience_verifications for select to authenticated
using (public.can_access_company_resource(company_id,reviewer_user_id,'view_applicants'));

drop policy "Participants can create a validated conversation" on public.conversations;
drop policy "Participants can view their conversations" on public.conversations;
drop policy "Participants can update request state" on public.conversations;
create policy "Workspace participants create validated conversations" on public.conversations for insert to authenticated
with check (exists (select 1 from public.applications a join public.jobs j on j.id=a.job_id
  where a.id=conversations.application_id and a.talent_id=conversations.talent_id and j.company_id=conversations.company_id
    and (conversations.talent_id=(select auth.uid()) or public.can_access_company_resource(
      conversations.company_id,coalesce(j.assigned_to_user_id,j.created_by_user_id),'manage_conversations'))));
create policy "Workspace participants read conversations" on public.conversations for select to authenticated
using (public.can_access_conversation(id));
create policy "Workspace participants update conversations" on public.conversations for update to authenticated
using (public.can_access_conversation(id)) with check (public.can_access_conversation(id));

drop policy "Participants can send messages as themselves" on public.messages;
drop policy "Participants can view messages" on public.messages;
drop policy "Participants can mark messages read" on public.messages;
create policy "Workspace participants read messages" on public.messages for select to authenticated
using (public.can_access_conversation(conversation_id));
create policy "Workspace participants send attributed messages" on public.messages for insert to authenticated
with check (sender_user_id=(select auth.uid()) and sender_id=(select auth.uid())
  and public.can_access_conversation(conversation_id) and exists (
    select 1 from public.conversations c where c.id=messages.conversation_id and (
      (messages.sender_role='talent' and c.talent_id=(select auth.uid())) or
      (messages.sender_role='employer' and exists (select 1 from public.company_memberships m
        where m.user_id=(select auth.uid()) and m.company_id=c.company_id and m.status='active')))));
notify pgrst, 'reload schema';
