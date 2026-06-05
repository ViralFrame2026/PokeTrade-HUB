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

  if not public.is_admin() and (
    new.is_admin is distinct from old.is_admin
    or new.is_verified is distinct from old.is_verified
    or new.reputation_average is distinct from old.reputation_average
    or new.reputation_count is distinct from old.reputation_count
    or new.joined_at is distinct from old.joined_at
  ) then
    raise exception 'Only administrators can update protected profile fields';
  end if;

  return new;
end;
$$;
