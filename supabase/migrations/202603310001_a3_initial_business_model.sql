create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'access_type') then
    create type public.access_type as enum ('admin', 'client_member', 'interpret');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'account_status') then
    create type public.account_status as enum ('invited', 'active', 'blocked', 'archived');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'client_type') then
    create type public.client_type as enum ('artist', 'label_agency', 'promoter', 'manager');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'client_status') then
    create type public.client_status as enum ('lead', 'active', 'inactive');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'client_priority') then
    create type public.client_priority as enum ('low', 'medium', 'high');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'distribution_status') then
    create type public.distribution_status as enum ('none', 'requested', 'active', 'ended');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'interpreter_distribution_status') then
    create type public.interpreter_distribution_status as enum ('none', 'requested', 'created', 'ended');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'campaign_status') then
    create type public.campaign_status as enum (
      'draft',
      'awaiting_approval',
      'awaiting_assets',
      'preparing',
      'launched',
      'paused',
      'finished',
      'canceled'
    );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type public.payment_status as enum ('paid', 'awaiting_payment', 'unpaid', 'partially_paid');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'email_topic') then
    create type public.email_topic as enum ('status_update', 'report_update', 'extension_update', 'other');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'email_delivery_status') then
    create type public.email_delivery_status as enum (
      'queued',
      'sent',
      'delivered',
      'opened',
      'clicked',
      'failed',
      'bounced',
      'complained'
    );
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.generate_campaign_order_number()
returns trigger
language plpgsql
as $$
declare
  seq_value bigint;
  order_year text;
begin
  if new.order_number is null or btrim(new.order_number) = '' then
    seq_value := nextval('public.order_number_seq');
    order_year := to_char(coalesce(new.ordered_at, current_date), 'YYYY');
    new.order_number := format('DIG-%s-%s', order_year, lpad(seq_value::text, 4, '0'));
  end if;

  return new;
end;
$$;

create sequence if not exists public.order_number_seq start with 1 increment by 1;

create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users (id) on delete cascade,
  full_name text,
  login_email text not null,
  avatar_url text,
  access_type public.access_type not null,
  account_status public.account_status not null default 'invited',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists user_profiles_login_email_lower_idx
  on public.user_profiles (lower(login_email));

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client_type public.client_type not null,
  client_status public.client_status not null default 'lead',
  priority public.client_priority not null default 'medium',
  label_client_id uuid references public.clients (id) on delete set null,
  account_manager_user_id uuid references public.user_profiles (id) on delete set null,
  affiliate text,
  primary_email text,
  phone text,
  country text,
  company_id_number text,
  billing_details text,
  bank_details text,
  crm_notes text,
  last_campaign_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  archived_at timestamptz
);

create index if not exists clients_type_status_idx
  on public.clients (client_type, client_status);

create index if not exists clients_label_client_id_idx
  on public.clients (label_client_id);

create index if not exists clients_account_manager_user_id_idx
  on public.clients (account_manager_user_id);

create table if not exists public.client_links (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  link_type text,
  label text,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists client_links_client_id_idx
  on public.client_links (client_id);

create table if not exists public.client_distributions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique references public.clients (id) on delete cascade,
  distribution_status public.distribution_status not null default 'none',
  contract_number text,
  contract_file_path text,
  contract_valid_from date,
  contract_valid_to date,
  revenue_share_percent numeric(5, 2),
  is_vat_payer boolean not null default false,
  currency_code text not null default 'CZK',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (
    revenue_share_percent is null
    or (revenue_share_percent >= 0 and revenue_share_percent <= 100)
  )
);

create table if not exists public.interpreters (
  id uuid primary key default gen_random_uuid(),
  owner_client_id uuid not null references public.clients (id) on delete cascade,
  name text not null,
  email text,
  has_access boolean not null default false,
  distribution_profile_status public.interpreter_distribution_status not null default 'none',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  archived_at timestamptz,
  check (
    (
      has_access = false
      and distribution_profile_status = 'none'
    )
    or email is not null
  )
);

create index if not exists interpreters_owner_client_id_idx
  on public.interpreters (owner_client_id);

create table if not exists public.client_memberships (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid not null references public.user_profiles (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  archived_at timestamptz,
  unique (user_profile_id, client_id)
);

create index if not exists client_memberships_client_id_idx
  on public.client_memberships (client_id);

create table if not exists public.interpret_accesses (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid not null unique references public.user_profiles (id) on delete cascade,
  interpreter_id uuid not null references public.interpreters (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists interpret_accesses_interpreter_id_idx
  on public.interpret_accesses (interpreter_id);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  order_number text unique,
  internal_code text,
  name text not null,
  client_id uuid not null references public.clients (id) on delete restrict,
  interpreter_id uuid references public.interpreters (id) on delete set null,
  ordered_at date,
  campaign_subtype text,
  package_name text,
  promoted_object text,
  source_of_order text,
  platforms text[] not null default '{}',
  start_date date,
  end_date date,
  campaign_status public.campaign_status not null default 'draft',
  payment_status public.payment_status not null default 'unpaid',
  total_amount numeric(12, 2),
  agency_fee_amount numeric(12, 2),
  budget_amount numeric(12, 2),
  currency_code text not null default 'CZK',
  estimated_results text,
  optimization_notes text,
  target_countries text[] not null default '{}',
  target_interests text[] not null default '{}',
  target_age_min smallint,
  target_age_max smallint,
  shared_request_notes text,
  admin_instructions text,
  internal_notes text,
  public_comment text,
  report_url text,
  responsible_user_id uuid references public.user_profiles (id) on delete set null,
  submitted_for_review_at timestamptz,
  last_checked_at timestamptz,
  next_check_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  archived_at timestamptz,
  check (target_age_min is null or target_age_min >= 0),
  check (target_age_max is null or target_age_max >= 0),
  check (
    target_age_min is null
    or target_age_max is null
    or target_age_min <= target_age_max
  )
);

create index if not exists campaigns_client_id_idx
  on public.campaigns (client_id);

create index if not exists campaigns_interpreter_id_idx
  on public.campaigns (interpreter_id);

create index if not exists campaigns_status_idx
  on public.campaigns (campaign_status, payment_status);

create index if not exists campaigns_responsible_user_id_idx
  on public.campaigns (responsible_user_id);

create index if not exists campaigns_next_check_at_idx
  on public.campaigns (next_check_at);

create table if not exists public.campaign_links (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  link_type text,
  label text,
  url text not null,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists campaign_links_campaign_id_idx
  on public.campaign_links (campaign_id);

create unique index if not exists campaign_links_primary_idx
  on public.campaign_links (campaign_id)
  where is_primary = true;

create table if not exists public.email_notification_preferences (
  user_profile_id uuid primary key references public.user_profiles (id) on delete cascade,
  email_enabled boolean not null default true,
  status_updates_enabled boolean not null default true,
  report_updates_enabled boolean not null default true,
  extension_updates_enabled boolean not null default true,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.email_messages (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid references public.user_profiles (id) on delete set null,
  client_id uuid references public.clients (id) on delete set null,
  campaign_id uuid references public.campaigns (id) on delete set null,
  topic public.email_topic not null,
  message_type text not null,
  subject text not null,
  recipient_email text not null,
  primary_action_url text,
  provider_name text,
  provider_message_id text unique,
  delivery_status public.email_delivery_status not null default 'queued',
  failure_reason text,
  metadata jsonb not null default '{}'::jsonb,
  sent_at timestamptz,
  delivered_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  failed_at timestamptz,
  last_event_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists email_messages_campaign_id_idx
  on public.email_messages (campaign_id);

create index if not exists email_messages_client_id_idx
  on public.email_messages (client_id);

create index if not exists email_messages_delivery_status_idx
  on public.email_messages (delivery_status);

create table if not exists public.email_message_events (
  id uuid primary key default gen_random_uuid(),
  email_message_id uuid not null references public.email_messages (id) on delete cascade,
  event_type text not null,
  normalized_status public.email_delivery_status,
  provider_event_id text,
  raw_payload jsonb,
  payload_summary jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists email_message_events_email_message_id_idx
  on public.email_message_events (email_message_id);

create index if not exists email_message_events_normalized_status_idx
  on public.email_message_events (normalized_status);

drop trigger if exists set_user_profiles_updated_at on public.user_profiles;
create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_clients_updated_at on public.clients;
create trigger set_clients_updated_at
before update on public.clients
for each row
execute function public.set_updated_at();

drop trigger if exists set_client_links_updated_at on public.client_links;
create trigger set_client_links_updated_at
before update on public.client_links
for each row
execute function public.set_updated_at();

drop trigger if exists set_client_distributions_updated_at on public.client_distributions;
create trigger set_client_distributions_updated_at
before update on public.client_distributions
for each row
execute function public.set_updated_at();

drop trigger if exists set_interpreters_updated_at on public.interpreters;
create trigger set_interpreters_updated_at
before update on public.interpreters
for each row
execute function public.set_updated_at();

drop trigger if exists set_client_memberships_updated_at on public.client_memberships;
create trigger set_client_memberships_updated_at
before update on public.client_memberships
for each row
execute function public.set_updated_at();

drop trigger if exists set_interpret_accesses_updated_at on public.interpret_accesses;
create trigger set_interpret_accesses_updated_at
before update on public.interpret_accesses
for each row
execute function public.set_updated_at();

drop trigger if exists set_campaigns_updated_at on public.campaigns;
create trigger set_campaigns_updated_at
before update on public.campaigns
for each row
execute function public.set_updated_at();

drop trigger if exists set_campaign_links_updated_at on public.campaign_links;
create trigger set_campaign_links_updated_at
before update on public.campaign_links
for each row
execute function public.set_updated_at();

drop trigger if exists set_email_notification_preferences_updated_at on public.email_notification_preferences;
create trigger set_email_notification_preferences_updated_at
before update on public.email_notification_preferences
for each row
execute function public.set_updated_at();

drop trigger if exists set_email_messages_updated_at on public.email_messages;
create trigger set_email_messages_updated_at
before update on public.email_messages
for each row
execute function public.set_updated_at();

drop trigger if exists set_campaign_order_number on public.campaigns;
create trigger set_campaign_order_number
before insert on public.campaigns
for each row
execute function public.generate_campaign_order_number();
