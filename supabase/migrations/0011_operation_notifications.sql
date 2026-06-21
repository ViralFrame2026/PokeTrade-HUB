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
  was_completed boolean;
  is_completed boolean;
  operation_label text;
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

  was_completed := listing_record.status in ('sold', 'traded', 'finished');
  is_completed := next_status in ('sold', 'traded', 'finished');

  update public.listings
  set
    status = next_status,
    completed_with_id = case
      when is_completed then counterparty_id
      else null
    end
  where id = target_listing_id
  returning * into updated_listing;

  perform public.record_sale_commission(updated_listing);

  if is_completed and not was_completed and counterparty_id is not null then
    operation_label := case
      when next_status = 'sold' then 'venta'
      when next_status = 'traded' then 'intercambio'
      else 'operacion'
    end;

    insert into public.notifications (user_id, type, title, body, payload)
    values (
      counterparty_id,
      'operation_completed',
      'Operacion cerrada',
      format('El vendedor marco "%s" como %s cerrada. Ya podes valorar la operacion.', listing_record.title, operation_label),
      jsonb_build_object('listing_id', target_listing_id)
    );

    if updated_listing.type = 'sale' and next_status = 'sold' then
      insert into public.notifications (user_id, type, title, body, payload)
      values (
        updated_listing.seller_id,
        'commission_created',
        'Comision generada',
        format('Se registro una comision del 5%% por la venta de "%s". Revisala en tus publicaciones.', listing_record.title),
        jsonb_build_object('listing_id', target_listing_id, 'price', updated_listing.price)
      );
    end if;
  end if;

  return updated_listing;
end;
$$;

revoke all on function public.set_own_listing_status(uuid, public.listing_status, uuid) from public;
grant execute on function public.set_own_listing_status(uuid, public.listing_status, uuid) to authenticated;
