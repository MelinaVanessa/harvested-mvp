-- Run once if you already created waitlist_signups WITHOUT a name column.
-- Supabase → SQL Editor → paste all → Run.

alter table public.waitlist_signups
  add column if not exists name text;

update public.waitlist_signups
set name = '(no name on file)'
where name is null;

alter table public.waitlist_signups
  alter column name set not null;
