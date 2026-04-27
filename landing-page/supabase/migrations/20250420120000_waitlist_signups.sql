-- Copy everything below into Supabase → SQL Editor (paste SQL only, not this file path).
-- Or use Supabase CLI: supabase db push
-- Stores waitlist signups from the Harvested landing Node API (service role).

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

-- RLS on, no anon policies: Node server uses the service role key (bypasses RLS).

comment on table public.waitlist_signups is 'Harvested pilot waitlist; Node API + service role.';
