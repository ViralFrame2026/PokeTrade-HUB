create table if not exists public.sale_commissions (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  buyer_id uuid references public.profiles(id) on delete set null,
  gross_amount numeric(12, 2) not null check (gross_amount >= 0),
  commission_rate numeric(5, 4) not null default 0.05 check (commission_rate >= 0 and commission_rate <= 1),
  commission_amount numeric(12, 2) not null check (commission_amount >= 0),
  seller_net_amount numeric(12, 2) not null check (seller_net_amount >= 0),
  status text not null default 'pending' check (status in ('pending', 'invoiced', 'paid', 'waived')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (listing_id)
);

alter table public.sale_commissions enable row level security;

drop policy if exists "Admins manage sale commissions" on public.sale_commissions;
create policy "Admins manage sale commissions"
on public.sale_commissions
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Sellers read own sale commissions" on public.sale_commissions;
create policy "Sellers read own sale commissions"
on public.sale_commissions
for select
using (seller_id = auth.uid());

create or replace function public.touch_sale_commissions_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists sale_commissions_updated_at on public.sale_commissions;
create trigger sale_commissions_updated_at
before update on public.sale_commissions
for each row execute function public.touch_sale_commissions_updated_at();

create or replace function public.record_sale_commission(
  target_listing public.listings
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  platform_rate numeric(5, 4) := 0.05;
  gross numeric(12, 2);
  commission numeric(12, 2);
begin
  if target_listing.type <> 'sale'
    or target_listing.status <> 'sold'
    or target_listing.price is null then
    delete from public.sale_commissions
    where listing_id = target_listing.id
      and status in ('pending', 'waived');
    return;
  end if;

  gross := target_listing.price;
  commission := round(gross * platform_rate, 2);

  insert into public.sale_commissions (
    listing_id,
    seller_id,
    buyer_id,
    gross_amount,
    commission_rate,
    commission_amount,
    seller_net_amount
  )
  values (
    target_listing.id,
    target_listing.seller_id,
    target_listing.completed_with_id,
    gross,
    platform_rate,
    commission,
    gross - commission
  )
  on conflict (listing_id) do update
  set
    seller_id = excluded.seller_id,
    buyer_id = excluded.buyer_id,
    gross_amount = excluded.gross_amount,
    commission_rate = excluded.commission_rate,
    commission_amount = excluded.commission_amount,
    seller_net_amount = excluded.seller_net_amount,
    updated_at = now();
end;
$$;

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

  perform public.record_sale_commission(updated_listing);

  return updated_listing;
end;
$$;

revoke all on function public.record_sale_commission(public.listings) from public;
revoke all on function public.set_own_listing_status(uuid, public.listing_status, uuid) from public;
grant execute on function public.set_own_listing_status(uuid, public.listing_status, uuid) to authenticated;

insert into public.sale_commissions (
  listing_id,
  seller_id,
  buyer_id,
  gross_amount,
  commission_rate,
  commission_amount,
  seller_net_amount,
  created_at
)
select
  id,
  seller_id,
  completed_with_id,
  price,
  0.05,
  round(price * 0.05, 2),
  price - round(price * 0.05, 2),
  coalesce(approved_at, created_at)
from public.listings
where type = 'sale'
  and status = 'sold'
  and price is not null
on conflict (listing_id) do nothing;

create index if not exists sale_commissions_status_idx
on public.sale_commissions(status, created_at desc);

create index if not exists sale_commissions_seller_idx
on public.sale_commissions(seller_id, created_at desc);
