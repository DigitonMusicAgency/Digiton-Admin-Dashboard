alter table public.interpreters
  add column if not exists login_email text;

create index if not exists interpreters_login_email_lower_idx
  on public.interpreters (lower(login_email))
  where login_email is not null;
