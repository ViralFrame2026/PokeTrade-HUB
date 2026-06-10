alter table public.profiles
add column if not exists is_super_admin boolean not null default false;

update public.profiles
set is_super_admin = true
where id = (
  select id
  from public.profiles
  where is_admin = true
  order by joined_at asc
  limit 1
);

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_admin = true
      and is_super_admin = true
  );
$$;

create or replace function public.protect_profile_system_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_user in ('postgres', 'service_role', 'supabase_admin') then
    return new;
  end if;

  if (
    new.is_admin is distinct from old.is_admin
    or new.is_super_admin is distinct from old.is_super_admin
  ) and not public.is_super_admin() then
    raise exception 'Only the primary administrator can manage administrator roles';
  end if;

  if not public.is_admin() and (
    new.is_verified is distinct from old.is_verified
    or new.reputation_average is distinct from old.reputation_average
    or new.reputation_count is distinct from old.reputation_count
    or new.joined_at is distinct from old.joined_at
  ) then
    raise exception 'Only administrators can update protected profile fields';
  end if;

  return new;
end;
$$;

create or replace function public.set_admin_role(
  target_profile_id uuid,
  enabled boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin() then
    raise exception 'Primary administrator access required';
  end if;

  if target_profile_id = auth.uid() and enabled = false then
    raise exception 'The primary administrator cannot remove their own access';
  end if;

  if exists (
    select 1
    from public.profiles
    where id = target_profile_id
      and is_super_admin = true
      and enabled = false
  ) then
    raise exception 'The primary administrator cannot be demoted';
  end if;

  update public.profiles
  set is_admin = enabled
  where id = target_profile_id;

  if not found then
    raise exception 'Profile not found';
  end if;
end;
$$;

revoke all on function public.set_admin_role(uuid, boolean) from public;
grant execute on function public.set_admin_role(uuid, boolean) to authenticated;
