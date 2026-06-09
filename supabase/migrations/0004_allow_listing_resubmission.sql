create or replace function public.protect_listing_moderation_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.moderation_status <> 'pending'
      or new.rejection_reason is not null
      or new.approved_at is not null then
      raise exception 'New listings must start pending moderation';
    end if;
    return new;
  end if;

  if new.approved_at is distinct from old.approved_at then
    raise exception 'Only administrators can update listing moderation fields';
  end if;

  if old.moderation_status in ('rejected', 'changes_requested')
    and new.moderation_status = 'pending'
    and new.rejection_reason is null then
    return new;
  end if;

  if new.rejection_reason is distinct from old.rejection_reason
    or new.moderation_status is distinct from old.moderation_status then
    raise exception 'Only administrators can update listing moderation fields';
  end if;

  return new;
end;
$$;

drop policy if exists "Users update own draft listings" on public.listings;

create policy "Users update own draft listings" on public.listings
for update using (
  seller_id = auth.uid()
  and moderation_status in ('pending', 'rejected', 'changes_requested')
)
with check (
  seller_id = auth.uid()
  and moderation_status = 'pending'
);
