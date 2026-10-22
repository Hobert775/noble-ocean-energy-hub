-- Deactivated accounts lose every role-based permission.
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = _user_id and ur.role = _role
  ) and not exists (
    select 1 from public.profiles p
    where p.id = _user_id and p.status = 'deactivated'
  )
$$;

-- Users may edit their own name/title/department but never their status.
revoke update on public.profiles from authenticated;
grant update (full_name, job_title, department, updated_at) on public.profiles to authenticated;

-- Admins manage roles directly; they cannot remove their own roles.
grant insert, delete on public.user_roles to authenticated;

create policy "Admins can assign roles"
on public.user_roles for insert to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can remove other users' roles"
on public.user_roles for delete to authenticated
using (public.has_role(auth.uid(), 'admin') and user_id <> auth.uid());

-- Admin-only list of accounts with sign-in details.
create or replace function public.admin_list_users()
returns table (id uuid, email text, last_sign_in_at timestamptz, created_at timestamptz)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Forbidden: admin role required';
  end if;
  return query
    select u.id, u.email::text, u.last_sign_in_at, u.created_at
    from auth.users u
    order by u.created_at;
end;
$$;

revoke all on function public.admin_list_users() from public, anon;
grant execute on function public.admin_list_users() to authenticated;

-- Admin-only status change; admins cannot change their own status.
create or replace function public.admin_set_user_status(_user_id uuid, _status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Forbidden: admin role required';
  end if;
  if _user_id = auth.uid() then
    raise exception 'You cannot change your own account status';
  end if;
  if _status not in ('active', 'deactivated') then
    raise exception 'Invalid status';
  end if;
  update public.profiles set status = _status, updated_at = now() where id = _user_id;
end;
$$;

revoke all on function public.admin_set_user_status(uuid, text) from public, anon;
grant execute on function public.admin_set_user_status(uuid, text) to authenticated;