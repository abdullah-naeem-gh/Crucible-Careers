alter function public.handle_updated_at() set search_path = pg_catalog;
alter function public.handle_application_status_touch() set search_path = pg_catalog;
revoke all on function public.handle_updated_at() from public, anon, authenticated;
revoke all on function public.handle_application_status_touch() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.rls_auto_enable() from public, anon, authenticated;

create or replace function public.talent_has_applied_to_job(p_job_id uuid, p_talent_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select p_talent_id=(select auth.uid()) and exists (
    select 1 from public.applications a where a.job_id=p_job_id and a.talent_id=p_talent_id
  );
$$;
create or replace function public.current_company_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select company_id from public.company_memberships
  where user_id=(select auth.uid()) and status='active' limit 1;
$$;
create or replace function public.is_company_admin(target_company_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.company_memberships
    where user_id=(select auth.uid()) and company_id=target_company_id and status='active' and role='admin');
$$;
create or replace function public.is_platform_company_reviewer()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.platform_staff
    where user_id=(select auth.uid()) and can_review_companies);
$$;
create or replace function public.can_access_conversation(target_conversation_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.conversations c where c.id=target_conversation_id and (
      c.talent_id=(select auth.uid()) or exists (
        select 1 from public.company_memberships m
        left join public.company_member_permissions p on p.membership_id=m.id
        where m.user_id=(select auth.uid()) and m.company_id=c.company_id and m.status='active'
          and (m.role='admin' or c.assigned_to_user_id=(select auth.uid())
            or coalesce(p.view_all_conversations,false) or coalesce(p.manage_all_conversations,false))
      )
    )
  );
$$;

revoke all on function public.talent_has_applied_to_job(uuid,uuid) from public, anon;
revoke all on function public.current_company_id() from public, anon;
revoke all on function public.is_company_admin(uuid) from public, anon;
revoke all on function public.is_platform_company_reviewer() from public, anon;
revoke all on function public.can_access_conversation(uuid) from public, anon;
grant execute on function public.talent_has_applied_to_job(uuid,uuid), public.current_company_id(),
  public.is_company_admin(uuid), public.is_platform_company_reviewer(),
  public.can_access_conversation(uuid) to authenticated, service_role;

create trigger update_companies_updated_at before update on public.companies for each row execute function public.handle_updated_at();
create trigger update_company_profiles_updated_at before update on public.company_profiles for each row execute function public.handle_updated_at();
create trigger update_company_memberships_updated_at before update on public.company_memberships for each row execute function public.handle_updated_at();
create trigger update_company_affiliation_requests_updated_at before update on public.company_affiliation_requests for each row execute function public.handle_updated_at();
create trigger update_company_invitations_updated_at before update on public.company_invitations for each row execute function public.handle_updated_at();
create trigger update_company_verification_requests_updated_at before update on public.company_verification_requests for each row execute function public.handle_updated_at();

create policy "Public company identity is readable" on public.companies for select to anon, authenticated using (true);
create policy "Public company profiles are readable" on public.company_profiles for select to anon, authenticated using (true);
create policy "Members read company memberships" on public.company_memberships for select to authenticated
  using (user_id=(select auth.uid()) or public.is_company_admin(company_id));
create policy "Members read company permissions" on public.company_member_permissions for select to authenticated
  using (exists (select 1 from public.company_memberships m where m.id=membership_id
    and (m.user_id=(select auth.uid()) or public.is_company_admin(m.company_id))));
create policy "Admins manage company permissions" on public.company_member_permissions for all to authenticated
  using (exists (select 1 from public.company_memberships m where m.id=membership_id and public.is_company_admin(m.company_id)))
  with check (exists (select 1 from public.company_memberships m where m.id=membership_id and public.is_company_admin(m.company_id)));
create policy "Requesters and admins read affiliation requests" on public.company_affiliation_requests for select to authenticated
  using (requester_user_id=(select auth.uid()) or (company_id is not null and public.is_company_admin(company_id)));
create policy "Admins read company invitations" on public.company_invitations for select to authenticated using (public.is_company_admin(company_id));
create policy "Admins read company audit" on public.company_audit_events for select to authenticated using (public.is_company_admin(company_id));
create policy "Admins and staff read verification requests" on public.company_verification_requests for select to authenticated
  using (public.is_company_admin(company_id) or public.is_platform_company_reviewer());
create policy "Staff read own staff record" on public.platform_staff for select to authenticated using (user_id=(select auth.uid()));
create policy "Users manage own conversation read state" on public.conversation_read_states for all to authenticated
  using (user_id=(select auth.uid()) and public.can_access_conversation(conversation_id))
  with check (user_id=(select auth.uid()) and public.can_access_conversation(conversation_id));

create or replace view public.employer_company_names with (security_invoker=true) as
select id, name as company from public.companies;
create or replace view public.employer_public_identities with (security_invoker=true) as
select p.id,p.first_name,p.last_name,p.avatar_url from public.profiles p
join public.company_memberships m on m.user_id=p.id and m.status='active';

revoke all on public.companies from anon, authenticated;
grant select (id,name,verification_status,verified_at,created_at,updated_at) on public.companies to anon, authenticated;
grant select on public.company_profiles, public.employer_company_names to anon, authenticated;
revoke all on public.employer_public_identities from anon, authenticated;
grant select on public.employer_public_identities to service_role;
grant select on public.company_memberships, public.company_member_permissions,
  public.company_affiliation_requests, public.company_invitations, public.company_audit_events,
  public.company_verification_requests, public.platform_staff to authenticated;
grant select,insert,update on public.conversation_read_states to authenticated;
grant all on public.companies, public.company_profiles, public.company_memberships,
  public.company_member_permissions, public.company_affiliation_requests, public.company_invitations,
  public.company_audit_events, public.company_verification_requests, public.platform_staff,
  public.conversation_read_states to service_role;
grant usage,select on sequence public.company_audit_events_id_seq to service_role;

insert into storage.buckets(id,name,public) values ('company-verification','company-verification',false)
on conflict(id) do update set public=excluded.public;
create policy "Company admins upload company assets" on storage.objects for insert to authenticated
with check (bucket_id='employer-assets' and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and public.is_company_admin(((storage.foldername(name))[1])::uuid));
create policy "Company admins update company assets" on storage.objects for update to authenticated
using (bucket_id='employer-assets' and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and public.is_company_admin(((storage.foldername(name))[1])::uuid))
with check (bucket_id='employer-assets' and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and public.is_company_admin(((storage.foldername(name))[1])::uuid));
create policy "Company admins delete company assets" on storage.objects for delete to authenticated
using (bucket_id='employer-assets' and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and public.is_company_admin(((storage.foldername(name))[1])::uuid));
notify pgrst, 'reload schema';
