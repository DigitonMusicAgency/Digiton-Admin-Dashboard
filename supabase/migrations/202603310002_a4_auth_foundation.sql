create or replace function public.current_user_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select up.id
  from public.user_profiles up
  where up.auth_user_id = auth.uid()
  limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_profiles up
    where up.auth_user_id = auth.uid()
      and up.access_type = 'admin'
      and up.account_status = 'active'
  );
$$;

alter table public.client_memberships
  add column if not exists membership_status public.account_status not null default 'invited';

alter table public.interpret_accesses
  add column if not exists access_status public.account_status not null default 'invited';

update public.client_memberships cm
set membership_status = case
  when up.account_status = 'active' then 'active'::public.account_status
  when up.account_status = 'blocked' then 'blocked'::public.account_status
  when up.account_status = 'archived' then 'archived'::public.account_status
  else 'invited'::public.account_status
end
from public.user_profiles up
where up.id = cm.user_profile_id
  and cm.membership_status = 'invited';

update public.interpret_accesses ia
set access_status = case
  when up.account_status = 'active' then 'active'::public.account_status
  when up.account_status = 'blocked' then 'blocked'::public.account_status
  when up.account_status = 'archived' then 'archived'::public.account_status
  else 'invited'::public.account_status
end
from public.user_profiles up
where up.id = ia.user_profile_id
  and ia.access_status = 'invited';

create or replace function public.has_active_client_membership(target_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.client_memberships cm
    join public.user_profiles up on up.id = cm.user_profile_id
    where up.auth_user_id = auth.uid()
      and up.account_status = 'active'
      and cm.membership_status = 'active'
      and cm.client_id = target_client_id
      and cm.archived_at is null
  );
$$;

create or replace function public.has_active_interpret_access(target_interpreter_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.interpret_accesses ia
    join public.user_profiles up on up.id = ia.user_profile_id
    where up.auth_user_id = auth.uid()
      and up.account_status = 'active'
      and ia.access_status = 'active'
      and ia.interpreter_id = target_interpreter_id
  );
$$;

create or replace function public.activate_current_identity()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.user_profiles
  set
    account_status = 'active',
    updated_at = timezone('utc', now())
  where auth_user_id = auth.uid()
    and account_status = 'invited';

  update public.client_memberships
  set
    membership_status = 'active',
    updated_at = timezone('utc', now())
  where user_profile_id = public.current_user_profile_id()
    and membership_status = 'invited';

  update public.interpret_accesses
  set
    access_status = 'active',
    updated_at = timezone('utc', now())
  where user_profile_id = public.current_user_profile_id()
    and access_status = 'invited';

  insert into public.email_notification_preferences (user_profile_id)
  values (public.current_user_profile_id())
  on conflict (user_profile_id) do nothing;
end;
$$;

grant execute on function public.current_user_profile_id() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.has_active_client_membership(uuid) to authenticated;
grant execute on function public.has_active_interpret_access(uuid) to authenticated;
grant execute on function public.activate_current_identity() to authenticated;

alter table public.user_profiles enable row level security;
alter table public.client_memberships enable row level security;
alter table public.interpret_accesses enable row level security;
alter table public.clients enable row level security;
alter table public.client_links enable row level security;
alter table public.client_distributions enable row level security;
alter table public.interpreters enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_links enable row level security;
alter table public.email_notification_preferences enable row level security;
alter table public.email_messages enable row level security;
alter table public.email_message_events enable row level security;

drop policy if exists "user_profiles_select_self_or_admin" on public.user_profiles;
create policy "user_profiles_select_self_or_admin"
on public.user_profiles
for select
to authenticated
using (
  auth.uid() = auth_user_id
  or public.is_admin()
);

drop policy if exists "client_memberships_select_self_or_admin" on public.client_memberships;
create policy "client_memberships_select_self_or_admin"
on public.client_memberships
for select
to authenticated
using (
  user_profile_id = public.current_user_profile_id()
  or public.is_admin()
);

drop policy if exists "interpret_accesses_select_self_or_admin" on public.interpret_accesses;
create policy "interpret_accesses_select_self_or_admin"
on public.interpret_accesses
for select
to authenticated
using (
  user_profile_id = public.current_user_profile_id()
  or public.is_admin()
);

drop policy if exists "clients_select_visible_scope" on public.clients;
create policy "clients_select_visible_scope"
on public.clients
for select
to authenticated
using (
  public.is_admin()
  or public.has_active_client_membership(id)
);

drop policy if exists "client_links_select_visible_scope" on public.client_links;
create policy "client_links_select_visible_scope"
on public.client_links
for select
to authenticated
using (
  public.is_admin()
  or public.has_active_client_membership(client_id)
);

drop policy if exists "client_distributions_select_visible_scope" on public.client_distributions;
create policy "client_distributions_select_visible_scope"
on public.client_distributions
for select
to authenticated
using (
  public.is_admin()
  or public.has_active_client_membership(client_id)
);

drop policy if exists "interpreters_select_visible_scope" on public.interpreters;
create policy "interpreters_select_visible_scope"
on public.interpreters
for select
to authenticated
using (
  public.is_admin()
  or public.has_active_client_membership(owner_client_id)
  or public.has_active_interpret_access(id)
);

drop policy if exists "campaigns_select_visible_scope" on public.campaigns;
create policy "campaigns_select_visible_scope"
on public.campaigns
for select
to authenticated
using (
  public.is_admin()
  or public.has_active_client_membership(client_id)
  or (
    interpreter_id is not null
    and public.has_active_interpret_access(interpreter_id)
  )
);

drop policy if exists "campaign_links_select_visible_scope" on public.campaign_links;
create policy "campaign_links_select_visible_scope"
on public.campaign_links
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.campaigns c
    where c.id = campaign_id
      and (
        public.has_active_client_membership(c.client_id)
        or (
          c.interpreter_id is not null
          and public.has_active_interpret_access(c.interpreter_id)
        )
      )
  )
);

drop policy if exists "email_preferences_select_or_update_self_or_admin" on public.email_notification_preferences;
create policy "email_preferences_select_or_update_self_or_admin"
on public.email_notification_preferences
for select
to authenticated
using (
  user_profile_id = public.current_user_profile_id()
  or public.is_admin()
);

drop policy if exists "email_preferences_update_self_or_admin" on public.email_notification_preferences;
create policy "email_preferences_update_self_or_admin"
on public.email_notification_preferences
for update
to authenticated
using (
  user_profile_id = public.current_user_profile_id()
  or public.is_admin()
)
with check (
  user_profile_id = public.current_user_profile_id()
  or public.is_admin()
);

drop policy if exists "email_messages_select_visible_scope" on public.email_messages;
create policy "email_messages_select_visible_scope"
on public.email_messages
for select
to authenticated
using (
  public.is_admin()
  or user_profile_id = public.current_user_profile_id()
);

drop policy if exists "email_message_events_select_admin_only" on public.email_message_events;
create policy "email_message_events_select_admin_only"
on public.email_message_events
for select
to authenticated
using (public.is_admin());
