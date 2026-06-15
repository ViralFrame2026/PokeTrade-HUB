create unique index if not exists ratings_unique_reviewer_listing
on public.ratings(reviewer_id, listing_id)
where listing_id is not null;

alter table public.listings
add column if not exists completed_with_id uuid references public.profiles(id) on delete set null;

drop function if exists public.set_own_listing_status(
  uuid,
  public.listing_status
);

create or replace function public.set_own_listing_status(
  target_listing_id uuid,
  next_status public.listing_status,
  counterparty_id uuid default null
)
returns public.listings
language plpgsql
security definer
set search_path = public
as $$
declare
  listing_record public.listings%rowtype;
  updated_listing public.listings;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if next_status not in ('active', 'reserved', 'sold', 'traded', 'finished') then
    raise exception 'Invalid listing status';
  end if;

  select *
  into listing_record
  from public.listings
  where id = target_listing_id
    and seller_id = auth.uid()
    and moderation_status = 'approved';

  if listing_record.id is null then
    raise exception 'Listing not found or unavailable';
  end if;

  if next_status in ('sold', 'traded', 'finished') then
    if counterparty_id is null or counterparty_id = auth.uid() then
      raise exception 'A valid counterparty is required';
    end if;

    if not exists (
      select 1
      from public.messages
      where listing_id = target_listing_id
        and (
          (sender_id = auth.uid() and recipient_id = counterparty_id)
          or
          (sender_id = counterparty_id and recipient_id = auth.uid())
        )
    ) then
      raise exception 'The selected user has no conversation for this listing';
    end if;
  end if;

  update public.listings
  set
    status = next_status,
    completed_with_id = case
      when next_status in ('sold', 'traded', 'finished') then counterparty_id
      else null
    end
  where id = target_listing_id
  returning * into updated_listing;

  return updated_listing;
end;
$$;

revoke all on function public.set_own_listing_status(uuid, public.listing_status, uuid) from public;
grant execute on function public.set_own_listing_status(uuid, public.listing_status, uuid) to authenticated;

drop policy if exists "Users create ratings" on public.ratings;

create or replace function public.refresh_reputation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_profile_id uuid;
begin
  target_profile_id := coalesce(new.reviewed_id, old.reviewed_id);

  update public.profiles
  set
    reputation_average = coalesce((
      select round(avg(stars)::numeric, 2)
      from public.ratings
      where reviewed_id = target_profile_id
    ), 0),
    reputation_count = (
      select count(*)
      from public.ratings
      where reviewed_id = target_profile_id
    )
  where id = target_profile_id;

  return coalesce(new, old);
end;
$$;

create or replace function public.submit_listing_rating(
  target_listing_id uuid,
  rating_stars integer,
  rating_comment text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  listing_record public.listings%rowtype;
  new_rating_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if rating_stars < 1 or rating_stars > 5 then
    raise exception 'Rating must be between 1 and 5';
  end if;

  if rating_comment is not null and char_length(trim(rating_comment)) > 500 then
    raise exception 'Rating comment is too long';
  end if;

  select *
  into listing_record
  from public.listings
  where id = target_listing_id;

  if listing_record.id is null then
    raise exception 'Listing not found';
  end if;

  if listing_record.status not in ('sold', 'traded', 'finished') then
    raise exception 'The operation is not completed';
  end if;

  if listing_record.seller_id = auth.uid() then
    raise exception 'Sellers cannot rate themselves';
  end if;

  if listing_record.completed_with_id is distinct from auth.uid() then
    raise exception 'Only the selected counterparty can rate this operation';
  end if;

  if exists (
    select 1
    from public.ratings
    where reviewer_id = auth.uid()
      and listing_id = target_listing_id
  ) then
    raise exception 'This operation has already been rated';
  end if;

  insert into public.ratings (
    reviewer_id,
    reviewed_id,
    listing_id,
    stars,
    comment
  )
  values (
    auth.uid(),
    listing_record.seller_id,
    target_listing_id,
    rating_stars,
    nullif(trim(rating_comment), '')
  )
  returning id into new_rating_id;

  insert into public.notifications (user_id, type, title, body, payload)
  values (
    listing_record.seller_id,
    'rating_received',
    'Recibiste una valoración',
    format('Tu operación "%s" recibió %s estrella(s).', listing_record.title, rating_stars),
    jsonb_build_object('listing_id', target_listing_id, 'rating_id', new_rating_id)
  );

  return new_rating_id;
end;
$$;

revoke all on function public.submit_listing_rating(uuid, integer, text) from public;
grant execute on function public.submit_listing_rating(uuid, integer, text) to authenticated;
