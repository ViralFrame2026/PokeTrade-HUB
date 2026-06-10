create or replace function public.set_own_listing_status(
  target_listing_id uuid,
  next_status public.listing_status
)
returns public.listings
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_listing public.listings;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if next_status not in ('active', 'reserved', 'sold', 'traded', 'finished') then
    raise exception 'Invalid listing status';
  end if;

  update public.listings
  set status = next_status
  where id = target_listing_id
    and seller_id = auth.uid()
    and moderation_status = 'approved'
  returning * into updated_listing;

  if updated_listing.id is null then
    raise exception 'Listing not found or unavailable';
  end if;

  return updated_listing;
end;
$$;

revoke all on function public.set_own_listing_status(uuid, public.listing_status) from public;
grant execute on function public.set_own_listing_status(uuid, public.listing_status) to authenticated;
