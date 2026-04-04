alter table public.clients
  add column if not exists bizkithub_customer_id text,
  add column if not exists bizkithub_customer_synced_at timestamptz,
  add column if not exists bizkithub_customer_sync_error text;

alter table public.campaigns
  add column if not exists bizkithub_order_id text,
  add column if not exists bizkithub_order_synced_at timestamptz,
  add column if not exists bizkithub_order_sync_error text;

create unique index if not exists clients_bizkithub_customer_id_unique
  on public.clients (bizkithub_customer_id)
  where bizkithub_customer_id is not null;

create unique index if not exists campaigns_bizkithub_order_id_unique
  on public.campaigns (bizkithub_order_id)
  where bizkithub_order_id is not null;
