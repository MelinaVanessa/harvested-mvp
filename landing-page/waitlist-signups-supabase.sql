-- Paste this ENTIRE file into Supabase → SQL Editor → New query, then Run.
-- Do not paste the filename or path (e.g. not "supabase/migrations/...").

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  role text not null check (role in ('gardener', 'neighbor', 'both')),
  created_at timestamptz not null default now(),
  constraint waitlist_signups_email_unique unique (email)
);

create index if not exists waitlist_signups_created_at_idx
  on public.waitlist_signups (created_at desc);

alter table public.waitlist_signups enable row level security;

comment on table public.waitlist_signups is 'Harvested pilot waitlist; written by Node API with service role.';
