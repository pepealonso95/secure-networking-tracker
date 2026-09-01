\pset pager off

select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'contacts';

select
  policyname,
  cmd,
  roles,
  qual,
  with_check
from pg_policies
where schemaname = 'public' and tablename = 'contacts'
order by cmd;

select
  grantee,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'contacts'
order by grantee, privilege_type;

select
  conname,
  pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.contacts'::regclass
order by conname;

