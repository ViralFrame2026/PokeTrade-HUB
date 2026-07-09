create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'ARS',
  provider text not null default 'mercadopago',
  preference_id text,
  payment_id text,
  external_reference text not null unique,
  checkout_url text,
  sandbox_checkout_url text,
  status text not null default 'pending' check (
    status in ('pending', 'approved', 'rejected', 'cancelled', 'refunded', 'expired')
  ),
  provider_status text,
  provider_status_detail text,
  raw_payload jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payment_orders enable row level security;

drop policy if exists "Buyers read own payment orders" on public.payment_orders;
create policy "Buyers read own payment orders"
on public.payment_orders
for select
using (buyer_id = auth.uid());

drop policy if exists "Sellers read received payment orders" on public.payment_orders;
create policy "Sellers read received payment orders"
on public.payment_orders
for select
using (seller_id = auth.uid());

drop policy if exists "Buyers create own pending payment orders" on public.payment_orders;
create policy "Buyers create own pending payment orders"
on public.payment_orders
for insert
with check (buyer_id = auth.uid() and status = 'pending');

drop policy if exists "Admins manage payment orders" on public.payment_orders;
create policy "Admins manage payment orders"
on public.payment_orders
for all
using (public.is_admin())
with check (public.is_admin());

create or replace function public.touch_payment_orders_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists payment_orders_updated_at on public.payment_orders;
create trigger payment_orders_updated_at
before update on public.payment_orders
for each row execute function public.touch_payment_orders_updated_at();

create or replace function public.confirm_paid_order(target_order_id uuid)
returns public.payment_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  order_record public.payment_orders%rowtype;
  listing_record public.listings%rowtype;
  updated_listing public.listings%rowtype;
begin
  select *
  into order_record
  from public.payment_orders
  where id = target_order_id
  for update;

  if order_record.id is null then
    raise exception 'Payment order not found';
  end if;

  if order_record.status <> 'approved' then
    raise exception 'Payment order is not approved';
  end if;

  select *
  into listing_record
  from public.listings
  where id = order_record.listing_id
  for update;

  if listing_record.id is null then
    raise exception 'Listing not found';
  end if;

  if listing_record.type <> 'sale'
    or listing_record.moderation_status <> 'approved'
    or listing_record.price is null then
    raise exception 'Listing cannot be paid';
  end if;

  if listing_record.status = 'active' then
    update public.listings
    set
      status = 'sold',
      completed_with_id = order_record.buyer_id
    where id = listing_record.id
    returning * into updated_listing;

    perform public.record_sale_commission(updated_listing);

    insert into public.notifications (user_id, type, title, body, payload)
    values
      (
        order_record.buyer_id,
        'payment_approved',
        'Pago aprobado',
        format('Tu pago por "%s" fue aprobado. Ya podés coordinar la entrega con el vendedor.', listing_record.title),
        jsonb_build_object('listing_id', listing_record.id, 'payment_order_id', order_record.id)
      ),
      (
        order_record.seller_id,
        'sale_paid',
        'Venta pagada',
        format('Recibimos el pago por "%s". Coordiná la entrega con el comprador.', listing_record.title),
        jsonb_build_object('listing_id', listing_record.id, 'payment_order_id', order_record.id)
      ),
      (
        order_record.seller_id,
        'commission_created',
        'Comision generada',
        format('Se registró una comisión del 5%% por la venta de "%s".', listing_record.title),
        jsonb_build_object('listing_id', listing_record.id, 'payment_order_id', order_record.id)
      );
  elsif listing_record.completed_with_id = order_record.buyer_id then
    updated_listing := listing_record;
  else
    raise exception 'Listing is no longer available';
  end if;

  select *
  into order_record
  from public.payment_orders
  where id = target_order_id;

  return order_record;
end;
$$;

revoke all on function public.confirm_paid_order(uuid) from public;
grant execute on function public.confirm_paid_order(uuid) to service_role;

create index if not exists payment_orders_buyer_idx
on public.payment_orders(buyer_id, created_at desc);

create index if not exists payment_orders_seller_idx
on public.payment_orders(seller_id, created_at desc);

create index if not exists payment_orders_listing_idx
on public.payment_orders(listing_id, created_at desc);

create index if not exists payment_orders_status_idx
on public.payment_orders(status, created_at desc);

create unique index if not exists payment_orders_payment_id_unique
on public.payment_orders(payment_id)
where payment_id is not null;

create unique index if not exists payment_orders_one_approved_per_listing
on public.payment_orders(listing_id)
where status = 'approved';
