create table public.account_activity (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  target_user_id uuid,
  action text not null,
  detail text not null default '',
  created_at timestamptz not null default now()
);
grant select, insert on public.account_activity to authenticated;
grant all on public.account_activity to service_role;
alter table public.account_activity enable row level security;

create policy "Admins can read account activity"
on public.account_activity for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can record account activity"
on public.account_activity for insert to authenticated
with check (public.has_role(auth.uid(), 'admin'));